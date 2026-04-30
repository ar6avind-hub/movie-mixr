import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { PlaylistCard } from "@/components/PlaylistCard";
import { CreatePlaylistDialog } from "@/components/CreatePlaylistDialog";
import { createPlaylist, deletePlaylist, fetchPlaylists, Playlist } from "@/api/playlists";
import { toast } from "@/hooks/use-toast";
import { Film, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_IDEAS = [
  { emoji: "🌙", title: "Late night noir", hint: "Rain-soaked streets, smoke & shadow" },
  { emoji: "🍿", title: "Comfort rewatches", hint: "Films you return to like an old friend" },
  { emoji: "🌌", title: "Mind-benders", hint: "Stories that stay with you for weeks" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    try {
      const data = await fetchPlaylists(user.id);
      setPlaylists(data);
    } catch (err: any) {
      toast({ title: "Couldn't load playlists", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async (data: {
    name: string;
    description: string;
    cover_emoji: string;
    is_public: boolean;
    genre: string | null;
  }) => {
    if (!user) return;
    try {
      const created = await createPlaylist({
        user_id: user.id,
        name: data.name,
        description: data.description,
        cover_emoji: data.cover_emoji,
        is_public: data.is_public,
        genre: data.genre,
      });
      setPlaylists((p) => [{ ...created, movie_count: 0 }, ...p]);
      toast({ title: "Playlist created" });
    } catch (err: any) {
      toast({ title: "Couldn't create", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const prev = playlists;
    setPlaylists((p) => p.filter((x) => x.id !== id));
    try {
      await deletePlaylist(id);
      toast({ title: "Playlist deleted" });
    } catch (err: any) {
      setPlaylists(prev);
      toast({ title: "Couldn't delete", description: err.message, variant: "destructive" });
    }
  };

  const greeting =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="container py-8 sm:py-16">
        <div className="flex flex-col gap-6 border-b hairline pb-8 sm:pb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              Your library
            </p>
            <h1 className="font-display text-4xl tracking-tight sm:text-6xl">
              Hello, <span className="italic">{greeting}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {playlists.length === 0
                ? "Begin with your first playlist."
                : `${playlists.length} ${playlists.length === 1 ? "playlist" : "playlists"}`}
            </p>
          </div>
          <CreatePlaylistDialog onCreate={handleCreate} />
        </div>

        <section className="mt-8 sm:mt-12">
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
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 px-6 py-16 text-center sm:py-24">
              <Film className="h-8 w-8 text-muted-foreground" strokeWidth={1.25} />
              <h2 className="mt-6 font-display text-2xl tracking-tight sm:text-3xl">An empty shelf</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Create your first playlist to start collecting the films you love.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p) => (
                <PlaylistCard key={p.id} playlist={p} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
