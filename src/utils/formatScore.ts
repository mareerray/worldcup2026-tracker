import type { Match } from '../types'

export function formatScore(match: Match) {
    const { fullTime, regularTime, penalties, duration } = match.score
    const hasPenalties = duration === 'PENALTY_SHOOTOUT' && !!penalties

    const base = hasPenalties && regularTime ? regularTime : fullTime

    const home = base.home ?? 0
    const away = base.away ?? 0

    return {
        home,
        away,
        penHome: hasPenalties ? penalties!.home ?? 0 : null,
        penAway: hasPenalties ? penalties!.away ?? 0 : null,
        hasPenalties,
    }
}