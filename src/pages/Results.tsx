import { useEffect, useState } from 'react'
import type { Match } from '../types'
import MatchCard from '../components/MatchCard'
import { getMatches } from '../lib/matches'
import '../styles/Results.css'

const KNOCKOUT_STAGES = [
  { key: 'LAST_32', label: 'Round of 32' },
  { key: 'LAST_16', label: 'Round of 16' },
  { key: 'FINALS', label: 'Finals' },
]

const FINALS_STAGES = [
  { key: 'QUARTER_FINALS', label: 'Quarter-finals' },
  { key: 'SEMI_FINALS', label: 'Semi-finals' },
  { key: 'THIRD_PLACE', label: '3rd Place' },
  { key: 'FINAL', label: 'Final' },
]

export default function Results() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(3)
  const [selectedStage, setSelectedStage] = useState<string | null>('FINALS')
  const [activeTab, setActiveTab] = useState<'group' | 'knockout'>('knockout')
  const [finalsMatches, setFinalsMatches] = useState<Record<string, Match[]>>({})
  const [finalsLoaded, setFinalsLoaded] = useState(false)

  // Fetch GROUP stage matches by matchday
  useEffect(() => {
    if (activeTab !== 'group' || selectedMatchday === null) return
    let ignore = false

    getMatches('GROUP_STAGE', selectedMatchday)
      .then(rows => {
        if (ignore) return
        setMatches(rows)
        setLoading(false)
      })
      .catch(err => {
        if (ignore) return
        console.error('Error fetching matches:', err)
        setError('Failed to load matches. Please try again.')
        setLoading(false)
      })
    return () => { ignore = true }
  }, [activeTab, selectedMatchday])

    // Fetch KNOCKOUT stage matches by stage
  useEffect(() => {
    if (activeTab !== 'knockout' || selectedStage === null) return
    let ignore = false

    const finished = (rows: Match[]) => rows.filter(m => m.status === 'FINISHED')

    if (selectedStage === 'FINALS') {
      if (finalsLoaded) return

      Promise.all(
        FINALS_STAGES.map(s =>
          getMatches(s.key).then(rows => ({ key: s.key, matches: finished(rows) }))
        )
      )
        .then(results => {
          if (ignore) return
          const grouped: Record<string, Match[]> = {}
          results.forEach(({ key, matches }) => {
            if (matches.length > 0) grouped[key] = matches
          })
          setFinalsMatches(grouped)
          setFinalsLoaded(true)
          setLoading(false)
        })
        .catch(err => {
          if (ignore) return
          console.error('Error fetching matches:', err)
          setError('Failed to load matches. Please try again.')
          setLoading(false)
        })
    } else {
      getMatches(selectedStage)
        .then(rows => {
          if (ignore) return
          setMatches(finished(rows))
          setLoading(false)
        })
        .catch(err => {
          if (ignore) return
          console.error('Error fetching matches:', err)
          setError('Failed to load matches. Please try again.')
          setLoading(false)
        })
    }
    return () => { ignore = true }
  }, [activeTab, selectedStage, finalsLoaded])


  function handleTabSwitch(tab: 'group' | 'knockout') {
    if (tab === activeTab) return
    setError(null)
    setMatches([])
    const finalsCached = selectedStage === 'FINALS' && finalsLoaded
    setLoading(tab === 'group' || !finalsCached)
    setActiveTab(tab)
    if (tab === 'knockout' && selectedStage === null) {
      setSelectedStage('LAST_32')
    }
  }

  return (
    <div>
      {/* Top-level tabs: Group Stage vs Knockout */}
      <div className="matchday-tabs">
        <button
          className={`matchday-tab-main ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('group')}
        >
          Group Stage
        </button>
        <button
          className={`matchday-tab-main ${activeTab === 'knockout' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('knockout')}
        >
          Knockout Stage
        </button>
      </div>

      {/* Sub-tabs */}
      {activeTab === 'group' && (
        <div className="matchday-tabs">
          {[1, 2, 3].map(day => (
            <button
              key={day}
              className={`matchday-tab ${selectedMatchday === day ? 'active' : ''}`}
              onClick={() => { setLoading(true); setError(null); setSelectedMatchday(day) }}
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'knockout' && (
        <div className="matchday-tabs">
          {KNOCKOUT_STAGES.map(stage => (
            <button
              key={stage.key}
              className={`matchday-tab ${selectedStage === stage.key ? 'active' : ''}`}
              onClick={() => {
                setError(null);
                // only show loading spinner if we don't already have finals cached
                if (stage.key !== 'FINALS' || !finalsLoaded) {
                  setLoading(true)
                }
                setSelectedStage(stage.key)
              }}
            >
              {stage.label}
            </button>
          ))}
        </div>
      )}

      {/* Match list — now has 4 possible states */}
      {/* fetch starts → loading = true
                  ↓
              fetch fails  → loading = false, error = "message"   → shows ⚠️ error + retry
              fetch ok     → loading = false, data is empty        → shows "No results yet"
              fetch ok     → loading = false, data has matches     → shows match cards */}
      {loading ? (
        <p className="loading">Loading matches...</p>
      ) : error ? ( // show error BEFORE checking empty data
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      ) : activeTab === 'knockout' && selectedStage === 'FINALS' ? (
        <div className="knockout-results">
          {FINALS_STAGES.filter(s => finalsMatches[s.key]?.length > 0).map(s => (
            <div key={s.key} className="knockout-results__section">
              <h3 className="knockout-results__title">{s.label}</h3>
              <div className="matches-grid">
                {finalsMatches[s.key].map(match => <MatchCard key={match.id} match={match} />)}
              </div>
            </div>
          ))}
          {Object.keys(finalsMatches).length === 0 && (
            <p className="no-data">No finals results yet.</p>
          )}
        </div>
      ) : matches.length === 0 ? (
        <p className="no-data">No results yet for this stage.</p>
      ) : (
        <div className="matches-grid">
          {matches.map(match => <MatchCard key={match.id} match={match} />)}
        </div>
      )}
    </div>
  )
}

