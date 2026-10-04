import { supabase } from './supabase';
import type { MatchDetailRow, ScorerDetailRow } from '../types/db';
import type { Match, Team } from '../types';

export async function getMatchDetails(
    stage: string,
    matchday?: number
): Promise<MatchDetailRow[]> {
    let q = supabase
        .from('match_details')
        .select('*')
        .eq('stage', stage)
        .order('utc_date', { ascending: true });

    if (matchday !== undefined) q = q.eq('matchday', matchday);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as MatchDetailRow[];
}

export function displayScore(m: MatchDetailRow): string {
    const h = (m.home_goals_full ?? 0) - (m.home_pens ?? 0);
    const a = (m.away_goals_full ?? 0) - (m.away_pens ?? 0);
    const pens =
        m.home_pens != null && m.away_pens != null
            ? ` (${m.home_pens}–${m.away_pens} pens)`
            : '';
    return `${h}–${a}${pens}`;
}

export function toMatch(r: MatchDetailRow): Match {
    const hasPens = r.duration === 'PENALTY_SHOOTOUT';
    return {
        id: r.id,
        utcDate: r.utc_date,
        status: r.status,
        matchday: r.matchday ?? 0,
        stage: r.stage,
        group: r.group_name ?? '',
        venue: r.venue ?? '',
        homeTeam: {
            id: r.home_team_id ?? 0,
            name: r.home_name ?? 'TBD',
            shortName: r.home_short_name ?? '',
            tla: r.home_tla ?? '',
            crest: r.home_crest ?? '',
        },
        awayTeam: {
            id: r.away_team_id ?? 0,
            name: r.away_name ?? 'TBD',
            shortName: r.away_short_name ?? '',
            tla: r.away_tla ?? '',
            crest: r.away_crest ?? '',
        },
        score: {
            duration: (r.duration ?? 'REGULAR') as 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT',
            fullTime: { home: r.home_goals_full, away: r.away_goals_full },
            regularTime: { home: r.home_goals_regular, away: r.away_goals_regular },
            penalties: hasPens ? { home: r.home_pens, away: r.away_pens } : undefined,
        },
    } as Match;
}

export async function getMatches(stage: string, matchday?: number): Promise<Match[]> {
    const rows = await getMatchDetails(stage, matchday);
    return rows.map(toMatch);
}

export async function getRecentFinished(limit = 6): Promise<Match[]> {
    const { data, error } = await supabase
        .from('match_details')
        .select('*')
        .eq('status', 'FINISHED')
        .order('utc_date', { ascending: false })
        .limit(limit)

    if (error) throw error

    return (data ?? []).map(row => toMatch(row as MatchDetailRow))
}

export async function getUpcoming(limit = 2): Promise<Match[]> {
    const { data, error } = await supabase
        .from('match_details')
        .select('*')
        .in('status', ['SCHEDULED', 'TIMED'])
        .order('utc_date', { ascending: true })
        .limit(limit)

    if (error) throw error

    return (data ?? []).map(row => toMatch(row as MatchDetailRow))
}

export async function getTopScorers(limit = 10): Promise<ScorerDetailRow[]> {
    const { data, error } = await supabase
        .from('scorer_details')
        .select('*')
        .order('goals', { ascending: false })
        .order('player_name', { ascending: true })
        .limit(limit)

    if (error) throw error

    return (data ?? []) as ScorerDetailRow[]
}

export async function getTeamFinishedMatches(
    teamId: number,
    limit = 10
): Promise<Match[]> {
    const { data, error } = await supabase
        .from('match_details')
        .select('*')
        .eq('status', 'FINISHED')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('utc_date', { ascending: false })
        .limit(limit)

    if (error) throw error

    return (data ?? []).map(row => toMatch(row as MatchDetailRow))
}

export async function getTeamUpcomingMatch(
    teamId: number
): Promise<Match | null> {
    const { data, error } = await supabase
        .from('match_details')
        .select('*')
        .in('status', ['SCHEDULED', 'TIMED'])
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('utc_date', { ascending: true })
        .limit(1)

    if (error) throw error

    const row = data?.[0]
    return row ? toMatch(row as MatchDetailRow) : null
}

export async function getTeamScorers(teamId: number): Promise<ScorerDetailRow[]> {
    const { data, error } = await supabase
        .from('scorer_details')
        .select('*')
        .eq('team_id', teamId)
        .order('goals', { ascending: false })
        .order('player_name', { ascending: true })

    if (error) throw error

    return (data ?? []) as ScorerDetailRow[]
}

export async function getTeam(teamId: number): Promise<Team> {
    const { data, error } = await supabase
        .from('teams')
        .select('id, name, short_name, tla, crest_url')
        .eq('id', teamId)
        .single()

    if (error) throw error

    return {
        id: data.id,
        name: data.name,
        shortName: data.short_name ?? '',
        tla: data.tla ?? '',
        crest: data.crest_url ?? '',
    }
}