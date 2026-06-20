-- QueueCast Dallas MVP seed data
-- Run this after supabase/schema.sql.
-- All UUIDs are fixed so the seed can be rerun consistently.

begin;

-- Remove only the QueueCast sample records before recreating the fixed UUID
-- chain. Deleting venues cascades to their events, lines, and line reports.
-- This prevents existing venue rows with different UUIDs from breaking the
-- events.venue_id foreign key.
delete from public.venues
where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000005'
)
or name in (
  'American Airlines Center',
  'Dos Equis Pavilion',
  'Toyota Music Factory',
  'House of Blues Dallas',
  'The Factory in Deep Ellum'
);

-- Profiles do not cascade from venues, so reset only the four sample users.
-- Their line reports and reporter scores are removed through foreign keys.
delete from public.profiles
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004'
);

-- Sample reporter profiles used by line_reports and reporter_scores.
insert into public.profiles (id, display_name, avatar_url, home_city)
values
  ('10000000-0000-4000-8000-000000000001', 'Maya R.', null, 'Dallas'),
  ('10000000-0000-4000-8000-000000000002', 'Chris T.', null, 'Irving'),
  ('10000000-0000-4000-8000-000000000003', 'Jordan P.', null, 'Dallas'),
  ('10000000-0000-4000-8000-000000000004', 'Avery K.', null, 'Deep Ellum')
on conflict (id) do update set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  home_city = excluded.home_city;

-- Dallas launch venues.
insert into public.venues (
  id,
  name,
  city,
  address,
  capacity,
  latitude,
  longitude,
  entry_points_count,
  bottleneck_severity,
  typical_bottleneck_notes
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'American Airlines Center',
    'Dallas',
    '2500 Victory Ave, Dallas, TX 75219',
    20000,
    32.7905,
    -96.8103,
    6,
    'high',
    'Entry lanes and rideshare crossings back up quickly near doors for arena-scale shows.'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Dos Equis Pavilion',
    'Dallas',
    '3839 S Fitzhugh Ave, Dallas, TX 75210',
    20000,
    32.7800,
    -96.7651,
    5,
    'high',
    'Parking flow and gate surges are the most common pressure points before outdoor shows.'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Toyota Music Factory',
    'Irving',
    '316 W Las Colinas Blvd, Irving, TX 75039',
    8000,
    32.8794,
    -96.9438,
    4,
    'medium',
    'Garage exits and plaza entry lines can spike close to show time.'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'House of Blues Dallas',
    'Dallas',
    '2200 N Lamar St, Dallas, TX 75202',
    1625,
    32.7850,
    -96.8088,
    2,
    'medium',
    'Compact lobby and merch area create short but noticeable bottlenecks.'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'The Factory in Deep Ellum',
    'Dallas',
    '2713 Canton St, Dallas, TX 75226',
    4300,
    32.7820,
    -96.7836,
    3,
    'medium',
    'Street parking and neighborhood foot traffic can slow arrival waves.'
  )
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  address = excluded.address,
  capacity = excluded.capacity,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  entry_points_count = excluded.entry_points_count,
  bottleneck_severity = excluded.bottleneck_severity,
  typical_bottleneck_notes = excluded.typical_bottleneck_notes;

-- Eight Dallas-area concert events across the launch venues.
insert into public.events (id, venue_id, artist, city, event_date, doors_time, show_time, status)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Travis Scott',
    'Dallas',
    '2026-06-14',
    '2026-06-14 18:30:00-05',
    '2026-06-14 20:00:00-05',
    'tonight'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Tyler, The Creator',
    'Dallas',
    '2026-06-14',
    '2026-06-14 18:00:00-05',
    '2026-06-14 19:30:00-05',
    'doors_soon'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    'Kacey Musgraves',
    'Irving',
    '2026-06-15',
    '2026-06-15 18:30:00-05',
    '2026-06-15 20:00:00-05',
    'upcoming'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000004',
    'Leon Bridges',
    'Dallas',
    '2026-06-16',
    '2026-06-16 19:00:00-05',
    '2026-06-16 20:30:00-05',
    'upcoming'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000005',
    'The Marías',
    'Dallas',
    '2026-06-18',
    '2026-06-18 19:00:00-05',
    '2026-06-18 20:00:00-05',
    'upcoming'
  ),
  (
    '30000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000001',
    'Drake',
    'Dallas',
    '2026-06-21',
    '2026-06-21 18:00:00-05',
    '2026-06-21 20:00:00-05',
    'upcoming'
  ),
  (
    '30000000-0000-4000-8000-000000000007',
    '20000000-0000-4000-8000-000000000002',
    'Morgan Wallen',
    'Dallas',
    '2026-06-22',
    '2026-06-22 17:30:00-05',
    '2026-06-22 19:30:00-05',
    'upcoming'
  ),
  (
    '30000000-0000-4000-8000-000000000008',
    '20000000-0000-4000-8000-000000000003',
    'SZA',
    'Irving',
    '2026-06-25',
    '2026-06-25 18:30:00-05',
    '2026-06-25 20:00:00-05',
    'upcoming'
  )
on conflict (id) do update set
  venue_id = excluded.venue_id,
  artist = excluded.artist,
  city = excluded.city,
  event_date = excluded.event_date,
  doors_time = excluded.doors_time,
  show_time = excluded.show_time,
  status = excluded.status;

-- Five reportable line types for every seeded event.
insert into public.lines (id, event_id, line_type, label)
values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000001', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000002', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000002', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000002', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000002', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000002', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000003', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000003', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000013', '30000000-0000-4000-8000-000000000003', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000014', '30000000-0000-4000-8000-000000000003', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000015', '30000000-0000-4000-8000-000000000003', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000016', '30000000-0000-4000-8000-000000000004', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000017', '30000000-0000-4000-8000-000000000004', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000018', '30000000-0000-4000-8000-000000000004', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000019', '30000000-0000-4000-8000-000000000004', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000020', '30000000-0000-4000-8000-000000000004', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000021', '30000000-0000-4000-8000-000000000005', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000022', '30000000-0000-4000-8000-000000000005', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000023', '30000000-0000-4000-8000-000000000005', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000024', '30000000-0000-4000-8000-000000000005', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000025', '30000000-0000-4000-8000-000000000005', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000026', '30000000-0000-4000-8000-000000000006', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000027', '30000000-0000-4000-8000-000000000006', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000028', '30000000-0000-4000-8000-000000000006', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000029', '30000000-0000-4000-8000-000000000006', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000030', '30000000-0000-4000-8000-000000000006', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000031', '30000000-0000-4000-8000-000000000007', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000032', '30000000-0000-4000-8000-000000000007', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000033', '30000000-0000-4000-8000-000000000007', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000034', '30000000-0000-4000-8000-000000000007', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000035', '30000000-0000-4000-8000-000000000007', 'bathrooms', 'Bathroom'),

  ('40000000-0000-4000-8000-000000000036', '30000000-0000-4000-8000-000000000008', 'entry', 'Entry'),
  ('40000000-0000-4000-8000-000000000037', '30000000-0000-4000-8000-000000000008', 'merch', 'Merch'),
  ('40000000-0000-4000-8000-000000000038', '30000000-0000-4000-8000-000000000008', 'parking', 'Parking'),
  ('40000000-0000-4000-8000-000000000039', '30000000-0000-4000-8000-000000000008', 'food', 'Food'),
  ('40000000-0000-4000-8000-000000000040', '30000000-0000-4000-8000-000000000008', 'bathrooms', 'Bathroom')
on conflict (id) do update set
  event_id = excluded.event_id,
  line_type = excluded.line_type,
  label = excluded.label;

-- Realistic sample reports for later Supabase testing.
insert into public.line_reports (
  id,
  line_id,
  user_id,
  wait_minutes,
  crowd_level,
  reporter_status,
  verification_status,
  trust_score,
  distance_from_venue_meters,
  is_real_location_verified,
  created_at
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    34,
    'heavy',
    'in_line',
    'verified_near_venue',
    8,
    82.40,
    true,
    '2026-06-14 18:42:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    29,
    'moderate',
    'in_line',
    'verified_near_venue',
    8,
    121.10,
    true,
    '2026-06-14 18:48:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    22,
    'moderate',
    'already_inside',
    'inside_venue',
    3,
    null,
    false,
    '2026-06-14 18:51:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    41,
    'heavy',
    'on_the_way',
    'on_the_way',
    3,
    940.20,
    false,
    '2026-06-14 18:39:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000001',
    27,
    'moderate',
    'in_line',
    'verified_near_venue',
    8,
    63.80,
    true,
    '2026-06-14 17:56:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000006',
    '40000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000002',
    36,
    'heavy',
    'in_line',
    'verified_near_venue',
    8,
    154.75,
    true,
    '2026-06-14 18:03:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000007',
    '40000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000003',
    18,
    'moderate',
    'just_checking',
    'unverified',
    2,
    null,
    false,
    '2026-06-14 18:05:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000008',
    '40000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000004',
    12,
    'light',
    'on_the_way',
    'on_the_way',
    3,
    1320.00,
    false,
    '2026-06-15 18:02:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000009',
    '40000000-0000-4000-8000-000000000016',
    '10000000-0000-4000-8000-000000000001',
    16,
    'moderate',
    'in_line',
    'verified_near_venue',
    8,
    44.25,
    true,
    '2026-06-16 19:08:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000010',
    '40000000-0000-4000-8000-000000000021',
    '10000000-0000-4000-8000-000000000002',
    24,
    'moderate',
    'in_line',
    'verified_near_venue',
    8,
    92.60,
    true,
    '2026-06-18 19:12:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000011',
    '40000000-0000-4000-8000-000000000026',
    '10000000-0000-4000-8000-000000000003',
    47,
    'packed',
    'in_line',
    'verified_near_venue',
    8,
    108.00,
    true,
    '2026-06-21 18:18:00-05'
  ),
  (
    '50000000-0000-4000-8000-000000000012',
    '40000000-0000-4000-8000-000000000031',
    '10000000-0000-4000-8000-000000000004',
    39,
    'heavy',
    'in_line',
    'verified_near_venue',
    8,
    71.35,
    true,
    '2026-06-22 17:44:00-05'
  )
on conflict (id) do update set
  line_id = excluded.line_id,
  user_id = excluded.user_id,
  wait_minutes = excluded.wait_minutes,
  crowd_level = excluded.crowd_level,
  reporter_status = excluded.reporter_status,
  verification_status = excluded.verification_status,
  trust_score = excluded.trust_score,
  distance_from_venue_meters = excluded.distance_from_venue_meters,
  is_real_location_verified = excluded.is_real_location_verified,
  created_at = excluded.created_at;

-- Sample aggregate reporter credibility records.
insert into public.reporter_scores (
  id,
  user_id,
  reports_submitted,
  verified_reports,
  helpful_score,
  reporter_level
)
values
  ('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 4, 4, 84, 'gold'),
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 3, 2, 52, 'silver'),
  ('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 3, 1, 31, 'bronze'),
  ('60000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 2, 2, 43, 'silver')
on conflict (user_id) do update set
  reports_submitted = excluded.reports_submitted,
  verified_reports = excluded.verified_reports,
  helpful_score = excluded.helpful_score,
  reporter_level = excluded.reporter_level;

-- Fail loudly if the expected Dallas MVP seed rows were not written.
do $$
declare
  seeded_profiles_count integer;
  seeded_venues_count integer;
  seeded_events_count integer;
  seeded_lines_count integer;
  seeded_reports_count integer;
  seeded_reporter_scores_count integer;
begin
  select count(*) into seeded_profiles_count from public.profiles where id::text like '10000000-0000-4000-8000-%';
  select count(*) into seeded_venues_count from public.venues where id::text like '20000000-0000-4000-8000-%';
  select count(*) into seeded_events_count from public.events where id::text like '30000000-0000-4000-8000-%';
  select count(*) into seeded_lines_count from public.lines where id::text like '40000000-0000-4000-8000-%';
  select count(*) into seeded_reports_count from public.line_reports where id::text like '50000000-0000-4000-8000-%';
  select count(*) into seeded_reporter_scores_count from public.reporter_scores where id::text like '60000000-0000-4000-8000-%';

  if seeded_profiles_count <> 4 then
    raise exception 'QueueCast seed expected 4 profiles, found %', seeded_profiles_count;
  end if;

  if seeded_venues_count <> 5 then
    raise exception 'QueueCast seed expected 5 venues, found %', seeded_venues_count;
  end if;

  if seeded_events_count <> 8 then
    raise exception 'QueueCast seed expected 8 events, found %', seeded_events_count;
  end if;

  if seeded_lines_count <> 40 then
    raise exception 'QueueCast seed expected 40 lines, found %', seeded_lines_count;
  end if;

  if seeded_reports_count <> 12 then
    raise exception 'QueueCast seed expected 12 line reports, found %', seeded_reports_count;
  end if;

  if seeded_reporter_scores_count <> 4 then
    raise exception 'QueueCast seed expected 4 reporter scores, found %', seeded_reporter_scores_count;
  end if;
end $$;

commit;

-- Supabase SQL Editor should return this row after seeding.
select
  (select count(*) from public.profiles where id::text like '10000000-0000-4000-8000-%') as seeded_profiles,
  (select count(*) from public.venues where id::text like '20000000-0000-4000-8000-%') as seeded_venues,
  (select count(*) from public.events where id::text like '30000000-0000-4000-8000-%') as seeded_events,
  (select count(*) from public.lines where id::text like '40000000-0000-4000-8000-%') as seeded_lines,
  (select count(*) from public.line_reports where id::text like '50000000-0000-4000-8000-%') as seeded_line_reports,
  (select count(*) from public.reporter_scores where id::text like '60000000-0000-4000-8000-%') as seeded_reporter_scores;
