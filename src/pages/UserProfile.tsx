import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AtSign, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DiscoverCard } from "@/components/DiscoverCard";
import { Button } from "@/components/ui/button";
import {
  fetchProfileByUsername,
  fetchPublicPlaylistsForUser,
  Profile,
} from "@/api/profiles";
import { DiscoverPlaylist } from "@/api/playlists";
import { toast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playlists, setPlaylists] = useState<DiscoverPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    let active = true;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const p = await fetchProfileByUsername(username);
        if (!active) return;
        if (!p) {
          setNotFound(true);
          return;
        }
        setProfile(p);
        const pls = await fetchPublicPlaylistsForUser(p.id);
        if (!active) return;
        setPlaylists(pls);
      } catch (err: any) {
        toast({
          title: "Couldn't load profile",
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
  }, [username]);

  const initials = (profile?.display_name ?? profile?.username ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="container py-12 sm:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3 gap-2">
          <Link to="/discover">
            <ArrowLeft className="h-4 w-4" /> Back to discover
          </Link>
        </Button>

        {loading ? (
          <div className="space-y-10">
            <div className="h-40 animate-pulse rounded-xl border hairline bg-elevated" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl border hairline bg-elevated"
                />
              ))}
            </div>
          </div>
        ) : notFound || !profile ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 py-24 text-center">
            <h2 className="font-display text-3xl tracking-tight">No such user</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              We couldn't find anyone with that username.
            </p>
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-8 border-b hairline pb-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border hairline bg-background/50 font-display text-4xl">
                  {initials}
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <AtSign className="h-3 w-3" />
                    {profile.username}
                  </p>
                  <h1 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">
                    {profile.display_name ?? profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="max-w-xl text-sm text-muted-foreground">
                      {profile.bio}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs uppercase tracking-widest text-muted-foreground">
                {playlists.length}{" "}
                {playlists.length === 1 ? "playlist" : "playlists"}
              </div>
            </header>

            <section className="mt-10">
              {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 py-20 text-center">
                  <h2 className="font-display text-3xl tracking-tight">
                    Nothing public yet
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    {profile.display_name ?? profile.username} hasn't shared any
                    playlists.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((p) => (
                    <DiscoverCard key={p.id} playlist={p} showOwner={false} />
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

export default UserProfile;
