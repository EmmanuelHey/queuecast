# QueueCast Data Model

This is the proposed Supabase/Postgres model for the MVP backend. It is documentation only; no backend has been implemented yet.

## `users`

Purpose: Stores app-level user profile data linked to Supabase Auth.

Columns:

- `id uuid primary key`
- `auth_user_id uuid unique not null`
- `display_name text`
- `home_city text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relationships:

- One `users` row maps to one Supabase Auth user.
- One user has many `line_reports`.
- One user has one `reporter_scores` row.

Important indexes:

- `users_auth_user_id_idx` on `auth_user_id`
- `users_home_city_idx` on `home_city`

## `venues`

Purpose: Stores venue metadata, coordinates, capacity, and bottleneck profile.

Columns:

- `id uuid primary key`
- `name text not null`
- `city text not null`
- `address text not null`
- `capacity integer`
- `latitude numeric not null`
- `longitude numeric not null`
- `entry_points_count integer`
- `bottleneck_severity text check in ('low', 'medium', 'high')`
- `typical_bottleneck_notes text[]`
- `created_at timestamptz not null default now()`

Relationships:

- One venue has many `events`.
- One venue has many historical events.

Important indexes:

- `venues_city_idx` on `city`
- `venues_name_idx` on `name`
- `venues_geo_idx` on `(latitude, longitude)`

## `events`

Purpose: Stores scheduled concerts and live event status.

Columns:

- `id uuid primary key`
- `venue_id uuid references venues(id)`
- `artist text not null`
- `date date not null`
- `doors_at timestamptz`
- `show_at timestamptz`
- `ends_at timestamptz`
- `status text check in ('upcoming', 'tonight', 'doors_soon', 'live_now', 'ended')`
- `attendance_estimate integer`
- `created_at timestamptz not null default now()`

Relationships:

- One event belongs to one venue.
- One event has many `lines`.
- One event has many `line_reports` through `lines`.

Important indexes:

- `events_venue_id_idx` on `venue_id`
- `events_artist_idx` on `artist`
- `events_date_idx` on `date`
- `events_status_idx` on `status`

## `lines`

Purpose: Defines line types for each event.

Columns:

- `id uuid primary key`
- `event_id uuid references events(id)`
- `line_type text check in ('entry', 'merch', 'parking', 'food', 'bathrooms')`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`

Relationships:

- One line belongs to one event.
- One line has many `line_reports`.
- One line has one current `line_estimates` row.

Important indexes:

- `lines_event_id_idx` on `event_id`
- `lines_event_type_idx` on `(event_id, line_type)`

## `line_reports`

Purpose: Stores raw crowd-submitted reports.

Columns:

- `id uuid primary key`
- `line_id uuid references lines(id)`
- `user_id uuid references users(id)`
- `wait_minutes integer not null`
- `crowd_level text check in ('light', 'steady', 'packed')`
- `reporter_status text check in ('in_line', 'on_the_way', 'inside', 'just_checking')`
- `verification_status text check in ('verified_near_venue', 'unverified', 'on_the_way', 'inside_venue')`
- `is_real_location_verified boolean not null default false`
- `distance_to_venue_meters integer`
- `trust_score integer not null default 0`
- `created_at timestamptz not null default now()`

Relationships:

- One report belongs to one line.
- One report belongs to one user.
- Reports feed `line_estimates`.

Important indexes:

- `line_reports_line_id_created_at_idx` on `(line_id, created_at desc)`
- `line_reports_user_id_idx` on `user_id`
- `line_reports_verification_idx` on `verification_status`

## `line_estimates`

Purpose: Stores current derived line estimates for fast UI reads.

Columns:

- `id uuid primary key`
- `line_id uuid unique references lines(id)`
- `estimated_wait_minutes integer not null`
- `confidence text check in ('low', 'medium', 'high')`
- `report_count integer not null default 0`
- `verified_report_count integer not null default 0`
- `total_trust_score integer not null default 0`
- `last_reported_at timestamptz`
- `updated_at timestamptz not null default now()`

Relationships:

- One estimate belongs to one line.
- Estimate is derived from many `line_reports`.

Important indexes:

- `line_estimates_line_id_idx` on `line_id`
- `line_estimates_updated_at_idx` on `updated_at desc`

## `historical_events`

Purpose: Stores historical concert data for prediction and insights.

Columns:

- `id uuid primary key`
- `artist text not null`
- `venue_id uuid references venues(id)`
- `event_date date not null`
- `attendance_estimate integer`
- `monthly_listeners_estimate integer`
- `entry_wait_peak integer`
- `merch_wait_peak integer`
- `parking_wait_peak integer`
- `average_entry_wait integer`
- `average_merch_wait integer`
- `average_parking_wait integer`
- `artist_category text`
- `created_at timestamptz not null default now()`

Relationships:

- Historical events may link to venues.
- Historical events support event prediction and similar-artist lookup.

Important indexes:

- `historical_events_artist_idx` on `artist`
- `historical_events_venue_id_idx` on `venue_id`
- `historical_events_artist_category_idx` on `artist_category`
- `historical_events_event_date_idx` on `event_date desc`

## `reporter_scores`

Purpose: Tracks reporter reputation and trust history.

Columns:

- `id uuid primary key`
- `user_id uuid unique references users(id)`
- `reports_submitted integer not null default 0`
- `verified_reports integer not null default 0`
- `helpful_score integer not null default 0`
- `reporter_level text`
- `last_report_at timestamptz`
- `updated_at timestamptz not null default now()`

Relationships:

- One reporter score belongs to one user.
- Score is derived from `line_reports`.

Important indexes:

- `reporter_scores_user_id_idx` on `user_id`
- `reporter_scores_level_idx` on `reporter_level`
- `reporter_scores_helpful_score_idx` on `helpful_score desc`
