-- Schéma Pronoscup 2026 — comptes, pronostics privés, classement public.
--
-- À appliquer via le dashboard Supabase (SQL Editor) ou la CLI :
--   supabase db push
--
-- Sécurité : les pronostics sont STRICTEMENT privés (RLS « own row »). Le
-- classement n'expose que des agrégats (pseudo + points), jamais les pronostics.
-- L'unicité du compte est garantie par auth.users.email (fournisseur Google).

-- Profil public : pseudo unique affiché au classement.
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  pseudo     text unique not null,
  created_at timestamptz not null default now()
);

-- Pronostics privés (1 ligne par compte ; scores = DraftScoreMap verbatim).
create table if not exists public.predictions (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  scores     jsonb not null default '{}'::jsonb,
  version    int   not null default 1,
  updated_at timestamptz not null default now()
);

-- Classement (dénormalisé avec le pseudo) : écrit par le job CI, lu par tous.
create table if not exists public.leaderboard (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  pseudo     text not null,
  points     int  not null default 0,
  exact      int  not null default 0,
  outcome    int  not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles    enable row level security;
alter table public.predictions enable row level security;
alter table public.leaderboard enable row level security;

-- predictions : chacun ne lit/écrit QUE sa propre ligne.
drop policy if exists "pred own" on public.predictions;
create policy "pred own" on public.predictions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- profiles : lecture publique (pseudos du classement), écriture sur sa ligne.
drop policy if exists "prof read" on public.profiles;
create policy "prof read" on public.profiles for select using (true);
drop policy if exists "prof write" on public.profiles;
create policy "prof write" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- leaderboard : lecture publique. Aucune politique d'écriture → seul le
-- service_role (job CI, qui contourne la RLS) peut écrire.
drop policy if exists "lb read" on public.leaderboard;
create policy "lb read" on public.leaderboard for select using (true);
