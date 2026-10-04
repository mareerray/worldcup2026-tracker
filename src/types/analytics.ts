// One row from the tournament_overview view
export interface TournamentOverview {
    finished_matches: number | null
    goals_in_play: number | null
    goals_per_match: number | null
    penalty_shootouts: number | null
    draws_after_play: number | null
}

// One row from the stage_analytics view
export interface StageAnalytics {
    stage: string | null
    finished_matches: number | null
    goals_in_play: number | null
    goals_per_match: string | null
    penalty_shootouts: number | null
    draws_after_play: number | null
}

// One row from the team_performance view
export interface TeamPerformance {
    performance_rank: number | null
    team_id: number | null
    team_name: string | null
    short_name: string | null
    tla: string | null
    crest_url: string | null
    matches_played: number | null
    goals_scored: number | null
    goals_conceded: number | null
    goal_difference: number | null
    goals_per_match: string | null
}

// One row from the highest_scoring_matches view
export interface HighestScoringMatch {
    match_rank: number | null
    id: number | null
    utc_date: string | null
    stage: string | null
    duration: string | null
    home_name: string | null
    home_short_name: string | null
    home_tla: string | null
    home_crest: string | null
    away_name: string | null
    away_short_name: string | null
    away_tla: string | null
    away_crest: string | null
    home_goals_in_play: number | null
    away_goals_in_play: number | null
    total_goals_in_play: number | null
    home_pens: number | null
    away_pens: number | null
}