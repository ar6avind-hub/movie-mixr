import { supabase } from "@/integrations/supabase/client";

export type TmdbMovie = {
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  overview: string;
};

export type PlaylistMovie = {
  id: string;
  playlist_id: string;
  tmdb_id: number | null;
  title: string;
  year: number | null;
  poster_url: string | null;
  note: string | null;
  position: number;
  created_at: string;
};

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase.functions.invoke("tmdb-search", {
    method: "GET" as never, // GET with query string
    // supabase-js doesn't support query strings on invoke directly,
    // so we use a manual fetch path below.
  } as never);

  // Fallback to manual fetch (more reliable for query strings)
  if (data || error) {
    if (error) throw error;
    return data?.results ?? [];
  }
  return [];
}

// Manual fetch — handles query strings cleanly.
export async function searchMoviesFetch(query: string): Promise<TmdbMovie[]> {
  if (!query.trim()) return [];
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `https://${projectId}.supabase.co/functions/v1/tmdb-search?q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search failed: ${body}`);
  }
  const data = await res.json();
  return data.results ?? [];
}

export async function fetchPlaylistMovies(playlistId: string): Promise<PlaylistMovie[]> {
  const { data, error } = await supabase
    .from("playlist_movies")
    .select("*")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PlaylistMovie[];
}

export async function addMovieToPlaylist(input: {
  playlist_id: string;
  movie: TmdbMovie;
  note: string;
  position: number;
}): Promise<PlaylistMovie> {
  const { data, error } = await supabase
    .from("playlist_movies")
    .insert({
      playlist_id: input.playlist_id,
      tmdb_id: input.movie.tmdb_id,
      title: input.movie.title,
      year: input.movie.year,
      poster_url: input.movie.poster_url,
      note: input.note.trim() || null,
      position: input.position,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PlaylistMovie;
}

export async function removeMovieFromPlaylist(id: string): Promise<void> {
  const { error } = await supabase.from("playlist_movies").delete().eq("id", id);
  if (error) throw error;
}
