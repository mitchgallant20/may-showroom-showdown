import type { ContestState } from "@/lib/types";

interface TopStatsBarProps {
  state: ContestState;
}

export function TopStatsBar({ state }: TopStatsBarProps) {
  const { pace, monthLabel, monthEnd } = state;
  const sectorOfMonth = Math.min(
    4,
    Math.max(1, Math.ceil((pace.elapsedDays / pace.totalDays) * 4)),
  );
  const totalPrize = state.categories.reduce(
    (acc, c) => acc + c.prizePerPerson,
    0,
  );

  const leaderHex =
    pace.leader === "team-bill"
      ? "var(--bill-2)"
      : pace.leader === "team-sumit"
      ? "var(--sumit-2)"
      : "#fff";
  const leaderLabel =
    pace.leader === "team-bill"
      ? "Closer leads"
      : pace.leader === "team-sumit"
      ? "Storm leads"
      : "Tied";

  return (
    <section className="mt-3.5 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
      <Cell pulse k="Session" sub={`Begins day 1 · Flag drops ${formatFlag(monthEnd)}`}>
        <span className="font-display text-[38px] font-black leading-none">
          {monthLabel.split(" ")[0].slice(0, 3)} &apos;{monthLabel.slice(-2)}
        </span>{" "}
        <small className="text-sm font-semibold text-white/55">· Sector {sectorOfMonth}</small>
      </Cell>
      <Cell k="Pace · all teams" sub={`In-period · Day ${pace.elapsedDays} of ${pace.totalDays}`}>
        <span className="font-display numeric text-[38px] font-black leading-none">
          {pace.combinedPerDay.toFixed(1)}
        </span>{" "}
        <small className="text-sm font-semibold text-white/55">deals/sell-day</small>
      </Cell>
      <Cell
        k="Delta · Storm ↔ Closer"
        sub={
          pace.leader === "tie" ? "Tied · 0 delta" : `deals · ${leaderLabel}`
        }
      >
        <span
          className="font-display numeric text-[38px] font-black leading-none"
          style={{ color: leaderHex }}
        >
          {pace.leader === "tie" ? "0" : `+${pace.delta}`}
        </span>
      </Cell>
      <Cell k="EOM Projection" sub="Total + (in-period pace × sell-days left)">
        <span
          className="font-display numeric text-[38px] font-black leading-none"
          style={{ color: "var(--bill-2)" }}
        >
          {pace.eomProjection.teamCloser}
        </span>{" "}
        <small className="text-sm font-semibold text-white/55">·</small>{" "}
        <span
          className="font-display numeric text-[38px] font-black leading-none"
          style={{ color: "var(--sumit-2)" }}
        >
          {pace.eomProjection.teamStorm}
        </span>
      </Cell>
      <Cell k="Prize Pool · per person" sub="Max possible · winning side">
        <span
          className="font-display numeric text-[38px] font-black leading-none"
          style={{ color: "var(--gold)" }}
        >
          ${totalPrize.toLocaleString()}
        </span>
      </Cell>
    </section>
  );
}

function Cell({
  k,
  sub,
  children,
  pulse,
}: {
  k: string;
  sub: string;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-line px-3.5 py-3"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
      }}
    >
      {pulse && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-xl"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(0,184,212,0.12), transparent 60%)",
          }}
        />
      )}
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {k}
      </div>
      <div className="mt-1.5">{children}</div>
      <div className="mt-1 font-mono text-[11px] text-white/55">{sub}</div>
    </div>
  );
}

function formatFlag(monthEndIso: string): string {
  try {
    const d = new Date(monthEndIso + "T00:00:00Z");
    // Add one day → first of next month, which is the "flag drop"
    const next = new Date(d.getTime() + 86_400_000);
    return next.toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return monthEndIso;
  }
}
