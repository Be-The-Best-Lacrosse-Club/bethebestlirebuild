-- ─────────────────────────────────────────────────────────────────────────────
-- BTB Lacrosse — Supabase schema
--
-- Run this in the Supabase SQL editor (or `supabase db push`), then set
-- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as Netlify site env vars so
-- netlify/functions/playbook.js can reach the database. No Supabase key is
-- ever shipped to the browser.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── users ────────────────────────────────────────────────────────────────────
-- App-level profile row for every coach/player. The site signs users in
-- through Netlify Identity, so this table is keyed by that identity's UUID
-- rather than Supabase Auth. Rows are upserted lazily by the playbook
-- function the first time a coach saves a play.
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
-- RLS is enabled with NO policies, so the public anon key gets zero access to
-- these tables. All reads and writes go through netlify/functions/playbook.js,
-- which verifies the caller's Netlify Identity JWT and uses the service-role
-- key (the service role bypasses RLS). Never add `using (true)` policies here
-- — that would let anyone holding the site's anon key read or delete every
-- coach's plays. If the app later adopts Supabase Auth, add per-coach policies
-- instead, e.g.:
--   create policy "own plays" on public.playbook for all
--     using (auth.uid() = coach_id) with check (auth.uid() = coach_id);
alter table public.users    enable row level security;
alter table public.playbook enable row level security;
