import { supabase } from './supabase'
import type {
    TournamentOverview,
    StageAnalytics,
    TeamPerformance,
    HighestScoringMatch,
} from '../types/analytics'

export async function getTournamentOverview(): Promise<TournamentOverview[]> {
    const { data, error } = await supabase
        .from('tournament_overview')
        .select('*')

    if (error) throw error

    return (data ?? []) as TournamentOverview[]
}

export async function getStageAnalytics(): Promise<StageAnalytics[]> {
    const { data, error } = await supabase
        .from('stage_analytics')
        .select('*')
        .order('stage', { ascending: true })

    if (error) throw error

    return (data ?? []) as StageAnalytics[]
}

export async function getTeamPerformance(): Promise<TeamPerformance[]> {
    const { data, error } = await supabase
        .from('team_performance')
        .select('*')
        .order('performance_rank', { ascending: true })

    if (error) throw error

    return (data ?? []) as TeamPerformance[]
}

export async function getHighestScoringMatches(
    limit = 10
): Promise<HighestScoringMatch[]> {
    const { data, error } = await supabase
        .from('highest_scoring_matches')
        .select('*')
        .order('match_rank', { ascending: true })
        .limit(limit)

    if (error) throw error

    return (data ?? []) as HighestScoringMatch[]
}

/*
What this code does:

- Ask Supabase for all columns from one view.

- Wait for the answer.

- If Supabase returns an error, stop and throw it.

- If there is no data, return an empty array instead of undefined.

- Return the rows with the correct TypeScript type.
*/