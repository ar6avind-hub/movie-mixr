import { Link, useNavigate } from "react-router-dom";
import { DiscoverPlaylist } from "@/api/playlists";
import { Globe, Lock } from "lucide-react";

/**
 * Compact playlist card used on Discover and Profile pages.
 * Owner name links to that user's profile when a username is provided.
 */
export const DiscoverCard = ({
  playlist,
  showOwner = true,
}: {
  playlist: DiscoverPlaylist;
  showOwner?: boolean;
}) => {
  const navigate = useNavigate();
  const owner = playlist.owner_display_name ?? playlist.owner_username ?? "anonymous";

  const handleOwnerClick = (e: React.MouseEvent) => {
    if (!playlist.owner_username) return;
    e.preventDefault();
    e.stopPropagation();
    navigate(`/user/${playlist.owner_username}`);
  };

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="group relative block overflow-hidden rounded-xl border hairline bg-card-gradient p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border hairline bg-background/50 text-3xl">
          {playlist.cover_emoji ?? "🎬"}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {!playlist.is_public && (
            <span className="flex items-center gap-1 rounded-full border hairline bg-background/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Lock className="h-3 w-3" /> Private
            </span>
          )}
          {playlist.genre && (
            <span className="rounded-full border hairline px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              {playlist.genre}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-1">
        <h3 className="font-display text-2xl leading-tight tracking-tight text-balance">
          {playlist.name}
        </h3>
        {showOwner && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            by{" "}
            {playlist.owner_username ? (
              <button
                type="button"
                onClick={handleOwnerClick}
                className="text-foreground/70 underline-offset-4 transition-smooth hover:text-foreground hover:underline"
              >
                {owner}
              </button>
            ) : (
              <span className="text-foreground/70">{owner}</span>
            )}
          </p>
        )}
        {playlist.description && (
          <p className="line-clamp-2 pt-2 text-sm text-muted-foreground">
            {playlist.description}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2">
          <Globe className="h-3 w-3" />
          {playlist.movie_count ?? 0}{" "}
          {playlist.movie_count === 1 ? "film" : "films"}
        </span>
        <span>
          {new Date(playlist.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
};
