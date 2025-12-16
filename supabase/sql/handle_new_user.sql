drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public as $$
declare
  v_username text;
begin
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  insert into public.profiles (id, email, username)
  values (new.id, new.email, v_username)
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(excluded.username, public.profiles.username);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
