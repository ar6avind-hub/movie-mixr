import { PlaylistMovie } from "@/api/movies";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const MovieCard = ({
  movie,
  canEdit,
  onRemove,
}: {
  movie: PlaylistMovie;
  canEdit: boolean;
  onRemove?: (id: string) => void;
}) => {
  return (
    <article className="group relative flex gap-4 rounded-xl border hairline bg-card-gradient p-4 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-glow sm:gap-5 sm:p-5">
      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-elevated sm:h-40 sm:w-28">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No poster
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight tracking-tight text-balance sm:text-2xl">
              {movie.title}
            </h3>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              {movie.year ?? "—"}
            </p>
          </div>
          {canEdit && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              /* Always tappable on touch — only fades on hover for mouse users */
              className="h-9 w-9 shrink-0 sm:opacity-0 sm:transition-smooth sm:group-hover:opacity-100"
              onClick={() => onRemove(movie.id)}
              aria-label="Remove film"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {movie.note && (
          <blockquote className="mt-3 border-l-2 hairline pl-3 text-xs italic text-muted-foreground sm:mt-4 sm:pl-4 sm:text-sm">
            "{movie.note}"
          </blockquote>
        )}
      </div>
    </article>
  );
};
