import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Standings from './pages/Standings'
import Results from './pages/Results'
import Fixtures from './pages/Fixtures'
import About from './pages/About'

function App() {
  const [matchday, setMatchday] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v4/competitions/WC/standings', {
      headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
    })
      .then(res => res.json())
      .then(json => setMatchday(json.season.currentMatchday))
  }, [])

  return (
    <div className="app">
      <Header matchday={matchday} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/results" element={<Results />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

// import { useEffect, useState } from 'react'
// import type { Standing, Match } from './types'
// import GroupTable from './components/GroupTable'
// import Header from './components/Header'
// import MatchCard from './components/MatchCard'

// function App() {
//   const [standings, setStandings] = useState<Standing[]>([])
//   const [matches, setMatches] = useState<Match[]>([])
//   const [matchday, setMatchday] = useState<number | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

//     Promise.all([
//       fetch('/api/v4/competitions/WC/standings', { headers }).then(r => r.json()),
//       fetch('/api/v4/competitions/WC/matches?matchday=2', { headers }).then(r => r.json())
//     ]).then(([standingsData, matchesData]) => {
//       setStandings(standingsData.standings)
//       setMatchday(standingsData.season.currentMatchday)
//       setMatches(matchesData.matches)
//       setLoading(false)
//     })
//   }, [])

//   if (loading) return <p>Loading...</p>

//   return (
//     <div className="app">
//       <Header matchday={matchday} />

//       <section className="matches-section">
//         <h2 className="section-title">Matchday {matchday} Results</h2>
//         <div className="matches-grid">
//           {matches.map(match => (
//             <MatchCard key={match.id} match={match} />
//           ))}
//         </div>
//       </section>

//       <section>
//         <h2 className="section-title">Group Standings</h2>
//         <div className="groups-grid">
//           {standings.map((standing) => (
//             <GroupTable key={standing.group} standing={standing} />
//           ))}
//         </div>
//       </section>
//     </div>
//   )
// }

// export default App