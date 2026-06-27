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
- 🥇 **Group Leaderboard** — quick snapshot of the top team in each of the 12 groups
- 🔴 **Live Match** — shows the current live match with real-time score, or a "no match live" message
- 📅 **Upcoming Matches** — next fixtures with date, time and timezone (EEST)
- 🤖 **AI Match Insight** — generate a short AI preview for upcoming fixtures (title, summary, key factor)
- 🥅 **Top Scorers** — live scorer rankings for WC 2026
- ⚽ **Latest Results** — most recent match scores at a glance
- 📊 **Tournament Progress** — matches played vs remaining with a progress bar
- 📸 **Image Carousel** — WC 2026 venues and highlights

### 🤖 AI Match Insight
- Click **Match insight** on an upcoming fixture to get a Gemini-generated preview
- Results appear in a floating insight card with an **AI** badge and disclaimer
- Responses are cached per match so repeat clicks do not call the API again
- Built with `gemini-2.5-flash` and structured JSON output (`title`, `summary`, `keyFactor`)

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
| Vercel | Deployment & API proxy |

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
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** Restart the dev server after changing `.env`. Never commit `.env` to Git.

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

````
src/
├── api/
│   └── football.ts         # Client helper for football-data.org requests
├── components/
│   ├── ai/
│   │   ├── AIResultCard.tsx      # Floating insight result card
│   │   ├── AIFloatingButton.tsx  # Floating AI button (optional)
│   │   └── MatchInsightButton.tsx # Match insight trigger button
│   ├── Footer.tsx
│   ├── GroupTable.tsx
│   ├── Header.tsx
│   ├── MatchCard.tsx
│   ├── Navbar.tsx
│   └── SearchBar.tsx
├── pages/
│   ├── About.tsx
│   ├── Fixtures.tsx
│   ├── Home.tsx            # Dashboard + AI match insight flow
│   ├── Results.tsx
│   ├── Standings.tsx
│   └── TeamPage.tsx
├── services/
│   └── geminiService.ts    # Gemini API calls & caching
├── styles/
│   ├── AIStyles.css        # AI button & insight card styles
│   ├── About.css
│   ├── Footer.css
│   ├── Home.css
│   ├── index.css
│   ├── SearchBar.css
│   └── TeamPage.css
├── types/
│   ├── ai.ts               # AI insight types
│   └── index.ts
├── utils/
│   └── slides.ts           # Carousel image data
├── App.tsx
└── main.tsx

api/
└── football.ts               # Vercel serverless proxy for football-data.org
````

## 🔑 APIs

### Football data
This project uses the free tier of [football-data.org](https://www.football-data.org).  
Rate limit: ~10 requests/minute.

In production, requests go through `api/football.ts` on Vercel. In local dev, Vite proxies `/api/football` to football-data.org.

### Gemini (AI Match Insight)
Match insights use the [Google Gemini API](https://ai.google.dev) via `src/services/geminiService.ts`.

- Model: `gemini-2.5-flash`
- Free/prepaid tiers have request and billing limits — click one match at a time while testing
- The Gemini key is read from `VITE_GEMINI_API_KEY` in the browser (fine for personal projects; use a server proxy for production apps with public traffic)

---

Built by [Mayuree Reunsati](https://github.com/mareerray) · grit:lab Åland June 2026
