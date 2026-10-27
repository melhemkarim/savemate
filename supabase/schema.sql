-- SaveMate schema (Phase 1). Run in Supabase → SQL Editor.
-- Money is stored as integer minor units (cents). Transactions are the source of truth;
-- goal progress is derived from them. Transactions are append-only: corrections are new rows.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 300),
  icon text not null default '🎯',
  target_cents bigint not null check (target_cents > 0 and target_cents <= 1000000000),
  target_date date not null,
  status text not null default 'active' check (status in ('active','paused','completed')),
  mode text not null default 'balanced' check (mode in ('chill','balanced','ambitious','beast')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index goals_user_status_idx on public.goals (user_id, status);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  amount_cents bigint not null check (amount_cents <> 0 and abs(amount_cents) <= 1000000000),
  kind text not null check (kind in ('contribution','correction')),
  reverses_id uuid unique references public.transactions(id),
  note text check (char_length(note) <= 200),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  check (
    (kind = 'contribution' and amount_cents > 0 and reverses_id is null) or
    (kind = 'correction' and amount_cents < 0 and reverses_id is not null)
  )
);
create index transactions_goal_idx on public.transactions (goal_id, created_at desc);
create index transactions_user_day_idx on public.transactions (user_id, occurred_on desc);

-- Derived progress (runs with the caller's permissions, so RLS applies)
create view public.goal_progress with (security_invoker = true) as
select g.*, coalesce(sum(t.amount_cents), 0)::bigint as saved_cents
from public.goals g
left join public.transactions t on t.goal_id = g.id
group by g.id;

-- Reverse a contribution by adding a negative correction row (history is never edited)
create function public.reverse_transaction(p_id uuid) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare t public.transactions; new_id uuid;
begin
  select * into t from public.transactions where id = p_id and kind = 'contribution';
  if not found then raise exception 'Entry not found'; end if;
  insert into public.transactions (goal_id, amount_cents, kind, reverses_id, note, occurred_on)
  values (t.goal_id, -t.amount_cents, 'correction', t.id, 'Correction', t.occurred_on)
  returning id into new_id;
  return new_id;
end $$;

-- updated_at trigger
create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger goals_updated before update on public.goals for each row execute function public.set_updated_at();

-- Create a profile automatically on sign-up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, timezone)
  values (new.id, nullif(new.raw_user_meta_data->>'display_name',''),
          coalesce(nullif(new.raw_user_meta_data->>'timezone',''), 'UTC'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Row Level Security: users only ever see and change their own rows
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.transactions enable row level security;

create policy "profiles: read own" on public.profiles for select using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "goals: read own" on public.goals for select using (user_id = (select auth.uid()));
create policy "goals: insert own" on public.goals for insert with check (user_id = (select auth.uid()));
create policy "goals: update own" on public.goals for update
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "goals: delete own" on public.goals for delete using (user_id = (select auth.uid()));

create policy "transactions: read own" on public.transactions for select using (user_id = (select auth.uid()));
create policy "transactions: insert on own goals" on public.transactions for insert with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid()))
);
-- No update/delete policies on transactions: history is append-only.
