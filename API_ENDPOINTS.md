# API Endpoints

This project uses two external APIs. Football data and Gemini requests go through `/api/*` proxies (never called directly from the browser in production).

## How requests are routed

| Environment | Path you call | Upstream |
|-------------|---------------|----------|
| Local dev | `GET /api/football/...` | Vite proxy → `https://api.football-data.org/v4/...` |
| Local dev | `POST /api/gemini` | Vite dev middleware → Google Gemini API |
| Vercel | `GET /api/football/...` | `api/football.ts` → `https://api.football-data.org/v4/...` |
| Vercel | `POST /api/gemini` | `api/gemini.ts` → Google Gemini API |

**Auth header (football-data.org):** `X-Auth-Token: <VITE_API_KEY>`

**Auth (Gemini):** server-side only — `GEMINI_API_KEY` in `.env` / Vercel env vars (not sent from the browser)

---

## Football-data.org (via `/api/football`)

Base path: `/api/football`  
Upstream base: `https://api.football-data.org/v4`

### Competition — World Cup (`WC`)

```
GET /api/football/competitions/WC
```
<!-- Tournament metadata and current matchday (Results page) -->

```
GET /api/football/competitions/WC/standings
```
<!-- Full group tables for all 12 groups (Standings page) -->

```
GET /api/football/competitions/WC/teams
```
<!-- List of all teams in the tournament (SearchBar) -->

```
GET /api/football/competitions/WC/matches
```
<!-- All World Cup matches; Home uses this for total match count -->

```
GET /api/football/competitions/WC/matches?matchday={n}
```
<!-- Matches for a specific group-stage matchday (Results page) -->

```
GET /api/football/competitions/WC/matches?dateFrom={YYYY-MM-DD}&dateTo={YYYY-MM-DD}
```
<!-- Matches in a date range; Home filters for live status (Live Matches card) -->

```
GET /api/football/competitions/WC/matches?status=FINISHED&stage=LAST_32
```
<!-- Recently finished round-of-32 games (Home — Latest Results) -->

```
GET /api/football/competitions/WC/matches?status=SCHEDULED&stage=LAST_32
```
<!-- Upcoming round-of-32 fixtures (Home — Upcoming Matches, Fixtures page) -->

### Knockout stages (Home — Knockout Bracket)

```
GET /api/football/competitions/WC/matches?stage=LAST_32
```
<!-- Round of 32 -->

```
GET /api/football/competitions/WC/matches?stage=LAST_16
```
<!-- Round of 16 -->

```
GET /api/football/competitions/WC/matches?stage=QUARTER_FINALS
```
<!-- Quarter-finals -->

```
GET /api/football/competitions/WC/matches?stage=SEMI_FINALS
```
<!-- Semi-finals -->

```
GET /api/football/competitions/WC/matches?stage=THIRD_PLACE
```
<!-- Match for third place -->

```
GET /api/football/competitions/WC/matches?stage=FINAL
```
<!-- Final -->

### Scorers

```
GET /api/football/competitions/WC/scorers?season=2026&limit=10
```
<!-- Top 10 goal scorers (Home — Top Scorers) -->

```
GET /api/football/competitions/WC/scorers?limit=150
```
<!-- Extended scorer list to find a player's goals (Team page) -->

### Teams

```
GET /api/football/teams/{teamId}
```
<!-- Team name, crest, and details (Team page) -->

```
GET /api/football/teams/{teamId}/matches?status=FINISHED&limit=5
```
<!-- Last 5 finished matches for a team (Team page) -->

```
GET /api/football/teams/{teamId}/matches?status=SCHEDULED&limit=1
```
<!-- Next scheduled match for a team (Team page) -->

---

## Google Gemini (via `/api/gemini`)

```
POST /api/gemini
```
<!-- AI match insight: title, summary, and key factor for an upcoming fixture (Home — Match insight button) -->

**Request body:**
```json
{ "prompt": "..." }
```

**Upstream:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Used in:** `src/services/geminiService.ts` → `api/gemini.ts`

---

## Quick reference — which page uses what

| Page / feature | Endpoints |
|----------------|-----------|
| Home | Knockout stages, scorers, finished/scheduled LAST_32, live date range, match count |
| Standings | `/competitions/WC/standings` |
| Fixtures | `/competitions/WC/matches?status=SCHEDULED&stage=LAST_32` |
| Results | `/competitions/WC`, `/competitions/WC/matches?matchday={n}` |
| Team page | `/teams/{id}`, team matches, `/competitions/WC/scorers?limit=150` |
| Search bar | `/competitions/WC/teams` |
| AI match insight | `POST /api/gemini` |

---

## Environment variables

```env
VITE_API_KEY=your_football_data_api_key      # football-data.org
GEMINI_API_KEY=your_gemini_api_key           # Google Gemini (server only)
```

On Vercel, the football proxy also reads `API_KEY` if `VITE_API_KEY` is not set server-side.
