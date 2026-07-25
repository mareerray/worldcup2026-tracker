import { Routes, Route } from 'react-router-dom'
import { Component } from 'react'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
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

  componentDidCatch(error: Error, info: React.ErrorInfo) { 
    console.error('ErrorBoundary caught:', error, info)
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
      <Analytics />
    </div>
  )
}

export default App

