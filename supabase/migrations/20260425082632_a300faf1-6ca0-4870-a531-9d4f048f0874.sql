-- Add public flag to playlists
alter table public.playlists
  add column if not exists is_public boolean not null default false;

-- Add note + tmdb_id to playlist_movies
alter table public.playlist_movies
  add column if not exists note text,
  add column if not exists tmdb_id integer;

-- Update RLS: allow public viewing of public playlists
drop policy if exists "Users can view their own playlists" on public.playlists;

create policy "View own or public playlists"
  on public.playlists for select
  to anon, authenticated
  using (is_public = true or auth.uid() = user_id);

-- Update RLS: allow public viewing of movies in public playlists
drop policy if exists "Users can view movies in their playlists" on public.playlist_movies;

create policy "View movies in own or public playlists"
  on public.playlist_movies for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id
        and (p.is_public = true or p.user_id = auth.uid())
    )
  );

-- Allow public viewing of profiles for owner display
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);