-- ─────────────────────────────────────────────────────────────────────────────
-- BTB Lacrosse — Supabase schema
--
-- Run this in the Supabase SQL editor (or `supabase db push`) for the project
-- referenced by VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── users ────────────────────────────────────────────────────────────────────
-- App-level profile row for every coach/player. The site currently signs users
-- in through Netlify Identity, so this table is keyed by that identity's UUID
-- rather than Supabase Auth. Rows are upserted lazily by the client the first
-- time a coach saves a play.
create table if not exists public.users (
  id         uuid primary key,
  email      text not null,
  full_name  text,
  role       text not null default 'coach' check (role in ('player', 'coach', 'owner')),
  created_at timestamptz not null default now()
);

-- ── playbook ─────────────────────────────────────────────────────────────────
-- One row per saved whiteboard play. `canvas_state` stores the full Konva
-- scene as JSON: { "players": PlayerToken[], "lines": DrawnLine[] } — see
-- src/lib/playbookStore.ts for the exact shape.
create table if not exists public.playbook (
  id           uuid primary key default gen_random_uuid(),
  coach_id     uuid not null references public.users (id) on delete cascade,
  title        text not null,
  canvas_state jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists playbook_coach_id_created_at_idx
  on public.playbook (coach_id, created_at desc);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.users    enable row level security;
alter table public.playbook enable row level security;

-- The SPA authenticates via Netlify Identity, not Supabase Auth, so requests
-- arrive under the `anon` role. These policies allow the anon key to read and
-- write; scoping to a single coach happens in the client (coach_id filter).
-- If the site later moves to Supabase Auth, replace these with policies that
-- check `auth.uid() = coach_id` / `auth.uid() = id`.
drop policy if exists "users upsert via anon key" on public.users;
create policy "users upsert via anon key"
  on public.users for all
  using (true)
  with check (true);

drop policy if exists "playbook crud via anon key" on public.playbook;
create policy "playbook crud via anon key"
  on public.playbook for all
  using (true)
  with check (true);
