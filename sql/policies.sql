-- Row Level Security: public read-only access
-- Run after schema.sql. Check that RLS is enabled on every table.

alter table teams             enable row level security;
alter table matches           enable row level security;
alter table standings         enable row level security;
alter table scorers           enable row level security;
alter table team_recaps       enable row level security;
alter table raw_api_responses enable row level security;  -- no policy = private

create policy "public read" on teams
    for select to public using (true);

create policy "public read" on matches
    for select to public using (true);

create policy "public read" on standings
    for select to public using (true);

create policy "public read" on scorers
    for select to public using (true);

create policy "Anyone can read recaps" on team_recaps
    for select to public using (true);

-- raw_api_responses has no policy on purpose.
-- Only server-side code using the service role can read or write it.