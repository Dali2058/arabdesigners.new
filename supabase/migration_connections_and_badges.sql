-- Adds storage for auto-detected Discord connections (YouTube, X/Twitter, Twitch, etc.)
-- and for the manually-granted admin badges (Early Supporter, Booster, Partner).
-- Run this once in Supabase SQL Editor after schema.sql.

alter table public.profiles
  add column if not exists connections jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists badges jsonb not null default '[]'::jsonb;
-- badges holds any of: 'early_supporter', 'booster', 'partner'
-- ('verified' and 'staff' keep using the existing verified/role columns)

-- No RLS/grant changes needed: profiles is already public-read via the existing
-- "Public can read profiles" policy, and all writes go through the Edge Function
-- using the service key (see supabase/functions/arab-designers-api/index.ts).
