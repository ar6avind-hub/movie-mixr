-- 1. Add view_count to playlists
ALTER TABLE public.playlists
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- 2. Create the views log
CREATE TABLE IF NOT EXISTS public.playlist_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL,
  viewer_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS playlist_views_lookup_idx
  ON public.playlist_views (playlist_id, viewer_key, created_at DESC);

ALTER TABLE public.playlist_views ENABLE ROW LEVEL SECURITY;

-- No direct read/write access to the log — only via the RPC below.
-- (Intentionally no policies = deny all for client SQL.)

-- 3. RPC to record a view safely
CREATE OR REPLACE FUNCTION public.record_playlist_view(
  _playlist_id uuid,
  _viewer_key text
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_pub boolean;
  recent_exists boolean;
  new_count integer;
BEGIN
  IF _viewer_key IS NULL OR length(trim(_viewer_key)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT is_public INTO is_pub
  FROM public.playlists
  WHERE id = _playlist_id;

  IF is_pub IS NULL THEN
    RETURN NULL; -- playlist doesn't exist
  END IF;

  IF is_pub = false THEN
    -- Don't count views on private playlists
    SELECT view_count INTO new_count FROM public.playlists WHERE id = _playlist_id;
    RETURN new_count;
  END IF;

  -- Dedupe: skip if the same viewer logged a view within the last 30 minutes
  SELECT EXISTS (
    SELECT 1 FROM public.playlist_views
    WHERE playlist_id = _playlist_id
      AND viewer_key = _viewer_key
      AND created_at > now() - interval '30 minutes'
  ) INTO recent_exists;

  IF recent_exists THEN
    SELECT view_count INTO new_count FROM public.playlists WHERE id = _playlist_id;
    RETURN new_count;
  END IF;

  INSERT INTO public.playlist_views (playlist_id, viewer_key)
  VALUES (_playlist_id, _viewer_key);

  UPDATE public.playlists
  SET view_count = view_count + 1
  WHERE id = _playlist_id
  RETURNING view_count INTO new_count;

  RETURN new_count;
END;
$$;

-- Allow anon + authenticated to invoke the RPC
GRANT EXECUTE ON FUNCTION public.record_playlist_view(uuid, text) TO anon, authenticated;