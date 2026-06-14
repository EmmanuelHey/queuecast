# Supabase Setup

QueueCast is still running on mock local data. This setup only prepares the app for a future Supabase connection.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com).
2. Sign in or create an account.
3. Select **New project**.
4. Choose an organization.
5. Enter a project name, such as `queuecast`.
6. Create a strong database password and save it somewhere safe.
7. Choose the region closest to the first launch market.
8. Select **Create new project**.

## 2. Find the Project URL

1. Open the Supabase project dashboard.
2. Go to **Project Settings**.
3. Select **API**.
4. Copy the value under **Project URL**.
5. Use it as `EXPO_PUBLIC_SUPABASE_URL`.

## 3. Find the Anon Key

1. Open the same **Project Settings > API** page.
2. Find **Project API keys**.
3. Copy the public `anon` key.
4. Use it as `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

The anon key is designed for client apps when Row Level Security policies are enabled. Do not use the service role key in the Expo app.

## 4. Create a Local .env File

Copy `.env.example` to `.env` and fill in the values from Supabase:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart Expo after changing environment variables:

```sh
npx expo start --clear
```

## Current Status

- `@supabase/supabase-js` is installed.
- `services/supabaseClient.ts` creates a Supabase client only when environment variables are present.
- The app still uses mock data.
- No auth flow has been added.
- No app screens read from or write to Supabase yet.
