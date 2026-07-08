import { useEffect, useState } from 'react'
import type { Match } from '../types'
import '../styles/Fixtures.css'

export default function Fixtures() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false // flag to detect if this effect is stale

        fetch(`/api/football/competitions/WC/matches?status=SCHEDULED`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY },
            signal: AbortSignal.timeout(10000) // 10 seconds timeout
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`)
                }
                return res.json()
            })
            .then(json => {
                if (ignore) return // if this effect is stale, do nothing
                setMatches(json.matches ?? [])
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching fixtures:', err)
                if (err.name === 'TimeoutError') {
                    setError('Request timed out. Check your connection and try again.')
                } else if (err.message.includes('429')) {
                    setError('Too many requests — please wait a minute and refresh.') // only for rate limits
                } else {
                    setError('Failed to load fixtures. Please try again.')
                }
                setLoading(false)
            })
        return () => { ignore = true } // cleanup function to mark this effect as stale
    }, [])

    if (loading) return <p className="loading">Loading fixtures...</p>
    if (error) return <p className="error-message">⚠️ {error}</p>

    return (
        <div>
            <div className="fixtures-list">
                {matches.map(match => {
                    const date = new Date(match.utcDate)
                    const day = date.toLocaleDateString('en-GB', {
                        timeZone: 'Europe/Helsinki',
                        weekday: 'long', day: 'numeric', month: 'long',
                    })
                    const time = date.toLocaleTimeString('en-GB', {
                        timeZone: 'Europe/Helsinki',
                        hour: '2-digit', minute: '2-digit'
                    })

                    return (
                        <div key={match.id} className="fixture-row">
                            <div className="fixture-row__date">
                                <span className="fixture-row__day">{day}</span>
                                <span className="fixture-row__time">{time}<span className="timezone-label">EEST</span></span>
                            </div>
                            <div className="fixture-row__match">
                                <div className="fixture-row__team">
                                    <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
                                    <span>{match.homeTeam.shortName}</span>
                                </div>
                                <span className="fixture-row__vs">vs</span>
                                <div className="fixture-row__team fixture-row__team--away">
                                    <span>{match.awayTeam.shortName}</span>
                                    <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}