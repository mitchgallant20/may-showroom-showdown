import { getContestState } from "@/lib/data/contestData";
import { PitWallHeader } from "@/components/pit-wall/pit-wall-header";
import { TopStatsBar } from "@/components/pit-wall/top-stats-bar";
import { FaceOff } from "@/components/pit-wall/face-off";
import { TelemetryChart } from "@/components/pit-wall/telemetry-chart";
import { DriverStandings } from "@/components/pit-wall/driver-standings";
import { SectorGrid } from "@/components/pit-wall/sector-grid";
import { LiveTicker } from "@/components/pit-wall/live-ticker";
import { PitWallFooter } from "@/components/pit-wall/pit-wall-footer";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function PitWallPage() {
  const state = await getContestState();
  // Closing flag = first day of next month at 00:00 local.
  const closingFlagIso = closingFlagFor(state.monthEnd);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-5 pb-10 pt-5 md:px-[22px]">
      <PitWallHeader state={state} closingFlagIso={closingFlagIso} />
      <TopStatsBar state={state} />
      <FaceOff state={state} />

      <section className="mt-3.5">
        <TelemetryChart state={state} />
      </section>

      <section className="mt-3.5">
        <DriverStandings state={state} />
      </section>

      <SectorGrid state={state} />
      <LiveTicker state={state} />
      <PitWallFooter state={state} closingFlagIso={closingFlagIso} />
    </main>
  );
}

function closingFlagFor(monthEndIso: string): string {
  // monthEndIso is the last day of the month e.g. "2026-05-31".
  // Closing flag = first day of next month at midnight local time.
  // We return an ISO-like string WITHOUT a `Z` so the client parses it as local.
  const [y, m, d] = monthEndIso.split("-").map((n) => parseInt(n, 10));
  const next = new Date(y, m - 1, d + 1, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T00:00:00`;
}
