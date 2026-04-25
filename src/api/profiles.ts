import { supabase } from "@/integrations/supabase/client";
import { DiscoverPlaylist } from "./playlists";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  favorite_genre: string | null;
  avatar_emoji: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchProfileByUsername(
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function fetchPlaylistsForUser(
  userId: string,
  opts: { includePrivate?: boolean } = {}
): Promise<DiscoverPlaylist[]> {
  let query = supabase
    .from("playlists")
    .select("*, playlist_movies(count)")
    .eq("user_id", userId);

  if (!opts.includePrivate) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    ...p,
    movie_count: p.playlist_movies?.[0]?.count ?? 0,
    owner_display_name: null,
    owner_username: null,
  })) as DiscoverPlaylist[];
}

export type ProfileUpdate = {
  display_name?: string | null;
  bio?: string | null;
  favorite_genre?: string | null;
  avatar_emoji?: string | null;
};

export async function updateProfile(
  userId: string,
  patch: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Profile;
}
