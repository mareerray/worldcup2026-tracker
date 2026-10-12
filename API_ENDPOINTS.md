# API Endpoints

Most tournament data now comes from **Supabase** (tables and SQL views).
The **football-data.org** API is used only for pages not yet migrated.
Requests to football-data.org go through a server-side proxy, never directly
from the browser.

## Where the data comes from

| Source | Used for |
|--------|----------|
| Supabase | Home, Results, Team page, Standings, Analytics |
| football-data.org (via proxy) | Pages not yet migrated (see table below) |

> CHECK: confirm which pages still call `/api/football` (search the code for
> `fetchFootballJson`) and update the table below.

## How football-data.org requests are routed

| Environment | Path you call | Upstream |
|-------------|---------------|----------|
| Local dev | `GET /api/football/...` | Vite proxy → `https://api.football-data.org/v4/...` |
| Vercel | `GET /api/football/...` | `api/football.ts` → `https://api.football-data.org/v4/...` |

- **Auth header sent upstream:** `X-Auth-Token: <FOOTBALL_API_KEY>`
  (set on the server only; never in browser code).
- **Caching:** the Vercel proxy caches successful responses for 60 seconds.
- **Rate limit (free tier):** about 10 calls per minute. A 429 error shows a
  "wait a minute and refresh" message.
- **Browser helper:** `src/api/footballClient.ts` → `fetchFootballJson(path)`.

---

## Football-data.org endpoints (via `/api/football`)

Base path: `/api/football`
Upstream base: `https://api.football-data.org/v4`

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /competitions/WC` | Tournament info, current matchday | CHECK |
| `GET /competitions/WC/teams` | All teams (search) | CHECK |
| `GET /competitions/WC/matches?status=SCHEDULED&stage=LAST_32` | Upcoming fixtures | CHECK |
| `GET /competitions/WC/matches?dateFrom={YYYY-MM-DD}&dateTo={YYYY-MM-DD}` | Live matches by date range | CHECK |
| `GET /competitions/WC/standings` | Group tables | Replaced by Supabase `group_standings` |

Other endpoints used earlier (matches by stage, scorers, team matches) were
moved to Supabase views. Delete any rows above that are no longer called.

### Free-tier limits

- `/teams/{id}` does not include squad or coach data on the free plan, so the
  Team page hides Formation, Coach and Squad sections.

---

## Supabase (tables and views)

| Table / view | Purpose |
|--------------|---------|
| `teams` | Team id, name, short name, TLA, crest URL |
| `matches` | Match records and stored score fields |
| `scorers` | Player goal totals |
| `group_standings` | Group tables (position, played, won, draw, lost, points, goals) |
| `match_details` | Matches joined with teams, plus `winner_team_id` |
| `scorer_details` | Scorers joined with team data |
| `match_analytics` | Match view with in-play goals (no penalty kicks) |
| `tournament_overview` | One-row KPI summary |
| `stage_analytics` | One row per tournament stage |
| `team_performance` | One row per team, with `performance_rank` |
| `highest_scoring_matches` | Top 10 matches by in-play goals |

Browser code reads these through `src/lib/supabase.ts`, `src/lib/matches.ts`
and `src/lib/analytics.ts`.

---

## Quick reference: which page uses what

| Page / feature | Data source |
|----------------|-------------|
| Home | Supabase (`match_details`, `scorer_details`) |
| Standings | Supabase (`group_standings`) |
| Results | Supabase (`match_details`) |
| Team page | Supabase (`teams`, `match_details`, `scorer_details`) |
| Analytics | Supabase (analytics views) |
| Fixtures | CHECK |
| Search bar | CHECK |

---

## Environment variables

```env
# Server only (Vite dev proxy / Vercel function)
FOOTBALL_API_KEY=your_football_data_api_key

# Browser (public; protect data with Row Level Security)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```