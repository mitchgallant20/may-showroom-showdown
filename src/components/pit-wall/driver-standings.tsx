import Image from "next/image";
import type { ContestState, Salesperson } from "@/lib/types";
import { getAllSalespeople } from "@/lib/data/contestData";

interface DriverStandingsProps {
  state: ContestState;
}

export function DriverStandings({ state }: DriverStandingsProps) {
  const ranked = getAllSalespeople(state);
  const leaderDeals = ranked[0]?.deals ?? 0;
  const closer = aggregateTeam(state.teams.teamBill.members);
  const storm = aggregateTeam(state.teams.teamSumit.members);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-white/[0.02] to-transparent">
      <header className="flex flex-col gap-3 border-b border-line px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="m-0 font-display text-[22px] font-black uppercase tracking-[0.04em] text-white">
            Driver Standings
          </h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            {ranked.length} reps · sorted by deals
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-2.5">
          <TeamSummary
            label="Team Closer"
            badge="CLR"
            accentLight="var(--bill-2)"
            accentBg="rgba(29,108,209,0.16)"
            accentBorder="rgba(94,163,255,0.35)"
            stats={closer}
          />
          <TeamSummary
            label="Team Storm"
            badge="STM"
            accentLight="var(--sumit-2)"
            accentBg="rgba(0,184,212,0.14)"
            accentBorder="rgba(123,232,255,0.35)"
            stats={storm}
          />
        </div>
      </header>
      <div className="p-0">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th>P</Th>
              <Th>Driver</Th>
              <Th align="right">Deals</Th>
              <Th align="right" hideOnNarrow>Δ</Th>
              <Th align="right" hideOnNarrow>Pace</Th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((rep, index) => (
              <Row
                key={rep.id}
                rep={rep}
                rank={index + 1}
                leaderDeals={leaderDeals}
                team={rep.team}
                captain={
                  rep.team === "team-bill"
                    ? state.teams.teamBill.captain
                    : state.teams.teamSumit.captain
                }
                teamLabel={rep.team === "team-bill" ? "Team Closer" : "Team Storm"}
                teamBadge={rep.team === "team-bill" ? "CLR" : "STM"}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TeamAggregate {
  total: number;
  newDeals: number;
  usedDeals: number;
  psApt: number;
  psSale: number;
}

function aggregateTeam(members: Salesperson[]): TeamAggregate {
  let total = 0;
  let newDeals = 0;
  let usedDeals = 0;
  let psApt = 0;
  let psSale = 0;
  for (const m of members) {
    total += m.deals;
    newDeals += m.newDeals;
    usedDeals += m.usedDeals;
    psApt += m.psAppointments;
    psSale += m.psDeals;
  }
  return { total, newDeals, usedDeals, psApt, psSale };
}

function TeamSummary({
  label,
  badge,
  accentLight,
  accentBg,
  accentBorder,
  stats,
}: {
  label: string;
  badge: string;
  accentLight: string;
  accentBg: string;
  accentBorder: string;
  stats: TeamAggregate;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-3 py-1.5"
      style={{ background: accentBg, borderColor: accentBorder }}
    >
      <div className="flex flex-col">
        <span
          className="inline-flex w-fit items-center rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{
            color: accentLight,
            border: `1px solid ${accentBorder}`,
            background: "rgba(0,0,0,0.25)",
          }}
        >
          {badge}
        </span>
        <span
          className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: accentLight }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2.5 border-l border-white/10 pl-3">
        <Cell label="Total" value={stats.total} color="#fff" />
        <Cell label="New" value={stats.newDeals} color={accentLight} />
        <Cell label="Used" value={stats.usedDeals} color="rgba(230,237,246,0.85)" />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="font-display numeric text-2xl font-black leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
        {label}
      </span>
    </div>
  );
}

function Th({
  children,
  align = "left",
  hideOnNarrow = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  hideOnNarrow?: boolean;
}) {
  return (
    <th
      className={`sticky top-0 border-b border-line bg-ink-900 px-2.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 ${
        align === "right" ? "text-right" : "text-left"
      } ${hideOnNarrow ? "hidden lg:table-cell" : ""}`}
    >
      {children}
    </th>
  );
}

interface RowProps {
  rep: Salesperson;
  rank: number;
  leaderDeals: number;
  team: "team-bill" | "team-sumit";
  captain: string;
  teamLabel: string;
  teamBadge: string;
}

function Row({ rep, rank, leaderDeals, team, captain, teamLabel, teamBadge }: RowProps) {
  const podiumColor =
    rank === 1
      ? "var(--gold)"
      : rank === 2
      ? "#cbd5e1"
      : rank === 3
      ? "#cd7f32"
      : "#fff";
  const isCaptain = rep.isCaptain;
  const isLeader = rank === 1;
  const delta = rep.deals - leaderDeals;

  return (
    <tr
      className={isLeader ? "border-b border-line" : "border-b border-line"}
      style={isLeader ? { background: "rgba(255,210,74,0.04)" } : undefined}
    >
      <td
        className="px-2.5 py-2.5 font-display text-[22px] font-black w-[42px] numeric"
        style={{ color: rank <= 3 ? podiumColor : "#fff" }}
      >
        {rank}
      </td>
      <td className="px-2.5 py-2.5">
        <div className="flex items-center gap-2">
          <Pic
            team={team}
            initial={rep.name[0]}
            portraitSrc={rep.portraitSrc ?? null}
            isCaptain={isCaptain}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[15px] font-bold leading-tight text-white">
              {rep.name}
              <Badge team={team}>{teamBadge}</Badge>
              {isCaptain && (
                <span
                  className="inline-flex items-center gap-1 rounded-md border border-gold/40 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{
                    background: "rgba(255,210,74,0.14)",
                    color: "var(--gold)",
                  }}
                >
                  C
                </span>
              )}
            </div>
            <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-white/55">
              {teamLabel}
              {isCaptain && ` · Captain`}
              {isCaptain && captain !== rep.name && ` (${captain})`}
            </div>
            <RepStatsRow rep={rep} />
          </div>
        </div>
      </td>
      <td className="px-2.5 py-2.5 text-right font-display numeric text-2xl font-black text-white">
        {rep.deals}
      </td>
      <td className="hidden px-2.5 py-2.5 text-right font-mono text-xs font-bold text-white/55 lg:table-cell">
        {rank === 1 ? "—" : delta < 0 ? `${delta}` : `+${delta}`}
      </td>
      <td className="hidden px-2.5 py-2.5 text-right font-mono text-xs font-bold lg:table-cell">
        <PaceCell rep={rep} leaderDeals={leaderDeals} />
      </td>
    </tr>
  );
}

function RepStatsRow({ rep }: { rep: Salesperson }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
      <Stat label="New" value={rep.newDeals} tone="bill-light" />
      <Stat label="Used" value={rep.usedDeals} tone="muted" />
      <span aria-hidden className="h-3 w-px bg-line-strong" />
      <Stat label="PS Apt" value={rep.psAppointments} tone="sumit-light" />
      <Stat label="PS Sale" value={rep.psDeals} tone="gold" />
    </div>
  );
}

type StatTone = "bill-light" | "sumit-light" | "gold" | "muted";

const STAT_TONE_COLOR: Record<StatTone, string> = {
  "bill-light": "var(--bill-2)",
  "sumit-light": "var(--sumit-2)",
  gold: "var(--gold)",
  muted: "rgba(230,237,246,0.65)",
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: StatTone;
}) {
  const isZero = value === 0;
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5"
      style={{
        background: "rgba(255,255,255,0.02)",
        opacity: isZero ? 0.55 : 1,
      }}
    >
      <span className="text-white/50">{label}</span>
      <span
        className="numeric"
        style={{ color: isZero ? "rgba(230,237,246,0.45)" : STAT_TONE_COLOR[tone] }}
      >
        {value}
      </span>
    </span>
  );
}

function Pic({
  team,
  initial,
  portraitSrc,
  isCaptain,
}: {
  team: "team-bill" | "team-sumit";
  initial: string;
  portraitSrc: string | null;
  isCaptain: boolean;
}) {
  const bg =
    team === "team-bill"
      ? "linear-gradient(135deg, rgba(29,108,209,0.45), rgba(29,108,209,0.1))"
      : "linear-gradient(135deg, rgba(0,184,212,0.45), rgba(0,184,212,0.1))";
  // Captains get a gold ring to read at a glance.
  const borderColor = isCaptain ? "rgba(255,210,74,0.85)" : undefined;
  const ringShadow = isCaptain ? "0 0 0 1px rgba(255,210,74,0.45)" : undefined;
  return (
    <div
      className="relative flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong font-display text-sm font-black text-white"
      style={{ background: bg, borderColor, boxShadow: ringShadow }}
    >
      {portraitSrc ? (
        <Image
          src={portraitSrc}
          alt=""
          fill
          sizes="44px"
          className="object-cover"
          style={{ objectPosition: "center 22%" }}
        />
      ) : (
        <span>{initial.toUpperCase()}</span>
      )}
    </div>
  );
}

function Badge({
  team,
  children,
}: {
  team: "team-bill" | "team-sumit";
  children: React.ReactNode;
}) {
  if (team === "team-bill") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: "rgba(29,108,209,0.16)",
          color: "var(--bill-2)",
          border: "1px solid rgba(94,163,255,0.35)",
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{
        background: "rgba(0,184,212,0.14)",
        color: "var(--sumit-2)",
        border: "1px solid rgba(123,232,255,0.35)",
      }}
    >
      {children}
    </span>
  );
}

function PaceCell({
  rep,
  leaderDeals,
}: {
  rep: Salesperson;
  leaderDeals: number;
}) {
  // Cheap heuristic: anyone with > 70% of leader's deals is "up", < 40% is "down".
  if (leaderDeals === 0) {
    return <span className="text-white/55">→ pace</span>;
  }
  const ratio = rep.deals / leaderDeals;
  if (ratio >= 0.7) {
    return <span className="text-[#5dd9a3]">▲ on tear</span>;
  }
  if (ratio < 0.35) {
    return <span className="text-ember">▼ off pace</span>;
  }
  return <span className="text-white/55">→ pace</span>;
}
