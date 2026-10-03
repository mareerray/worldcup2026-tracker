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

export type MatchDetailRow = {
    id: number;
    utc_date: string;
    status: string;
    stage: string;
    group_name: string | null;
    matchday: number | null;
    venue: string | null;
    duration: string | null;
    home_team_id: number | null;
    home_name: string | null;
    home_short_name: string | null;
    home_tla: string | null;
    home_crest: string | null;
    away_team_id: number | null;
    away_name: string | null;
    away_short_name: string | null;
    away_tla: string | null;
    away_crest: string | null;
    home_goals_full: number | null;
    away_goals_full: number | null;
    home_goals_regular: number | null;
    away_goals_regular: number | null;
    home_pens: number | null;
    away_pens: number | null;
    winner_team_id: number | null;
};

export type ScorerDetailRow = {
    player_id: number;
    player_name: string;
    team_id: number;
    goals: number;
    team_name: string | null;
    team_short_name: string | null;
    team_tla: string | null;
    team_crest: string | null;
};