import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Manual-entry overrides for Private Sale numbers.
 *
 * The contest spec doesn't yet have a Blink Intelligence pull for PS
 * appointments and PS deals, so the floor manager keeps these in sync
 * by hand via /admin. The values are persisted to `data/overrides.json`
 * at the project root and merged into ContestState at read time.
 */

export interface RepPsOverride {
  psAppointments: number;
  psDeals: number;
}

export interface ManualOverrides {
  perRep: Record<string, RepPsOverride>;
  lastUpdated: string;
}

const OVERRIDES_PATH = path.join(process.cwd(), "data", "overrides.json");

const DEFAULT_OVERRIDES: ManualOverrides = {
  perRep: {
    bill: { psAppointments: 1, psDeals: 1 },
    eric: { psAppointments: 2, psDeals: 2 },
    sonny: { psAppointments: 1, psDeals: 0 },
    doug: { psAppointments: 0, psDeals: 0 },
    sumit: { psAppointments: 1, psDeals: 1 },
    brady: { psAppointments: 1, psDeals: 0 },
    vlad: { psAppointments: 0, psDeals: 0 },
    bob: { psAppointments: 0, psDeals: 0 },
  },
  lastUpdated: new Date().toISOString(),
};

export async function readOverrides(): Promise<ManualOverrides> {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    const parsed = JSON.parse(raw) as ManualOverrides;
    if (!parsed || typeof parsed !== "object" || !parsed.perRep) {
      return DEFAULT_OVERRIDES;
    }
    return parsed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      await writeOverrides(DEFAULT_OVERRIDES);
      return DEFAULT_OVERRIDES;
    }
    return DEFAULT_OVERRIDES;
  }
}

export async function writeOverrides(next: ManualOverrides): Promise<void> {
  const dir = path.dirname(OVERRIDES_PATH);
  await fs.mkdir(dir, { recursive: true });
  const stamped: ManualOverrides = {
    ...next,
    lastUpdated: new Date().toISOString(),
  };
  await fs.writeFile(OVERRIDES_PATH, JSON.stringify(stamped, null, 2) + "\n", "utf8");
}

/** Sanitize a form-derived value into a non-negative integer. */
export function clampCount(value: unknown): number {
  const n = typeof value === "string" ? parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), 999);
}
