import { useEffect, useState } from 'react'
import type { Match } from '../types'
import MatchCard from '../components/MatchCard'

const KNOCKOUT_STAGES = [
    { key: 'LAST_32',       label: 'Round of 32' },
    { key: 'LAST_16',       label: 'Round of 16' },
    { key: 'QUARTER_FINALS', label: 'Quarter-finals' },
    { key: 'SEMI_FINALS',   label: 'Semi-finals' },
    { key: 'THIRD_PLACE',   label: '3rd Place' },
    { key: 'FINAL',         label: 'Final' },
  ]

export default function Results() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null) // null instead of 1
    const [selectedStage, setSelectedStage] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'group' | 'knockout'>('group')

    // Fetch current matchday once on load
    useEffect(() => {
        fetch(`/api/football/competitions/WC`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
            .then(res => res.json())
            .then(json => setSelectedMatchday(json.currentSeason?.currentMatchday ?? 1))
    }, [])

    // Fetch matches whenever matchday changes
    useEffect(() => {
        if (selectedMatchday === null) return // wait for matchday to be known
        fetch(`/api/football/competitions/WC/matches?matchday=${selectedMatchday}`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
            .then(res => res.json())
            .then(json => {
                setMatches(json.matches)
                setLoading(false)
            })
    }, [selectedMatchday])

    useEffect(() => {
        if (activeTab !== 'knockout' || selectedStage === null) return
        setLoading(true)
        fetch(`/api/football/competitions/WC/matches?stage=${selectedStage}&status=FINISHED`, {
          headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
        .then(res => res.json())
        .then(json => {
            setMatches(json.matches ?? [])
            setLoading(false)
        })
    }, [activeTab, selectedStage])

    function handleTabSwitch(tab: 'group' | 'knockout') {
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
                  onClick={() => { setLoading(true); setSelectedMatchday(day) }}
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
                  onClick={() => { setLoading(true); setSelectedStage(stage.key) }}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          )}
      
          {/* Match list */}
          {loading ? (
            <p className="loading">Loading matches...</p>
          ) : matches.length === 0 ? (
            <p className="no-data">No results yet for this stage.</p>
          ) : (
            <div className="matches-grid">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      )

    // return (
    //     <div>
    //         <div className="matchday-tabs">
    //             {matchdays.map(day => (
    //                 <button
    //                     key={day}
    //                     className={`matchday-tab ${selectedMatchday === day ? 'active' : ''}`}
    //                     onClick={() => {
    //                         setLoading(true)
    //                         setSelectedMatchday(day)
    //                     }}
    //                 >
    //                     Matchday {day}
    //                 </button>
    //             ))}
    //         </div>

    //         {loading ? (
    //             <p className="loading">Loading matches...</p>
    //         ) : (
    //             <div className="matches-grid">
    //                 {matches.map(match => (
    //                     <MatchCard key={match.id} match={match} />
    //                 ))}
    //             </div>
    //         )}
    //     </div>
    // )
}
