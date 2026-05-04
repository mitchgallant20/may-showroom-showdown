# Winnipeg Hyundai · Sales Contest Scoreboard

Single-page sports-scoreboard hype dashboard for the monthly Winnipeg Hyundai
sales floor contest. Team Bill vs. Team Sumit. Designed to live on a TV in
the showroom.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind 3.4 — custom dark navy + Hyundai blue + electric cyan palette in [tailwind.config.ts](tailwind.config.ts)
- Lucide icons (available, not yet used heavily — leaving room for `claude design`)
- Static data file today; Blink Intelligence connector slot wired into the data layer

## Quickstart

```bash
npm install
npm run dev
# http://localhost:4040
```

Dev and prod both bind to **port 4040** (set in [package.json](package.json)) so
this app doesn't fight with other dev servers running on 3000 / 3737.

```bash
npm run typecheck   # tsc --noEmit
npm run build       # next build
```

## Routes

- `/` — the scoreboard (read-only TV view) → http://localhost:4040
- `/admin` — manual-entry form for PS appointments and PS deals per rep → http://localhost:4040/admin

## Page anatomy — three zones, top-to-bottom

| Zone | Component | What it shows |
| --- | --- | --- |
| **0** | [SiteHeader](src/components/site-header.tsx) | Live indicator, month, days-remaining hero, link to `/admin` |
| **1** | [TeamWarHeader](src/components/team-war-header.tsx) | `Team Bill VS Team Sumit`, giant deal counts, captains, member chips, tug-of-war bar |
| **1.5** | [PrizePoolBanner](src/components/prize-pool-banner.tsx) | Total max prize per winning team member ($1,250) |
| **2** | [ContestTiles](src/components/contest-tiles.tsx) | 2×2 grid: Hyundai New Vehicle Target, PS Appointments, PS Deals, Monthly Champion |
| **3** | [IndividualLeaderboard](src/components/individual-leaderboard.tsx) | All 8 reps ranked, gold/silver/bronze podium for top 3 |
| **footer** | [FooterNote](src/components/footer-note.tsx) | Data source + qualifying-deal definition |

## Manual entry — `/admin`

The Hyundai Sales Log doesn't expose PS-source appointment counts, so the
floor manager keeps those numbers in sync by hand:

- One number input per rep × per metric (16 boxes total).
- Server action writes to [`data/overrides.json`](data/overrides.json) and
  `revalidatePath('/')` — the scoreboard updates immediately.
- Per-team rolling totals shown above the inputs as a sanity check.
- "Last saved" timestamp at the top so you can see who's looking at
  stale data.

Open from the scoreboard via the **Update PS Numbers** button in the header,
or navigate directly to `/admin`.

## Data layer — single source of truth

All view components are pure functions of one [`ContestState`](src/lib/types.ts)
object. The page (a server component) fetches it once and passes it down.

The current implementation lives in [`src/lib/data/contestData.ts`](src/lib/data/contestData.ts)
and returns the populated **April 2026 mid-month** mock the spec calls for:

- Team Bill: Bill (10) · Eric (19) · Sonny (8) · Doug (3) → **40 deals**
- Team Sumit: Sumit (15) · Brady (12) · Vlad (14) · Bob (5) → **46 deals**
- PS appointments: Bill **4** · Sumit **2**
- PS deals: Bill **3** · Sumit **1**
- New-vehicle RDR target: 80 new cars
- 8 days remaining

Swap `getContestState()` for a Blink Intelligence fetch and the UI updates with
zero component changes.

## Design tokens (for `claude design`)

- Background: `bg-ink-900` (`#0a0e1a`) on `--bg-base` (`#05070d`)
- Hyundai blue: `#002C5F` → glow `#1d6cd1` (Team Bill accent)
- Electric cyan: `#00B8D4` (Team Sumit accent)
- Gold (prize/podium #1): `#ffd24a`
- Silver / Bronze for podium #2 / #3: `#cbd5e1` / `#cd7f32`
- Display font: `Barlow Condensed` 800/900 — used for all big numbers and team names
- Body font: `Inter`
- Animations: `animate-pulse-glow` (leading score), `animate-tug-shimmer` (target progress bar)

## Hooks left for `claude design`

- TV mode toggle (lock in 1080p / 4K layout, hide footer note)
- Month-over-month spark line per rep
- Background ambient effects (animated grid, low-FPS confetti when target unlocks)
- Sound cues (optional — disabled by default for showroom)
- Real-time refresh polling (the page is currently `force-static`)

## Approval boundaries

This site is **read-only**. It displays contest standings — no actions, no
write paths, no external posts. Future Blink Intelligence integration must
stay read-only too unless approval boundaries are explicitly expanded.

## File map

```
app/
  layout.tsx            # html shell + Inter/Barlow Condensed fonts
  page.tsx              # composes the three zones
  globals.css           # ambient backgrounds, scoreboard grid, score-leading glow

src/
  components/
    site-header.tsx
    team-war-header.tsx        # Zone 1
    prize-pool-banner.tsx
    contest-tiles.tsx          # Zone 2
    individual-leaderboard.tsx # Zone 3
    footer-note.tsx
  lib/
    types.ts                   # ContestState contract
    data/contestData.ts        # April 2026 mock + getContestState()
    utils/cn.ts
```
