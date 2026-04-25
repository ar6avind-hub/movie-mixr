CREATE TABLE public.playlist_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, playlist_id)
);

CREATE INDEX idx_playlist_favorites_user ON public.playlist_favorites(user_id);
CREATE INDEX idx_playlist_favorites_playlist ON public.playlist_favorites(playlist_id);

ALTER TABLE public.playlist_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.playlist_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can favorite accessible playlists"
  ON public.playlist_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_favorites.playlist_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can remove their own favorites"
  ON public.playlist_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);