import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { addFavorite, isFavorite, removeFavorite } from "@/api/favorites";
import { toast } from "@/hooks/use-toast";

interface Props {
  playlistId: string;
  // Used to enforce: cannot favorite your own private playlist.
  ownerId: string;
  isPublic: boolean;
}

export const FavoriteButton = ({ playlistId, ownerId, isPublic }: Props) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isOwner = !!(user && user.id === ownerId);
  // Can only favorite if logged in AND the playlist is reachable to others
  // (i.e., either it's public, or you own it — but owners of *private* playlists
  // shouldn't favorite their own private content).
  const canFavorite = !!user && (isPublic || (isOwner && isPublic));

  useEffect(() => {
    let active = true;
    if (!user) {
      setFavorited(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    isFavorite(user.id, playlistId)
      .then((v) => {
        if (active) setFavorited(v);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, playlistId]);

  if (!user) return null;
  if (!canFavorite) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const next = !favorited;
    setFavorited(next);
    try {
      if (next) {
        await addFavorite(user.id, playlistId);
        toast({ title: "Saved to favorites" });
      } else {
        await removeFavorite(user.id, playlistId);
        toast({ title: "Removed from favorites" });
      }
    } catch (err: any) {
      setFavorited(!next);
      toast({
        title: "Couldn't update favorites",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading || busy}
      className="gap-2"
      aria-pressed={favorited}
    >
      <Heart
        className="h-4 w-4 transition-smooth"
        fill={favorited ? "currentColor" : "none"}
      />
      {favorited ? "Saved" : "Save"}
    </Button>
  );
};
