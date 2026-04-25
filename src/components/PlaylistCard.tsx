import { Link } from "react-router-dom";
import { Playlist } from "@/api/playlists";
import { Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PlaylistCard = ({
  playlist,
  onDelete,
}: {
  playlist: Playlist;
  onDelete: (id: string) => void;
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(playlist.id);
  };

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="group relative block overflow-hidden rounded-xl border hairline bg-card-gradient p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border hairline bg-background/50 text-3xl">
          {playlist.cover_emoji ?? "🎬"}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 transition-smooth group-hover:opacity-100"
          onClick={handleDelete}
          aria-label="Delete playlist"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 space-y-1">
        <h3 className="font-display text-2xl leading-tight tracking-tight text-balance">
          {playlist.name}
        </h3>
        {playlist.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{playlist.description}</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2">
          {playlist.is_public && <Globe className="h-3 w-3" />}
          {playlist.movie_count ?? 0} {playlist.movie_count === 1 ? "film" : "films"}
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
