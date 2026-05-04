/**
 * Core domain types for the Winnipeg Hyundai monthly sales contest scoreboard.
 *
 * The shape here is the contract that `claude design` (and a future Blink
 * Intelligence connector) will fulfill — keep it stable.
 */

export type TeamId = "team-bill" | "team-sumit";

export interface Salesperson {
  id: string;
  name: string;
  team: TeamId;
  isCaptain: boolean;
  /** Total qualifying deals for the contest month (CO-only under current rules). */
  deals: number;
  /** New-vehicle slice of `deals`. */
  newDeals: number;
  /** Used-vehicle slice of `deals`. */
  usedDeals: number;
  /** Private Sale appointments booked this month. */
  psAppointments: number;
  /** Private Sale deals closed this month (SOURCE = PS). */
  psDeals: number;
  /**
   * Public path to a tight head-and-shoulders portrait of this rep —
   * the cropped wrestling-card face, square-ish. If null/undefined,
   * the UI falls back to the rep's initial in a colored circle.
   */
  portraitSrc?: string | null;
}

export interface Team {
  id: TeamId;
  /** Human-facing display name e.g. "Team Closer". */
  name: string;
  /** Wrestler ringname e.g. "THE CLOSER". */
  ringname: string;
  captain: string;
  /** Short uppercase badge code e.g. CLR, STM. */
  badge: string;
  /** "Hyundai Blue" / "Electric Cyan" — shown under the captain's name. */
  colorTagline: string;
  /** Public path to the captain poster. */
  posterSrc: string;
  /** Tailwind color tokens this team uses for accents/glows. */
  accent: "hyundai" | "electric";
  /** Hex used for inline styles where Tailwind tokens can't reach. */
  accentHex: string;
  /** Lighter accent used for headlines/highlights. */
  accentLightHex: string;
  /** Deep accent for gradients. */
  accentDeepHex: string;
  glowHex: string;
  members: Salesperson[];
}

export type CategoryKind =
  | "new-vehicle-target"
  | "ps-appointments"
  | "ps-deals"
  | "monthly-champion";

export interface CategoryProgress {
  /** Per-team raw count for this category. */
  teamBill: number;
  teamSumit: number;
  /** For target-based categories, the goal number; null otherwise. */
  target: number | null;
  /** "shared" = both teams win if hit; otherwise highest count wins. */
  resolution: "highest-wins" | "shared-target";
}

export interface ContestCategory {
  kind: CategoryKind;
  icon: string;
  title: string;
  blurb: string;
  /** Prize amount per person on the winning team. */
  prizePerPerson: number;
  progress: CategoryProgress;
}

export interface ContestState {
  /** Display string e.g. "April 2026" */
  monthLabel: string;
  /** ISO date the contest opened. */
  monthStart: string;
  /** ISO date the contest closes. */
  monthEnd: string;
  /** Computed days remaining (inclusive of today). */
  daysRemaining: number;
  /** Last time the data was refreshed. */
  lastUpdated: string;
  teams: { teamBill: Team; teamSumit: Team };
  categories: ContestCategory[];
  /** Aggregate totals for header. */
  totals: {
    teamBillDeals: number;
    teamSumitDeals: number;
  };
  /** Source-of-truth note shown in footer. */
  dataSource: string;
  /**
   * Source the deal numbers came from.
   *  - `desk-log` = static snapshot of the APRIL 2026 desk log tab (CO only).
   *  - `live`     = Blink Intelligence warehouse for the current month.
   *  - `demo`     = mock fallback when no source is reachable.
   */
  dataMode: "desk-log" | "live" | "demo";
  /** Latest sold-event timestamp seen in the warehouse, when live. */
  liveLastEventAt: string | null;
  /** Daily cumulative deal totals per team, indexed by day-of-month (1..N). */
  telemetry: TelemetrySeries;
  /** Latest ~12 sold events across both teams, newest first. */
  recentEvents: RecentEvent[];
  /** Pace + projection numbers used by the top stats bar. */
  pace: PaceStats;
}

/**
 * Cumulative-NEW telemetry chart data for the current contest month.
 *
 * Single combined line (both teams summed). Includes:
 *  - a "boost" carry-over from last month (where Day 1 starts on the y-axis)
 *  - actual cumulative through today
 *  - forecast continuation from today to month-end, using only
 *    current-month pace and excluding Sundays from the rate
 */
export interface TelemetrySeries {
  /** Day-of-month 1..N for the current contest month. */
  days: number[];
  /** ISO date string for each day (e.g. "2026-05-01"). */
  dateLabels: string[];
  /** 0=Sun..6=Sat for each day — used to grey out Sundays in the chart. */
  dayOfWeek: number[];
  /** Index of "today" in days[]; -1 before the month, totalDays-1 after. */
  todayIndex: number;
  /** Cumulative NEW combined through end-of-day; null beyond today. */
  actualCumulative: (number | null)[];
  /** Cumulative NEW projection through end-of-day; null before today. */
  forecastCumulative: (number | null)[];
  /** Carry-over from last month — Day 1 starts on this y-value. */
  boost: number;
  /** Total cumulative as of today (boost + this-month NEW so far). */
  currentTotal: number;
  /** Pace = NEW deals per selling day, computed from current period only. */
  paceNewPerSellingDay: number;
  /** Selling days (Mon–Sat) elapsed in the current period through today. */
  sellingDaysElapsed: number;
  /** Selling days remaining after today. */
  sellingDaysRemaining: number;
  /** Projected end-of-month cumulative. */
  eomProjection: number;
  /** Target line value (currently 80 new cars). */
  target: number;
}

export interface RecentEvent {
  /** ISO timestamp. */
  at: string;
  /** Display-ready short text e.g. "ERIC closes deal #19 — Team Closer". */
  text: string;
  /** Team this event is attributed to (when applicable). */
  team: TeamId | null;
}

export interface PaceStats {
  /** Combined deals/day across both teams MTD. */
  combinedPerDay: number;
  /** Difference in deals between leading and trailing team (always ≥ 0). */
  delta: number;
  /** Which team is currently leading total deals. */
  leader: TeamId | "tie";
  /** End-of-month projected total for each team. */
  eomProjection: { teamCloser: number; teamStorm: number };
  /** Months elapsed days (so day 2 of 31 etc.) */
  elapsedDays: number;
  /** Total days in the month. */
  totalDays: number;
}
