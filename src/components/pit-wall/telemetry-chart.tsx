import type { ContestState, TelemetrySeries } from "@/lib/types";

interface TelemetryChartProps {
  state: ContestState;
}

const VW = 1100;
const VH = 320;
const PAD_L = 10;
const PAD_R = 16;
const PAD_T = 28;
const PAD_B = 8;

/**
 * Cumulative new-vehicle pace chart, full-width.
 *
 * One combined line (both teams), NEW only. Day 1 starts at last
 * month's "boost" so the visual reflects momentum carried in. Past
 * days use the actual count; from today forward we draw a dashed
 * forecast at the current-month pace (Mon–Sat only — no Sunday sales).
 */
export function TelemetryChart({ state }: TelemetryChartProps) {
  const t = state.telemetry;
  const days = t.days.length;
  if (days === 0) return null;

  const maxY = Math.max(t.target * 1.1, t.eomProjection * 1.05, 10);

  const xFor = (i: number) =>
    PAD_L + (i / Math.max(days - 1, 1)) * (VW - PAD_L - PAD_R);
  const yFor = (v: number) =>
    VH - PAD_B - (v / maxY) * (VH - PAD_T - PAD_B);

  const targetY = yFor(t.target);
  const todayX = t.todayIndex >= 0 ? xFor(t.todayIndex) : null;

  const actualPoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < days; i++) {
    if (t.actualCumulative[i] !== null) {
      actualPoints.push({ x: xFor(i), y: yFor(t.actualCumulative[i] as number) });
    }
  }
  // Day 1 anchor at the boost — explicit point so the line visibly starts from the boost.
  if (actualPoints.length > 0 && t.boost > 0) {
    // No-op: day 1's actual already includes boost.
  }

  const forecastPoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < days; i++) {
    if (t.forecastCumulative[i] !== null) {
      forecastPoints.push({ x: xFor(i), y: yFor(t.forecastCumulative[i] as number) });
    }
  }

  const actualPolyline = actualPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const forecastPolyline = forecastPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Filled area under the actual line.
  const baselineY = VH - PAD_B;
  const actualArea =
    actualPoints.length > 0
      ? `M${actualPoints[0].x},${baselineY} L${actualPoints
          .map((p) => `${p.x},${p.y}`)
          .join(" L")} L${actualPoints[actualPoints.length - 1].x},${baselineY} Z`
      : null;

  // Sunday markers (subtle vertical bands)
  const sundayBands: Array<{ x: number; w: number }> = [];
  for (let i = 0; i < days; i++) {
    if (t.dayOfWeek[i] === 0) {
      const xLeft = xFor(Math.max(0, i - 0.5));
      const xRight = xFor(Math.min(days - 1, i + 0.5));
      sundayBands.push({ x: xLeft, w: xRight - xLeft });
    }
  }

  // Boost marker — short horizontal stub at Day 1's y = boost.
  const boostY = yFor(t.boost);
  const boostX = xFor(0);

  // Today value to label on the actual line tip.
  const todayValue =
    t.todayIndex >= 0 && t.actualCumulative[t.todayIndex] !== null
      ? (t.actualCumulative[t.todayIndex] as number)
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-white/[0.02] to-transparent">
      <header className="flex flex-col gap-2 border-b border-line px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="m-0 font-display text-[22px] font-black uppercase tracking-[0.04em] text-white">
            Cumulative New Vehicle Sales · Pace to {t.target}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            Combined teams · NEW only · forecast skips Sundays · current-period pace only
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Stat label="Boost" value={t.boost} sub="from last month" />
          <Stat
            label="Today"
            value={todayValue ?? t.boost}
            sub={`${t.currentTotal} cumulative`}
          />
          <Stat
            label="Pace"
            value={t.paceNewPerSellingDay.toFixed(1)}
            sub="new/selling-day"
            color="var(--gold)"
          />
          <Stat
            label="EOM"
            value={Math.round(t.eomProjection)}
            sub={`projected · ${t.sellingDaysRemaining} sell-days left`}
            color={
              t.eomProjection >= t.target ? "var(--gold)" : "var(--ember)"
            }
          />
        </div>
      </header>

      <div className="px-4 py-3.5">
        <div
          className="relative h-[320px] overflow-hidden rounded-[10px] border border-line-strong bg-chart"
          style={{ backgroundColor: "#07090f" }}
        >
          <div aria-hidden className="bg-chart-grid absolute inset-0" />
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            preserveAspectRatio="none"
            className="relative block h-full w-full"
          >
            <defs>
              <linearGradient id="actualFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7be8ff" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#7be8ff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="targetFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffd24a" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ffd24a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Sunday bands (very subtle) */}
            {sundayBands.map((b, i) => (
              <rect
                key={`sun-${i}`}
                x={b.x}
                y={PAD_T}
                width={b.w}
                height={VH - PAD_T - PAD_B}
                fill="rgba(255,61,87,0.06)"
              />
            ))}

            {/* Target line at 80 */}
            <rect
              x={PAD_L}
              y={targetY - 1}
              width={VW - PAD_L - PAD_R}
              height={VH - PAD_B - (targetY - 1)}
              fill="url(#targetFill)"
              opacity="0.5"
            />
            <line
              x1={PAD_L}
              y1={targetY}
              x2={VW - PAD_R}
              y2={targetY}
              stroke="#ffd24a"
              strokeDasharray="6 6"
              strokeWidth="1.8"
              opacity="0.85"
            />
            <text
              x={VW - PAD_R - 4}
              y={targetY - 8}
              textAnchor="end"
              fontFamily="JetBrains Mono"
              fontSize="11"
              fill="#ffd24a"
              letterSpacing="2"
            >
              TARGET {t.target}
            </text>

            {/* Boost stub on Day 1 */}
            <line
              x1={boostX - 6}
              y1={boostY}
              x2={boostX + 6}
              y2={boostY}
              stroke="#ffd24a"
              strokeWidth="2"
              opacity="0.7"
            />
            <text
              x={boostX + 8}
              y={boostY + 3}
              fontFamily="JetBrains Mono"
              fontSize="10"
              fill="#ffd24a"
              opacity="0.85"
            >
              BOOST {t.boost}
            </text>

            {/* Today vertical line */}
            {todayX !== null && (
              <>
                <line
                  x1={todayX}
                  y1={PAD_T - 6}
                  x2={todayX}
                  y2={VH - PAD_B}
                  stroke="rgba(255,255,255,0.55)"
                  strokeDasharray="3 4"
                  strokeWidth="1.2"
                />
                <text
                  x={todayX + 6}
                  y={PAD_T - 12}
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  fill="rgba(255,255,255,0.85)"
                  letterSpacing="2"
                >
                  NOW · DAY {t.todayIndex + 1} OF {days}
                </text>
              </>
            )}

            {/* Actual area + line */}
            {actualArea && (
              <>
                <path d={actualArea} fill="url(#actualFill)" />
                <polyline
                  points={actualPolyline}
                  fill="none"
                  stroke="#7be8ff"
                  strokeWidth="2.6"
                />
                {actualPoints.length > 0 && (
                  <circle
                    cx={actualPoints[actualPoints.length - 1].x}
                    cy={actualPoints[actualPoints.length - 1].y}
                    r="5.5"
                    fill="#7be8ff"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
              </>
            )}

            {/* Forecast dashed line */}
            {forecastPoints.length >= 2 && (
              <polyline
                points={forecastPolyline}
                fill="none"
                stroke="#ffd24a"
                strokeWidth="2.4"
                strokeDasharray="4 5"
                opacity="0.95"
              />
            )}

            {/* Forecast endpoint marker */}
            {forecastPoints.length > 0 && (
              <>
                <circle
                  cx={forecastPoints[forecastPoints.length - 1].x}
                  cy={forecastPoints[forecastPoints.length - 1].y}
                  r="5"
                  fill="none"
                  stroke="#ffd24a"
                  strokeWidth="2"
                />
                <text
                  x={forecastPoints[forecastPoints.length - 1].x - 6}
                  y={forecastPoints[forecastPoints.length - 1].y - 8}
                  textAnchor="end"
                  fontFamily="JetBrains Mono"
                  fontSize="11"
                  fontWeight="700"
                  fill="#ffd24a"
                >
                  EOM {Math.round(t.eomProjection)}
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
          <span>Day 1 · {formatDay(t.dateLabels[0])}</span>
          {[0.25, 0.5, 0.75].map((q) => {
            const i = Math.round(q * (days - 1));
            return (
              <span key={q}>
                Day {t.days[i]} · {formatDay(t.dateLabels[i])}
              </span>
            );
          })}
          <span>
            Day {t.days[days - 1]} · {formatDay(t.dateLabels[days - 1])} ·
            flag drop
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Legend color="#7be8ff" label="Actual cumulative" />
          <Legend color="#ffd24a" label="Forecast (Mon–Sat pace)" dashed />
          <Legend
            color="#ff3d57"
            label="Sunday — no selling"
            block
            opacity={0.4}
          />
          <Legend color="#ffd24a" label={`Target ${t.target}`} dashed />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  color = "#fff",
}: {
  label: string;
  value: number | string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-line-strong bg-white/[0.02] px-3 py-1.5">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {label}
      </div>
      <div
        className="font-display numeric text-2xl font-black leading-none"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-white/45">
        {sub}
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  dashed,
  block,
  opacity = 1,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  block?: boolean;
  opacity?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
      {block ? (
        <i
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ background: color, opacity }}
        />
      ) : (
        <i
          className="inline-block h-0.5 w-3"
          style={{
            background: dashed ? undefined : color,
            borderTop: dashed ? `2px dashed ${color}` : undefined,
          }}
        />
      )}
      {label}
    </span>
  );
}

function formatDay(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

// Re-export for tests / future tweaks (preserves the type narrowing helper).
export type { TelemetrySeries };
