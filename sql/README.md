# SQL

This folder holds the database definitions for the World Cup 2026 Tracker (Supabase / Postgres).

## Files

| File | What it does |
|---|---|
| `schema.sql` | Creates 6 tables, then 9 views, in one file |
| `policies.sql` | Turns on Row Level Security and adds the public read policies |

Run `schema.sql` first, then `policies.sql`.

## Order matters

Run `schema.sql` top to bottom. Foreign keys need `teams` first, and views need their source tables and earlier views.

| Layer | Objects |
|---|---|
| Core tables | `teams`, `matches`, `scorers`, `standings` |
| Raw layer | `raw_api_responses` (JSON saved from football-data.org) |
| Extra table | `team_recaps` (reserved for AI-generated team summaries, not used yet) |
| Cleaning views | `team_groups`, `match_analytics`, `match_details`, `scorer_details` |
| Analytics views | `group_standings`, `tournament_overview`, `stage_analytics`, `team_performance`, `highest_scoring_matches` |

Primary and foreign keys were checked against the live database. Defaults and indexes are not included.

##  Security

- Row Level Security is enabled on all 6 tables.
- `teams`, `matches`, `standings`, `scorers` and `team_recaps` have a public read-only (`SELECT`) policy.
- `raw_api_responses` has no policy, so it is not readable with the public key.
- There are no insert, update or delete policies, so the browser cannot change data.

## How the data flows

```
football-data.org
      ↓
raw_api_responses (raw JSON)
      ↓
teams, matches, scorers, standings (clean tables)
      ↓
cleaning views → analytics views
      ↓
website
```
