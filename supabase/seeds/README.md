# QueueCast Split Seed

Run `supabase/schema.sql` first. Then open each file below in the Supabase SQL Editor and run the entire file in this order:

1. `01_profiles_venues.sql`
2. `02_events.sql`
3. `03_lines.sql`
4. `04_reports_scores.sql`
5. `05_verify_counts.sql`

Expected final seeded counts:

- Profiles: 4
- Venues: 5
- Events: 8
- Lines: 40
- Line reports: 12
- Reporter scores: 4

The first four steps run in their own transaction. Each dependent step checks that its required parent rows exist and raises a clear error if an earlier step was skipped.
