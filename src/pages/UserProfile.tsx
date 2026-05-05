import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AtSign, Calendar, Film, Lock, Pencil, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DiscoverCard } from "@/components/DiscoverCard";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import {
  fetchPlaylistsForUser,
  fetchProfileByUsername,
  Profile,
  ProfileUpdate,
  updateProfile,
} from "@/api/profiles";
import { DiscoverPlaylist } from "@/api/playlists";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playlists, setPlaylists] = useState<DiscoverPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = !!(user && profile && user.id === profile.id);

  const handleSave = async (patch: ProfileUpdate) => {
    if (!profile) return;
    try {
      const updated = await updateProfile(profile.id, patch);
      setProfile(updated);
      if (user && user.id === updated.id) await refreshProfile();
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({
        title: "Couldn't save profile",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

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
        const includePrivate = !!(user && user.id === p.id);
        const pls = await fetchPlaylistsForUser(p.id, { includePrivate });
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
  }, [username, user?.id]);

  const publicCount = playlists.filter((p) => p.is_public).length;

  const initials = (profile?.display_name ?? profile?.username ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative min-h-screen">
      <SiteHeader />

      <main className="container py-8 sm:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 gap-2 sm:mb-8 sm:-ml-3">
          <Link to="/discover">
            <ArrowLeft className="h-4 w-4" /> Back to discover
          </Link>
        </Button>

        {loading ? (
          <div className="space-y-8 sm:space-y-10">
            <div className="h-40 skeleton rounded-xl border hairline" />
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 skeleton rounded-xl border hairline sm:h-56"
                />
              ))}
            </div>
          </div>
        ) : notFound || !profile ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline bg-elevated/40 px-6 py-16 text-center sm:py-24">
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">No such user</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              We couldn't find anyone with that username.
            </p>
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-6 border-b hairline pb-8 sm:gap-8 sm:pb-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border hairline bg-background/50 font-display text-3xl sm:h-24 sm:w-24 sm:text-4xl">
                  {profile.avatar_emoji ?? initials}
                </div>
                <div className="min-w-0 space-y-2 sm:space-y-3">
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                    <AtSign className="h-3 w-3" />
                    {profile.username}
                  </p>
                  <h1 className="font-display text-3xl leading-tight tracking-tight text-balance sm:text-6xl sm:leading-none">
                    {profile.display_name ?? profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="max-w-xl text-sm text-muted-foreground">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:gap-x-5 sm:text-xs">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Joined{" "}
                      {new Date(profile.created_at).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {profile.favorite_genre && (
                      <p className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Loves {profile.favorite_genre}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Button>
                )}
                <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                  <div>
                    {publicCount}{" "}
                    {publicCount === 1 ? "public playlist" : "public playlists"}
                  </div>
                  {isOwner && playlists.length > publicCount && (
                    <div className="mt-1 flex items-center gap-1 text-foreground/60 sm:justify-end">
                      <Lock className="h-3 w-3" />
                      {playlists.length - publicCount} private
                    </div>
                  )}
                </div>
              </div>
            </header>

            <section className="mt-8 sm:mt-10">
              {playlists.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed hairline bg-elevated/40 px-6 py-16 text-center sm:py-20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border hairline bg-background/50">
                    <Film className="h-6 w-6 text-muted-foreground" strokeWidth={1.25} />
                  </div>
                  <h2 className="mt-6 font-display text-2xl tracking-tight sm:text-3xl">
                    {isOwner ? "No playlists yet" : "Nothing public yet"}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {isOwner
                      ? "Your library is waiting. Create a playlist to share your taste with the world."
                      : `${profile.display_name ?? profile.username} hasn't shared any playlists. Check back soon.`}
                  </p>
                  {isOwner && (
                    <Button asChild size="lg" className="mt-7">
                      <Link to="/dashboard">Go to your library</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((p) => (
                    <DiscoverCard key={p.id} playlist={p} showOwner={false} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {profile && isOwner && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default UserProfile;
