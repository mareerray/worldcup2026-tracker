-- =====================================================================
-- World Cup 2026 Tracker: database schema (Supabase / Postgres)
-- Order: 1) tables  2) cleaning-layer views  3) analytics-layer views
-- Keys come from the live database. Foreign keys are assumed to point to teams(id).
-- =====================================================================

-- ===== TABLES =====

create table if not exists teams (
    id          integer not null primary key,   -- API team id
    name        text    not null,
    short_name  text,
    tla         text,                            -- 3-letter code
    crest_url   text
);

create table if not exists matches (
    id                  integer not null primary key,   -- API match id
    utc_date            timestamptz not null,
    status              text not null,                  -- e.g. SCHEDULED, FINISHED
    stage               text,                           -- e.g. GROUP_STAGE, LAST_16
    group_name          text,
    matchday            integer,
    venue               text,
    home_team_id        integer references teams(id),
    away_team_id        integer references teams(id),
    duration            text,                           -- e.g. REGULAR, PENALTY_SHOOTOUT
    home_goals_full     integer,                        -- includes shootout kicks
    away_goals_full     integer,
    home_goals_regular  integer,
    away_goals_regular  integer,
    home_pens           integer,                        -- shootout kicks only
    away_pens           integer,
    last_updated        timestamptz
);

create table if not exists scorers (
    player_id    integer not null primary key,
    player_name  text not null,
    team_id      integer references teams(id),
    goals        integer not null,
    updated_at   timestamptz not null
);

create table if not exists standings (
    group_name       text not null,                     -- 'OVERALL' is used by group_standings
    team_id          integer not null references teams(id),
    position         integer,
    played           integer,
    won              integer,
    draw             integer,
    lost             integer,
    points           integer,
    goals_for        integer,
    goals_against    integer,
    goal_difference  integer,
    primary key (group_name, team_id)
);

-- Raw JSON saved from football-data.org (raw layer)
-- id has no default shown; check whether it is an identity column
create table if not exists raw_api_responses (
    id          bigint not null primary key,
    endpoint    text not null,                  -- e.g. /competitions/WC/matches
    fetched_at  timestamptz not null,
    payload     jsonb not null                  -- full API response
);

-- Generated text summary for each team (artificial intelligence)
-- Reserved for AI-generated team summaries (not used yet).
create table if not exists team_recaps (
    team_id       integer not null primary key references teams(id),
    summary       text not null,
    model         text,                         -- which AI model wrote it
    generated_at  timestamptz not null
);

-- ===== VIEWS: cleaning layer =====

-- team_groups: which group each team plays in (from group-stage matches)
create or replace view team_groups as
select distinct team_id, group_name
from (
    select home_team_id as team_id, group_name
    from matches
    where stage = 'GROUP_STAGE'
    union
    select away_team_id as team_id, group_name
    from matches
    where stage = 'GROUP_STAGE'
) t
where team_id is not null
  and group_name is not null;

-- match_analytics: in-play goals = full-time goals minus shootout kicks
create or replace view match_analytics as
select
    id, utc_date, status, stage, group_name, matchday, venue,
    home_team_id, away_team_id, duration,
    home_goals_full, away_goals_full,
    home_goals_regular, away_goals_regular,
    home_pens, away_pens, last_updated,
    coalesce(home_goals_full, 0) - coalesce(home_pens, 0) as home_goals_in_play,
    coalesce(away_goals_full, 0) - coalesce(away_pens, 0) as away_goals_in_play,
    (coalesce(home_goals_full, 0) - coalesce(home_pens, 0))
      + (coalesce(away_goals_full, 0) - coalesce(away_pens, 0)) as total_goals_in_play
from matches m;

-- match_details: matches joined with home/away team info, plus winner_team_id
create or replace view match_details as
select
    m.id, m.utc_date, m.status, m.stage, m.group_name, m.matchday, m.venue, m.duration,
    m.home_team_id,
    h.name as home_name, h.short_name as home_short_name, h.tla as home_tla, h.crest_url as home_crest,
    m.away_team_id,
    a.name as away_name, a.short_name as away_short_name, a.tla as away_tla, a.crest_url as away_crest,
    m.home_goals_full, m.away_goals_full,
    m.home_goals_regular, m.away_goals_regular,
    m.home_pens, m.away_pens,
    case
        when m.status <> 'FINISHED' then null::integer
        when m.duration = 'PENALTY_SHOOTOUT' then
            case
                when m.home_pens > m.away_pens then m.home_team_id
                when m.away_pens > m.home_pens then m.away_team_id
                else null::integer
            end
        when m.home_goals_full > m.away_goals_full then m.home_team_id
        when m.away_goals_full > m.home_goals_full then m.away_team_id
        else null::integer
    end as winner_team_id
from matches m
left join teams h on h.id = m.home_team_id
left join teams a on a.id = m.away_team_id;

-- scorer_details: scorers joined with team info
create or replace view scorer_details as
select
    s.player_id, s.player_name, s.team_id, s.goals,
    t.name as team_name, t.short_name as team_short_name,
    t.tla as team_tla, t.crest_url as team_crest
from scorers s
left join teams t on t.id = s.team_id;

-- ===== VIEWS: analytics layer =====

-- group_standings: group tables with position
create or replace view group_standings as
select
    g.group_name,
    rank() over (
        partition by g.group_name
        order by s.points desc, s.goal_difference desc, s.goals_for desc
    ) as group_position,
    s.team_id,
    t.name as team_name, t.short_name, t.tla, t.crest_url,
    s.played, s.won, s.draw, s.lost, s.points,
    s.goals_for, s.goals_against, s.goal_difference
from standings s
join team_groups g on g.team_id = s.team_id
join teams t on t.id = s.team_id
where s.group_name = 'OVERALL';

-- tournament_overview: one summary row for the Analytics KPI cards
create or replace view tournament_overview as
select
    count(*) as finished_matches,
    sum(total_goals_in_play) as goals_in_play,
    round(avg(total_goals_in_play), 2) as goals_per_match,
    count(*) filter (where duration = 'PENALTY_SHOOTOUT') as penalty_shootouts,
    count(*) filter (where home_goals_in_play = away_goals_in_play) as draws_after_play
from match_analytics
where status = 'FINISHED';

-- stage_analytics: one row per tournament stage
create or replace view stage_analytics as
select
    stage,
    count(*) as finished_matches,
    sum(total_goals_in_play) as goals_in_play,
    round(avg(total_goals_in_play), 2) as goals_per_match,
    count(*) filter (where duration = 'PENALTY_SHOOTOUT') as penalty_shootouts,
    count(*) filter (where home_goals_in_play = away_goals_in_play) as draws_after_play
from match_analytics
where status = 'FINISHED'
group by stage
order by
    case stage
        when 'GROUP_STAGE' then 1
        when 'LAST_32' then 2
        when 'LAST_16' then 3
        when 'QUARTER_FINALS' then 4
        when 'SEMI_FINALS' then 5
        when 'THIRD_PLACE' then 6
        when 'FINAL' then 7
        else 99
    end;

-- team_performance: one row per team across all finished matches
create or replace view team_performance as
with team_match_rows as (
    select home_team_id as team_id,
           home_goals_in_play as goals_scored,
           away_goals_in_play as goals_conceded
    from match_analytics
    where status = 'FINISHED'
    union all
    select away_team_id as team_id,
           away_goals_in_play as goals_scored,
           home_goals_in_play as goals_conceded
    from match_analytics
    where status = 'FINISHED'
),
team_totals as (
    select
        t.id as team_id, t.name as team_name, t.short_name, t.tla, t.crest_url,
        count(*) as matches_played,
        sum(r.goals_scored) as goals_scored,
        sum(r.goals_conceded) as goals_conceded,
        sum(r.goals_scored) - sum(r.goals_conceded) as goal_difference,
        round(avg(r.goals_scored), 2) as goals_per_match
    from team_match_rows r
    join teams t on t.id = r.team_id
    group by t.id, t.name, t.short_name, t.tla, t.crest_url
)
select
    rank() over (
        order by goal_difference desc, goals_scored desc, goals_conceded, team_name
    ) as performance_rank,
    team_id, team_name, short_name, tla, crest_url,
    matches_played, goals_scored, goals_conceded, goal_difference, goals_per_match
from team_totals
order by performance_rank;

-- highest_scoring_matches: top 10 finished matches by in-play goals
create or replace view highest_scoring_matches as
select
    row_number() over (
        order by ma.total_goals_in_play desc,
                 abs(ma.home_goals_in_play - ma.away_goals_in_play),
                 md.utc_date
    ) as match_rank,
    md.id, md.utc_date, md.stage, md.duration,
    md.home_name, md.home_short_name, md.home_tla, md.home_crest,
    md.away_name, md.away_short_name, md.away_tla, md.away_crest,
    ma.home_goals_in_play, ma.away_goals_in_play, ma.total_goals_in_play,
    md.home_pens, md.away_pens
from match_analytics ma
join match_details md on md.id = ma.id
where ma.status = 'FINISHED'
order by ma.total_goals_in_play desc,
         abs(ma.home_goals_in_play - ma.away_goals_in_play),
         md.utc_date
limit 10;
