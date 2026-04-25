// TMDb movie search proxy — keeps the API token server-side.
import { corsHeaders } from "../_shared/cors.ts";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const query = (url.searchParams.get("q") ?? "").trim();
    if (!query) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TMDb v4 read-access tokens start with "eyJ" (JWT). v3 keys are 32 hex chars.
    const isV4 = TMDB_API_KEY.startsWith("eyJ");
    const tmdbUrl = new URL("https://api.themoviedb.org/3/search/movie");
    tmdbUrl.searchParams.set("query", query);
    tmdbUrl.searchParams.set("include_adult", "false");
    tmdbUrl.searchParams.set("language", "en-US");
    tmdbUrl.searchParams.set("page", "1");
    if (!isV4) tmdbUrl.searchParams.set("api_key", TMDB_API_KEY);

    const tmdbRes = await fetch(tmdbUrl.toString(), {
      headers: isV4
        ? { Authorization: `Bearer ${TMDB_API_KEY}`, accept: "application/json" }
        : { accept: "application/json" },
    });

    if (!tmdbRes.ok) {
      const body = await tmdbRes.text();
      throw new Error(`TMDb error [${tmdbRes.status}]: ${body}`);
    }

    const data = await tmdbRes.json();
    const results = (data.results ?? []).slice(0, 12).map((m: any) => ({
      tmdb_id: m.id,
      title: m.title,
      year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
      poster_url: m.poster_path
        ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
        : null,
      overview: m.overview ?? "",
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("tmdb-search error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
