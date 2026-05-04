import Link from "next/link";
import { Pencil } from "lucide-react";
import type { ContestState } from "@/lib/types";

interface PitWallFooterProps {
  state: ContestState;
  /** ISO of the closing flag for the "FLAG DROP" line. */
  closingFlagIso: string;
}

export function PitWallFooter({ state, closingFlagIso }: PitWallFooterProps) {
  const flagDropLabel = (() => {
    try {
      const d = new Date(closingFlagIso);
      return d.toLocaleString("en-CA", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return closingFlagIso;
    }
  })();

  return (
    <footer
      className="mt-4 flex flex-wrap justify-between gap-4.5 rounded-xl border border-line px-4 py-3.5 font-mono text-[11px] tracking-[0.06em] text-white/55"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.015), transparent)",
      }}
    >
      <div>
        <b className="font-bold text-white">DATA</b> · {state.dataSource}
      </div>
      <div>
        <b className="font-bold text-white">FLAG DROP</b> · {flagDropLabel} —
        last day of Hyundai reporting month
      </div>
      <div className="flex items-center gap-3">
        <span>
          <b className="font-bold text-white">PIT WALL</b> · v1 · refresh every 60s
        </span>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-sumit/40 hover:bg-sumit/[0.08] hover:text-sumit-light"
        >
          <Pencil className="h-3 w-3" /> Pit Crew · PS Numbers
        </Link>
      </div>
    </footer>
  );
}
