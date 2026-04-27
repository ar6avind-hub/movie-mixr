import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Globe, Lock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { MovieCard } from "@/components/MovieCard";
import { AddMovieDialog } from "@/components/AddMovieDialog";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  fetchPlaylist,
  PlaylistWithOwner,
  recordPlaylistView,
} from "@/api/playlists";
import {
  addMovieToPlaylist,
  fetchPlaylistMovies,
  PlaylistMovie,
  removeMovieFromPlaylist,
  TmdbMovie,
} from "@/api/movies";
import { getViewerKey } from "@/lib/viewer";
import { toast } from "@/hooks/use-toast";

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistWithOwner | null>(null);
  const [movies, setMovies] = useState<PlaylistMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwner = !!(user && playlist && user.id === playlist.user_id);

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      try {
        const p = await fetchPlaylist(id);
        if (!active) return;
        if (!p) {
          setNotFound(true);
          return;
        }
        setPlaylist(p);
        const m = await fetchPlaylistMovies(id);
        if (!active) return;
        setMovies(m);

        // Fire-and-forget view tracking. Server enforces dedupe + public-only.
        if (p.is_public) {
          const viewerKey = getViewerKey(user?.id ?? null);
          recordPlaylistView(p.id, viewerKey).then((next) => {
            if (!active || next == null) return;
            setPlaylist((cur) =>
              cur ? { ...cur, view_count: next } : cur
            );
          });
        }
      } catch (err: any) {
        toast({
          title: "Couldn't load playlist",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // user?.id is intentionally a dep so re-records correctly after sign-in
  }, [id, user?.id]);

  const handleAdd = async (movie: TmdbMovie, note: string) => {
    if (!playlist) return;
    const created = await addMovieToPlaylist({
      playlist_id: playlist.id,
      movie,
      note,
      position: movies.length,
    });
    setMovies((m) => [...m, created]);
    toast({ title: "Film added" });
  };

  const handleRemove = async (movieId: string) => {
    const prev = movies;
    setMovies((m) => m.filter((x) => x.id !== movieId));
    try {
      await removeMovieFromPlaylist(movieId);
      toast({ title: "Film removed" });
    } catch (err: any) {
      setMovies(prev);
      toast({
        title: "Couldn't remove",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="container py-8 sm:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 gap-2 sm:mb-8 sm:-ml-3">
          <Link to={user ? "/dashboard" : "/"}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        {loading ? (
          <div className="space-y-8">
            <div className="h-40 skeleton rounded-xl border hairline" />
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 skeleton rounded-xl border hairline"
                />
              ))}
            </div>
          </div>
        ) : notFound || !playlist ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 px-6 py-16 text-center sm:py-24">
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Not here</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              This playlist doesn't exist or isn't shared.
            </p>
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-6 border-b hairline pb-8 sm:gap-8 sm:pb-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border hairline bg-background/50 text-3xl sm:h-24 sm:w-24 sm:text-5xl">
                  {playlist.cover_emoji ?? "🎬"}
                </div>
                <div className="min-w-0 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                    {playlist.is_public ? (
                      <>
                        <Globe className="h-3 w-3" /> Public playlist
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Private
                      </>
                    )}
                  </div>
                  <h1 className="font-display text-3xl leading-tight tracking-tight text-balance sm:text-6xl sm:leading-none">
                    {playlist.name}
                  </h1>
                  {playlist.description && (
                    <p className="max-w-xl text-sm text-muted-foreground">
                      {playlist.description}
                    </p>
                  )}
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                    by{" "}
                    {playlist.owner_username ? (
                      <Link
                        to={`/user/${playlist.owner_username}`}
                        className="text-foreground/80 underline-offset-4 transition-smooth hover:text-foreground hover:underline"
                      >
                        {playlist.owner_display_name ?? playlist.owner_username}
                      </Link>
                    ) : (
                      <span className="text-foreground/80">
                        {playlist.owner_display_name ?? "anonymous"}
                      </span>
                    )}
                    {" · "}
                    {movies.length} {movies.length === 1 ? "film" : "films"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {playlist.is_public && (
                  <ShareButton
                    title={playlist.name}
                    description={playlist.description}
                  />
                )}
                {!isOwner && (
                  <FavoriteButton
                    playlistId={playlist.id}
                    ownerId={playlist.user_id}
                    isPublic={playlist.is_public}
                  />
                )}
                {isOwner && <AddMovieDialog onAdd={handleAdd} />}
              </div>
            </header>

            <section className="mt-8 sm:mt-10">
              {movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 px-6 py-16 text-center sm:py-20">
                  <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                    No films yet
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    {isOwner
                      ? "Add the first film to begin this collection."
                      : "The owner hasn't added any films yet."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {movies.map((m) => (
                    <MovieCard
                      key={m.id}
                      movie={m}
                      canEdit={isOwner}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PlaylistDetail;
