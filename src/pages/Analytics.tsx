import { useEffect, useState } from 'react'
import {
    getTournamentOverview,
    getStageAnalytics,
    getTeamPerformance,
    getHighestScoringMatches,
} from '../lib/analytics'
import type {
    TournamentOverview,
    StageAnalytics,
    TeamPerformance,
    HighestScoringMatch,
} from '../types/analytics'
import '../styles/Analytics.css'

// /* ----------- Constants and Types ------------ */ //

const STAGE_ORDER = [
    'GROUP_STAGE',
    'LAST_32',
    'LAST_16',
    'QUARTER_FINALS',
    'SEMI_FINALS',
    'THIRD_PLACE',
    'FINAL',
]

type TeamSortKey =
    | 'goal_difference'
    | 'goals_scored'
    | 'goals_conceded'
    | 'team_name'

type SortDirection = 'asc' | 'desc'

// /* ----------- Helper functions ------------ */ //

function getStageOrder(stage: string | null): number {
    if (!stage) return STAGE_ORDER.length

    const index = STAGE_ORDER.indexOf(stage)
    return index === -1 ? STAGE_ORDER.length : index
}

function formatStageName(stage: string | null): string {
    if (!stage) return 'Unknown stage'

    const stageNames: Record<string, string> = {
        GROUP_STAGE: 'Group stage',
        LAST_32: 'Round of 32',
        LAST_16: 'Round of 16',
        QUARTER_FINALS: 'Quarter-finals',
        SEMI_FINALS: 'Semi-finals',
        THIRD_PLACE: 'Third place',
        FINAL: 'Final',
    }

    return stageNames[stage] ?? stage.replaceAll('_', ' ')
}

function getGoalsScored(team: TeamPerformance): number {
    return team.goals_scored ?? 0
}

function getGoalsConceded(team: TeamPerformance): number {
    return team.goals_conceded ?? 0
}

function getTeamName(team: TeamPerformance): string {
    return team.short_name ?? team.team_name ?? 'Unknown team'
}

interface TeamBarChartProps {
    title: string
    teams: TeamPerformance[]
    getValue: (team: TeamPerformance) => number
    valueLabel: string
    variant?: 'attack' | 'defence'
}

function TeamBarChart({
    title,
    teams,
    getValue,
    valueLabel,
    variant = 'attack',
}: TeamBarChartProps) {
    const maxValue = Math.max(...teams.map(getValue), 1)

    return (
        <article className="team-bar-chart">
            <div className="team-bar-chart__header">
                <h3>{title}</h3>
                <span className="team-bar-chart__metric">{valueLabel}</span>
            </div>

            <div className="team-bar-chart__rows">
                {teams.map((team) => {
                    const value = getValue(team)
                    const barWidth = (value / maxValue) * 100

                    return (
                        <div
                            className="team-bar-chart__row"
                            key={team.team_id ?? team.team_name ?? 'unknown'}
                        >
                            <div className="team-bar-chart__team">
                                {team.crest_url && (
                                    <img
                                        src={team.crest_url}
                                        alt=""
                                        className="team-bar-chart__crest"
                                    />
                                )}

                                <span title={getTeamName(team)}>
                                    {getTeamName(team)}
                                </span>
                            </div>

                            <div className="team-bar-chart__track">
                                <div
                                    className={`team-bar-chart__bar team-bar-chart__bar--${variant}`}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>

                            <span className="team-bar-chart__value">
                                {value}
                            </span>
                        </div>
                    )
                })}
            </div>

        </article>
    )
}

function formatMatchDate(date: string | null): string {
    if (!date) return 'Date unavailable'

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

function getMatchGoals(match: HighestScoringMatch): number {
    return match.total_goals_in_play ?? 0
}

// /* ----------- Analytics Page Component ------------ */ //

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<TournamentOverview[]>([])
    const [stages, setStages] = useState<StageAnalytics[]>([])
    const [teams, setTeams] = useState<TeamPerformance[]>([])
    const [topMatches, setTopMatches] = useState<HighestScoringMatch[]>([])
    const [teamSortKey, setTeamSortKey] =
        useState<TeamSortKey>('goal_difference')

    const [teamSortDirection, setTeamSortDirection] =
        useState<SortDirection>('desc')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const sortedTeams = [...teams].sort((a, b) => {
        if (teamSortKey === 'team_name') {
            const aName = getTeamName(a)
            const bName = getTeamName(b)

            const result = aName.localeCompare(bName)

            return teamSortDirection === 'asc' ? result : -result
        }

        const aValue = Number(a[teamSortKey] ?? 0)
        const bValue = Number(b[teamSortKey] ?? 0)

        const result = aValue - bValue

        return teamSortDirection === 'asc' ? result : -result
    })

    useEffect(() => {
        async function loadAnalytics() {
            try {
                const [overviewData, stageData, teamData, matchData] =
                    await Promise.all([
                        getTournamentOverview(),
                        getStageAnalytics(),
                        getTeamPerformance(),
                        getHighestScoringMatches(),
                    ])

                setOverview(overviewData)
                setStages(stageData)
                setTeams(teamData)
                setTopMatches(matchData)

            } catch (err) {
                console.error(err)
                setError('Could not load analytics data.')
            } finally {
                setLoading(false)
            }
        }

        loadAnalytics()
    }, [])

    if (loading) {
        return (
            <main className="analytics-page">
                <h1>Analytics</h1>
                <p>Loading analytics…</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="analytics-page">
                <h1>Analytics</h1>
                <p>{error}</p>
            </main>
        )
    }

    return (
        <main className="analytics-page">

            <section>
                <h2>Tournament overview</h2>

                {overview.length === 0 ? (
                    <p>No tournament overview data available.</p>
                ) : (
                    <div className="analytics-overview">
                        <div className="analytics-card">
                            <span className="analytics-card__label">Finished matches</span>
                            <span className="analytics-card__value">
                                {overview[0].finished_matches ?? '—'}
                            </span>
                        </div>

                        <div className="analytics-card">
                            <span className="analytics-card__label">Goals</span>
                            <span className="analytics-card__value">
                                {overview[0].goals_in_play ?? '—'}
                            </span>
                        </div>

                        <div className="analytics-card">
                            <span className="analytics-card__label">Goals per match</span>
                            <span className="analytics-card__value">
                                {overview[0].goals_per_match ?? '—'}
                            </span>
                        </div>

                        <div className="analytics-card">
                            <span className="analytics-card__label">Penalty shootouts</span>
                            <span className="analytics-card__value">
                                {overview[0].penalty_shootouts ?? '—'}
                            </span>
                        </div>

                        <div className="analytics-card">
                            <span className="analytics-card__label">Draws after play</span>
                            <span className="analytics-card__value">
                                {overview[0].draws_after_play ?? '—'}
                            </span>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h2>Scoring by stage</h2>

                {stages.length === 0 ? (
                    <p>No stage analytics available.</p>
                ) : (
                    <div className="stage-table-wrap">
                        <table className="stage-table">
                            <thead>
                                <tr>
                                    <th>Stage</th>
                                    <th>Matches</th>
                                    <th>Goals</th>
                                    <th>Goals / match</th>
                                    <th>Penalties</th>
                                    <th>Draws</th>
                                </tr>
                            </thead>

                            <tbody>
                                {[...stages]
                                    .sort(
                                        (a, b) =>
                                            getStageOrder(a.stage) - getStageOrder(b.stage)
                                    )
                                    .map((stage) => (
                                        <tr key={stage.stage ?? 'unknown'}>
                                            <td>{formatStageName(stage.stage)}</td>
                                            <td>{stage.finished_matches ?? '—'}</td>
                                            <td>{stage.goals_in_play ?? '—'}</td>
                                            <td>
                                                {stage.goals_per_match
                                                    ? Number(stage.goals_per_match).toFixed(2)
                                                    : '—'}
                                            </td>
                                            <td>{stage.penalty_shootouts ?? '—'}</td>
                                            <td>{stage.draws_after_play ?? '—'}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section>
                <h2>Team performance</h2>

                {teams.length === 0 ? (
                    <p>No team performance data available.</p>
                ) : (
                    <div className="team-performance-grid">
                        <TeamBarChart
                            title="Top attacks"
                            teams={[...teams]
                                .sort((a, b) => getGoalsScored(b) - getGoalsScored(a))
                                .slice(0, 5)}
                            getValue={getGoalsScored}
                            valueLabel="goals scored"
                        />

                        <TeamBarChart
                            title="Best defences"
                            teams={[...teams]
                                .sort((a, b) => getGoalsConceded(a) - getGoalsConceded(b))
                                .slice(0, 5)}
                            getValue={getGoalsConceded}
                            valueLabel="goals conceded"
                            variant="defence"
                        />
                    </div>
                )}
            </section>

            <section>
                <div className="analytics-section-header">
                    <h2>Team statistics</h2>

                    <div className="team-statistics-controls">
                        <div
                            className="team-statistics-filter"
                            aria-label="Team statistics filter"
                        >
                            <button
                                type="button"
                                className="team-statistics-filter__button team-statistics-filter__button--active"
                            >
                                All teams
                            </button>

                            <button
                                type="button"
                                className="team-statistics-filter__button"
                                disabled
                                title="Knockout-only statistics will be added when the database view is ready."
                            >
                                Knockout only
                            </button>
                        </div>

                        <label className="team-sort-control">
                            <span>Sort by</span>

                            <select
                                value={`${teamSortKey}-${teamSortDirection}`}
                                onChange={(event) => {
                                    const [key, direction] = event.target.value.split('-') as [
                                        TeamSortKey,
                                        SortDirection,
                                    ]

                                    setTeamSortKey(key)
                                    setTeamSortDirection(direction)
                                }}
                            >
                                <option value="goal_difference-desc">
                                    Goal difference ↓
                                </option>
                                <option value="goals_scored-desc">
                                    Goals scored ↓
                                </option>
                                <option value="goals_conceded-asc">
                                    Goals conceded ↑
                                </option>
                                <option value="team_name-asc">
                                    Team name A–Z
                                </option>
                                <option value="team_name-desc">
                                    Team name Z–A
                                </option>
                            </select>
                        </label>
                    </div>
                </div>

                <p className="team-statistics-legend">
                    P = played · GF = goals scored · GA = goals conceded · GD = goal difference
                </p>

                <div className="team-statistics-wrap">
                    <table className="team-statistics-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team</th>
                                <th>P</th>
                                <th>GF</th>
                                <th>GA</th>
                                <th>GD</th>
                                <th>Goals / match</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedTeams.map((team, index) => {
                                const goalDifference = team.goal_difference ?? 0
                                const goalsPerMatch = team.goals_per_match
                                    ? Number(team.goals_per_match).toFixed(2)
                                    : '—'

                                return (
                                    <tr
                                        key={team.team_id ?? team.team_name ?? index}
                                    >
                                        <td>{team.performance_rank ?? '-'}</td>

                                        <td>
                                            <div className="team-statistics-table__team">
                                                {team.crest_url && (
                                                    <img
                                                        src={team.crest_url}
                                                        alt=""
                                                        className="team-statistics-table__crest"
                                                    />
                                                )}

                                                <span>
                                                    {getTeamName(team)}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{team.matches_played ?? '—'}</td>
                                        <td>{team.goals_scored ?? '—'}</td>
                                        <td>{team.goals_conceded ?? '—'}</td>

                                        <td
                                            className={
                                                goalDifference > 0
                                                    ? 'team-statistics-table__positive'
                                                    : goalDifference < 0
                                                        ? 'team-statistics-table__negative'
                                                        : ''
                                            }
                                        >
                                            {goalDifference > 0
                                                ? `+${goalDifference}`
                                                : goalDifference}
                                        </td>

                                        <td className="team-statistics-table__average">
                                            {goalsPerMatch}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2>Highest-scoring matches</h2>

                {topMatches.length === 0 ? (
                    <p>No high-scoring match data available.</p>
                ) : (
                    <ol className="goal-lollipop-list">
                        {topMatches.map((match, index) => {
                            const totalGoals = getMatchGoals(match)
                            const maxGoals = 10
                            const goalPercentage = Math.min(
                                (totalGoals / maxGoals) * 100,
                                100
                            )

                            return (
                                <li
                                    className="goal-lollipop"
                                    key={match.id ?? index}
                                >
                                    <div className="goal-lollipop__match">
                                        <span className="goal-lollipop__rank">
                                            #{match.match_rank ?? index + 1}
                                        </span>

                                        <span className="goal-lollipop__teams">
                                            {match.home_short_name ??
                                                match.home_name ??
                                                'Home team'}

                                            <strong className="goal-lollipop__score">
                                                {match.home_goals_in_play ?? 0}–
                                                {match.away_goals_in_play ?? 0}
                                            </strong>

                                            {match.away_short_name ??
                                                match.away_name ??
                                                'Away team'}
                                        </span>
                                    </div>

                                    <div className="goal-lollipop__visual">
                                        <p className="goal-lollipop__meta">
                                            {formatMatchDate(match.utc_date)}
                                            {' · '}
                                            {formatStageName(match.stage)}
                                        </p>

                                        <div className="goal-lollipop__line-row">
                                            <div className="goal-lollipop__track">
                                                <div
                                                    className="goal-lollipop__stick"
                                                    style={{ width: `${goalPercentage}%` }}
                                                />

                                                <span
                                                    className="goal-lollipop__ball"
                                                    style={{ left: `${goalPercentage}%` }}
                                                    aria-hidden="true"
                                                >
                                                    ⚽
                                                </span>
                                            </div>

                                            <span className="goal-lollipop__total">
                                                {totalGoals} goals
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                )}
            </section>
        </main>
    )
}

/*
What this code does:

- It imports four Supabase fetch functions.

- It creates four pieces of state, one for each analytics view.

- useEffect runs once when the Analytics page opens.

- Promise.all fetches all four views at the same time.

- While loading, it shows Loading analytics…

- If Supabase returns an error, it shows a simple error message.

- When successful, it temporarily prints the raw data using <pre> and JSON.stringify.
*/