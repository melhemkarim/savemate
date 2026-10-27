# SaveMate (Phase 1)

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase. Runs on free tiers (Supabase Free, Vercel Hobby).

## Phase 2 added
Missed-day recovery card (log a catch-up for yesterday; allowed for the last 7 days) · calendar view · achievements page (derived from existing data, no schema change).

## Phase 1 includes
Email/password auth (sign up, log in, log out, password reset) · savings goals (create, edit, pause, resume, complete, delete)
· four saving paces with integer-cent math · contributions with append-only corrections · dashboard (totals, streak, 7-day chart, deadlines, activity)
· settings (name, currency, time zone) · Row Level Security on every table.

## Setup
1. Create a free project at supabase.com.
2. Supabase → SQL Editor → paste and run `supabase/schema.sql`.
3. Supabase → Authentication → URL Configuration: set Site URL to `http://localhost:3000` and add
   `http://localhost:3000/auth/callback` to Redirect URLs (add your production URL later too).
4. `cp .env.example .env.local` and fill in the project URL and anon key (Project Settings → API).
5. `npm install && npm run dev` → http://localhost:3000

Tip: for quick local testing, turn off "Confirm email" under Authentication → Providers → Email.

## Deploy
Push to GitHub, import into Vercel, add the same env vars, then add your Vercel URL to Supabase Redirect URLs.

## Design decisions
- Money is stored as integer cents. Goal progress is a SQL view (`goal_progress`) summing transactions.
- Transactions are append-only (no UPDATE/DELETE policies). "Undo" calls `reverse_transaction()`, which inserts a negative correction row; a unique index prevents double reversal.
- "Today" uses the time zone saved on the profile.
- Deleting a goal deletes its history (after a confirmation dialog).
- Plan math (`lib/plans.ts`): daily = ceil(remaining ÷ days), where days = days left × 1.5 (Chill), 1 (Balanced), 0.75 (Ambitious), 0.5 (Beast).

## Not yet built (Phase 3)
Reminders, downloadable summaries, dark theme, onboarding.
