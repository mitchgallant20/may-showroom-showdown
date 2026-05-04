"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  /** ISO timestamp of the closing flag — defaults to first of next month at 00:00 local. */
  targetIso: string;
}

interface Parts {
  d: string;
  h: string;
  m: string;
  s: string;
}

function compute(target: number): Parts {
  const now = Date.now();
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86_400_000);
  diff -= d * 86_400_000;
  const h = Math.floor(diff / 3_600_000);
  diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000);
  diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export function Countdown({ targetIso }: CountdownProps) {
  const target = new Date(targetIso).getTime();
  const [parts, setParts] = useState<Parts>(() => compute(target));

  useEffect(() => {
    const id = setInterval(() => setParts(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-end gap-2.5">
      <div className="self-center pr-0.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.28em] text-white/55">
        Closing
        <br />
        flag
      </div>
      <Cell label="days" value={parts.d} />
      <Cell label="hrs" value={parts.h} />
      <Cell label="min" value={parts.m} />
      <Cell label="sec" value={parts.s} />
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative min-w-16 rounded-[10px] border border-line-strong bg-ink-800 px-2.5 pb-2 pt-1.5 text-center"
      style={{ background: "var(--bg-card-2)" }}
    >
      <div
        className="font-display numeric text-[42px] font-black leading-none text-white"
        style={{ textShadow: "0 0 18px rgba(0,184,212,0.35)" }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">
        {label}
      </div>
    </div>
  );
}
