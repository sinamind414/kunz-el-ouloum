-- ============================================================================
-- Kunz El Ouloum — Schéma Supabase (Auth + Télémétrie)
-- À exécuter dans le SQL Editor de ton projet Supabase.
-- ============================================================================

-- 1) Profils (miroir de auth.users, dénormalisé pour cache offline + wilaya)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  wilaya     text,
  created_at timestamptz default now()
);

-- 2) Events de télémétrie (lacunes pédagogiques + ouvertures)
create table if not exists public.telemetry_events (
  id         bigint generated always as identity primary key,
  user_id    text not null,
  event_name text not null,
  payload    jsonb not null default '{}'::jsonb,
  is_online  boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists telemetry_events_event_name_idx on public.telemetry_events(event_name);
create index if not exists telemetry_events_user_id_idx    on public.telemetry_events(user_id);
create index if not exists telemetry_events_created_at_idx on public.telemetry_events(created_at);

-- NOTE (audit Fable 5 - M1) : la table reste ouverte à l'insert anonyme pour préserver
-- la télémétrie offline-first des invités (telemetryService.ts insère avec un userId local
-- via le client anon, pas auth.uid()). MAIS l'insert est désormais durci par une whitelist
-- d'event_name + une borne de longueur user_id (policy plus bas) et des contraintes CHECK
-- anti-spam (taille payload, longueurs) pour limiter l'abus/DoS sans casser l'offline-first.

-- Contraintes anti-abus (idempotentes : s'appliquent aux tables déjà existantes).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'telemetry_user_id_len') then
    alter table public.telemetry_events
      add constraint telemetry_user_id_len check (char_length(user_id) between 3 and 128);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'telemetry_event_name_len') then
    alter table public.telemetry_events
      add constraint telemetry_event_name_len check (char_length(event_name) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'telemetry_payload_size') then
    alter table public.telemetry_events
      add constraint telemetry_payload_size check (octet_length(payload::text) <= 5000);
  end if;
end $$;

-- 3) Row Level Security
alter table public.profiles         enable row level security;
alter table public.telemetry_events enable row level security;

-- Profils : l'utilisateur gère sa propre ligne
drop policy if exists "profiles read own"   on public.profiles;
create policy "profiles read own"   on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);

-- Télémétrie : insert anonyme autorisé (buffer offline-first) MAIS restreint à une
-- whitelist d'event_name connus + une borne de longueur user_id (anti-spam).
-- Pas de SELECT pour anon (les stats globales seront lues côté serveur / service role).
drop policy if exists "telemetry insert anon" on public.telemetry_events;
create policy "telemetry insert anon" on public.telemetry_events
  for insert with check (
    event_name in (
      'APP_OPENED','METHOD_FAIL','METHOD_SUCCESS','PRO_TEASER_CLICKED',
      'GUEST_LOGIN_OFFLINE','QUIZ_COMPLETED','BOSS_COMPLETED','DOMAIN_SELECTED'
    )
    and char_length(user_id) between 3 and 128
  );

-- 4) Création automatique du profil à l'inscription Google
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
