import { useEffect, useState } from 'react'
import type { Match } from '../types'
import MatchCard from '../components/MatchCard'

export default function Results() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null) // 👈 null instead of 1

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
        if (selectedMatchday === null) return // 👈 wait for matchday to be known
        fetch(`/api/football/competitions/WC/matches?matchday=${selectedMatchday}`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
            .then(res => res.json())
            .then(json => {
                setMatches(json.matches)
                setLoading(false)
            })
    }, [selectedMatchday])

    const matchdays = [1, 2, 3]

    return (
        <div>
            <div className="matchday-tabs">
                {matchdays.map(day => (
                    <button
                        key={day}
                        className={`matchday-tab ${selectedMatchday === day ? 'active' : ''}`}
                        onClick={() => {
                            setLoading(true)
                            setSelectedMatchday(day)
                        }}
                    >
                        Matchday {day}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="loading">Loading matches...</p>
            ) : (
                <div className="matches-grid">
                    {matches.map(match => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </div>
    )
}
// import { useEffect, useState } from 'react'
// import type { Match } from '../types'
// import MatchCard from '../components/MatchCard'

// export default function Results() {
//     const [matches, setMatches] = useState<Match[]>([])
//     const [loading, setLoading] = useState(true)
//     const [selectedMatchday, setSelectedMatchday] = useState(1)

//     useEffect(() => {
//         fetch(`/api/football/competitions/WC/matches?matchday=${selectedMatchday}`, {
//             headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
//         })
//             .then(res => res.json())
//             .then(json => {
//                 setMatches(json.matches)
//                 setLoading(false)
//             })
//     }, [selectedMatchday])

//     const matchdays = [1, 2, 3]

//     return (
//         <div>
//             <div className="matchday-tabs">
//                 {matchdays.map(day => (
//                     <button
//                         key={day}
//                         className={`matchday-tab ${selectedMatchday === day ? 'active' : ''}`}
//                         onClick={() => {
//                             setLoading(true)
//                             setSelectedMatchday(day)
//                         }}
//                     >
//                         Matchday {day}
//                     </button>
//                 ))}
//             </div>

//             {loading ? (
//                 <p className="loading">Loading matches...</p>
//             ) : (
//                 <div className="matches-grid">
//                     {matches.map(match => (
//                         <MatchCard key={match.id} match={match} />
//                     ))}
//                 </div>
//             )}
//         </div>
//     )
// }