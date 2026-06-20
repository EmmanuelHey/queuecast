-- QueueCast seed step 4 of 5: sample reports and reporter scores.
-- Requires 01_profiles_venues.sql and 03_lines.sql.

begin;

do $$
begin
  if (select count(*) from public.profiles where id::text like '10000000-0000-4000-8000-%') <> 4 then
    raise exception 'Run 01_profiles_venues.sql first; four sample profiles are required.';
  end if;

  if (select count(*) from public.lines where id::text like '40000000-0000-4000-8000-%') <> 40 then
    raise exception 'Run 03_lines.sql first; forty fixed-ID lines are required.';
  end if;
end $$;

delete from public.line_reports
where id::text like '50000000-0000-4000-8000-%';

delete from public.reporter_scores
where id::text like '60000000-0000-4000-8000-%'
   or user_id::text like '10000000-0000-4000-8000-%';

insert into public.line_reports (
  id, line_id, user_id, wait_minutes, crowd_level, reporter_status,
  verification_status, trust_score, distance_from_venue_meters,
  is_real_location_verified, created_at
)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 34, 'heavy', 'in_line', 'verified_near_venue', 8, 82.40, true, now() - interval '4 minutes'),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 29, 'moderate', 'in_line', 'verified_near_venue', 8, 121.10, true, now() - interval '7 minutes'),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 22, 'moderate', 'already_inside', 'inside_venue', 3, null, false, now() - interval '9 minutes'),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', 41, 'heavy', 'on_the_way', 'on_the_way', 3, 940.20, false, now() - interval '12 minutes'),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 27, 'moderate', 'in_line', 'verified_near_venue', 8, 63.80, true, now() - interval '5 minutes'),
  ('50000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 36, 'heavy', 'in_line', 'verified_near_venue', 8, 154.75, true, now() - interval '8 minutes'),
  ('50000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000003', 18, 'moderate', 'just_checking', 'unverified', 2, null, false, now() - interval '16 minutes'),
  ('50000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000004', 12, 'light', 'on_the_way', 'on_the_way', 3, 1320.00, false, now() - interval '20 minutes'),
  ('50000000-0000-4000-8000-000000000009', '40000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000001', 16, 'moderate', 'in_line', 'verified_near_venue', 8, 44.25, true, now() - interval '6 minutes'),
  ('50000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000002', 24, 'moderate', 'in_line', 'verified_near_venue', 8, 92.60, true, now() - interval '11 minutes'),
  ('50000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000003', 47, 'packed', 'in_line', 'verified_near_venue', 8, 108.00, true, now() - interval '13 minutes'),
  ('50000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000004', 39, 'heavy', 'in_line', 'verified_near_venue', 8, 71.35, true, now() - interval '15 minutes');

insert into public.reporter_scores (
  id, user_id, reports_submitted, verified_reports, helpful_score, reporter_level
)
values
  ('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 4, 4, 84, 'gold'),
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 3, 2, 52, 'silver'),
  ('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 3, 1, 31, 'bronze'),
  ('60000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 2, 2, 43, 'silver');

commit;

select
  (select count(*) from public.line_reports where id::text like '50000000-0000-4000-8000-%') as seeded_line_reports,
  (select count(*) from public.reporter_scores where id::text like '60000000-0000-4000-8000-%') as seeded_reporter_scores;
