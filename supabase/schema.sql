-- QueueCast initial Supabase schema
-- This file defines the first production-ready database shape for the app.
-- The React Native app is not connected to Supabase yet.

-- Required for gen_random_uuid().
create extension if not exists pgcrypto;

-- Stores public app profile data for authenticated users.
-- A profile id should match auth.users.id when Supabase Auth is connected.
create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  home_city text,
  created_at timestamptz not null default now()
);

-- Stores venue records such as American Airlines Center or Dos Equis Pavilion.
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text,
  capacity integer,
  latitude double precision,
  longitude double precision,
  entry_points_count integer,
  bottleneck_severity text not null default 'medium'
    check (bottleneck_severity in ('low', 'medium', 'high')),
  typical_bottleneck_notes text,
  created_at timestamptz not null default now()
);

-- Stores concerts and live events hosted by venues.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  artist text not null,
  city text not null,
  event_date date not null,
  doors_time timestamptz,
  show_time timestamptz,
  status text not null default 'upcoming'
    check (status in ('tonight', 'upcoming', 'doors_soon', 'live_now', 'ended')),
  created_at timestamptz not null default now()
);

-- Stores reportable line types for each event, such as Entry, Merch, Parking,
-- Food, and Bathrooms.
create table if not exists public.lines (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  line_type text not null
    check (line_type in ('entry', 'merch', 'parking', 'food', 'bathrooms')),
  label text not null,
  created_at timestamptz not null default now(),
  unique (event_id, line_type)
);

-- Stores individual crowd reports submitted by users for a specific line.
-- Trust score is calculated by the application/service layer for now.
create table if not exists public.line_reports (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.lines(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  wait_minutes integer not null check (wait_minutes >= 0 and wait_minutes <= 240),
  crowd_level text not null
    check (crowd_level in ('light', 'moderate', 'heavy', 'packed')),
  reporter_status text not null
    check (reporter_status in ('in_line', 'on_the_way', 'already_inside', 'just_checking')),
  verification_status text not null default 'unverified'
    check (
      verification_status in (
        'verified_near_venue',
        'unverified',
        'on_the_way',
        'inside_venue',
        'too_far',
        'location_denied',
        'location_unavailable'
      )
    ),
  trust_score integer not null default 0 check (trust_score >= 0),
  distance_from_venue_meters numeric(10, 2),
  is_real_location_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Stores aggregate credibility and contribution metrics for each reporter.
create table if not exists public.reporter_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  reports_submitted integer not null default 0 check (reports_submitted >= 0),
  verified_reports integer not null default 0 check (verified_reports >= 0),
  helpful_score integer not null default 0 check (helpful_score >= 0),
  reporter_level text not null default 'guest'
    check (reporter_level in ('guest', 'bronze', 'silver', 'gold', 'venue_expert')),
  created_at timestamptz not null default now()
);

-- Relationship indexes for fast lookups and future realtime subscriptions.
create index if not exists events_venue_id_idx on public.events(venue_id);
create index if not exists lines_event_id_idx on public.lines(event_id);
create index if not exists line_reports_line_id_idx on public.line_reports(line_id);
create index if not exists line_reports_user_id_idx on public.line_reports(user_id);
create index if not exists reporter_scores_user_id_idx on public.reporter_scores(user_id);

-- Enable row level security for all app tables.
alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.lines enable row level security;
alter table public.line_reports enable row level security;
alter table public.reporter_scores enable row level security;

-- Keep policy creation safe while iterating on the early schema.
drop policy if exists "Anyone can read venues" on public.venues;
drop policy if exists "Anyone can read events" on public.events;
drop policy if exists "Anyone can read lines" on public.lines;
drop policy if exists "Anyone can read profiles" on public.profiles;
drop policy if exists "Anyone can read reporter scores" on public.reporter_scores;
drop policy if exists "Authenticated users can create line reports" on public.line_reports;
drop policy if exists "Anyone can read line reports" on public.line_reports;
drop policy if exists "Users can update their own line reports" on public.line_reports;
drop policy if exists "Users can delete their own line reports" on public.line_reports;

-- Public read policies for venue and event discovery.
create policy "Anyone can read venues"
  on public.venues
  for select
  using (true);

create policy "Anyone can read events"
  on public.events
  for select
  using (true);

-- Lines need to be readable so attendees can view current line types for events.
create policy "Anyone can read lines"
  on public.lines
  for select
  using (true);

-- Profiles and reporter scores are readable for basic reporter context.
create policy "Anyone can read profiles"
  on public.profiles
  for select
  using (true);

create policy "Anyone can read reporter scores"
  on public.reporter_scores
  for select
  using (true);

-- Authenticated users can create their own line reports.
create policy "Authenticated users can create line reports"
  on public.line_reports
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can read line reports for public wait estimates and activity.
create policy "Anyone can read line reports"
  on public.line_reports
  for select
  using (true);

-- Users can only modify their own reports.
create policy "Users can update their own line reports"
  on public.line_reports
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own line reports"
  on public.line_reports
  for delete
  to authenticated
  using (auth.uid() = user_id);
