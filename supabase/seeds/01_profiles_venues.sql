-- QueueCast seed step 1 of 5: sample profiles and Dallas venues.
-- Run after supabase/schema.sql.

begin;

-- Reset only QueueCast sample records. Venue deletion cascades through events,
-- lines, and line reports. Profile deletion cascades through reports and scores.
delete from public.venues
where id::text like '20000000-0000-4000-8000-%'
   or name in (
     'American Airlines Center',
     'Dos Equis Pavilion',
     'Toyota Music Factory',
     'House of Blues Dallas',
     'The Factory in Deep Ellum'
   );

delete from public.profiles
where id::text like '10000000-0000-4000-8000-%';

insert into public.profiles (id, display_name, avatar_url, home_city)
values
  ('10000000-0000-4000-8000-000000000001', 'Maya R.', null, 'Dallas'),
  ('10000000-0000-4000-8000-000000000002', 'Chris T.', null, 'Irving'),
  ('10000000-0000-4000-8000-000000000003', 'Jordan P.', null, 'Dallas'),
  ('10000000-0000-4000-8000-000000000004', 'Avery K.', null, 'Deep Ellum');

insert into public.venues (
  id, name, city, address, capacity, latitude, longitude,
  entry_points_count, bottleneck_severity, typical_bottleneck_notes
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'American Airlines Center', 'Dallas',
    '2500 Victory Ave, Dallas, TX 75219', 20000, 32.7905, -96.8103,
    6, 'high',
    'Entry lanes and rideshare crossings back up quickly near doors for arena-scale shows.'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Dos Equis Pavilion', 'Dallas',
    '3839 S Fitzhugh Ave, Dallas, TX 75210', 20000, 32.7800, -96.7651,
    5, 'high',
    'Parking flow and gate surges are the most common pressure points before outdoor shows.'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Toyota Music Factory', 'Irving',
    '316 W Las Colinas Blvd, Irving, TX 75039', 8000, 32.8794, -96.9438,
    4, 'medium',
    'Garage exits and plaza entry lines can spike close to show time.'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'House of Blues Dallas', 'Dallas',
    '2200 N Lamar St, Dallas, TX 75202', 1625, 32.7850, -96.8088,
    2, 'medium',
    'Compact lobby and merch area create short but noticeable bottlenecks.'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'The Factory in Deep Ellum', 'Dallas',
    '2713 Canton St, Dallas, TX 75226', 4300, 32.7820, -96.7836,
    3, 'medium',
    'Street parking and neighborhood foot traffic can slow arrival waves.'
  );

commit;

select
  (select count(*) from public.profiles where id::text like '10000000-0000-4000-8000-%') as seeded_profiles,
  (select count(*) from public.venues where id::text like '20000000-0000-4000-8000-%') as seeded_venues;
