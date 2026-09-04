-- Arab Designers admin/verification migration. Run after schema.sql.
alter table public.profiles add column if not exists role text not null default 'designer';
alter table public.profiles add column if not exists verified boolean not null default false;
update public.profiles set role='admin', verified=true where username='i.ixi.';
create index if not exists profiles_role_idx on public.profiles(role);
