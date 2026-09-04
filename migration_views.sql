-- Run after schema.sql.
create or replace function public.increment_work_view(p_work_id text)
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.works
  set views = views + 1
  where id = p_work_id
  returning views;
$$;

revoke all on function public.increment_work_view(text) from public;
grant execute on function public.increment_work_view(text) to anon, authenticated;
