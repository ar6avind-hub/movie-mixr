import { useState } from "react";
import { Link } from "react-router-dom";
import { Playlist } from "@/api/playlists";
import { Trash2, Globe, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PlaylistCard = ({
  playlist,
  onDelete,
}: {
  playlist: Playlist;
  onDelete: (id: string) => void;
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  return (
    <>
      <Link
        to={`/playlist/${playlist.id}`}
        className="group relative block overflow-hidden rounded-xl border hairline bg-card-gradient p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-glow active:scale-[0.99] sm:p-6"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border hairline bg-background/50 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
            {playlist.cover_emoji ?? "🎬"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 sm:opacity-0 sm:transition-smooth sm:group-hover:opacity-100"
            onClick={openConfirm}
            aria-label="Delete playlist"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 space-y-1 sm:mt-6">
          <h3 className="font-display text-xl leading-tight tracking-tight text-balance sm:text-2xl">
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{playlist.description}</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest text-muted-foreground sm:mt-6 sm:text-xs">
          <span className="flex items-center gap-2">
            {playlist.is_public && <Globe className="h-3 w-3" />}
            {playlist.movie_count ?? 0} {playlist.movie_count === 1 ? "film" : "films"}
          </span>
          <span className="flex items-center gap-3">
            {playlist.is_public && playlist.view_count > 0 && (
              <span
                className="flex items-center gap-1.5"
                title={`${playlist.view_count.toLocaleString()} ${
                  playlist.view_count === 1 ? "view" : "views"
                }`}
              >
                <Eye className="h-3 w-3" />
                {playlist.view_count.toLocaleString()}
              </span>
            )}
            <span>
              {new Date(playlist.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </span>
        </div>
      </Link>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-foreground">{playlist.name}</span> and all of its films
              will be permanently removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(playlist.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
