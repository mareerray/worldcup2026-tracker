# ⚽ FIFA World Cup 2026 Tracker

A real-time World Cup 2026 dashboard built with React, TypeScript and Vite.
Live data powered by the [football-data.org](https://www.football-data.org) API.

## 🚀 Live Demo
[worldcup2026-tracker-app.vercel.app](https://worldcup2026-tracker-app.vercel.app) 

<div>
<img src="public/images/screenshot.png" width="700">
</div>

## ✨ Features

- 🥇 **Live Standings** — group table with points, goals and goal difference
- ⚽ **Results** — match scores by matchday
- 📅 **Fixtures** — upcoming matches with dates and times
- 🥅 **Top Scorers** — live scorer rankings for WC 2026
- 📊 **Tournament Progress** — matches played vs remaining
- 📸 **Image Carousel** — WC 2026 venues and highlights
- 🌍 **About** — tournament info and fun facts

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| football-data.org API | Live match data |
| Vitest | Unit testing |
| Vercel | Deployment |

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- A free API key from [football-data.org](https://www.football-data.org)

### Installation

```bash
git clone https://github.com/mareerray/worldcup2026-tracker.git
cd worldcup2026-tracker
npm install
```

### Environment Variables

Create a `.env` file at the root:

```env
VITE_API_KEY=your_api_key_here
```

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
├── components/
│ ├── Header.tsx # Sticky header with nav
│ └── MatchCard.tsx # Reusable match result card
├── pages/
│ ├── Home.tsx # Dashboard with live data
│ ├── Standings.tsx # Group standings table
│ ├── Results.tsx # Match results by matchday
│ ├── Fixtures.tsx # Upcoming fixtures
│ └── About.tsx # Tournament info & facts
├── types.ts # TypeScript interfaces
└── main.tsx # App entry point
````

## 🔑 API

This project uses the free tier of [football-data.org](https://www.football-data.org).  
Rate limit: 10 requests/minute.

## 📄 License

MIT — feel free to use and modify.

---

Built by [Mayuree Reunsati](https://github.com/mareerray) · grit:lab Åland 2026

