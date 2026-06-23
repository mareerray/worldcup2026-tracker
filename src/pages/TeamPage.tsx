import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/TeamPage.css'
import TeamFormation from '../components/TeamFormation'

type Coach = {
  id: number
  firstName: string
  lastName: string
  name: string
  dateOfBirth?: string
  nationality?: string
}

type Scorer = {
  player: {
    id: number
    name: string
    position?: string
    dateOfBirth?: string
  }
  team: {
    id: number
    name: string
    crest: string
  }
  goals: number
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
  const [upcomingMatch, setUpcomingMatches] = useState<Match | null>(null)
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    let cancelled = false
    const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

    const loadTeam = async () => {
      try {
        setLoading(true)

        const [teamRes, matchesRes, upcomingRes, scorersRes] = await Promise.all([
          fetch(`/api/football/teams/${id}`, { headers }),
          fetch(`/api/football/teams/${id}/matches?status=FINISHED&limit=5`, { headers }),
          fetch(`/api/football/teams/${id}/matches?status=SCHEDULED&limit=1`, { headers }),
          fetch(`/api/football/competitions/WC/scorers?limit=50`, { headers })
        ])

        const [teamData, matchesData, upcomingMatchesData, scorersData] = await Promise.all([
          teamRes.json(),
          matchesRes.json(),
          upcomingRes.json(),
          scorersRes.json()
        ])

        if (cancelled) return

        setTeam(teamData)
        const sortedMatches = [...(matchesData.matches || [])].sort(
          (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
        )
        setMatches(sortedMatches)
        setUpcomingMatches(upcomingMatchesData.matches?.[0] ?? null)
        setScorers((scorersData.scorers || []).filter((s: Scorer) => s.team.id === teamData.id))
      } catch {
        if (!cancelled) {
          setTeam(null)
          setMatches([])
          setUpcomingMatches(null)
          setScorers([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTeam()

    return () => {
      cancelled = true
    }
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

      {upcomingMatch && (
        <>
          <h2>Upcoming Match</h2>
          <div className="next-match__item team-page__upcoming">
            <div className="next-match__teams">
              <div className="next-match__team">
                <img src={upcomingMatch.homeTeam.crest} alt={upcomingMatch.homeTeam.name} width={32} height={32} />
                <span>{upcomingMatch.homeTeam.shortName}</span>
              </div>
              <div className="next-match__middle">
                <span className="next-match__vs">VS</span>
              </div>
              <div className="next-match__team">
                <img src={upcomingMatch.awayTeam.crest} alt={upcomingMatch.awayTeam.name} width={32} height={32} />
                <span>{upcomingMatch.awayTeam.shortName}</span>
              </div>
            </div>
            <p className="next-match__date">
              {new Date(upcomingMatch.utcDate).toLocaleDateString('en-GB', {
                timeZone: 'Europe/Helsinki',
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
              {' · '}
              {new Date(upcomingMatch.utcDate).toLocaleTimeString('en-GB', {
                timeZone: 'Europe/Helsinki',
                hour: '2-digit',
                minute: '2-digit'
              })}
              <span className="timezone-label">EEST</span>
            </p>
          </div>
        </>
      )}

      <h2>Recent Results</h2>
      <div className="results-list">
        {matches.map(match => (
          <div key={match.id} className="result-row">
            <div className="result-row__team result-row__team--home">
              <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
              <span>{match.homeTeam.shortName}</span>
            </div>
            <div className="result-row__center">
              <div className="result-row__score">
                <span>{match.score.fullTime.home}</span>
                <span className="score--divider">–</span>
                <span>{match.score.fullTime.away}</span>
              </div>
              <p className="result-row__date">
                {new Date(match.utcDate).toLocaleDateString('en-GB', {
                  timeZone: 'Europe/Helsinki',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="result-row__team result-row__team--away">
              <span>{match.awayTeam.shortName}</span>
              <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
            </div>
          </div>
        ))}
      </div>

      <>
        <h2>Scorers</h2>
        <div className="scorers-list">
          {scorers.length > 0 ? (
            scorers.slice(0, 5).map((s, i) => (
              <div key={s.player.id} className="scorer-row">
                <span className="scorer-row__rank">{i + 1}</span>
                <img src={s.team.crest} alt={s.team.name} width={20} height={20} />
                <span className="scorer-row__name">{s.player.name}</span>
                <span className="scorer-row__goals">{s.goals} ⚽</span>
              </div>
            ))
          ) : (
            <div>
              <span className="scorer-row__none">No Scorers from this team yet</span>
            </div>
          )}
        </div>
      </>

      <TeamFormation players={(team.squad ?? []).map(p => ({ ...p, position: p.position ?? '' }))} team={{ crest: team.crest, name: team.name }} />

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
// import { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import '../styles/TeamPage.css'
// import TeamFormation from '../components/TeamFormation'

// type Coach = {
//     id: number
//     firstName: string
//     lastName: string
//     name: string
//     dateOfBirth?: string
//     nationality?: string
// }

// type Team = {
//     id: number
//     name: string
//     shortName: string
//     tla: string
//     crest: string
//     squad?: {
//         id: number
//         name: string
//         position?: string
//         dateOfBirth?: string
//         nationality?: string
//     }[]
//     coach?: Coach
// }

// type Match = {
//     id: number
//     utcDate: string
//     homeTeam: { name: string; shortName: string; crest: string }
//     awayTeam: { name: string; shortName: string; crest: string }
//     score: { fullTime: { home: number | null; away: number | null } }
// }

// export default function TeamPage() {
//     const { id } = useParams()
//     const [team, setTeam] = useState<Team | null>(null)
//     const [matches, setMatches] = useState<Match[]>([])
//     const [upcomingMatch, setUpcomingMatches] = useState<Match | null>(null)
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         if (!id) return

//         let cancelled = false
//         const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

//         const loadTeam = async () => {
//             try {
//                 setLoading(true)

//                 const [teamRes, matchesRes, upcomingRes] = await Promise.all([
//                     fetch(`/api/football/teams/${id}`, { headers }),
//                     fetch(`/api/football/teams/${id}/matches?status=FINISHED&limit=5`, { headers }),
//                     fetch(`/api/football/teams/${id}/matches?status=SCHEDULED&limit=1`, { headers })
//                 ])

//                 const [teamData, matchesData, upcomingMatchesData] = await Promise.all([
//                     teamRes.json(),
//                     matchesRes.json(),
//                     upcomingRes.json()
//                 ])

//                 if (cancelled) return

//                 setTeam(teamData)
//                 const sortedMatches = [...(matchesData.matches || [])].sort(
//                     (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
//                 )
//                 setMatches(sortedMatches)
//                 setUpcomingMatches(upcomingMatchesData.matches?.[0] ?? null)
//             } catch {
//                 if (!cancelled) {
//                     setTeam(null)
//                     setMatches([])
//                     setUpcomingMatches(null)
//                 }
//             } finally {
//                 if (!cancelled) setLoading(false)
//             }
//         }

//         loadTeam()

//         return () => {
//             cancelled = true
//         }
//     }, [id])
 

//     if (loading) return <p className="loading">Loading...</p>
//     if (!team) return <p className="no-data">Team not found</p>

//     return (
//         <div className="team-page">
//             <div className="team-page__header">
//                 <img src={team.crest} alt={team.name} width={72} height={72} />
//                 <div>
//                     <h1>{team.name}</h1>
//                     <p>{team.shortName}</p>
//                 </div>
//             </div>

//             {upcomingMatch && (
//                 <>
//                     <h2>Upcoming Match</h2>
//                     <div className="next-match__item team-page__upcoming">
//                         <div className="next-match__teams">
//                             <div className="next-match__team">
//                                 <img src={upcomingMatch.homeTeam.crest} alt={upcomingMatch.homeTeam.name} width={32} height={32} />
//                                 <span>{upcomingMatch.homeTeam.shortName}</span>
//                             </div>

//                             <div className="next-match__middle">
//                                 <span className="next-match__vs">VS</span>
//                             </div>

//                             <div className="next-match__team">
//                                 <img src={upcomingMatch.awayTeam.crest} alt={upcomingMatch.awayTeam.name} width={32} height={32} />
//                                 <span>{upcomingMatch.awayTeam.shortName}</span>
//                             </div>
//                         </div>

//                         <p className="next-match__date">
//                             {new Date(upcomingMatch.utcDate).toLocaleDateString('en-GB', {
//                                 timeZone: 'Europe/Helsinki',
//                                 weekday: 'short',
//                                 day: 'numeric',
//                                 month: 'short'
//                             })}
//                             {' · '}
//                             {new Date(upcomingMatch.utcDate).toLocaleTimeString('en-GB', {
//                                 timeZone: 'Europe/Helsinki',
//                                 hour: '2-digit',
//                                 minute: '2-digit'
//                             })}
//                             <span className="timezone-label">EEST</span>
//                         </p>
//                     </div>
//                 </>
//             )}

//             <h2>Recent Results</h2>
//             <div className="results-list">
//                 {matches.map(match => (

//                     <div key={match.id} className="result-row">
//                         <div className="result-row__team result-row__team--home">
//                             <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
//                             <span>{match.homeTeam.shortName}</span>
//                         </div>

//                         <div className="result-row__center">
//                             <div className="result-row__score">
//                                 <span>{match.score.fullTime.home}</span>
//                                 <span className="score--divider">–</span>
//                                 <span>{match.score.fullTime.away}</span>
//                             </div>
//                             <p className="result-row__date">
//                                 {new Date(match.utcDate).toLocaleDateString('en-GB', {
//                                     timeZone: 'Europe/Helsinki',
//                                     day: 'numeric',
//                                     month: 'short',
//                                     year: 'numeric'
//                                 })}
//                             </p>
//                         </div>

//                         <div className="result-row__team result-row__team--away">
//                             <span>{match.awayTeam.shortName}</span>
//                             <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <TeamFormation
//                 players={(team.squad ?? []).map(p => ({ ...p, position: p.position ?? '' }))}
//                 team={{ crest: team.crest, name: team.name }}
//             />

//             {team.coach && (
//                 <>
//                     <h2>Coach</h2>
//                     <div className="coach-card">
//                         <div className="coach-card__name">{team.coach.name}</div>
//                         <div className="coach-card__meta">
//                             <span>Nationality: {team.coach.nationality ?? 'N/A'}</span>
//                             <span>Born: {team.coach.dateOfBirth ? team.coach.dateOfBirth.slice(0, 4) : 'N/A'}</span>
//                         </div>
//                     </div>
//                 </>
//             )}

//             <h2>Squad</h2>
//             <div className="squad-grid">
//                 {team.squad?.map(player => (
//                     <div key={player.id} className="squad-card">
//                         <div className="squad-card__name">{player.name}</div>
//                         <div className="squad-card__meta">
//                             <span>{player.position ?? 'N/A'}</span>
//                             <span>{player.nationality ?? 'N/A'}</span>
//                             <span>{player.dateOfBirth ? player.dateOfBirth.slice(0, 4) : 'N/A'}</span>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//         </div>
//     )
// }