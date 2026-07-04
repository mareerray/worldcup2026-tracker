export interface Team {
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

export type Coach = {
    id: number
    firstName: string
    lastName: string
    name: string
    dateOfBirth?: string
    nationality?: string
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

export type Scorer = {
    player: {
        id: number
        name: string
        position?: string
        dateOfBirth?: string
    }
    team: Team
    goals: number
}

export interface Match {
    id: number
    utcDate: string
    status: string  // 'SCHEDULED', 'IN_PLAY', 'FINISHED', 'PAUSED'
    matchday: number
    homeTeam: MatchTeam
    awayTeam: MatchTeam
    group: string
    stage: string
    venue: string
    score: {
        duration?: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'
        fullTime: Score
        regularTime?: Score
        penalties?: Score
    }
}

