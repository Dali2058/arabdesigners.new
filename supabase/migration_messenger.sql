-- Arab Designers Messenger
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null,
  receiver_id text not null,
  content text not null default '',
  attachment_url text,
  attachment_type text,
  attachment_name text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_sender_receiver_idx on public.messages(sender_id, receiver_id, created_at);
create index if not exists messages_receiver_read_idx on public.messages(receiver_id, read_at);

alter table public.messages enable row level security;
drop policy if exists "Public can read messages" on public.messages;
revoke all on public.messages from anon, authenticated;

insert into storage.buckets (id,name,public,file_size_limit)
values ('chat','chat',true,52428800)
on conflict (id) do update set public=true,file_size_limit=52428800;
drop policy if exists "Public can read chat assets" on storage.objects;
create policy "Public can read chat assets" on storage.objects for select to anon, authenticated using (bucket_id='chat');
