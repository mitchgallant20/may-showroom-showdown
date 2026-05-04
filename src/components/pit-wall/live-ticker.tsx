import type { ContestState } from "@/lib/types";

interface LiveTickerProps {
  state: ContestState;
}

/**
 * Looping marquee of the most recent events. Pulls from
 * `state.recentEvents` (live = latest sold rows from Blink, demo =
 * canned list). Doubled inline to make the CSS animation seamless.
 */
export function LiveTicker({ state }: LiveTickerProps) {
  const items =
    state.recentEvents.length > 0
      ? state.recentEvents
      : [{ at: "", text: "Awaiting first sale of the month…", team: null }];

  // Add some derived items so the strip never feels empty.
  const derived = [
    {
      text: `Pace: ${state.pace.combinedPerDay.toFixed(1)} deals/day · all teams`,
    },
    {
      text: `Projection · EOM ${state.pace.eomProjection.teamCloser} · ${state.pace.eomProjection.teamStorm}`,
    },
    {
      text:
        state.pace.leader === "tie"
          ? "Dead heat · 0 delta"
          : `${state.pace.leader === "team-bill" ? "Closer" : "Storm"} leads by ${state.pace.delta}`,
    },
  ];

  const fullItems = [...items, ...derived];
  const doubled = [...fullItems, ...fullItems];

  return (
    <div
      className="mt-3.5 flex h-[42px] items-center overflow-hidden rounded-xl border border-line-strong"
      style={{ background: "#000", color: "var(--gold)" }}
    >
      <div
        className="flex h-full flex-shrink-0 items-center px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ background: "var(--gold)", color: "#000" }}
      >
        ⚡ LIVE WIRE
      </div>
      <div className="flex animate-ticker gap-12 whitespace-nowrap pl-6 font-mono text-[13px] font-semibold tracking-[0.05em]">
        {doubled.map((evt, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span>{evt.text}</span>
            <span style={{ color: "var(--ember)" }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
