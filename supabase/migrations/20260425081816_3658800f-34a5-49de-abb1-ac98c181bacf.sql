-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Playlists
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_emoji text default '🎬',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.playlists enable row level security;

create policy "Users can view their own playlists"
  on public.playlists for select to authenticated using (auth.uid() = user_id);

create policy "Users can create their own playlists"
  on public.playlists for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own playlists"
  on public.playlists for update to authenticated using (auth.uid() = user_id);

create policy "Users can delete their own playlists"
  on public.playlists for delete to authenticated using (auth.uid() = user_id);

create trigger playlists_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

create index playlists_user_id_idx on public.playlists(user_id);

-- Playlist movies
create table public.playlist_movies (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  title text not null,
  year int,
  poster_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.playlist_movies enable row level security;

create policy "Users can view movies in their playlists"
  on public.playlist_movies for select to authenticated
  using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

create policy "Users can add movies to their playlists"
  on public.playlist_movies for insert to authenticated
  with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

create policy "Users can update movies in their playlists"
  on public.playlist_movies for update to authenticated
  using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

create policy "Users can delete movies from their playlists"
  on public.playlist_movies for delete to authenticated
  using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

create index playlist_movies_playlist_id_idx on public.playlist_movies(playlist_id);