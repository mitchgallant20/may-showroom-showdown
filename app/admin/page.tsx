import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getRepRoster } from "@/lib/data/contestData";
import { readOverrides } from "@/lib/data/manualOverrides";
import { saveOverrides } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    via?: string;
    error?: string;
    detail?: string;
  }>;
}) {
  const overrides = await readOverrides();
  const roster = getRepRoster();
  const params = await searchParams;
  const justSaved = params?.saved === "1";
  const savedVia = params?.via === "github" ? "github" : params?.via === "fs" ? "fs" : null;
  const errorKind = params?.error ?? null;
  const errorDetail = params?.detail ?? null;
  const authFailed = errorKind === "auth";
  const fsFailed = errorKind === "fs";
  const githubFailed = errorKind === "github";
  const passwordRequired = Boolean(process.env.ADMIN_PASSWORD);
  const tokenConfigured = Boolean(process.env.GITHUB_TOKEN);

  const teamCloser = roster.filter((r) => r.team === "team-bill");
  const teamStorm = roster.filter((r) => r.team === "team-sumit");

  const teamCloserTotals = totalsFor(teamCloser, overrides);
  const teamStormTotals = totalsFor(teamStorm, overrides);

  return (
    <main className="mx-auto flex w-full max-w-[900px] flex-col gap-7 px-5 pb-12 pt-6 md:px-8 md:pt-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-sumit-light hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to pit wall
          </Link>
          <h1 className="font-display mt-2 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
            Pit Crew · Manual Entry
          </h1>
          <p className="mt-1.5 max-w-2xl font-mono text-xs text-white/55">
            Update PS appointments and PS deals per rep. Numbers go live on the
            scoreboard the moment you save.
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
            Last saved
          </span>
          <div className="numeric font-mono text-sm font-medium text-white/80">
            {formatStamp(overrides.lastUpdated)}
          </div>
        </div>
      </header>

      {justSaved && (
        <div
          className="rounded-xl border border-gold/30 px-5 py-3 font-mono text-sm font-semibold text-gold"
          style={{ background: "rgba(255,210,74,0.10)" }}
        >
          ✓ Saved
          {savedVia === "github" && " — committed to GitHub. Pit Wall will refresh after Vercel rebuilds (~30–60s)."}
          {savedVia === "fs" && " — written to local data/overrides.json. Pit Wall refreshed."}
          {!savedVia && ". Pit Wall refreshed."}
        </div>
      )}

      {authFailed && (
        <div
          className="rounded-xl border border-red-400/40 px-5 py-3 font-mono text-sm font-semibold text-red-300"
          style={{ background: "rgba(239,68,68,0.10)" }}
        >
          ✗ Wrong password. Try again.
        </div>
      )}

      {(fsFailed || githubFailed) && (
        <div
          className="space-y-2 rounded-xl border border-red-400/40 px-5 py-3 font-mono text-sm font-semibold text-red-300"
          style={{ background: "rgba(239,68,68,0.10)" }}
        >
          <div>
            ✗ Save failed via{" "}
            <code className="text-red-200">
              {githubFailed ? "GitHub commit" : "local filesystem"}
            </code>
            .
          </div>
          {errorDetail && (
            <div className="break-all rounded-md border border-red-400/20 bg-black/20 px-3 py-2 text-[11px] font-normal leading-snug text-red-200">
              {errorDetail}
            </div>
          )}
          <div className="text-[11px] font-normal text-red-200/80">
            {githubFailed
              ? "Check that GITHUB_TOKEN in Vercel env vars is current and has Contents:write on this repo."
              : "Local writes don't work on Vercel — set GITHUB_TOKEN to enable broadcast."}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-line bg-ink-900/50 px-4 py-2.5 font-mono text-[11px] text-white/55">
        Persistence channel:{" "}
        {tokenConfigured ? (
          <span className="text-sumit-light">GitHub commit → redeploy</span>
        ) : (
          <span className="text-gold">local filesystem (dev mode)</span>
        )}{" "}
        · admin password{" "}
        {passwordRequired ? (
          <span className="text-sumit-light">required</span>
        ) : (
          <span className="text-white/45">disabled</span>
        )}
      </div>

      <form action={saveOverrides} className="space-y-5">
        {passwordRequired && (
          <section className="rounded-2xl border border-line bg-ink-900/70 px-5 py-4">
            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                Admin password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-line-strong bg-ink-800 px-3 py-2 font-mono text-sm text-white outline-none transition-colors focus:border-sumit focus:ring-2 focus:ring-sumit/40"
              />
            </label>
          </section>
        )}

        <TeamSection
          title="Team Closer"
          accentHex="#5ea3ff"
          accentDeepHex="#1d6cd1"
          reps={teamCloser}
          overrides={overrides}
          totals={teamCloserTotals}
        />
        <TeamSection
          title="Team Storm"
          accentHex="#7be8ff"
          accentDeepHex="#00b8d4"
          reps={teamStorm}
          overrides={overrides}
          totals={teamStormTotals}
        />

        <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.06]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.22em] shadow-glow-gold transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gold)", color: "#05070d" }}
          >
            <Save className="h-4 w-4" /> Save & broadcast
          </button>
        </div>
      </form>

      <p className="rounded-xl border border-line bg-ink-900/50 px-4 py-3 font-mono text-[11px] text-white/55">
        Stored in <code className="text-white/80">data/overrides.json</code>.
        Per-team totals roll up automatically into{" "}
        <span className="text-sumit-light">PS Appointments</span> and{" "}
        <span className="text-sumit-light">PS Deals</span> sectors on the Pit
        Wall.
      </p>
    </main>
  );
}

function TeamSection({
  title,
  accentHex,
  accentDeepHex,
  reps,
  overrides,
  totals,
}: {
  title: string;
  accentHex: string;
  accentDeepHex: string;
  reps: ReturnType<typeof getRepRoster>;
  overrides: Awaited<ReturnType<typeof readOverrides>>;
  totals: { apts: number; deals: number };
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-ink-900/70">
      <header
        className="flex items-center justify-between border-b border-line px-5 py-3.5"
        style={{ background: `linear-gradient(90deg, ${accentDeepHex}25, transparent)` }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: accentHex, boxShadow: `0 0 14px ${accentHex}` }}
          />
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
            Team totals
          </div>
          <div className="numeric font-mono text-sm text-white/80">
            <span className="font-bold">{totals.apts}</span> apts ·{" "}
            <span className="font-bold">{totals.deals}</span> deals
          </div>
        </div>
      </header>

      <div className="divide-y divide-line">
        <div className="hidden grid-cols-[1fr_8rem_8rem] gap-4 px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45 md:grid">
          <span>Rep</span>
          <span className="text-center">PS Appointments</span>
          <span className="text-center">PS Deals</span>
        </div>
        {reps.map((rep) => {
          const o = overrides.perRep[rep.id] ?? { psAppointments: 0, psDeals: 0 };
          return (
            <div
              key={rep.id}
              className="grid grid-cols-[1fr_5rem_5rem] items-center gap-3 px-5 py-3 md:grid-cols-[1fr_8rem_8rem] md:gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">
                  {rep.name}
                </span>
                {rep.isCaptain && (
                  <span
                    className="rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      border: "1px solid rgba(255,210,74,0.4)",
                      background: "rgba(255,210,74,0.10)",
                      color: "var(--gold)",
                    }}
                  >
                    Cap
                  </span>
                )}
              </div>
              <NumberInput
                name={`apts:${rep.id}`}
                defaultValue={o.psAppointments}
                ariaLabel={`${rep.name} PS appointments`}
              />
              <NumberInput
                name={`deals:${rep.id}`}
                defaultValue={o.psDeals}
                ariaLabel={`${rep.name} PS deals`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NumberInput({
  name,
  defaultValue,
  ariaLabel,
}: {
  name: string;
  defaultValue: number;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={999}
      step={1}
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      className="font-display numeric w-full rounded-xl border border-line-strong bg-ink-800 px-3 py-2 text-center text-3xl font-black text-white outline-none transition-colors focus:border-sumit focus:ring-2 focus:ring-sumit/40"
    />
  );
}

function totalsFor(
  reps: ReturnType<typeof getRepRoster>,
  overrides: Awaited<ReturnType<typeof readOverrides>>,
): { apts: number; deals: number } {
  let apts = 0;
  let deals = 0;
  for (const r of reps) {
    const o = overrides.perRep[r.id];
    if (!o) continue;
    apts += o.psAppointments;
    deals += o.psDeals;
  }
  return { apts, deals };
}

function formatStamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
