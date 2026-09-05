-- Arab Designers: re-enable designer-uploaded portfolio work, add embeds,
-- per-work comments, manual ordering, and profile view counts.
-- Run once in Supabase SQL Editor, AFTER schema.sql, migration_admin.sql,
-- migration_connections_and_badges.sql and migration_views.sql already exist.
-- Then redeploy the arab-designers-api Edge Function.

-- 1) Allow embeds in addition to image/video, plus a caption and manual order.
alter table public.works drop constraint if exists works_media_type_check;
alter table public.works add constraint works_media_type_check
  check (media_type in ('image','video','embed'));

alter table public.works add column if not exists description text not null default '';
alter table public.works add column if not exists position integer not null default 0;

-- Backfill a stable order for any rows that already exist.
with ordered as (
  select id, row_number() over (partition by profile_id order by created_at asc) - 1 as rn
  from public.works
)
update public.works w set position = ordered.rn
from ordered where ordered.id = w.id and w.position = 0;

-- 2) Comments, one per work.
create table if not exists public.work_comments (
  id uuid primary key default gen_random_uuid(),
  work_id text not null references public.works(id) on delete cascade,
  discord_id text not null,
  username text not null,
  display_name text not null,
  avatar text,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists work_comments_work_id_idx on public.work_comments(work_id);

grant select on public.work_comments to anon, authenticated;
alter table public.work_comments enable row level security;

drop policy if exists "Public can read work comments" on public.work_comments;
create policy "Public can read work comments"
on public.work_comments for select
to anon, authenticated
using (true);

-- All writes happen through the Edge Function using the service key.
revoke insert, update, delete on public.work_comments from anon, authenticated;

-- 3) Profile view counter (separate from per-work views, which already exist).
alter table public.profiles add column if not exists views bigint not null default 0;

create or replace function public.increment_profile_view(p_username text)
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set views = views + 1
  where username = p_username
  returning views;
$$;

revoke all on function public.increment_profile_view(text) from public;
grant execute on function public.increment_profile_view(text) to anon, authenticated;
