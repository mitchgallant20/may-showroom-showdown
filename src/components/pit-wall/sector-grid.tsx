import type { ContestCategory, ContestState } from "@/lib/types";

interface SectorGridProps {
  state: ContestState;
}

const SECTOR_LABELS: Record<ContestCategory["kind"], string> = {
  "new-vehicle-target": "Sector 1 · Shared Target",
  "ps-appointments": "Sector 2 · Head-to-Head",
  "ps-deals": "Sector 3 · Head-to-Head",
  "monthly-champion": "Sector 4 · Chequered Flag",
};

export function SectorGrid({ state }: SectorGridProps) {
  return (
    <section className="mt-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {state.categories.map((cat) => (
        <Sector key={cat.kind} category={cat} />
      ))}
    </section>
  );
}

function Sector({ category }: { category: ContestCategory }) {
  const isShared = category.progress.resolution === "shared-target";
  const target = category.progress.target ?? 0;

  if (isShared) {
    const current = category.progress.teamBill;
    const pct = Math.min(100, Math.round((current / Math.max(target, 1)) * 100));
    const unlocked = pct >= 100;
    return (
      <article
        className={`relative overflow-hidden rounded-2xl border border-line p-4 ${
          pct > 50 ? "sector-unlocking" : ""
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
        }}
      >
        {pct > 50 && (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(255,210,74,0.12), transparent 70%)",
            }}
          />
        )}
        <Label icon={category.icon}>{SECTOR_LABELS[category.kind]}</Label>
        <h3 className="mt-1.5 font-display text-xl font-black leading-[1.05] text-white">
          {category.title}
        </h3>
        <div className="mt-2.5 flex items-end gap-3.5">
          <div
            className="font-display numeric text-[54px] font-black leading-[0.86]"
            style={{
              color: "var(--gold)",
              textShadow: "0 0 24px rgba(255,210,74,0.45)",
            }}
          >
            {current}
            <span className="ml-1 text-[22px] font-semibold text-white/55">
              /{target}
            </span>
          </div>
          <div className="pb-3 font-mono text-xs uppercase tracking-[0.2em] text-white/55">
            <span className="block">{pct}%</span>
            <span className="block font-display text-[28px] font-black leading-none text-white/35">
              to flag
            </span>
          </div>
        </div>
        <Bar
          pct={pct}
          gradient={
            unlocked
              ? "linear-gradient(90deg, #c89a1f, #ffd24a, #fff7c4)"
              : "linear-gradient(90deg, #c89a1f, #ffd24a, #fff7c4)"
          }
          shadow="inset 0 0 14px rgba(255,210,74,0.6)"
        />
        <Footer
          pill={
            unlocked ? (
              <Pill tone="gold">UNLOCKED · 110% HIT</Pill>
            ) : (
              <Pill tone="gold">UNLOCKS FOR ALL · @110%</Pill>
            )
          }
          prize={`$${category.prizePerPerson} / person`}
        />
      </article>
    );
  }

  const closer = category.progress.teamBill;
  const storm = category.progress.teamSumit;
  const total = Math.max(closer + storm, 1);
  const closerPct = (closer / total) * 100;
  const winner: "bill" | "sumit" | "tie" =
    closer === storm ? "tie" : closer > storm ? "bill" : "sumit";
  const winnerLabel =
    winner === "bill"
      ? "Closer leads"
      : winner === "sumit"
      ? "Storm leads"
      : "Tied";
  const winnerDelta = Math.abs(closer - storm);

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-line p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
      }}
    >
      <Label icon={category.icon}>{SECTOR_LABELS[category.kind]}</Label>
      <h3 className="mt-1.5 font-display text-xl font-black leading-[1.05] text-white">
        {category.title}
      </h3>
      <div className="mt-2.5 flex items-baseline gap-4.5" style={{ gap: "18px" }}>
        <div
          className="font-display numeric text-[54px] font-black leading-[0.86]"
          style={{
            color: winner === "bill" ? "var(--bill-2)" : "rgba(230,237,246,0.35)",
            textShadow:
              winner === "bill" ? "0 0 24px rgba(29,108,209,0.4)" : undefined,
          }}
        >
          {closer}
        </div>
        <div className="pb-3 font-mono text-xs uppercase tracking-[0.2em] text-white/55">
          vs
        </div>
        <div
          className="font-display numeric text-[54px] font-black leading-[0.86]"
          style={{
            color: winner === "sumit" ? "var(--sumit-2)" : "rgba(230,237,246,0.35)",
            textShadow:
              winner === "sumit" ? "0 0 24px rgba(0,184,212,0.4)" : undefined,
          }}
        >
          {storm}
        </div>
      </div>
      <Bar
        pct={winner === "bill" ? closerPct : 100 - closerPct}
        gradient={
          winner === "bill"
            ? "linear-gradient(90deg, var(--bill-deep), var(--bill-2))"
            : winner === "sumit"
            ? "linear-gradient(90deg, var(--sumit-deep), var(--sumit-2))"
            : "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))"
        }
        marginLeft={winner === "sumit" ? `${closerPct}%` : undefined}
      />
      <Footer
        pill={
          winner === "tie" ? (
            <Pill tone="gold">Tied · 0 delta</Pill>
          ) : winner === "bill" ? (
            <Pill tone="bill">{winnerLabel} · +{winnerDelta}</Pill>
          ) : (
            <Pill tone="sumit">{winnerLabel} · +{winnerDelta}</Pill>
          )
        }
        prize={`$${category.prizePerPerson} / person`}
      />
    </article>
  );
}

function Label({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
      <span className="text-sm">{icon}</span> {children}
    </div>
  );
}

function Bar({
  pct,
  gradient,
  marginLeft,
  shadow,
}: {
  pct: number;
  gradient: string;
  marginLeft?: string;
  shadow?: string;
}) {
  return (
    <div
      className="relative mt-3 overflow-hidden rounded-full border border-line-strong"
      style={{
        height: "8px",
        background: "#0b1020",
      }}
    >
      <div
        className="h-full"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: gradient,
          marginLeft,
          boxShadow: shadow,
        }}
      />
    </div>
  );
}

function Footer({
  pill,
  prize,
}: {
  pill: React.ReactNode;
  prize: string;
}) {
  return (
    <div className="mt-2.5 flex items-center justify-between">
      {pill}
      <span
        className="font-display text-[22px] font-black"
        style={{ color: "var(--gold)" }}
      >
        {prize}
      </span>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "bill" | "sumit" | "gold";
  children: React.ReactNode;
}) {
  const styles =
    tone === "bill"
      ? {
          background: "rgba(29,108,209,0.14)",
          color: "var(--bill-2)",
          border: "1px solid rgba(94,163,255,0.4)",
        }
      : tone === "sumit"
      ? {
          background: "rgba(0,184,212,0.14)",
          color: "var(--sumit-2)",
          border: "1px solid rgba(123,232,255,0.4)",
        }
      : {
          background: "rgba(255,210,74,0.14)",
          color: "var(--gold)",
          border: "1px solid rgba(255,210,74,0.4)",
        };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
      style={styles}
    >
      {children}
    </span>
  );
}
