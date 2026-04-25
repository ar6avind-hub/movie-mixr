import { useEffect, useState } from "react";
import { Compass, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DiscoverCard } from "@/components/DiscoverCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DiscoverPlaylist,
  DiscoverSort,
  fetchPublicPlaylists,
} from "@/api/playlists";
import { GENRES } from "@/lib/genres";
import { toast } from "@/hooks/use-toast";

const Discover = () => {
  const [playlists, setPlaylists] = useState<DiscoverPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genre, setGenre] = useState<string | "all">("all");
  const [sort, setSort] = useState<DiscoverSort>("newest");

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchPublicPlaylists({
          search: debouncedSearch,
          genre: genre === "all" ? null : genre,
          sort,
        });
        if (active) setPlaylists(data);
      } catch (err: any) {
        if (active) {
          toast({
            title: "Couldn't load",
            description: err.message,
            variant: "destructive",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedSearch, genre, sort]);

  const empty = !loading && playlists.length === 0;

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="container py-12 sm:py-16">
        <header className="space-y-3 border-b hairline pb-10">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Compass className="h-3 w-3" /> Discover
          </p>
          <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
            Public <span className="italic">collections</span>
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Wander through playlists shared by other film lovers.
          </p>
        </header>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={genre} onValueChange={(v) => setGenre(v as string)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as DiscoverSort)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most_movies">Most films</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <section className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl border hairline bg-elevated"
                />
              ))}
            </div>
          ) : empty ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 py-24 text-center">
              <Compass
                className="h-8 w-8 text-muted-foreground"
                strokeWidth={1.25}
              />
              <h2 className="mt-6 font-display text-3xl tracking-tight">
                Nothing here yet
              </h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Try a different search, or be the first to share a public playlist.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p) => (
                <DiscoverCard key={p.id} playlist={p} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Discover;
