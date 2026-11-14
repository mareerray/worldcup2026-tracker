import type { Match } from '../types'
import { formatScore } from '../utils/formatScore'


interface Props {
    match: Match
    compact?: boolean
}

function TeamCrest({
    crest,
    name,
    shortName,
    tla,
    size,
}: {
    crest: string
    name: string
    shortName: string
    tla: string
    size: number
}) {
    if (!crest) {
        return (
            <span
                className="team-fallback"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}
            >
                {shortName || tla || name}
            </span>
        )
    }

    return (
        <img
            src={crest}
            alt={name}
            width={size}
            height={size}
        />
    )
}

export default function MatchCard({ match, compact }: Props) {
    const date = new Date(match.utcDate)
    const time = date.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Helsinki',
        hour: '2-digit',
        minute: '2-digit',
    })
    const day = date.toLocaleDateString('en-GB', {
        timeZone: 'Europe/Helsinki',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })

    const isFinished = match.status === 'FINISHED'
    const isLive =
        match.status === 'IN_PLAY' || match.status === 'PAUSED'
    const s = formatScore(match)

    if (compact) {
        return (
            <div className="match-card match-card--compact">
                <div className="match-card__teams-compact">
                    <div className="match-card__team-compact">
                        <TeamCrest
                            crest={match.homeTeam.crest}
                            name={match.homeTeam.name}
                            shortName={match.homeTeam.shortName}
                            tla={match.homeTeam.tla}
                            size={18}
                        />
                        <span>{match.homeTeam.shortName}</span>
                    </div>

                    <div className="match-card__score-compact">
                        {s.home} – {s.away}
                        {s.hasPenalties && (
                            <span className="score--pens">
                                ({s.penHome}-{s.penAway})
                            </span>
                        )}
                    </div>

                    <div className="match-card__team-compact match-card__team-compact--away">
                        <span>{match.awayTeam.shortName}</span>
                        <TeamCrest
                            crest={match.awayTeam.crest}
                            name={match.awayTeam.name}
                            shortName={match.awayTeam.shortName}
                            tla={match.awayTeam.tla}
                            size={18}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`match-card ${isLive ? 'match-card--live' : ''}`}>
            <div className="match-card__date">
                {isLive ? (
                    <span className="live-badge">🔴 LIVE</span>
                ) : (
                    <span>
                        {day} · {time}
                        <span className="timezone-label">EEST</span>
                    </span>
                )}
            </div>

            <div className="match-card__teams">
                <div className="match-card__team">
                    <TeamCrest
                        crest={match.homeTeam.crest}
                        name={match.homeTeam.name}
                        shortName={match.homeTeam.shortName}
                        tla={match.homeTeam.tla}
                        size={28}
                    />
                    <span>{match.homeTeam.shortName}</span>
                </div>

                <div className="match-card__score">
                    {isFinished || isLive ? (
                        <>
                            <div className="score--main">
                                <strong>{s.home}</strong> –{' '}
                                <strong>{s.away}</strong>
                            </div>

                            {s.hasPenalties && (
                                <span className="score--pens">
                                    ({s.penHome}-{s.penAway})
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="match-card__vs">vs</span>
                    )}
                </div>

                <div className="match-card__team match-card__team--away">
                    <span>{match.awayTeam.shortName}</span>
                    <TeamCrest
                        crest={match.awayTeam.crest}
                        name={match.awayTeam.name}
                        shortName={match.awayTeam.shortName}
                        tla={match.awayTeam.tla}
                        size={28}
                    />
                </div>
            </div>
        </div>
    )
}