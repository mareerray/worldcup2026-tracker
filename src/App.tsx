import { Routes, Route } from 'react-router-dom'
import { useEffect, Component } from 'react'
import type { ReactNode } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Standings from './pages/Standings'
import Results from './pages/Results'
import Fixtures from './pages/Fixtures'
import About from './pages/About'
import Footer from './components/Footer'
import TeamPage from './pages/TeamPage'

// Error Boundary
interface ErrorBoundaryState { hasError: boolean }
interface ErrorBoundaryProps { children: ReactNode }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p>⚠️ Something went wrong. Please try refreshing the page.</p>
        </div>
      )
    }
    return this.props.children
  }
}

// App
function App() {

  const API_BASE = 'https://api.football-data.org/v4'

  useEffect(() => {
    fetch(`${API_BASE}/competitions/WC/standings`, {
      headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
    })
      .then(res => res.json())
      .catch(err => console.error('App fetch error:', err))
  }, [])

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/results" element={<Results />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/about" element={<About />} />
            <Route path="/team/:id" element={<TeamPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default App

