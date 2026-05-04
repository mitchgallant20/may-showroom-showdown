import Image from "next/image";
import type { ContestState, Salesperson, Team } from "@/lib/types";

interface FaceOffProps {
  state: ContestState;
}

export function FaceOff({ state }: FaceOffProps) {
  const { teamBill, teamSumit } = state.teams;
  const { teamBillDeals, teamSumitDeals } = state.totals;
  const total = Math.max(teamBillDeals + teamSumitDeals, 1);
  const billPct = (teamBillDeals / total) * 100;
  const leader: "bill" | "sumit" | "tie" =
    teamBillDeals === teamSumitDeals
      ? "tie"
      : teamBillDeals > teamSumitDeals
      ? "bill"
      : "sumit";
  const delta = Math.abs(teamBillDeals - teamSumitDeals);

  return (
    <section className="mt-3.5">
      <div
        className="bg-faceoff relative overflow-hidden rounded-[18px] border border-line-strong"
        style={{ backgroundColor: "#07090f" }}
      >
        <div aria-hidden className="bg-faceoff-grid absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[10px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,210,74,0.22), transparent 65%)",
          }}
        />

        <div className="relative grid grid-cols-1 gap-2 px-5 pb-4 pt-5 md:grid-cols-[1fr_auto_1fr] md:px-[22px] md:pt-5">
          <Driver
            team={teamBill}
            score={teamBillDeals}
            isLeading={leader === "bill"}
            carNo="№ 01"
            side="left"
          />
          <CenterColumn leader={leader} delta={delta} />
          <Driver
            team={teamSumit}
            score={teamSumitDeals}
            isLeading={leader === "sumit"}
            carNo="№ 02"
            side="right"
          />
        </div>

        <TugBar billPct={billPct} leader={leader} />
      </div>
    </section>
  );
}

interface DriverProps {
  team: Team;
  score: number;
  isLeading: boolean;
  carNo: string;
  side: "left" | "right";
}

function Driver({ team, score, isLeading, carNo, side }: DriverProps) {
  const right = side === "right";
  const ringnameColor = team.id === "team-bill" ? "var(--bill-2)" : "var(--sumit-2)";
  const scoreColor = team.id === "team-bill" ? "var(--bill-2)" : "var(--sumit-2)";
  const scoreShadow =
    team.id === "team-bill"
      ? "0 0 40px rgba(29,108,209,0.55)"
      : "0 0 40px rgba(0,184,212,0.6)";
  const portraitObjectPos = team.id === "team-bill" ? "center 25%" : "center 30%";
  const carNoBg =
    team.id === "team-bill" ? "rgba(29,108,209,0.85)" : "rgba(0,184,212,0.85)";
  const teamNew = team.members.reduce((acc, m) => acc + m.newDeals, 0);
  const teamUsed = team.members.reduce((acc, m) => acc + m.usedDeals, 0);

  const Portrait = (
    <div
      className="relative aspect-[4/5] w-[220px] overflow-hidden rounded-2xl border border-line-strong shadow-portrait md:w-[240px]"
      style={{ background: "#050810" }}
    >
      <span
        className="absolute left-2.5 top-2.5 z-10 inline-flex rounded-lg border border-white/20 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur"
        style={{ background: carNoBg }}
      >
        {carNo} · Captain {team.captain}
      </span>
      <Image
        src={team.posterSrc}
        alt={`${team.name} captain poster`}
        fill
        sizes="240px"
        className="object-cover"
        style={{
          objectPosition: portraitObjectPos,
          filter: "saturate(1.05) contrast(1.05)",
        }}
        priority
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );

  const Meta = (
    <div className={`pb-1.5 ${right ? "text-right" : "text-left"}`}>
      <div
        className="font-display text-xl font-black uppercase tracking-[0.16em] md:text-2xl"
        style={{ color: ringnameColor }}
      >
        &ldquo;{team.ringname}&rdquo;
      </div>
      <div
        className="mt-1 font-display text-5xl font-black leading-[0.86] text-white md:text-6xl lg:text-7xl"
        style={{ textShadow: "0 0 28px rgba(255,255,255,0.06)" }}
      >
        {team.name.toUpperCase()}
      </div>
      <div className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35">
        Captain {team.captain} · {team.colorTagline}
      </div>
      <div
        className={`mt-1.5 font-display text-[86px] font-black leading-[0.82] md:text-[110px] lg:text-[128px] ${
          isLeading ? "animate-pulse-glow" : ""
        } ${right ? "justify-end" : ""} flex items-end gap-3`}
        style={{ color: scoreColor, textShadow: scoreShadow }}
      >
        <span className="numeric">{score}</span>
        <span className="flex flex-col gap-1 pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
          <span>deals · MTD</span>
          <span className="flex items-baseline gap-2">
            <span style={{ color: scoreColor }} className="numeric">
              {teamNew}
            </span>
            <span className="text-white/40">NEW</span>
            <span className="text-white/30">·</span>
            <span className="numeric text-white/85">{teamUsed}</span>
            <span className="text-white/40">USED</span>
          </span>
        </span>
      </div>
      <div
        className={`mt-3.5 flex flex-wrap gap-1.5 ${right ? "justify-end" : "justify-start"}`}
      >
        {team.members.map((m) => (
          <Chip key={m.id} rep={m} accent={team.id === "team-bill" ? "bill" : "sumit"} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`relative grid items-end gap-3.5 ${
        right ? "grid-cols-[1fr_220px] md:grid-cols-[1fr_240px]" : "grid-cols-[220px_1fr] md:grid-cols-[240px_1fr]"
      }`}
    >
      {right ? (
        <>
          {Meta}
          {Portrait}
        </>
      ) : (
        <>
          {Portrait}
          {Meta}
        </>
      )}
    </div>
  );
}

function Chip({
  rep,
  accent,
}: {
  rep: Salesperson;
  accent: "bill" | "sumit";
}) {
  const borderColor =
    accent === "bill" ? "rgba(94,163,255,0.35)" : "rgba(123,232,255,0.35)";
  const avatarBg =
    accent === "bill"
      ? "linear-gradient(135deg, rgba(29,108,209,0.55), rgba(29,108,209,0.15))"
      : "linear-gradient(135deg, rgba(0,184,212,0.55), rgba(0,184,212,0.15))";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-white/[0.03] py-0.5 pl-0.5 pr-2.5 font-mono text-[11px] font-semibold text-white/85"
      style={{ borderColor }}
    >
      <span
        className="relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong text-[10px] font-black text-white/85"
        style={{ background: avatarBg }}
      >
        {rep.portraitSrc ? (
          <Image
            src={rep.portraitSrc}
            alt=""
            fill
            sizes="20px"
            className="object-cover"
            style={{ objectPosition: "center 22%" }}
          />
        ) : (
          rep.name[0]?.toUpperCase()
        )}
      </span>
      {rep.name}
      <span className="numeric font-medium text-white/55">{rep.deals}</span>
    </span>
  );
}

function CenterColumn({
  leader,
  delta,
}: {
  leader: "bill" | "sumit" | "tie";
  delta: number;
}) {
  const leaderText =
    leader === "bill"
      ? "Closer leads by"
      : leader === "sumit"
      ? "Storm leads by"
      : "Dead heat";
  const accentColor =
    leader === "bill"
      ? "var(--bill-2)"
      : leader === "sumit"
      ? "var(--sumit-2)"
      : "var(--gold)";
  const pillBorder =
    leader === "bill"
      ? "rgba(94,163,255,0.45)"
      : leader === "sumit"
      ? "rgba(0,184,212,0.45)"
      : "rgba(255,210,74,0.45)";
  const pillBg =
    leader === "bill"
      ? "rgba(29,108,209,0.10)"
      : leader === "sumit"
      ? "rgba(0,184,212,0.10)"
      : "rgba(255,210,74,0.10)";
  const sign = leader === "tie" ? "" : "+";

  return (
    <div className="relative flex min-w-[180px] flex-col items-center justify-center px-3.5">
      <div
        className="relative font-display text-[88px] font-black uppercase leading-[0.85] text-white animate-pulse-glow"
        style={{
          textShadow:
            "0 0 20px rgba(255,210,74,0.35), 0 0 50px rgba(255,210,74,0.15)",
        }}
      >
        VS
        <span
          aria-hidden
          className="absolute -inset-[20%] -z-10 blur-[6px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,210,74,0.35), transparent 60%)",
          }}
        />
      </div>
      <div
        className="mt-3.5 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{
          color: accentColor,
          borderColor: pillBorder,
          background: pillBg,
        }}
      >
        {leader === "tie" ? "⚡ Tied" : `⚡ ${leaderText} ${delta}`}
      </div>
      <div className="mt-2.5 font-display text-5xl font-black leading-none text-white">
        <span className="numeric" style={{ color: accentColor }}>
          {sign}
          {delta}
        </span>
        <small className="mt-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35">
          delta · MTD
        </small>
      </div>
    </div>
  );
}

function TugBar({
  billPct,
  leader,
}: {
  billPct: number;
  leader: "bill" | "sumit" | "tie";
}) {
  const sumitPct = 100 - billPct;
  return (
    <div
      className="relative mx-7 mb-6 h-5.5 overflow-hidden rounded-full border border-line-strong"
      style={{ background: "#0b1020", height: "22px" }}
    >
      <div
        className="absolute bottom-0 left-0 top-0"
        style={{
          width: `${billPct}%`,
          background:
            "linear-gradient(90deg, var(--bill-deep), var(--bill) 70%, var(--bill-2))",
          boxShadow: "inset 0 0 18px rgba(29,108,209,0.5)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 top-0"
        style={{
          width: `${sumitPct}%`,
          background:
            "linear-gradient(270deg, var(--sumit-deep), var(--sumit) 70%, var(--sumit-2))",
          boxShadow: "inset 0 0 18px rgba(0,184,212,0.5)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 top-0 w-px"
        style={{ background: "rgba(255,255,255,0.35)" }}
      />
      <div
        aria-hidden
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{
          left: `${billPct}%`,
          width: "36px",
          height: "36px",
          background:
            "radial-gradient(circle, #fff, #ffd24a 60%, transparent 100%)",
          boxShadow: "0 0 30px var(--gold)",
        }}
        title={leader === "tie" ? "Tied" : leader === "bill" ? "Closer leads" : "Storm leads"}
      />
    </div>
  );
}
