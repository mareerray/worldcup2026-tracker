import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Match, Team, Scorer } from '../types'
import { formatScore } from '../utils/formatScore'
import '../styles/TeamPage.css'
import TeamFormation from '../components/TeamFormation'
import MatchCard from '../components/MatchCard'

/** Final podium finishes — same teams as ChampionsPodium (football-data.org IDs). */
const PODIUM_FINISHES: Record<number, { label: string; place: 1 | 2 | 3 }> = {
  760: { label: 'Champion', place: 1 },       // Spain
  762: { label: 'Second Place', place: 2 }, // Argentina
  770: { label: 'Third Place', place: 3 },  // England
}

function TrophyIcon() {
  return (
    <svg className="badge__trophy" viewBox="0 0 64 64" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 8h28v6c0 8.5-5.2 15.6-12.5 18.4L32 34l-1.5-1.6C23.2 29.6 18 22.5 18 14V8z"
      />
      <path
        fill="currentColor"
        opacity="0.85"
        d="M10 10h8v4c0 4.4-2.4 8.2-6 10.2C9.4 20.8 8 17.6 8 14v-2c0-1.1.9-2 2-2zm36 0h8c1.1 0 2 .9 2 2v2c0 3.6-1.4 6.8-3.9 9.2-3.6-2-6.1-5.8-6.1-10.2v-4z"
      />
      <rect x="28" y="34" width="8" height="8" rx="1" fill="currentColor" />
      <path fill="currentColor" d="M22 48h20l-2 8H24l-2-8z" />
      <rect x="18" y="56" width="28" height="4" rx="2" fill="currentColor" />
    </svg>
  )
}

function isTeamEliminated(matches: Match[], upcomingMatch: Match | null, teamId: number): boolean {
  if (upcomingMatch) return false

  const groupMatchesPlayed = matches.filter(m => m.stage === 'GROUP_STAGE' || !m.stage && m.status === 'FINISHED').length
  const groupStageDone = groupMatchesPlayed >= 3

  if (!groupStageDone) return false

  const lastKnockoutLoss = matches.find(m => {
    if (m.status !== 'FINISHED') return false
    const s = formatScore(m)
    const isHome = m.homeTeam.id === teamId

    if (s.home !== s.away) {
      const teamScore = isHome ? s.home : s.away
      const oppScore = isHome ? s.away : s.home
      return teamScore < oppScore
    }
    if (s.hasPenalties && s.penHome !== s.penAway) {
      const teamPens = isHome ? s.penHome! : s.penAway!
      const oppPens = isHome ? s.penAway! : s.penHome!
      return teamPens < oppPens
    }
    return false
  })

  return !!lastKnockoutLoss
}

export default function TeamPage() {
  const { id } = useParams()
  const [team, setTeam] = useState<Team | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [upcomingMatch, setUpcomingMatches] = useState<Match | null>(null)
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const podiumFinish = team ? PODIUM_FINISHES[team.id] : undefined
  const eliminated = team && !podiumFinish ? isTeamEliminated(matches, upcomingMatch, team.id) : false
  const hasStarted = matches.some(m => m.status === 'FINISHED') || !!upcomingMatch
  const stillIn = team ? hasStarted && !eliminated && !podiumFinish : false

  useEffect(() => {
    if (!id) return

    let cancelled = false
    const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

    const loadTeam = async () => {
      try {
        setLoading(true)
        setError(null) // reset error state before fetching

        const [teamRes, matchesRes, upcomingRes, scorersRes] = await Promise.all([
          fetch(`/api/football/teams/${id}`, { headers, signal: AbortSignal.timeout(10000) }), // 10 seconds timeout
          fetch(`/api/football/teams/${id}/matches?status=FINISHED&limit=10`, { headers, signal: AbortSignal.timeout(10000) }),
          fetch(`/api/football/teams/${id}/matches?status=SCHEDULED&limit=1`, { headers, signal: AbortSignal.timeout(10000) }),
          fetch(`/api/football/competitions/WC/scorers?limit=150`, { headers, signal: AbortSignal.timeout(10000) })
        ])

        // check every response before parsing
        for (const res of [teamRes, matchesRes, upcomingRes, scorersRes]) {
          if (!res.ok) throw new Error(`Server error: ${res.status}`)
        }

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
      } catch (err: unknown) {
        if (cancelled) return
        console.error('Error fetching team:', err)
        setTeam(null)
        setMatches([])
        setUpcomingMatches(null)
        setScorers([])

        if (err instanceof Error) {
          if (err.name === 'TimeoutError') {
            setError('Request timed out. Check your connection and try again.')
          } else if (err.message.includes('429')) {
            setError('Too many requests — please wait a minute and refresh.')
          } else if (err.message.includes('404')) {
            setError('Team not found.')
          } else {
            setError('Failed to load team data. Please try again.')
          }
        } else {
          setError('Failed to load team data. Please try again.')
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
  if (error) return <p className="error-message">⚠️ {error}</p>
  if (!team) return <p className="no-data">Team not found</p>

  return (
    <div className="team-page">
      <div className="team-page__header">
        <div className="team-page__header-left"> {/* wrap crest + name together */}
          <img src={team.crest} alt={team.name} width={72} height={72} />
          <div>
            <h1>{team.name}</h1>
            <p>{team.shortName}</p>
          </div>
        </div>
        {podiumFinish && (
          <span className={`badge badge--podium badge--podium-${podiumFinish.place}`}>
            <TrophyIcon />
            {podiumFinish.label}
          </span>
        )}
        {eliminated && <span className="badge badge--eliminated">Eliminated</span>}
        {stillIn && <span className="badge badge--active">Active</span>}
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
              🟢{' '}
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

      <h2>Latest Results</h2>
      <div className="matches-grid matches-grid--team-page">
        {matches.map(match => <MatchCard key={match.id} match={match} />)}
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
