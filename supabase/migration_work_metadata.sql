alter table public.works add column if not exists category text;
alter table public.works add column if not exists tags text[] not null default '{}';
alter table public.works add column if not exists tools text;
