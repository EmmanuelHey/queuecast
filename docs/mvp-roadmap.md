# QueueCast MVP Roadmap

## 1. Frontend Prototype

Build the mobile experience with mock data:

- Expo Router navigation.
- Home, Search, Activity, Profile, Event Detail, Venue Detail, Report, and Onboarding.
- Trust-weighted line reports.
- Arrival-based wait prediction.
- Historical event intelligence.

## 2. Dallas Mock Launch

Make the product feel locally specific:

- Dallas-area venues.
- Dallas launch event schedule.
- Venue bottleneck metadata.
- Mock venue coordinates.
- Demo-ready flow for a short walkthrough.

## 3. Supabase Backend

Move mock state into a real backend:

- Supabase project.
- Postgres schema.
- Public event and venue reads.
- Authenticated report writes.
- Realtime line estimate subscriptions.
- RLS policies.

## 4. Real User Auth

Introduce identity when it adds value:

- Magic-link or email auth.
- User profiles.
- Reporter score persistence.
- Abuse and duplicate-report prevention.

## 5. Real Location Verification

Replace mock verification with real GPS checks:

- Foreground location permission.
- Venue radius checks.
- Distance stored with reports.
- Trust score boost for verified nearby reporters.
- Privacy-conscious messaging.

## 6. Dallas Beta

Test with real users and real Dallas events:

- Seed high-priority Dallas venues.
- Recruit early concertgoers.
- Monitor report quality.
- Tune wait estimate and prediction rules.
- Collect feedback from event nights.

## 7. Venue Dashboard

Build venue-facing tools:

- Live line map and current estimates.
- Report volume and confidence.
- Bottleneck history.
- Exportable event summaries.
- Staff-facing alerts.

## 8. Ticketing and Venue Partnerships

Connect QueueCast to real event supply:

- Ticketmaster or similar event ingestion.
- Venue partnerships for official event data.
- Push notifications for arrival timing.
- "Leave now" recommendations.
- Sponsored or partner venue surfaces.
