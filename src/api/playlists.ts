import { supabase } from "@/integrations/supabase/client";

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_emoji: string | null;
  is_public: boolean;
  genre: string | null;
  created_at: string;
  updated_at: string;
  movie_count?: number;
};

export type PlaylistWithOwner = Playlist & {
  owner_display_name: string | null;
};

export type DiscoverSort = "newest" | "most_movies";

export type DiscoverPlaylist = Playlist & {
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
  genre?: string | null;
}): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: input.user_id,
      name: input.name,
      description: input.description ?? null,
      cover_emoji: input.cover_emoji ?? "🎬",
      is_public: input.is_public ?? false,
      genre: input.genre ?? null,
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

// Discover: fetch all public playlists with movie counts and owner names.
export async function fetchPublicPlaylists(opts: {
  search?: string;
  genre?: string | null;
  sort?: DiscoverSort;
}): Promise<DiscoverPlaylist[]> {
  let query = supabase
    .from("playlists")
    .select("*, playlist_movies(count)")
    .eq("is_public", true);

  if (opts.search?.trim()) {
    query = query.ilike("name", `%${opts.search.trim()}%`);
  }
  if (opts.genre) {
    query = query.eq("genre", opts.genre);
  }
  // "most_movies" can't be sorted server-side via the count alias reliably,
  // so we always fetch by created_at and sort in-memory when needed.
  query = query.order("created_at", { ascending: false }).limit(200);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []).map((p: any) => ({
    ...p,
    movie_count: p.playlist_movies?.[0]?.count ?? 0,
  })) as (Playlist & { movie_count: number })[];

  // Fetch owner display names in one query.
  const ownerIds = Array.from(new Set(rows.map((r) => r.user_id)));
  let ownerMap = new Map<string, string | null>();
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);
    ownerMap = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]));
  }

  const enriched: DiscoverPlaylist[] = rows.map((r) => ({
    ...r,
    owner_display_name: ownerMap.get(r.user_id) ?? null,
  }));

  if (opts.sort === "most_movies") {
    enriched.sort((a, b) => (b.movie_count ?? 0) - (a.movie_count ?? 0));
  }

  return enriched;
}
