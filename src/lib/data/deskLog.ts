/**
 * Desk-log snapshot — Winnipeg Hyundai retail sales sheet.
 *
 * Source: `RETAIL SALES 2026+ (live).xlsx` → `MAY 26` sheet, extracted
 * 2026-05-04. Re-run the export script when the sheet updates.
 *
 * Counting rules (applied at extraction time, also enforced here):
 *  - Status MUST NOT be C or CO. Only "live" deals (D, P) count.
 *  - If ETA is set AND > 2026-06-01 the row is excluded (vehicle won't
 *    arrive before the flag drops).
 *  - Splits are not double-counted; primary salesperson takes the deal.
 */

import type { TelemetrySeries, RecentEvent } from "@/lib/types";

export type VehicleType = "NEW" | "USED";
export type DealStatus = "D" | "P"; // C / CO never make it into this list

export interface DeskLogDeal {
  /** YYYY-MM-DD — the DATE column from the sheet (deal initiated). */
  date: string;
  /** D or P; rows with C / CO are filtered out at extraction time. */
  status: DealStatus;
  /** Source code (UP, RP, RR, RF, PH, REV, etc.). */
  source: string;
  /** RDR field — "R" / "P" / "" / "LM" / etc. */
  rdr: string;
  /** Optional ETA YYYY-MM-DD; "" when no ETA in the sheet. */
  eta: string;
  vehicleType: VehicleType;
  /** Primary salesperson — uppercase short name as it appears on the sheet. */
  salesperson: string;
  /** Split salesperson uppercase short name; "" when no split. */
  split: string;
  customer: string;
  /** Model column ("PALISADE", "TUCSON HEV", etc.). */
  vehicle: string;
}

/**
 * Live deals (status = D or P) from the MAY 26 sheet, snapshot
 * 2026-05-11. 60 rows kept from 66 status rows on the sheet:
 *  - 4 excluded as C/CO (HEMMINGER, BAXTER, SHTYKA, KINCH)
 *  - 1 excluded for ETA > 2026-06-01 (DOUG / MALOLOS)
 *  - 1 excluded as off-roster (VINCE / LLORIN)
 *
 * Seven rows have moved P → D since the last snapshot:
 *  ERIC/MCMILLAN, SUMIT/MERCER, SONNY/LEBLANC, ROBERT/BRASS,
 *  ERIC/KAUR, ROBERT/VELDHUISEN, SUMIT/HOFFMEISTER.
 */
export const DESK_LOG_DEALS: DeskLogDeal[] = [
  { date: "2026-03-19", status: "D", source: "UP", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "ERIC", split: "", customer: "MCMILLAN", vehicle: "PALISADE" },
  { date: "2026-04-04", status: "D", source: "UP", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "MERCER", vehicle: "KONA" },
  { date: "2026-04-11", status: "P", source: "RP", rdr: "", eta: "2026-05-21", vehicleType: "NEW", salesperson: "BILL", split: "VLAD", customer: "KOLT", vehicle: "TUCSON PHEV" },
  { date: "2026-04-11", status: "P", source: "REV", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "SATOUDIAN", vehicle: "PALISADE HEV" },
  { date: "2026-04-13", status: "P", source: "UP", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "ROBERT", customer: "BEDI", vehicle: "PALISADE" },
  { date: "2026-04-17", status: "P", source: "PH", rdr: "", eta: "", vehicleType: "NEW", salesperson: "DOUG", split: "SUMIT", customer: "BEARDY", vehicle: "PALISADE" },
  { date: "2026-04-20", status: "P", source: "RF", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "FETTERLY", vehicle: "KONA" },
  { date: "2026-04-23", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "VLAD", split: "", customer: "LOEPPKY", vehicle: "TUCSON PHEV" },
  { date: "2026-04-25", status: "P", source: "RR", rdr: "", eta: "", vehicleType: "USED", salesperson: "SONNY", split: "", customer: "BROWN", vehicle: "F150" },
  { date: "2026-04-25", status: "P", source: "RP", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "KUROCHKIN", vehicle: "ELANTRA HEV" },
  { date: "2026-04-25", status: "P", source: "PH", rdr: "", eta: "2026-05-18", vehicleType: "NEW", salesperson: "BRADY", split: "SUMIT", customer: "BOLT", vehicle: "SANTA FE HEV" },
  { date: "2026-04-27", status: "P", source: "RP", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "SONNY", split: "BRADY", customer: "NADEAU", vehicle: "TUCSON" },
  { date: "2026-04-27", status: "P", source: "RP", rdr: "LM", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "RACE", vehicle: "TUCSON" },
  { date: "2026-04-30", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "RAUSCH", vehicle: "TUCSON HEV" },
  { date: "2026-05-01", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "USED", salesperson: "SONNY", split: "", customer: "AKINYEMI", vehicle: "SANTA FE" },
  { date: "2026-05-02", status: "D", source: "RF", rdr: "", eta: "", vehicleType: "USED", salesperson: "SONNY", split: "", customer: "LEBLANC", vehicle: "ELANTRA" },
  { date: "2026-05-02", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "WHITE", vehicle: "TUCSON" },
  { date: "2026-05-02", status: "P", source: "RP", rdr: "", eta: "2026-05-18", vehicleType: "NEW", salesperson: "BRADY", split: "", customer: "HORODECKI", vehicle: "KONA" },
  { date: "2026-05-02", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BILL", split: "", customer: "PFEIL", vehicle: "TUCSON" },
  { date: "2026-05-02", status: "P", source: "PH", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BRADY", split: "SUMIT", customer: "SVEINSON", vehicle: "TUCSON" },
  { date: "2026-05-02", status: "P", source: "RF", rdr: "P", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "BRADY", customer: "SALAZAR", vehicle: "VENUE" },
  { date: "2026-05-02", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "USED", salesperson: "SONNY", split: "", customer: "WARREN", vehicle: "KONA" },
  { date: "2026-05-04", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ERIC", split: "", customer: "KAY", vehicle: "KONA" },
  { date: "2026-05-04", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "SINGH", vehicle: "SONATA HEV" },
  { date: "2026-05-04", status: "D", source: "UP", rdr: "P", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "BRASS", vehicle: "PALISADE HEV" },
  { date: "2026-05-04", status: "D", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ERIC", split: "", customer: "KAUR", vehicle: "ELANTRA HEV" },
  { date: "2026-05-05", status: "P", source: "RR", rdr: "", eta: "", vehicleType: "NEW", salesperson: "VLAD", split: "", customer: "RAND", vehicle: "TUCSON HEV" },
  { date: "2026-05-05", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "KATUSIME", vehicle: "TUCSON" },
  { date: "2026-05-05", status: "P", source: "PH", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BRADY", split: "", customer: "GALLAGE", vehicle: "ELANTRA" },
  { date: "2026-05-05", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BRADY", split: "ERIC", customer: "HUTLIN", vehicle: "TUCSON" },
  { date: "2026-05-05", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BRADY", split: "", customer: "PANG", vehicle: "ELANTRA" },
  { date: "2026-05-06", status: "P", source: "UP", rdr: "P", eta: "", vehicleType: "NEW", salesperson: "DOUG", split: "", customer: "HARMS", vehicle: "KONA" },
  { date: "2026-05-07", status: "D", source: "PH", rdr: "P", eta: "", vehicleType: "NEW", salesperson: "ROBERT", split: "BRADY", customer: "VELDHUISEN", vehicle: "SANTA FE HEV" },
  { date: "2026-05-07", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "USED", salesperson: "VLAD", split: "", customer: "HUTTON", vehicle: "KONA" },
  { date: "2026-05-08", status: "D", source: "PH", rdr: "", eta: "", vehicleType: "USED", salesperson: "SUMIT", split: "", customer: "HOFFMEISTER", vehicle: "SONATA" },
  { date: "2026-05-08", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "VLAD", split: "", customer: "MELNYK", vehicle: "TUCSON" },
  { date: "2026-05-08", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BILL", split: "", customer: "ALLEN", vehicle: "VENUE" },
  { date: "2026-05-08", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "USED", salesperson: "ERIC", split: "", customer: "MUIR", vehicle: "SANTA FE" },
  { date: "2026-05-08", status: "P", source: "RP", rdr: "", eta: "2026-05-26", vehicleType: "NEW", salesperson: "ROBERT", split: "", customer: "DOW", vehicle: "TUCSON PHEV" },
  { date: "2026-05-08", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BILL", split: "SONNY", customer: "SINGH", vehicle: "ELANTRA" },
  { date: "2026-05-08", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "USED", salesperson: "VLAD", split: "", customer: "SOROKA", vehicle: "X5" },
  { date: "2026-05-08", status: "P", source: "RR", rdr: "", eta: "", vehicleType: "USED", salesperson: "SONNY", split: "", customer: "RONDEAU", vehicle: "SANTA CRUZ" },
  { date: "2026-05-08", status: "P", source: "PH", rdr: "", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "BHANDAL", vehicle: "KONA" },
  { date: "2026-05-08", status: "P", source: "RR", rdr: "P", eta: "", vehicleType: "NEW", salesperson: "BRADY", split: "SUMIT", customer: "CHATURVEDI", vehicle: "VENUE" },
  { date: "2026-05-08", status: "P", source: "PH", rdr: "", eta: "", vehicleType: "USED", salesperson: "ERIC", split: "", customer: "NGEREM", vehicle: "KONA" },
  { date: "2026-05-09", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ERIC", split: "BILL", customer: "LALONDE", vehicle: "SANTA FE HEV" },
  { date: "2026-05-09", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "NEW", salesperson: "VLAD", split: "BRADY", customer: "VICTOR", vehicle: "KONA" },
  { date: "2026-05-09", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "DOUG", split: "", customer: "GARGE", vehicle: "ELANTRA" },
  { date: "2026-05-09", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "BRADY", split: "SUMIT", customer: "AHMED", vehicle: "PALISADE HEV" },
  { date: "2026-05-09", status: "P", source: "RR", rdr: "P", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "DOUSDEBES CORDOVA", vehicle: "VENUE" },
  { date: "2026-05-09", status: "P", source: "RR", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ERIC", split: "", customer: "VANCAEYZEEL", vehicle: "IONIQ 5" },
  { date: "2026-05-09", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "HENDERSON", vehicle: "TUCSON HEV" },
  { date: "2026-05-09", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "DOUG", split: "BRADY", customer: "ALADENIJII", vehicle: "TUCSON" },
  { date: "2026-05-09", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "USED", salesperson: "VLAD", split: "", customer: "CARREIRO", vehicle: "TUCSON" },
  { date: "2026-05-09", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "ERIC", split: "", customer: "PEZZOTTI", vehicle: "TUCSON HEV" },
  { date: "2026-05-09", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "VLAD", split: "", customer: "BUCKNER", vehicle: "SANTA FE HEV" },
  { date: "2026-05-11", status: "P", source: "UP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "VLAD", split: "", customer: "MACKEY", vehicle: "KONA" },
  { date: "2026-05-11", status: "P", source: "RP", rdr: "", eta: "", vehicleType: "NEW", salesperson: "SUMIT", split: "", customer: "JEFFERY", vehicle: "KONA" },
  { date: "2026-05-11", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "NEW", salesperson: "SONNY", split: "", customer: "DELA CRUZ", vehicle: "TUCSON HEV" },
  { date: "2026-05-11", status: "P", source: "RF", rdr: "", eta: "", vehicleType: "NEW", salesperson: "SONNY", split: "", customer: "MARQUEZ", vehicle: "TUCSON HEV" },
];

/** Desk-log first-name → contest rep id. Robert is "bob" in the contest. */
export const DESK_LOG_NAME_TO_ID: Record<string, string> = {
  BILL: "bill",
  ERIC: "eric",
  SONNY: "sonny",
  DOUG: "doug",
  SUMIT: "sumit",
  BRADY: "brady",
  VLAD: "vlad",
  ROBERT: "bob",
};

const TEAM_BILL_IDS = new Set(["bill", "eric", "sonny", "doug"]);
const TEAM_SUMIT_IDS = new Set(["sumit", "brady", "vlad", "bob"]);

const CONTEST_FLAG_DROP_ISO = "2026-06-01";

export interface RepCounts {
  total: number;
  newDeals: number;
  usedDeals: number;
}

export interface PeriodSnapshot {
  /** Per-rep totals within the period (primary attribution; splits ignored). */
  countsByRep: Record<string, RepCounts>;
  /** Rows where RDR='R' inside the period — registered new-vehicle signal. */
  rdrCount: number;
  /** Latest deal date seen inside the period. */
  lastDate: string;
  /** Total deals in the period. */
  total: number;
  /** Total NEW deals in the period. */
  totalNew: number;
}

/**
 * Returns true if a deal should count toward contest tallies. The
 * embedded list is already filtered, but this guards against any
 * future bad rows slipping through.
 */
function isCountable(deal: DeskLogDeal): boolean {
  if (deal.status !== "D" && deal.status !== "P") return false;
  if (deal.eta && deal.eta > CONTEST_FLAG_DROP_ISO) return false;
  return true;
}

/** Returns rollups across ALL countable deals (no date filter). */
export function readAllDealsSnapshot(): PeriodSnapshot {
  return readPeriodSnapshot("0000-01-01", "9999-12-31");
}

/** Filters countable deals to a date range and returns rep + RDR rollups. */
export function readPeriodSnapshot(
  monthStartIso: string,
  monthEndExclusiveIso: string,
): PeriodSnapshot {
  const countsByRep: Record<string, RepCounts> = {};
  for (const id of Object.values(DESK_LOG_NAME_TO_ID)) {
    countsByRep[id] = { total: 0, newDeals: 0, usedDeals: 0 };
  }

  let rdrCount = 0;
  let lastDate = "";
  let total = 0;
  let totalNew = 0;

  for (const deal of DESK_LOG_DEALS) {
    if (!isCountable(deal)) continue;
    if (deal.date < monthStartIso || deal.date >= monthEndExclusiveIso) continue;
    const id = DESK_LOG_NAME_TO_ID[deal.salesperson.toUpperCase()];
    if (id) {
      const c = countsByRep[id];
      c.total += 1;
      if (deal.vehicleType === "NEW") c.newDeals += 1;
      else c.usedDeals += 1;
    }
    if (deal.rdr === "R") rdrCount += 1;
    if (deal.date > lastDate) lastDate = deal.date;
    total += 1;
    if (deal.vehicleType === "NEW") totalNew += 1;
  }

  return { countsByRep, rdrCount, lastDate, total, totalNew };
}

/** Number of countable NEW deals dated strictly before `monthStartIso`. */
export function countNewBoost(monthStartIso: string): number {
  let n = 0;
  for (const d of DESK_LOG_DEALS) {
    if (!isCountable(d)) continue;
    if (d.vehicleType === "NEW" && d.date < monthStartIso) n += 1;
  }
  return n;
}

/**
 * Builds the cumulative NEW chart series for a contest month.
 *
 * - Day 1 starts at `boost` (last month's NEW carry-over).
 * - Each in-period NEW deal increments cumulative on its date.
 * - Pace = (in-period NEW so far) / (selling days elapsed, Mon–Sat).
 * - Forecast continues from today through end-of-month, adding pace
 *   on every Mon–Sat and 0 on Sundays.
 */
export function buildChartSeries({
  monthStartIso,
  monthEndExclusiveIso,
  todayIso,
  target,
  boost,
}: {
  monthStartIso: string;
  monthEndExclusiveIso: string;
  /** YYYY-MM-DD of today. */
  todayIso: string;
  target: number;
  boost: number;
}): TelemetrySeries {
  const startMs = new Date(monthStartIso + "T00:00:00Z").getTime();
  const endMs = new Date(monthEndExclusiveIso + "T00:00:00Z").getTime();
  const todayMs = new Date(todayIso + "T00:00:00Z").getTime();
  const dayMs = 86_400_000;
  const totalDays = Math.round((endMs - startMs) / dayMs);

  const days: number[] = [];
  const dateLabels: string[] = [];
  const dayOfWeek: number[] = [];
  for (let i = 0; i < totalDays; i++) {
    const dt = new Date(startMs + i * dayMs);
    days.push(dt.getUTCDate());
    dateLabels.push(dt.toISOString().slice(0, 10));
    dayOfWeek.push(dt.getUTCDay()); // 0=Sun
  }

  const dailyAdds = new Array(totalDays).fill(0);
  for (const deal of DESK_LOG_DEALS) {
    if (!isCountable(deal)) continue;
    if (deal.vehicleType !== "NEW") continue;
    if (deal.date < monthStartIso || deal.date >= monthEndExclusiveIso) continue;
    const idx = dateLabels.indexOf(deal.date);
    if (idx >= 0) dailyAdds[idx] += 1;
  }

  let todayIndex = -1;
  if (todayMs >= startMs && todayMs < endMs) {
    todayIndex = Math.floor((todayMs - startMs) / dayMs);
  } else if (todayMs >= endMs) {
    todayIndex = totalDays - 1;
  }

  const actualCumulative: (number | null)[] = new Array(totalDays).fill(null);
  if (todayIndex >= 0) {
    let running = boost;
    for (let i = 0; i <= todayIndex; i++) {
      running += dailyAdds[i];
      actualCumulative[i] = running;
    }
  }

  let sellingDaysElapsed = 0;
  let inPeriodNewSoFar = 0;
  if (todayIndex >= 0) {
    for (let i = 0; i <= todayIndex; i++) {
      if (dayOfWeek[i] !== 0) sellingDaysElapsed += 1;
      inPeriodNewSoFar += dailyAdds[i];
    }
  }
  const paceNewPerSellingDay =
    sellingDaysElapsed > 0 ? inPeriodNewSoFar / sellingDaysElapsed : 0;

  const forecastCumulative: (number | null)[] = new Array(totalDays).fill(null);
  if (todayIndex >= 0) {
    let running = actualCumulative[todayIndex] as number;
    forecastCumulative[todayIndex] = running;
    for (let i = todayIndex + 1; i < totalDays; i++) {
      if (dayOfWeek[i] !== 0) running += paceNewPerSellingDay;
      forecastCumulative[i] = running;
    }
  } else {
    let running = boost;
    for (let i = 0; i < totalDays; i++) {
      forecastCumulative[i] = running;
    }
  }

  let sellingDaysRemaining = 0;
  for (let i = todayIndex + 1; i < totalDays; i++) {
    if (dayOfWeek[i] !== 0) sellingDaysRemaining += 1;
  }

  const eomProjection =
    forecastCumulative[totalDays - 1] !== null
      ? (forecastCumulative[totalDays - 1] as number)
      : boost;
  const currentTotal =
    todayIndex >= 0 && actualCumulative[todayIndex] !== null
      ? (actualCumulative[todayIndex] as number)
      : boost;

  return {
    days,
    dateLabels,
    dayOfWeek,
    todayIndex,
    actualCumulative,
    forecastCumulative,
    boost,
    currentTotal,
    paceNewPerSellingDay: Math.round(paceNewPerSellingDay * 100) / 100,
    sellingDaysElapsed,
    sellingDaysRemaining,
    eomProjection: Math.round(eomProjection * 10) / 10,
    target,
  };
}

/** Latest events as ticker entries, newest first (cap at 12). */
export function buildDeskLogTicker(
  monthStartIso?: string,
  monthEndExclusiveIso?: string,
): RecentEvent[] {
  const filtered = DESK_LOG_DEALS.filter(
    (d) =>
      isCountable(d) &&
      (!monthStartIso ||
        !monthEndExclusiveIso ||
        (d.date >= monthStartIso && d.date < monthEndExclusiveIso)),
  );
  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
  return sorted.slice(0, 12).map((d) => {
    const id = DESK_LOG_NAME_TO_ID[d.salesperson.toUpperCase()];
    const team =
      id && TEAM_BILL_IDS.has(id)
        ? "team-bill"
        : id && TEAM_SUMIT_IDS.has(id)
        ? "team-sumit"
        : null;
    const teamLabel =
      team === "team-bill"
        ? "Team Closer"
        : team === "team-sumit"
        ? "Team Storm"
        : "";
    const text = teamLabel
      ? `${d.salesperson} closes ${d.vehicle} (${d.customer}) — ${teamLabel}`
      : `${d.salesperson} closes ${d.vehicle} (${d.customer})`;
    return { at: d.date, text, team };
  });
}
