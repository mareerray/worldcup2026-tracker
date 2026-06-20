import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Standings from './pages/Standings'
import Results from './pages/Results'
import Fixtures from './pages/Fixtures'
import About from './pages/About'
import Footer from './components/Footer'

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
      <Footer />
    </div>
  )
}

export default App

