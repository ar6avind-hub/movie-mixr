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

      <main className="container py-8 sm:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 gap-2 sm:mb-8 sm:-ml-3">
          <Link to="/discover">
            <ArrowLeft className="h-4 w-4" /> Back to discover
          </Link>
        </Button>

        <header className="flex flex-col gap-4 border-b hairline pb-8 sm:pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              <Heart className="h-3 w-3" /> Your collection
            </p>
            <h1 className="font-display text-4xl leading-none tracking-tight sm:text-6xl">
              Favorites
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Playlists you've saved from across CINEBLEND.
            </p>
          </div>
          <div className="text-left text-[10px] uppercase tracking-widest text-muted-foreground sm:text-right sm:text-xs">
            {playlists.length} {playlists.length === 1 ? "saved" : "saved"}
          </div>
        </header>

        <section className="mt-8 sm:mt-10">
          {loading ? (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 skeleton rounded-xl border hairline sm:h-56"
                />
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed hairline bg-elevated/40 px-6 py-16 text-center sm:py-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border hairline bg-background/50">
                <Heart className="h-6 w-6 text-muted-foreground" strokeWidth={1.25} />
              </div>
              <h2 className="mt-6 font-display text-2xl tracking-tight sm:text-3xl">
                Nothing saved yet
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Wander through Discover and tap the heart on any playlist to keep it
                close. Your collection lives here.
              </p>
              <Button asChild size="lg" className="mt-7">
                <Link to="/discover">Explore Discover</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
