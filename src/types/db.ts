export type GroupStandingRow = {
    group_name: string
    group_position: number
    team_id: number
    team_name: string
    short_name: string | null
    tla: string | null
    crest_url: string | null
    played: number
    won: number
    draw: number
    lost: number
    points: number
    goals_for: number
    goals_against: number
    goal_difference: number
}