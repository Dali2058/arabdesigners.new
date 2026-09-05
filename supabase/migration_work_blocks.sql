-- Arab Designers: Behance-style multi-block work editor.
create table if not exists public.work_blocks (
  id uuid primary key default gen_random_uuid(),
  work_id text not null references public.works(id) on delete cascade,
  block_type text not null check (block_type in ('image','video','audio','embed','text')),
  media_url text not null default '',
  storage_path text not null default '',
  content text not null default '',
  caption text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists work_blocks_work_id_idx on public.work_blocks(work_id);
alter table public.work_blocks enable row level security;
drop policy if exists "Public can read work blocks" on public.work_blocks;
create policy "Public can read work blocks" on public.work_blocks for select to anon, authenticated using (true);
revoke insert, update, delete on public.work_blocks from anon, authenticated;

-- Layout controls for Behance-style project composition.
alter table public.work_blocks add column if not exists layout text not null default 'full'
  check (layout in ('full','half'));
alter table public.work_blocks add column if not exists gap integer not null default 16;
