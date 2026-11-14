import { loadCsv } from "./localData";
import type {
    TournamentOverview,
    StageAnalytics,
    TeamPerformance,
    HighestScoringMatch,
} from "../types/analytics";

export async function getTournamentOverview(): Promise<TournamentOverview[]> {
    return loadCsv<TournamentOverview>("tournament-overview.csv");
}

export async function getStageAnalytics(): Promise<StageAnalytics[]> {
    const rows = await loadCsv<StageAnalytics>("stage-analytics.csv");

    return rows.sort(
        (a: StageAnalytics, b: StageAnalytics) =>
            String(a.stage).localeCompare(String(b.stage))
    );
}

export async function getTeamPerformance(): Promise<TeamPerformance[]> {
    const rows = await loadCsv<TeamPerformance>("team-performance.csv");

    return rows.sort(
        (a: TeamPerformance, b: TeamPerformance) =>
            Number(a.performance_rank) - Number(b.performance_rank)
    );
}

export async function getHighestScoringMatches(
    limit = 10
): Promise<HighestScoringMatch[]> {
    const rows = await loadCsv<HighestScoringMatch>(
        "highest-scoring-matches.csv"
    );

    return rows
        .sort(
            (a: HighestScoringMatch, b: HighestScoringMatch) =>
                Number(a.match_rank) - Number(b.match_rank)
        )
        .slice(0, limit);
}