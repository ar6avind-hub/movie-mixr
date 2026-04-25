import { supabase } from "@/integrations/supabase/client";

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_emoji: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  movie_count?: number;
};

export type PlaylistWithOwner = Playlist & {
  owner_display_name: string | null;
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

export async function fetchPlaylist(id: string): Promise<PlaylistWithOwner | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.user_id)
    .maybeSingle();

  return { ...(data as Playlist), owner_display_name: profile?.display_name ?? null };
}

export async function createPlaylist(input: {
  user_id: string;
  name: string;
  description?: string;
  cover_emoji?: string;
  is_public?: boolean;
}): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: input.user_id,
      name: input.name,
      description: input.description ?? null,
      cover_emoji: input.cover_emoji ?? "🎬",
      is_public: input.is_public ?? false,
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
