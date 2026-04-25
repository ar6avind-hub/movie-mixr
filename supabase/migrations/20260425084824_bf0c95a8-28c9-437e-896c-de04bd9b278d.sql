-- Add bio
alter table public.profiles
  add column if not exists bio text;

-- Helper: slugify a string into a username candidate
create or replace function public.slugify_username(input text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  s text;
begin
  s := lower(coalesce(input, ''));
  s := regexp_replace(s, '[^a-z0-9]+', '_', 'g');
  s := regexp_replace(s, '^_+|_+$', '', 'g');
  if s = '' then
    s := 'user';
  end if;
  return left(s, 24);
end;
$$;

-- Backfill missing usernames before adding the unique constraint
do $$
declare
  r record;
  base text;
  candidate text;
  n int;
begin
  for r in
    select p.id, p.display_name, u.email
    from public.profiles p
    left join auth.users u on u.id = p.id
    where p.username is null or p.username = ''
  loop
    base := public.slugify_username(
      coalesce(nullif(r.display_name, ''), split_part(r.email, '@', 1), 'user')
    );
    candidate := base;
    n := 1;
    while exists (select 1 from public.profiles where username = candidate) loop
      n := n + 1;
      candidate := base || n::text;
    end loop;
    update public.profiles set username = candidate where id = r.id;
  end loop;
end$$;

-- Now enforce required + unique
alter table public.profiles
  alter column username set not null;

create unique index if not exists profiles_username_key
  on public.profiles (lower(username));

-- Update the new-user trigger to generate a username automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  base := public.slugify_username(
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      split_part(new.email, '@', 1),
      'user'
    )
  );
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Make sure the trigger exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();