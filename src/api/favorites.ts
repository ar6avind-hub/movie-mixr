import { supabase } from "@/integrations/supabase/client";
import { DiscoverPlaylist, Playlist } from "./playlists";

export async function fetchFavoriteIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("playlist_favorites")
    .select("playlist_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data ?? []).map((r: any) => r.playlist_id));
}

export async function isFavorite(
  userId: string,
  playlistId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("playlist_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("playlist_id", playlistId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function addFavorite(userId: string, playlistId: string) {
  const { error } = await supabase
    .from("playlist_favorites")
    .insert({ user_id: userId, playlist_id: playlistId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, playlistId: string) {
  const { error } = await supabase
    .from("playlist_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("playlist_id", playlistId);
  if (error) throw error;
}

// Fetch all playlists favorited by a user, hydrated with movie counts and owners.
export async function fetchFavoritePlaylists(
  userId: string
): Promise<DiscoverPlaylist[]> {
  const { data, error } = await supabase
    .from("playlist_favorites")
    .select("created_at, playlists:playlist_id(*, playlist_movies(count))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? [])
    .map((row: any) => row.playlists)
    .filter(Boolean)
    .map((p: any) => ({
      ...(p as Playlist),
      movie_count: p.playlist_movies?.[0]?.count ?? 0,
    })) as (Playlist & { movie_count: number })[];

  const ownerIds = Array.from(new Set(rows.map((r) => r.user_id)));
  let ownerMap = new Map<
    string,
    { display_name: string | null; username: string | null }
  >();

  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .in("id", ownerIds);
    ownerMap = new Map(
      (profiles ?? []).map((p: any) => [
        p.id,
        { display_name: p.display_name, username: p.username },
      ])
    );
  }

  return rows.map((r) => ({
    ...r,
    owner_display_name: ownerMap.get(r.user_id)?.display_name ?? null,
    owner_username: ownerMap.get(r.user_id)?.username ?? null,
  }));
}
