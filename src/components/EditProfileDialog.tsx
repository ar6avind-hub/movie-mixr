import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GENRES } from "@/lib/genres";
import { Profile, ProfileUpdate } from "@/api/profiles";

const AVATAR_EMOJIS = [
  "🎬",
  "🍿",
  "🎭",
  "🌙",
  "🔥",
  "💔",
  "🌌",
  "🗡️",
  "👁️",
  "🌹",
  "📽️",
  "⭐",
];

const MAX_BIO = 240;
const MAX_NAME = 60;

export const EditProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile;
  onSave: (patch: ProfileUpdate) => Promise<void>;
}) => {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [genre, setGenre] = useState<string | null>(profile.favorite_genre);
  const [emoji, setEmoji] = useState<string | null>(profile.avatar_emoji);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setGenre(profile.favorite_genre);
      setEmoji(profile.avatar_emoji);
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        favorite_genre: genre,
        avatar_emoji: emoji,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-hairline bg-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Edit profile</DialogTitle>
          <DialogDescription>
            Refine how others see you across CINEBLEND.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((e) => (
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

          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, MAX_NAME))}
              placeholder="Optional"
              maxLength={MAX_NAME}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
              placeholder="A short line about your taste in cinema."
              rows={3}
              maxLength={MAX_BIO}
            />
            <p className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
              {bio.length}/{MAX_BIO}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Favorite genre</Label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setGenre(null)}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-widest transition-smooth ${
                  genre === null
                    ? "border-foreground bg-foreground text-background"
                    : "hairline text-muted-foreground hover:bg-accent"
                }`}
              >
                None
              </button>
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-widest transition-smooth ${
                    genre === g
                      ? "border-foreground bg-foreground text-background"
                      : "hairline text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
