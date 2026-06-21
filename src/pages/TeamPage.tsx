import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/TeamPage.css'

type Coach = {
    id: number
    firstName: string
    lastName: string
    name: string
    dateOfBirth?: string
    nationality?: string
}

type Team = {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
    squad?: {
        id: number
        name: string
        position?: string
        dateOfBirth?: string
        nationality?: string
    }[]
    coach?: Coach
}

type Match = {
    id: number
    utcDate: string
    homeTeam: { name: string; shortName: string; crest: string }
    awayTeam: { name: string; shortName: string; crest: string }
    score: { fullTime: { home: number | null; away: number | null } }
}

export default function TeamPage() {
    const { id } = useParams()
    const [team, setTeam] = useState<Team | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

        Promise.all([
            fetch(`/api/football/teams/${id}`, { headers }).then(r => r.json()),
            fetch(`/api/football/teams/${id}/matches?status=FINISHED&limit=5`, { headers }).then(r => r.json())
        ]).then(([teamData, matchesData]) => {
            setTeam(teamData)
            setMatches(matchesData.matches || [])
            setLoading(false)
        })
    }, [id])

    if (loading) return <p className="loading">Loading...</p>
    if (!team) return <p className="no-data">Team not found</p>

    return (
        <div className="team-page">
            <div className="team-page__header">
                <img src={team.crest} alt={team.name} width={72} height={72} />
                <div>
                    <h1>{team.name}</h1>
                    <p>{team.shortName}</p>
                </div>
            </div>

            <h2>Recent Matches</h2>
            <div className="results-list">
                {matches.map(match => (
                    <div key={match.id} className="result-row">
                        <div className="result-row__team result-row__team--home">
                            <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
                            <span>{match.homeTeam.shortName}</span>
                        </div>

                        <div className="result-row__score">
                            <span>{match.score.fullTime.home}</span>
                            <span className="score--divider">–</span>
                            <span>{match.score.fullTime.away}</span>
                        </div>

                        <div className="result-row__team result-row__team--away">
                            <span>{match.awayTeam.shortName}</span>
                            <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
                        </div>
                    </div>
                ))}
            </div>

            {team.coach && (
                <>
                    <h2>Coach</h2>
                    <div className="coach-card">
                        <div className="coach-card__name">{team.coach.name}</div>
                        <div className="coach-card__meta">
                            <span>Nationality: {team.coach.nationality ?? 'N/A'}</span>
                            <span>Born: {team.coach.dateOfBirth ? team.coach.dateOfBirth.slice(0, 4) : 'N/A'}</span>
                        </div>
                    </div>
                </>
            )}

            <h2>Squad</h2>
            <div className="squad-grid">
                {team.squad?.map(player => (
                    <div key={player.id} className="squad-card">
                        <div className="squad-card__name">{player.name}</div>
                        <div className="squad-card__meta">
                            <span>{player.position ?? 'N/A'}</span>
                            <span>{player.nationality ?? 'N/A'}</span>
                            <span>{player.dateOfBirth ? player.dateOfBirth.slice(0, 4) : 'N/A'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}