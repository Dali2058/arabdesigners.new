-- Arab Designers Cloud schema
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null unique,
  username text not null unique,
  display_name text not null,
  avatar text,
  banner text,
  discord_banner text,
  bio text not null default '',
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.works (
  id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled project',
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  media_label text not null default 'Image',
  storage_path text not null,
  views bigint not null default 0,
  likes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_likes (
  work_id text not null references public.works(id) on delete cascade,
  discord_id text not null,
  created_at timestamptz not null default now(),
  primary key (work_id, discord_id)
);

create index if not exists works_profile_id_idx on public.works(profile_id);
create index if not exists works_updated_at_idx on public.works(updated_at desc);
create index if not exists work_likes_work_id_idx on public.work_likes(work_id);

grant select on public.profiles to anon, authenticated;
grant select on public.works to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.work_likes enable row level security;

-- Public read only. All mutations happen through the Edge Function using the secret key.
drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Public can read works" on public.works;
create policy "Public can read works"
on public.works for select
to anon, authenticated
using (true);

-- Remove direct write access from browser roles.
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.works from anon, authenticated;
revoke select, insert, update, delete on public.work_likes from anon, authenticated;

-- Public Storage bucket for published work. The files themselves are public;
-- mutation is controlled by signed upload URLs issued by the Edge Function.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'works',
  'works',
  true,
  31457280,
  array[
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/webm','video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Keep direct browser mutations locked down. Signed upload URLs are issued server-side.
drop policy if exists "Public can read work assets" on storage.objects;
create policy "Public can read work assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'works');

-- Helpful cleanup trigger for updated timestamps.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
before update on public.works
for each row execute function public.set_updated_at();
