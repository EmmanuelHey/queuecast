-- Restore public read access required by the QueueCast event detail screens.
-- Run this once in the Supabase SQL Editor for the configured project.

alter table public.lines enable row level security;
alter table public.line_reports enable row level security;

drop policy if exists "Anyone can read lines" on public.lines;
create policy "Anyone can read lines"
  on public.lines
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can read line reports" on public.line_reports;
create policy "Anyone can read line reports"
  on public.line_reports
  for select
  to anon, authenticated
  using (true);

-- Expected after the migration and seed:
select count(*) as visible_lines from public.lines;
