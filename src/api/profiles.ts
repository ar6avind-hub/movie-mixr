import { supabase } from "@/integrations/supabase/client";
import { DiscoverPlaylist } from "./playlists";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
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

export async function fetchPublicPlaylistsForUser(
  userId: string
): Promise<DiscoverPlaylist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*, playlist_movies(count)")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    ...p,
    movie_count: p.playlist_movies?.[0]?.count ?? 0,
    owner_display_name: null,
    owner_username: null,
  })) as DiscoverPlaylist[];
}
