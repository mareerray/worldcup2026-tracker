import type { Match } from '../types'

interface Props {
    match: Match
    compact?: boolean
}

export default function MatchCard({ match, compact }: Props) {
    const date = new Date(match.utcDate)
    const time = date.toLocaleTimeString('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' })
    const day = date.toLocaleDateString('en-GB', { timeZone: 'Europe/Helsinki', weekday: 'short', day: 'numeric', month: 'short' })

    const isFinished = match.status === 'FINISHED'
    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'

    if (compact) {
        return (
            <div className="match-card match-card--compact">
                <div className="match-card__teams-compact">
                    <div className="match-card__team-compact">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={18} height={18} />
                        <span>{match.homeTeam.shortName}</span>
                    </div>
                    <div className="match-card__score-compact">
                        {match.score.fullTime.home} – {match.score.fullTime.away}
                    </div>
                    <div className="match-card__team-compact match-card__team-compact--away">
                        <span>{match.awayTeam.shortName}</span>
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={18} height={18} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`match-card ${isLive ? 'match-card--live' : ''}`}>
            <div className="match-card__date">
                {isLive ? <span className="live-badge">🔴 LIVE</span> : <span>{day} · {time}<span className="timezone-label">EEST</span></span>}
            </div>
            <div className="match-card__teams">
                <div className="match-card__team">
                    <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={28} height={28} />
                    <span>{match.homeTeam.shortName}</span>
                </div>
                <div className="match-card__score">
                    {isFinished || isLive
                        ? <><strong>{match.score.fullTime.home}</strong> – <strong>{match.score.fullTime.away}</strong></>
                        : <span className="match-card__vs">vs</span>
                    }
                </div>
                <div className="match-card__team match-card__team--away">
                    <span>{match.awayTeam.shortName}</span>
                    <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={28} height={28} />
                </div>
            </div>
        </div>
    )
}