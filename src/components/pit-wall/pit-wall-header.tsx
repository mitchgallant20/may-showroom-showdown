import type { ContestState } from "@/lib/types";
import { Countdown } from "./countdown";
import { LogoWithVideo } from "./logo-with-video";

interface PitWallHeaderProps {
  state: ContestState;
  /** ISO of the closing flag (e.g. 2026-06-01T00:00:00). */
  closingFlagIso: string;
}

export function PitWallHeader({ state, closingFlagIso }: PitWallHeaderProps) {
  return (
    <header
      className="relative grid items-center gap-6 rounded-2xl border border-line px-4 py-3.5 backdrop-blur md:grid-cols-[auto_1fr_auto] md:px-[18px]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), transparent)",
      }}
    >
      <LogoWithVideo />

      <div className="flex flex-col gap-1.5">
        <DataModePill mode={state.dataMode} />
        <h1
          className="font-display text-3xl font-black uppercase tracking-[0.04em] text-white md:text-[38px]"
          style={{ letterSpacing: "0.04em" }}
        >
          PIT WALL · {state.monthLabel.toUpperCase()}
        </h1>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
          <span className="text-bill-light">Team Closer</span>
          <span className="mx-2">· vs ·</span>
          <span className="text-sumit-light">Team Storm</span>
        </div>
      </div>

      <Countdown targetIso={closingFlagIso} />
    </header>
  );
}

function DataModePill({ mode }: { mode: "desk-log" | "live" | "demo" }) {
  const config = (() => {
    switch (mode) {
      case "live":
        return {
          color: "text-sumit-light",
          dotClass: "animate-blink-dot bg-sumit-light",
          dotShadow: "0 0 12px rgba(0,184,212,0.85)",
          label: "LIVE · WINNIPEG HYUNDAI · PIT WALL",
        };
      case "desk-log":
        return {
          color: "text-gold",
          dotClass: "bg-gold",
          dotShadow: "0 0 10px rgba(255,210,74,0.7)",
          label: "DESK LOG · MAY 26 · LIVE DEALS · ETA ≤ JUN 1",
        };
      default:
        return {
          color: "text-gold",
          dotClass: "bg-gold",
          dotShadow: "0 0 10px rgba(255,210,74,0.7)",
          label: "DEMO MODE · WINNIPEG HYUNDAI · PIT WALL",
        };
    }
  })();
  return (
    <div
      className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] ${config.color}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${config.dotClass}`}
        style={{ boxShadow: config.dotShadow }}
      />
      {config.label}
    </div>
  );
}
