-- Remove orphan rows referencing missing playlists
DELETE FROM public.playlist_views WHERE playlist_id NOT IN (SELECT id FROM public.playlists);
DELETE FROM public.playlist_favorites WHERE playlist_id NOT IN (SELECT id FROM public.playlists);
DELETE FROM public.playlist_movies WHERE playlist_id NOT IN (SELECT id FROM public.playlists);

ALTER TABLE public.playlist_movies DROP CONSTRAINT IF EXISTS playlist_movies_playlist_id_fkey;
ALTER TABLE public.playlist_movies
  ADD CONSTRAINT playlist_movies_playlist_id_fkey
  FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON DELETE CASCADE;

ALTER TABLE public.playlist_views DROP CONSTRAINT IF EXISTS playlist_views_playlist_id_fkey;
ALTER TABLE public.playlist_views
  ADD CONSTRAINT playlist_views_playlist_id_fkey
  FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON DELETE CASCADE;

ALTER TABLE public.playlist_favorites DROP CONSTRAINT IF EXISTS playlist_favorites_playlist_id_fkey;
ALTER TABLE public.playlist_favorites
  ADD CONSTRAINT playlist_favorites_playlist_id_fkey
  FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON DELETE CASCADE;