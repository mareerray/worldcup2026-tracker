export interface Team {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
}

export interface TableEntry {
    position: number
    team: Team
    playedGames: number
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
}

export interface Standing {
    group: string
    table: TableEntry[]
    position: number
    team: {
        id: number
        name: string
        shortName: string
        crest: string
    }
    playedGames: number
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
}

export interface MatchTeam {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
}

export interface Score {
    home: number | null
    away: number | null
}

export interface Match {
    id: number
    utcDate: string
    status: string  // 'SCHEDULED', 'IN_PLAY', 'FINISHED', 'PAUSED'
    matchday: number
    homeTeam: MatchTeam
    awayTeam: MatchTeam
    group: string
    venue: string
    score: {
        fullTime: Score
    }
}