# QueueCast Backend Plan

QueueCast should stay frontend-only until the product questions are clearer: which venues matter first, which reports users will actually submit, and what signals make estimates trustworthy. The first backend should support the MVP without forcing a large infrastructure surface.

## Why Supabase First

Supabase is a strong first backend choice because QueueCast needs a relational data model, user identity, realtime updates, and strict access rules more than it needs custom server infrastructure on day one.

Supabase gives the project:

- Hosted Postgres for venues, events, lines, reports, estimates, and historical intelligence.
- Built-in Auth for anonymous-to-real user flows.
- Realtime subscriptions for live line estimate updates.
- Row-level security so users can only mutate their own reports and profile data.
- Good Expo integration through the JavaScript client.
- A path to add server-side services later without replacing the database.

## Auth

The first auth version should support low-friction reporting:

- Anonymous session or magic-link sign-in for early beta.
- Email or phone sign-in once reputation matters.
- User profile records linked to Supabase Auth users.
- Reporter score and verification history attached to the authenticated user.

Auth should not block browsing events or venue data. It should be required only when a user submits reports, claims reputation, or receives notifications.

## Postgres

Postgres should be the source of truth for:

- Venue metadata and coordinates.
- Events and event schedules.
- Lines available for each event.
- Raw user-submitted line reports.
- Derived line estimates.
- Historical event intelligence.
- Reporter score and trust signals.

The app should store raw reports and derived estimates separately. Raw reports preserve auditability; line estimates provide fast reads for the UI.

## Realtime Subscriptions

Realtime should focus on high-value live surfaces:

- Subscribe to `line_estimates` for an event detail screen.
- Subscribe to recent `line_reports` for the activity feed.
- Optionally subscribe to venue-level active lines for venue dashboards.

Avoid subscribing to every table globally. Event and venue screens should subscribe only to the rows they need.

## Row-Level Security

RLS should be enabled on all user-writeable tables.

Expected rules:

- Anyone can read public venues, events, active lines, and published estimates.
- Authenticated users can insert their own line reports.
- Users can read and update their own profile and reporter score.
- Users cannot edit other users' reports.
- Service-role jobs can aggregate reports into line estimates.
- Admin or venue roles can manage venue metadata and official event records.

## Expo Integration

Expo can use the Supabase JavaScript client directly for the first backend version.

Planned integration points:

- Store Supabase session locally with secure storage where appropriate.
- Fetch public events and venues from Postgres.
- Insert line reports from the Report screen.
- Subscribe to line estimate changes on Event Detail.
- Keep mock fallback available for demos and local development.

## Future FastAPI Prediction Service

Prediction logic can start in the app and later move behind a FastAPI service when it becomes more sophisticated.

FastAPI would eventually own:

- Arrival-based wait prediction.
- Historical similarity matching.
- Venue bottleneck scoring.
- Report anomaly detection.
- Scheduled estimate recalculation.
- Integrations with Ticketmaster, venue feeds, and traffic data.

Supabase should remain the system of record. FastAPI should act as a prediction and integration layer, not a replacement for Postgres.
