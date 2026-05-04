/**
 * Blink Intelligence warehouse adapter.
 *
 * Reads `sales_tracking_records` from the local SQLite warehouse used
 * by Mitch's Blink stack and projects it onto the contest's metrics:
 *  - per-rep deal counts
 *  - per-day cumulative team totals (telemetry chart)
 *  - new-vehicle RDR
 *  - latest sold events (live ticker)
 *
 * No npm SQLite binding — we shell out to the `sqlite3` CLI in
 * read-only mode. Cheap, zero install risk, plenty fast for one
 * page render.
 *
 * Path is configurable via env: BLINK_WAREHOUSE_DB.
 *
 * Falls back gracefully when the warehouse is absent (returns null);
 * the caller decides whether to use mock numbers.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";

const execFileAsync = promisify(execFile);

const DEFAULT_DB =
  process.env.BLINK_WAREHOUSE_DB ?? "/Users/mitch/BlinkIntelligence/db/warehouse.db";

/**
 * Maps Blink's full assigned_to names to our short contest rep ids.
 * Anyone not in this map is ignored in the rollups.
 */
export const REP_NAME_TO_ID: Record<string, string> = {
  "Bill Turnbull": "bill",
  "Eric Anderson": "eric",
  "Sonny Dela Cruz": "sonny",
  "Doug McCartney": "doug",
  "Sumit Thapar": "sumit",
  "Brady Hrymak": "brady",
  "Vladyslav Ihnatov": "vlad",
  "Robert McGregor": "bob",
};

const TEAM_BILL_IDS = new Set(["bill", "eric", "sonny", "doug"]);

export interface BlinkSnapshot {
  /** Deals per rep id for the requested month. */
  dealsByRep: Record<string, number>;
  /** New-vehicle RDR total (sales_type='N') in the month. */
  newVehicleRdr: number;
  /** ISO timestamp of the latest sold event seen. */
  lastEventAt: string | null;
  /** Raw sold events for ticker / telemetry derivation. */
  events: SoldRow[];
}

export interface SoldRow {
  assigned_to: string;
  sales_type: string | null;
  source_name: string | null;
  vehicle_text: string | null;
  event_at: string;
}

export async function readBlinkSnapshot(
  monthStart: string,
  monthEndExclusive: string,
  dbPath: string = DEFAULT_DB,
): Promise<BlinkSnapshot | null> {
  try {
    await fs.access(dbPath);
  } catch {
    return null;
  }

  const events = await querySoldRows(dbPath, monthStart, monthEndExclusive);
  if (events === null) return null;

  const dealsByRep: Record<string, number> = {};
  for (const id of Object.values(REP_NAME_TO_ID)) dealsByRep[id] = 0;

  let newVehicleRdr = 0;
  let lastEventAt: string | null = null;

  for (const row of events) {
    const id = REP_NAME_TO_ID[row.assigned_to];
    if (id) {
      dealsByRep[id] = (dealsByRep[id] ?? 0) + 1;
    }
    if ((row.sales_type ?? "").toUpperCase() === "N") {
      newVehicleRdr += 1;
    }
    if (!lastEventAt || row.event_at > lastEventAt) {
      lastEventAt = row.event_at;
    }
  }

  return { dealsByRep, newVehicleRdr, lastEventAt, events };
}

/**
 * Builds a day-by-day cumulative deal series for each team across the month.
 */
export function buildTelemetrySeries(
  events: SoldRow[],
  monthStart: string,
  monthEndExclusive: string,
): { days: number[]; closer: number[]; storm: number[] } {
  const start = new Date(monthStart + "T00:00:00Z").getTime();
  const end = new Date(monthEndExclusive + "T00:00:00Z").getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((end - start) / dayMs);

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const closer = new Array(totalDays).fill(0);
  const storm = new Array(totalDays).fill(0);

  for (const e of events) {
    const id = REP_NAME_TO_ID[e.assigned_to];
    if (!id) continue;
    const ts = new Date(e.event_at).getTime();
    const dayIndex = Math.min(totalDays - 1, Math.max(0, Math.floor((ts - start) / dayMs)));
    if (TEAM_BILL_IDS.has(id)) closer[dayIndex] += 1;
    else storm[dayIndex] += 1;
  }

  // Cumulate.
  for (let i = 1; i < totalDays; i++) {
    closer[i] += closer[i - 1];
    storm[i] += storm[i - 1];
  }

  return { days, closer, storm };
}

async function querySoldRows(
  dbPath: string,
  monthStartIso: string,
  monthEndExclusiveIso: string,
): Promise<SoldRow[] | null> {
  const sql = [
    "SELECT assigned_to, sales_type, source_name, vehicle_text, event_at",
    "FROM sales_tracking_records",
    "WHERE tracking_mode = 'sold'",
    `  AND event_at >= '${monthStartIso}'`,
    `  AND event_at <  '${monthEndExclusiveIso}'`,
    "ORDER BY event_at ASC;",
  ].join(" ");

  try {
    const { stdout } = await execFileAsync(
      "sqlite3",
      ["-readonly", "-json", dbPath, sql],
      { maxBuffer: 8 * 1024 * 1024, timeout: 5000 },
    );
    const trimmed = stdout.trim();
    if (!trimmed) return [];
    return JSON.parse(trimmed) as SoldRow[];
  } catch (err) {
    console.warn("[blinkAdapter] sqlite3 query failed:", (err as Error).message);
    return null;
  }
}
