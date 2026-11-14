import { loadCsv } from "./localData";
import type { MatchDetailRow, ScorerDetailRow } from "../types/db";
import type { Match, Team } from "../types";

type TeamCsvRow = {
    id: number | string;
    name: string;
    short_name?: string;
    tla?: string;
    crest_url?: string;
};

async function getTeamMap(): Promise<Map<number, TeamCsvRow>> {
    const teams = await loadCsv<TeamCsvRow>("teams.csv");

    return new Map(
        teams.map((team) => [Number(team.id), team])
    );
}

function enrichMatchRows(
    rows: MatchDetailRow[],
    teamMap: Map<number, TeamCsvRow>
): MatchDetailRow[] {
    return rows.map((row) => {
        const homeTeam = teamMap.get(Number(row.home_team_id));
        const awayTeam = teamMap.get(Number(row.away_team_id));

        return {
            ...row,
            home_name: homeTeam?.name ?? "TBD",
            home_short_name: homeTeam?.short_name ?? "",
            home_tla: homeTeam?.tla ?? "",
            home_crest: homeTeam?.crest_url ?? "",
            away_name: awayTeam?.name ?? "TBD",
            away_short_name: awayTeam?.short_name ?? "",
            away_tla: awayTeam?.tla ?? "",
            away_crest: awayTeam?.crest_url ?? "",
        } as MatchDetailRow;
    });
}

export async function getMatchDetails(
    stage: string,
    matchday?: number
): Promise<MatchDetailRow[]> {
    const [matchRows, teamMap] = await Promise.all([
        loadCsv<MatchDetailRow>("matches.csv"),
        getTeamMap(),
    ]);

    const enrichedRows = matchRows.map((row) => {
        const homeTeam = teamMap.get(Number(row.home_team_id));
        const awayTeam = teamMap.get(Number(row.away_team_id));

        return {
            ...row,
            home_name: homeTeam?.name ?? "TBD",
            home_short_name: homeTeam?.short_name ?? "",
            home_tla: homeTeam?.tla ?? "",
            home_crest: homeTeam?.crest_url ?? "",
            away_name: awayTeam?.name ?? "TBD",
            away_short_name: awayTeam?.short_name ?? "",
            away_tla: awayTeam?.tla ?? "",
            away_crest: awayTeam?.crest_url ?? "",
        } as MatchDetailRow;
    });

    return enrichedRows
        .filter((row: MatchDetailRow) => row.stage === stage)
        .filter((row: MatchDetailRow) =>
            matchday === undefined
                ? true
                : Number(row.matchday) === matchday
        )
        .sort(
            (a: MatchDetailRow, b: MatchDetailRow) =>
                new Date(a.utc_date).getTime() -
                new Date(b.utc_date).getTime()
        );
}

export function displayScore(m: MatchDetailRow): string {
    const homeGoals = Number(m.home_goals_full ?? 0);
    const homePenalties = Number(m.home_pens ?? 0);
    const awayGoals = Number(m.away_goals_full ?? 0);
    const awayPenalties = Number(m.away_pens ?? 0);

    const home = homeGoals - homePenalties;
    const away = awayGoals - awayPenalties;

    const penalties =
        m.home_pens != null && m.away_pens != null
            ? ` (${m.home_pens}–${m.away_pens} pens)`
            : "";

    return `${home}–${away}${penalties}`;
}

export function toMatch(r: MatchDetailRow): Match {
    const hasPenalties = r.duration === "PENALTY_SHOOTOUT";

    return {
        id: r.id,
        utcDate: r.utc_date,
        status: r.status,
        matchday: Number(r.matchday ?? 0),
        stage: r.stage,
        group: r.group_name ?? "",
        venue: r.venue ?? "",
        homeTeam: {
            id: Number(r.home_team_id ?? 0),
            name: r.home_name ?? "TBD",
            shortName: r.home_short_name ?? "",
            tla: r.home_tla ?? "",
            crest: r.home_crest ?? "",
        },
        awayTeam: {
            id: Number(r.away_team_id ?? 0),
            name: r.away_name ?? "TBD",
            shortName: r.away_short_name ?? "",
            tla: r.away_tla ?? "",
            crest: r.away_crest ?? "",
        },
        score: {
            duration: (r.duration ?? "REGULAR") as
                | "REGULAR"
                | "EXTRA_TIME"
                | "PENALTY_SHOOTOUT",
            fullTime: {
                home: r.home_goals_full,
                away: r.away_goals_full,
            },
            regularTime: {
                home: r.home_goals_regular,
                away: r.away_goals_regular,
            },
            penalties: hasPenalties
                ? {
                    home: r.home_pens,
                    away: r.away_pens,
                }
                : undefined,
        },
    } as Match;
}

export async function getMatches(
    stage: string,
    matchday?: number
): Promise<Match[]> {
    const rows = await getMatchDetails(stage, matchday);
    return rows.map(toMatch);
}

export async function getRecentFinished(limit = 6): Promise<Match[]> {
    const [matchRows, teamMap] = await Promise.all([
        loadCsv<MatchDetailRow>("matches.csv"),
        getTeamMap(),
    ]);

    const rows = enrichMatchRows(matchRows, teamMap);

    return rows
        .filter((row: MatchDetailRow) => row.status === "FINISHED")
        .sort(
            (a: MatchDetailRow, b: MatchDetailRow) =>
                new Date(b.utc_date).getTime() - new Date(a.utc_date).getTime()
        )
        .slice(0, limit)
        .map(toMatch);
}

export async function getUpcoming(limit = 2): Promise<Match[]> {
    const [matchRows, teamMap] = await Promise.all([
        loadCsv<MatchDetailRow>("matches.csv"),
        getTeamMap(),
    ]);

    const rows = enrichMatchRows(matchRows, teamMap);

    return rows
        .filter(
            (row: MatchDetailRow) =>
                row.status === "SCHEDULED" || row.status === "TIMED"
        )
        .sort(
            (a: MatchDetailRow, b: MatchDetailRow) =>
                new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
        )
        .slice(0, limit)
        .map(toMatch);
}

export async function getTopScorers(
    limit = 10
): Promise<ScorerDetailRow[]> {
    const [scorerRows, teamMap] = await Promise.all([
        loadCsv<ScorerDetailRow>("scorers.csv"),
        getTeamMap(),
    ]);

    const enrichedScorers = scorerRows.map((row) => {
        const team = teamMap.get(Number(row.team_id));

        return {
            ...row,
            team_name: team?.name ?? "",
            team_short_name: team?.short_name ?? "",
            team_tla: team?.tla ?? "",
            team_crest: team?.crest_url ?? "",
        } as ScorerDetailRow;
    });

    return enrichedScorers
        .sort((a, b) => {
            const goalDifference = Number(b.goals) - Number(a.goals);

            if (goalDifference !== 0) {
                return goalDifference;
            }

            return String(a.player_name).localeCompare(
                String(b.player_name)
            );
        })
        .slice(0, limit);
}

export async function getTeamFinishedMatches(
    teamId: number,
    limit = 10
): Promise<Match[]> {
    const [matchRows, teamMap] = await Promise.all([
        loadCsv<MatchDetailRow>("matches.csv"),
        getTeamMap(),
    ]);

    const rows = enrichMatchRows(matchRows, teamMap);

    return rows
        .filter(
            (row: MatchDetailRow) =>
                row.status === "FINISHED" &&
                (Number(row.home_team_id) === teamId ||
                    Number(row.away_team_id) === teamId)
        )
        .sort(
            (a: MatchDetailRow, b: MatchDetailRow) =>
                new Date(b.utc_date).getTime() - new Date(a.utc_date).getTime()
        )
        .slice(0, limit)
        .map(toMatch);
}

export async function getTeamUpcomingMatch(
    teamId: number
): Promise<Match | null> {
    const rows = await loadCsv<MatchDetailRow>("matches.csv");

    const upcomingMatch = rows
        .filter(
            (row: MatchDetailRow) =>
                (row.status === "SCHEDULED" || row.status === "TIMED") &&
                (Number(row.home_team_id) === teamId ||
                    Number(row.away_team_id) === teamId)
        )
        .sort(
            (a: MatchDetailRow, b: MatchDetailRow) =>
                new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime()
        )
        .at(0);

    return upcomingMatch ? toMatch(upcomingMatch) : null;
}

export async function getTeamScorers(
    teamId: number
): Promise<ScorerDetailRow[]> {
    const [scorerRows, teamMap] = await Promise.all([
        loadCsv<ScorerDetailRow>("scorers.csv"),
        getTeamMap(),
    ]);

    const enrichedScorers = scorerRows
        .filter((row) => Number(row.team_id) === teamId)
        .map((row) => {
            const team = teamMap.get(Number(row.team_id));

            return {
                ...row,
                team_name: team?.name ?? "",
                team_short_name: team?.short_name ?? "",
                team_tla: team?.tla ?? "",
                team_crest: team?.crest_url ?? "",
            } as ScorerDetailRow;
        })
        .sort((a, b) => {
            const goalDifference = Number(b.goals) - Number(a.goals);

            if (goalDifference !== 0) {
                return goalDifference;
            }

            return String(a.player_name).localeCompare(
                String(b.player_name)
            );
        });

    return enrichedScorers;
}

export async function getTeam(teamId: number): Promise<Team> {
    const teamMap = await getTeamMap();
    const team = teamMap.get(teamId);

    if (!team) {
        throw new Error(`Team with id ${teamId} was not found.`);
    }

    return {
        id: Number(team.id),
        name: team.name,
        shortName: team.short_name ?? "",
        tla: team.tla ?? "",
        crest: team.crest_url ?? "",
    };
}