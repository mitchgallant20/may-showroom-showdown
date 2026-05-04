/**
 * Desk log snapshot — CO deals only.
 *
 * Snapshot extracted from `RETAIL SALES 2026+ (live).xlsx` → APRIL 2026 sheet
 * on 2026-05-03. The April reporting cycle includes a few May 1–2 dated
 * rows; we use those to drive May's pace forecast while April-dated rows
 * become the "boost" the chart starts with on Day 1.
 *
 * Replace with a live xlsx/Sheets pull when ready.
 */

import type { TelemetrySeries, RecentEvent } from "@/lib/types";

export type VehicleType = "NEW" | "USED";

export interface CoDeal {
  /** YYYY-MM-DD */
  date: string;
  source: string; // UP, RP, RR, RF, PH, etc.
  rdr: "R" | "P" | "" | string;
  vehicleType: VehicleType;
  salesperson: string; // primary, uppercase short name
  split: string;
  customer: string;
  vehicle: string;
}

/** All 25 CO rows extracted from the APRIL 2026 sheet. */
export const APRIL_CO_DEALS: CoDeal[] = [
  { date: "2026-03-19", source: "UP", rdr: "R", vehicleType: "NEW",  salesperson: "ERIC",   split: "",       customer: "MCMILLAN",   vehicle: "PALISADE" },
  { date: "2026-04-04", source: "UP", rdr: "R", vehicleType: "NEW",  salesperson: "SUMIT",  split: "",       customer: "MERCER",     vehicle: "KONA" },
  { date: "2026-04-11", source: "RP", rdr: "",  vehicleType: "NEW",  salesperson: "BILL",   split: "VLAD",   customer: "KOLT",       vehicle: "TUCSON PHEV" },
  { date: "2026-04-13", source: "UP", rdr: "R", vehicleType: "NEW",  salesperson: "SUMIT",  split: "ROBERT", customer: "BEDI",       vehicle: "PALISADE" },
  { date: "2026-04-14", source: "UP", rdr: "",  vehicleType: "NEW",  salesperson: "DOUG",   split: "",       customer: "MALOLOS",    vehicle: "SANTA FE HEV" },
  { date: "2026-04-17", source: "PH", rdr: "",  vehicleType: "NEW",  salesperson: "DOUG",   split: "SUMIT",  customer: "BEARDY",     vehicle: "PALISADE" },
  { date: "2026-04-20", source: "RF", rdr: "R", vehicleType: "NEW",  salesperson: "ROBERT", split: "",       customer: "FETTERLY",   vehicle: "KONA" },
  { date: "2026-04-20", source: "UP", rdr: "",  vehicleType: "NEW",  salesperson: "SONNY",  split: "",       customer: "HEMMINGER",  vehicle: "IONIQ 5" },
  { date: "2026-04-22", source: "RP", rdr: "",  vehicleType: "NEW",  salesperson: "BRADY",  split: "",       customer: "BAXTER",     vehicle: "KONA EV" },
  { date: "2026-04-23", source: "UP", rdr: "",  vehicleType: "NEW",  salesperson: "VLAD",   split: "",       customer: "LOEPPKY",    vehicle: "TUCSON PHEV" },
  { date: "2026-04-25", source: "RR", rdr: "",  vehicleType: "USED", salesperson: "SONNY",  split: "",       customer: "BROWN",      vehicle: "F150" },
  { date: "2026-04-25", source: "RP", rdr: "R", vehicleType: "NEW",  salesperson: "SUMIT",  split: "",       customer: "KUROCHKIN",  vehicle: "ELANTRA HEV" },
  { date: "2026-04-25", source: "PH", rdr: "",  vehicleType: "NEW",  salesperson: "BRADY",  split: "SUMIT",  customer: "BOLT",       vehicle: "SANTA FE HEV" },
  { date: "2026-04-27", source: "RP", rdr: "R", vehicleType: "NEW",  salesperson: "SONNY",  split: "BRADY",  customer: "NADEAU",     vehicle: "TUCSON" },
  { date: "2026-04-27", source: "RP", rdr: "R", vehicleType: "NEW",  salesperson: "ROBERT", split: "",       customer: "RACE",       vehicle: "TUCSON" },
  { date: "2026-04-30", source: "UP", rdr: "",  vehicleType: "NEW",  salesperson: "ROBERT", split: "",       customer: "RAUSCH",     vehicle: "TUCSON HEV" },
  { date: "2026-05-01", source: "RF", rdr: "",  vehicleType: "USED", salesperson: "SONNY",  split: "",       customer: "AKINYEMI",   vehicle: "SANTA FE" },
  { date: "2026-05-02", source: "RF", rdr: "",  vehicleType: "USED", salesperson: "SONNY",  split: "",       customer: "LEBLANC",    vehicle: "ELANTRA" },
  { date: "2026-05-02", source: "RF", rdr: "",  vehicleType: "NEW",  salesperson: "SUMIT",  split: "",       customer: "WHITE",      vehicle: "TUCSON" },
  { date: "2026-05-02", source: "RP", rdr: "",  vehicleType: "NEW",  salesperson: "BRADY",  split: "",       customer: "HORODECKI",  vehicle: "KONA" },
  { date: "2026-05-02", source: "RP", rdr: "",  vehicleType: "NEW",  salesperson: "BILL",   split: "",       customer: "PFEIL",      vehicle: "TUCSON" },
  { date: "2026-05-02", source: "PH", rdr: "",  vehicleType: "NEW",  salesperson: "BRADY",  split: "SUMIT",  customer: "SVEINSON",   vehicle: "TUCSON" },
  { date: "2026-05-02", source: "RF", rdr: "",  vehicleType: "USED", salesperson: "VLAD",   split: "",       customer: "SHTYKA",     vehicle: "X5" },
  { date: "2026-05-02", source: "RF", rdr: "P", vehicleType: "NEW",  salesperson: "SUMIT",  split: "BRADY",  customer: "SALAZAR",    vehicle: "VENUE" },
  { date: "2026-05-02", source: "RF", rdr: "",  vehicleType: "USED", salesperson: "SONNY",  split: "",       customer: "WARREN",     vehicle: "KONA" },
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

export interface RepCounts {
  total: number;
  newDeals: number;
  usedDeals: number;
}

export interface PeriodSnapshot {
  /** Per-rep CO totals within the period (primary attribution; splits ignored). */
  countsByRep: Record<string, RepCounts>;
  /** CO rows where RDR='R' inside the period — registered new-vehicle signal. */
  rdrCount: number;
  /** Latest deal date seen inside the period. */
  lastDate: string;
  /** Total CO deals in the period. */
  total: number;
  /** Total CO NEW deals in the period. */
  totalNew: number;
}

/** Returns rollups across ALL CO rows (no date filter). */
export function readAllDealsSnapshot(): PeriodSnapshot {
  return readPeriodSnapshot("0000-01-01", "9999-12-31");
}

/** Filters CO deals to a date range and returns rep + RDR rollups. */
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

  for (const deal of APRIL_CO_DEALS) {
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

/** Number of NEW CO deals dated strictly before `monthStartIso`. */
export function countNewBoost(monthStartIso: string): number {
  let n = 0;
  for (const d of APRIL_CO_DEALS) {
    if (d.vehicleType === "NEW" && d.date < monthStartIso) n += 1;
  }
  return n;
}

/**
 * Builds the cumulative NEW chart series for a contest month.
 *
 * - Day 1 starts at `boost` (last month's NEW deals carried over).
 * - Each in-period NEW deal increments cumulative on its date.
 * - Pace = (in-period NEW so far) / (selling days elapsed, Mon–Sat).
 * - Forecast continues from today through end-of-month, adding pace
 *   on every Mon–Sat and adding 0 on Sundays.
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

  // Daily new-deal counts within the period.
  const dailyAdds = new Array(totalDays).fill(0);
  for (const deal of APRIL_CO_DEALS) {
    if (deal.vehicleType !== "NEW") continue;
    if (deal.date < monthStartIso || deal.date >= monthEndExclusiveIso) continue;
    const idx = dateLabels.indexOf(deal.date);
    if (idx >= 0) dailyAdds[idx] += 1;
  }

  // Today index inside the month.
  let todayIndex = -1;
  if (todayMs >= startMs && todayMs < endMs) {
    todayIndex = Math.floor((todayMs - startMs) / dayMs);
  } else if (todayMs >= endMs) {
    todayIndex = totalDays - 1;
  }

  // Actual cumulative through today.
  const actualCumulative: (number | null)[] = new Array(totalDays).fill(null);
  if (todayIndex >= 0) {
    let running = boost;
    for (let i = 0; i <= todayIndex; i++) {
      running += dailyAdds[i];
      actualCumulative[i] = running;
    }
  }

  // Pace: NEW added inside the period through today / selling-days through today.
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

  // Forecast continuation from today onward, skipping Sundays.
  const forecastCumulative: (number | null)[] = new Array(totalDays).fill(null);
  if (todayIndex >= 0) {
    let running = actualCumulative[todayIndex] as number;
    forecastCumulative[todayIndex] = running;
    for (let i = todayIndex + 1; i < totalDays; i++) {
      if (dayOfWeek[i] !== 0) running += paceNewPerSellingDay;
      forecastCumulative[i] = running;
    }
  } else {
    // Today is before the month — project the entire month at zero pace.
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

/** Latest CO events as ticker entries, newest first (cap at 12). */
export function buildDeskLogTicker(
  monthStartIso?: string,
  monthEndExclusiveIso?: string,
): RecentEvent[] {
  const filtered = APRIL_CO_DEALS.filter(
    (d) =>
      !monthStartIso ||
      !monthEndExclusiveIso ||
      (d.date >= monthStartIso && d.date < monthEndExclusiveIso),
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
