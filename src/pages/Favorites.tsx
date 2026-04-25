import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DiscoverCard } from "@/components/DiscoverCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { fetchFavoritePlaylists } from "@/api/favorites";
import { DiscoverPlaylist } from "@/api/playlists";
import { toast } from "@/hooks/use-toast";

const Favorites = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<DiscoverPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    fetchFavoritePlaylists(user.id)
      .then((p) => {
        if (active) setPlaylists(p);
      })
      .catch((err: any) =>
        toast({
          title: "Couldn't load favorites",
          description: err.message,
          variant: "destructive",
        })
      )
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="container py-12 sm:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3 gap-2">
          <Link to="/discover">
            <ArrowLeft className="h-4 w-4" /> Back to discover
          </Link>
        </Button>

        <header className="flex flex-col gap-4 border-b hairline pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Heart className="h-3 w-3" /> Your collection
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">
              Favorites
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Playlists you've saved from across CINEBLEND.
            </p>
          </div>
          <div className="text-left text-xs uppercase tracking-widest text-muted-foreground sm:text-right">
            {playlists.length} {playlists.length === 1 ? "saved" : "saved"}
          </div>
        </header>

        <section className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl border hairline bg-elevated"
                />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 py-24 text-center">
              <Heart className="mb-4 h-6 w-6 text-muted-foreground" />
              <h2 className="font-display text-3xl tracking-tight">
                Nothing saved yet
              </h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Save public playlists from Discover to keep them close.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-6">
                <Link to="/discover">Browse discover</Link>
              </Button>
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

export default Favorites;
