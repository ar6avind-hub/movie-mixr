ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favorite_genre text,
  ADD COLUMN IF NOT EXISTS avatar_emoji text;