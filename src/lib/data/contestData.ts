import type {
  ContestState,
  PaceStats,
  Salesperson,
  Team,
} from "@/lib/types";
import { readOverrides } from "@/lib/data/manualOverrides";
import {
  DESK_LOG_DEALS,
  buildChartSeries,
  buildDeskLogTicker,
  countNewBoost,
  readAllDealsSnapshot,
  readPeriodSnapshot,
} from "@/lib/data/deskLog";

/**
 * Composes the ContestState shown on the Pit Wall.
 *
 * Contest period = the calendar month containing today. Standings, sectors,
 * pace, and team totals all reflect deals dated inside that month.
 *
 * Last-month deals (rows dated before the contest month start) are not
 * counted in standings, but they ARE used as the chart's starting "boost"
 * so the cumulative line begins above zero.
 *
 * Forecast pace = (in-period NEW / selling days elapsed in the period),
 * skipping Sundays. Last-month deals do not influence the rate.
 *
 * Source for now: MAY 26 desk-log snapshot. C / CO statuses excluded;
 * rows with ETA > 2026-06-01 also excluded. Replace with a live xlsx
 * pull when ready.
 */

interface BaseRep {
  id: string;
  name: string;
  team: "team-bill" | "team-sumit";
  isCaptain: boolean;
  /**
   * Public path to the cropped wrestling-card head shot. Convention:
   * `/fighters/<id>.png` — these files are produced by cropping the
   * full character cards saved in `/public/fighters/source/`.
   */
  portraitSrc: string;
}

const BASE_TEAM_BILL: BaseRep[] = [
  { id: "bill",  name: "Bill",  team: "team-bill", isCaptain: true,  portraitSrc: "/fighters/bill.png" },
  { id: "eric",  name: "Eric",  team: "team-bill", isCaptain: false, portraitSrc: "/fighters/eric.png" },
  { id: "sonny", name: "Sonny", team: "team-bill", isCaptain: false, portraitSrc: "/fighters/sonny.png" },
  { id: "doug",  name: "Doug",  team: "team-bill", isCaptain: false, portraitSrc: "/fighters/doug.png" },
];

const BASE_TEAM_SUMIT: BaseRep[] = [
  { id: "sumit", name: "Sumit", team: "team-sumit", isCaptain: true,  portraitSrc: "/fighters/sumit.png" },
  { id: "brady", name: "Brady", team: "team-sumit", isCaptain: false, portraitSrc: "/fighters/brady.png" },
  { id: "vlad",  name: "Vlad",  team: "team-sumit", isCaptain: false, portraitSrc: "/fighters/vlad.png" },
  { id: "bob",   name: "Bob",   team: "team-sumit", isCaptain: false, portraitSrc: "/fighters/bob.png" },
];

const TEAM_BILL_META = {
  id: "team-bill" as const,
  name: "Team Closer",
  ringname: "THE CLOSER",
  captain: "Bill",
  badge: "CLR",
  colorTagline: "Hyundai Blue",
  posterSrc: "/captains/team-closer.png",
  accent: "hyundai" as const,
  accentHex: "#1d6cd1",
  accentLightHex: "#5ea3ff",
  accentDeepHex: "#0a3a7a",
  glowHex: "rgba(29, 108, 209, 0.55)",
};

const TEAM_SUMIT_META = {
  id: "team-sumit" as const,
  name: "Team Storm",
  ringname: "THE STORM",
  captain: "Sumit",
  badge: "STM",
  colorTagline: "Electric Cyan",
  posterSrc: "/captains/team-storm.png",
  accent: "electric" as const,
  accentHex: "#00b8d4",
  accentLightHex: "#7be8ff",
  accentDeepHex: "#066b7d",
  glowHex: "rgba(0, 184, 212, 0.6)",
};

const NEW_VEHICLE_TARGET = 80;

interface MonthBounds {
  monthLabel: string;
  /** YYYY-MM-DD of day 1 */
  monthStart: string;
  /** YYYY-MM-DD of last day (inclusive) */
  monthEnd: string;
  /** YYYY-MM-DD of first day of next month (exclusive in queries) */
  monthEndExclusive: string;
  totalDays: number;
  /** 1..totalDays — today's day-of-month, clamped */
  elapsedDays: number;
  /** Days remaining inclusive of today */
  daysRemaining: number;
  /** YYYY-MM-DD of today, clamped to month bounds. */
  todayIso: string;
}

function getCurrentMonthBounds(now: Date = new Date()): MonthBounds {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const endExclusive = new Date(Date.UTC(year, month + 1, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = lastDay.getUTCDate();

  const monthLabel = start.toLocaleString("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const today = now.getUTCDate();
  const elapsedDays = Math.max(1, Math.min(totalDays, today));
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(
    0,
    Math.ceil((lastDay.getTime() - Date.UTC(year, month, today)) / msPerDay) + 1,
  );

  return {
    monthLabel,
    monthStart: isoDate(start),
    monthEnd: isoDate(lastDay),
    monthEndExclusive: isoDate(endExclusive),
    totalDays,
    elapsedDays,
    daysRemaining,
    todayIso: isoDate(now),
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function applyDeals(
  base: BaseRep[],
  countsByRep: Record<string, { total: number; newDeals: number; usedDeals: number }>,
  overrides: Awaited<ReturnType<typeof readOverrides>>,
): Salesperson[] {
  return base.map((rep) => {
    const o = overrides.perRep[rep.id];
    const c = countsByRep[rep.id] ?? { total: 0, newDeals: 0, usedDeals: 0 };
    return {
      id: rep.id,
      name: rep.name,
      team: rep.team,
      isCaptain: rep.isCaptain,
      deals: c.total,
      newDeals: c.newDeals,
      usedDeals: c.usedDeals,
      psAppointments: o?.psAppointments ?? 0,
      psDeals: o?.psDeals ?? 0,
      portraitSrc: rep.portraitSrc,
    };
  });
}

function buildTeam(
  meta: typeof TEAM_BILL_META | typeof TEAM_SUMIT_META,
  members: Salesperson[],
): Team {
  return { ...meta, members };
}

const sumDeals = (members: Salesperson[]) =>
  members.reduce((acc, m) => acc + m.deals, 0);
const sumPsApts = (members: Salesperson[]) =>
  members.reduce((acc, m) => acc + m.psAppointments, 0);
const sumPsDeals = (members: Salesperson[]) =>
  members.reduce((acc, m) => acc + m.psDeals, 0);

interface PaceInputs {
  /** All-time team totals (for the standings rank, delta, EOM base). */
  closerTotal: number;
  stormTotal: number;
  /** In-period CO counts — what drives the pace multiplier. */
  closerInPeriod: number;
  stormInPeriod: number;
  /** Selling days (Mon–Sat) elapsed in the period through today. */
  sellingDaysElapsed: number;
  /** Selling days remaining after today. */
  sellingDaysRemaining: number;
  month: MonthBounds;
}

function buildPace({
  closerTotal,
  stormTotal,
  closerInPeriod,
  stormInPeriod,
  sellingDaysElapsed,
  sellingDaysRemaining,
  month,
}: PaceInputs): PaceStats {
  const safeElapsed = Math.max(sellingDaysElapsed, 1);
  const closerPerDay = closerInPeriod / safeElapsed;
  const stormPerDay = stormInPeriod / safeElapsed;
  const combinedPerDay = closerPerDay + stormPerDay;

  // Each team's EOM = current total + (their in-period pace × selling days remaining).
  // Pre-period CO still counts in `total`, but doesn't influence the multiplier.
  const closerEOM = Math.round(closerTotal + closerPerDay * sellingDaysRemaining);
  const stormEOM = Math.round(stormTotal + stormPerDay * sellingDaysRemaining);

  const delta = Math.abs(closerTotal - stormTotal);
  const leader =
    closerTotal === stormTotal
      ? "tie"
      : closerTotal > stormTotal
      ? "team-bill"
      : "team-sumit";

  return {
    combinedPerDay: Math.round(combinedPerDay * 10) / 10,
    delta,
    leader,
    eomProjection: {
      teamCloser: closerEOM,
      teamStorm: stormEOM,
    },
    elapsedDays: month.elapsedDays,
    totalDays: month.totalDays,
  };
}

export async function getContestState(): Promise<ContestState> {
  const overrides = await readOverrides();
  const month = getCurrentMonthBounds();
  // Standings, sectors, totals, face-off all count EVERY CO deal in the
  // desk log (no date filter). Only the chart's pace forecast and the
  // EOM projection split pre-month deals out so they don't drag the rate.
  const snapshot = readAllDealsSnapshot();
  const periodSnapshot = readPeriodSnapshot(
    month.monthStart,
    month.monthEndExclusive,
  );
  const newBoost = countNewBoost(month.monthStart);

  const teamBillMembers = applyDeals(BASE_TEAM_BILL, snapshot.countsByRep, overrides);
  const teamSumitMembers = applyDeals(BASE_TEAM_SUMIT, snapshot.countsByRep, overrides);

  const teamBill = buildTeam(TEAM_BILL_META, teamBillMembers);
  const teamSumit = buildTeam(TEAM_SUMIT_META, teamSumitMembers);

  const teamBillDeals = sumDeals(teamBillMembers);
  const teamSumitDeals = sumDeals(teamSumitMembers);
  const teamBillPsApts = sumPsApts(teamBillMembers);
  const teamSumitPsApts = sumPsApts(teamSumitMembers);
  const teamBillPsDeals = sumPsDeals(teamBillMembers);
  const teamSumitPsDeals = sumPsDeals(teamSumitMembers);

  const telemetry = buildChartSeries({
    monthStartIso: month.monthStart,
    monthEndExclusiveIso: month.monthEndExclusive,
    todayIso: month.todayIso,
    target: NEW_VEHICLE_TARGET,
    boost: newBoost,
  });
  const recentEvents = buildDeskLogTicker(); // any-date, newest first

  // In-period team totals — used only for the EOM projection multiplier.
  const closerInPeriod = BASE_TEAM_BILL.reduce(
    (acc, r) => acc + (periodSnapshot.countsByRep[r.id]?.total ?? 0),
    0,
  );
  const stormInPeriod = BASE_TEAM_SUMIT.reduce(
    (acc, r) => acc + (periodSnapshot.countsByRep[r.id]?.total ?? 0),
    0,
  );

  const pace = buildPace({
    closerTotal: teamBillDeals,
    stormTotal: teamSumitDeals,
    closerInPeriod,
    stormInPeriod,
    sellingDaysElapsed: telemetry.sellingDaysElapsed,
    sellingDaysRemaining: telemetry.sellingDaysRemaining,
    month,
  });

  // New-vehicle target progress = total NEW count across all rows in the
  // desk log (snapshot already includes April + May). Matches the chart
  // line's end-of-today value.
  const newCarsToward80 =
    teamBillMembers.reduce((a, m) => a + m.newDeals, 0) +
    teamSumitMembers.reduce((a, m) => a + m.newDeals, 0);

  const dataSource = `Desk Log · MAY 26 sheet · ${DESK_LOG_DEALS.length} live deals (D + P, excluding C / CO) · ETA ≤ Jun 1 · ${month.monthLabel} contest · pre-${month.monthStart} NEW deals (${newBoost}) carry as chart boost only · PS appointments + PS deals updated manually via /admin`;

  return {
    monthLabel: month.monthLabel,
    monthStart: month.monthStart,
    monthEnd: month.monthEnd,
    daysRemaining: month.daysRemaining,
    lastUpdated: snapshot.lastDate || month.todayIso,
    teams: { teamBill, teamSumit },
    totals: {
      teamBillDeals,
      teamSumitDeals,
    },
    categories: [
      {
        kind: "new-vehicle-target",
        icon: "🎯",
        title: "Hyundai New Vehicle Target",
        blurb: "80 new cars to flag drop. Includes last month's carry-over boost.",
        prizePerPerson: 250,
        progress: {
          teamBill: newCarsToward80,
          teamSumit: newCarsToward80,
          target: NEW_VEHICLE_TARGET,
          resolution: "shared-target",
        },
      },
      {
        kind: "ps-appointments",
        icon: "📞",
        title: "Most PS Appointments",
        blurb: "PS-source appointments booked. Highest count wins.",
        prizePerPerson: 250,
        progress: {
          teamBill: teamBillPsApts,
          teamSumit: teamSumitPsApts,
          target: null,
          resolution: "highest-wins",
        },
      },
      {
        kind: "ps-deals",
        icon: "🔑",
        title: "Most PS Deals (SOURCE = PS)",
        blurb: "Deals where SOURCE = PS. Highest count wins.",
        prizePerPerson: 250,
        progress: {
          teamBill: teamBillPsDeals,
          teamSumit: teamSumitPsDeals,
          target: null,
          resolution: "highest-wins",
        },
      },
      {
        kind: "monthly-champion",
        icon: "🏁",
        title: "Monthly Champion · CO Deals",
        blurb: "Counting CO deals only this contest. Splits are not double-counted.",
        prizePerPerson: 500,
        progress: {
          teamBill: teamBillDeals,
          teamSumit: teamSumitDeals,
          target: null,
          resolution: "highest-wins",
        },
      },
    ],
    dataSource,
    dataMode: "desk-log",
    liveLastEventAt: snapshot.lastDate || null,
    telemetry,
    recentEvents,
    pace,
  };
}

/** Sorted leaderboard for standings table. */
export function getAllSalespeople(state: ContestState): Salesperson[] {
  return [...state.teams.teamBill.members, ...state.teams.teamSumit.members].sort(
    (a, b) => b.deals - a.deals,
  );
}

export function categoryWinner(
  state: ContestState,
  kind: ContestState["categories"][number]["kind"],
): "team-bill" | "team-sumit" | "tie" | "shared" | "behind" {
  const cat = state.categories.find((c) => c.kind === kind);
  if (!cat) return "tie";
  const { teamBill, teamSumit, target, resolution } = cat.progress;
  if (resolution === "shared-target") {
    if (target === null) return "tie";
    return teamBill >= target ? "shared" : "behind";
  }
  if (teamBill === teamSumit) return "tie";
  return teamBill > teamSumit ? "team-bill" : "team-sumit";
}

export function getRepRoster(): Array<{
  id: string;
  name: string;
  team: "team-bill" | "team-sumit";
  isCaptain: boolean;
}> {
  return [...BASE_TEAM_BILL, ...BASE_TEAM_SUMIT].map((r) => ({
    id: r.id,
    name: r.name,
    team: r.team,
    isCaptain: r.isCaptain,
  }));
}
