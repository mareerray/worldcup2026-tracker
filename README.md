# ⚽ FIFA World Cup 2026 Tracker

A real-time World Cup 2026 dashboard built with React, TypeScript and Vite.
Live data powered by the [football-data.org](https://www.football-data.org) API, with optional **AI match insights** powered by Google Gemini.

## 🚀 Live Demo
[worldcup2026-tracker-app.vercel.app](https://worldcup2026-tracker-app.vercel.app)

<div>
<img src="public/images/screenshot.png" width="700">
</div>

## ✨ Features

### 🏠 Home Dashboard
- 🔴 **Live Matches** — in-play fixtures with scores (auto-refreshes every 90s)
- 📅 **Upcoming Matches** — next fixtures with date, time and timezone (EEST)
- 🤖 **AI Match Insight** — generate a short AI preview for upcoming fixtures (title, summary, key factor)
- 🏆 **Knockout Bracket** — full tournament tree from Round of 32 through the Final, with the match for third place between the semi-finals
- 🥅 **Top Scorers** — goal scorer rankings for WC 2026
- ⚽ **Latest Results** — most recent match scores at a glance
- 📸 **Image Carousel** — WC 2026 venues and highlights

### 🤖 AI Match Insight
- Click **Match insight** on an upcoming fixture to get a Gemini-generated preview
- Results appear in a floating insight card with an **AI** badge and disclaimer
- Responses are cached per match so repeat clicks do not call the API again
- Built with `gemini-2.5-flash` and structured JSON output (`title`, `summary`, `keyFactor`)
- API key is kept server-side via `api/gemini.ts` (not exposed in the browser)

### 📄 Pages
- 🏆 **Standings** — full group tables for all 12 groups with P, W, D, L, GD and PTS
- 🕐 **Results** — all match scores filterable by matchday
- 🗓️ **Fixtures** — upcoming matches with date, time and venue
- 🔍 **Team Search** — search any of the 48 teams and view their details
- 🌍 **About** — tournament info, fun facts and external resources

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| football-data.org API | Live match data |
| Google Gemini API | AI match insights |
| Vitest | Unit testing |
| Vercel | Deployment & API proxies |

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- A free API key from [football-data.org](https://www.football-data.org)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com) (for Match Insight)

### Installation

```bash
git clone https://github.com/mareerray/worldcup2026-tracker.git
cd worldcup2026-tracker
npm install
```

### Environment Variables

Create a `.env` file at the root:

```env
VITE_API_KEY=your_football_data_api_key
GEMINI_API_KEY=your_gemini_api_key
```

| Variable | Used by | Notes |
|----------|---------|-------|
| `VITE_API_KEY` | Browser + `api/football.ts` | Sent as `X-Auth-Token` to football-data.org |
| `GEMINI_API_KEY` | `api/gemini.ts` (server only) | Never bundled into the client |

> **Note:** Restart the dev server after changing `.env`. Never commit `.env` to Git.

On Vercel, set both variables in **Settings → Environment Variables**. The football proxy also accepts `API_KEY` if `VITE_API_KEY` is not set server-side.

### Example `.env`
Create a local `.env` from this example (do NOT commit your `.env`). You can also commit a trimmed `.env.example` with these keys.

```env
# Client (used by the browser via Vite)
VITE_API_KEY=your_football_data_api_key

# Server-only (preferred for production; used by the server proxy)
API_KEY=your_football_data_api_key

# Gemini (server-side key — keep secret)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Vite dev plugin can also read this
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Note: `VITE_`-prefixed variables are exposed to the client by Vite — keep only non-sensitive values there. Prefer `API_KEY` and `GEMINI_API_KEY` for server-only secrets.

### Run locally

```bash
npm run dev
```

### Run tests

```bash
npm run test
```

### Build for production

```bash
npm run build
```

## 📁 Project Structure

```
.
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vite.geminiDevPlugin.ts
├── vitest.config.ts
├── vercel.json
├── api/
│   ├── football.ts             # Vercel serverless proxy → football-data.org
│   └── gemini.ts               # Vercel serverless proxy → Google Gemini
├── lib/
│   └── geminiUpstream.ts       # Shared Gemini logic for local dev middleware
├── public/
│   └── images/                 # screenshot and other assets
└── src/
	├── App.tsx
	├── main.tsx
	├── setupTests.ts
	├── api/
	│   └── footballClient.ts   # Browser helper — calls /api/football
	├── assets/
	├── components/
	│   ├── ChampionsPodium.tsx
	│   ├── Footer.tsx
	│   ├── GroupTable.tsx
	│   ├── Header.tsx
	│   ├── KnockoutBracket.tsx
	│   ├── MatchCard.tsx
	│   ├── Navbar.tsx
	│   ├── SearchBar.tsx
	│   └── TeamFormation.tsx
	│   └── ai/
	│       ├── AIFloatingButton.tsx
	│       ├── AIResultCard.tsx
	│       └── MatchInsightButton.tsx
	├── pages/
	│   ├── About.tsx
	│   ├── Fixtures.tsx
	│   ├── Home.test.tsx
	│   ├── Home.tsx
	│   ├── OldHome.tsx
	│   ├── Results.tsx
	│   ├── Standings.tsx
	│   └── TeamPage.tsx
	├── services/
	│   └── geminiService.ts     # Calls /api/gemini + client-side caching
	├── styles/
	│   ├── About.css
	│   ├── AIStyles.css
	│   ├── ChampionsPodium.css
	│   ├── Fixtures.css
	│   ├── Footer.css
	│   ├── Home.css
	│   ├── index.css
	│   └── ...
	├── types/
	│   ├── ai.ts
	│   └── index.ts
	└── utils/
		├── formatScore.ts
		├── matchInsightPrompt.ts
		└── slides.ts
```

## 🔑 APIs

Both external APIs are proxied through `/api/*` so keys stay off the public client where possible.

| Proxy | Server file | Client helper | Upstream |
|-------|-------------|---------------|----------|
| `/api/football/*` | `api/football.ts` | `src/api/footballClient.ts` | football-data.org v4 |
| `POST /api/gemini` | `api/gemini.ts` | `src/services/geminiService.ts` | Google Gemini |

- **Local dev:** Vite proxies `/api/football` to football-data.org; a dev middleware handles `/api/gemini`
- **Production:** Vercel runs `api/football.ts` and `api/gemini.ts` as serverless functions

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for the full list of endpoints used in this project.

### Football data
This project uses the free tier of [football-data.org](https://www.football-data.org).
Rate limit: ~10 requests/minute — avoid hammering the API during development.

### Gemini (AI Match Insight)
Match insights use the [Google Gemini API](https://ai.google.dev) via the `/api/gemini` proxy.

- Model: `gemini-2.5-flash`
- Free/prepaid tiers have request and billing limits — click one match at a time while testing

---

Built by [Mayuree Reunsati](https://github.com/mareerray) · grit:lab Åland June 2026
