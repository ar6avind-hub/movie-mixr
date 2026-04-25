import { supabase } from "@/integrations/supabase/client";

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_emoji: string | null;
  created_at: string;
  updated_at: string;
  movie_count?: number;
};

export async function fetchPlaylists(userId: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*, playlist_movies(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    ...p,
    movie_count: p.playlist_movies?.[0]?.count ?? 0,
  }));
}

export async function createPlaylist(input: {
  user_id: string;
  name: string;
  description?: string;
  cover_emoji?: string;
}): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: input.user_id,
      name: input.name,
      description: input.description ?? null,
      cover_emoji: input.cover_emoji ?? "🎬",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Playlist;
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) throw error;
}
