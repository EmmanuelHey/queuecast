# QueueCast

QueueCast is a mobile app for concertgoers to see, report, and predict live venue line wait times.

The current MVP is Dallas-first and frontend-only. It uses mock data to demonstrate the product loop: pick a Dallas concert, review live line estimates, choose an arrival time, see predicted waits, and submit a trust-weighted report.

## Current Features

- Dallas-area event and venue mock data.
- Event detail pages with entry, merch, parking, food, and bathroom lines.
- Venue detail pages with capacity, address, bottleneck notes, and active lines.
- Trust-weighted line reports.
- Reporter status and mock location verification readiness.
- Arrival-based wait prediction.
- Historical concert intelligence and simple wait trend charts.
- Activity and profile screens.
- First-time onboarding and demo-ready empty states.

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- React Query
- NativeWind
- Expo Location, gated with mock fallback

## Run Locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

Run web:

```bash
npx expo start --web
```

Typecheck:

```bash
npx tsc --noEmit
```

## Current Limitation

QueueCast currently uses frontend mock data only. There is no backend, no real authentication, no persistent reports, no real Ticketmaster integration, and no production GPS verification yet.

The location verification code is intentionally gated and mock-safe so the app can be demoed on web and native without requiring real location services.

## Next Planned Backend Step

The next backend milestone is Supabase:

- Postgres schema for venues, events, lines, reports, estimates, historical events, and reporter scores.
- Supabase Auth for user identity.
- Row-level security for safe report writes.
- Realtime subscriptions for live line estimates.
- Future FastAPI service for prediction logic and external integrations.

See:

- [Backend Plan](docs/backend-plan.md)
- [Data Model](docs/data-model.md)
- [MVP Roadmap](docs/mvp-roadmap.md)
