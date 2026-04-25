alter table public.playlists
  add column if not exists genre text;

create index if not exists playlists_is_public_genre_idx
  on public.playlists (is_public, genre)
  where is_public = true;