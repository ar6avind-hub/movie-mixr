import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const EMOJIS = ["🎬", "🍿", "🎭", "🌙", "🔥", "💔", "🌌", "🗡️", "👁️", "🌹"];

export const CreatePlaylistDialog = ({
  onCreate,
}: {
  onCreate: (data: {
    name: string;
    description: string;
    cover_emoji: string;
    is_public: boolean;
  }) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎬");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        cover_emoji: emoji,
        is_public: isPublic,
      });
      setName("");
      setDescription("");
      setEmoji("🎬");
      setIsPublic(false);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="border-hairline bg-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">New playlist</DialogTitle>
          <DialogDescription>Curate a collection of films worth remembering.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Title</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Late night noir"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Cover</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-lg transition-smooth ${
                    emoji === e
                      ? "border-foreground bg-accent"
                      : "hairline bg-background hover:bg-accent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border hairline bg-background/50 px-3 py-2.5">
            <div className="space-y-0.5">
              <Label htmlFor="public" className="cursor-pointer">
                Make public
              </Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view.
              </p>
            </div>
            <input
              id="public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-foreground"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !name.trim()} className="w-full">
              {submitting ? "Creating…" : "Create playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
