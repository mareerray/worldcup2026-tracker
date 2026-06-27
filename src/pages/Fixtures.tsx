import { useEffect, useState } from 'react'
import type { Match } from '../types'
import '../styles/Fixtures.css'

export default function Fixtures() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/football/competitions/WC/matches?status=SCHEDULED`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
            .then(res => res.json())
            .then(json => {
                setMatches(json.matches)
                setLoading(false)
            })
    }, [])

    if (loading) return <p className="loading">Loading fixtures...</p>

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
                            <div className="fixture-row__matchday">
                                MD {match.matchday}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}