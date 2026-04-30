import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { searchMovies, TmdbMovie } from "@/api/movies";
import { toast } from "@/hooks/use-toast";
import { friendlyError } from "@/lib/errors";

type Step = "search" | "note";

export const AddMovieDialog = ({
  onAdd,
  existingTmdbIds = [],
}: {
  onAdd: (movie: TmdbMovie, note: string) => Promise<void>;
  existingTmdbIds?: Array<number | null>;
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TmdbMovie | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchMovies(trimmed);
        setResults(data);
      } catch (err: any) {
        toast({
          title: "Search failed",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, open]);

  const reset = () => {
    setStep("search");
    setQuery("");
    setResults([]);
    setSelected(null);
    setNote("");
    setSaving(false);
  };

  const handleSelect = (movie: TmdbMovie) => {
    setSelected(movie);
    setStep("note");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onAdd(selected, note);
      setOpen(false);
      reset();
    } catch (err: any) {
      toast({
        title: "Couldn't add film",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add film
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto border-hairline bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight sm:text-3xl">
            {step === "search" ? "Find a film" : "Why this one?"}
          </DialogTitle>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search by title…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {searching && (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {!searching && query && results.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nothing found.
                </p>
              )}

              {!searching && !query && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Type a title to begin.
                </p>
              )}

              {results.map((m) => (
                <button
                  key={m.tmdb_id}
                  onClick={() => handleSelect(m)}
                  className="flex w-full items-start gap-4 rounded-lg border border-transparent p-3 text-left transition-smooth hover:border-hairline hover:bg-elevated"
                >
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-elevated">
                    {m.poster_url ? (
                      <img
                        src={m.poster_url}
                        alt={`${m.title} poster`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium">{m.title}</h4>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {m.year ?? "—"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {m.overview}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {selected && (
              <div className="flex items-start gap-4 rounded-lg border hairline bg-elevated/50 p-3">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md bg-elevated">
                  {selected.poster_url ? (
                    <img
                      src={selected.poster_url}
                      alt={`${selected.title} poster`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-xl leading-tight">
                    {selected.title}
                  </h4>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {selected.year ?? "—"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelected(null);
                    setStep("search");
                  }}
                  aria-label="Choose another film"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="movie-note"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Personal note
              </label>
              <Textarea
                id="movie-note"
                placeholder="Why this film? What stayed with you?"
                rows={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setStep("search")}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to playlist"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
