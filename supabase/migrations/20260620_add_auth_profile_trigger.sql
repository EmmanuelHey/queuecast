-- Ensure every Supabase Auth user has a matching public.profiles row.
-- Run this once in the Supabase SQL Editor before enabling report writes.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill accounts created before this trigger was installed.
insert into public.profiles (id, display_name)
select
  auth_user.id,
  coalesce(
    auth_user.raw_user_meta_data ->> 'display_name',
    split_part(auth_user.email, '@', 1)
  )
from auth.users as auth_user
on conflict (id) do nothing;
