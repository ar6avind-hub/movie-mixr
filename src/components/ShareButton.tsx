import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  title: string;
  description?: string | null;
}

export const ShareButton = ({ title, description }: Props) => {
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    // Prefer native share when available (typically mobile).
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({
          title,
          text: description ?? undefined,
          url,
        });
        return;
      } catch (err: any) {
        // User cancelled — don't fall back, don't toast.
        if (err?.name === "AbortError") return;
        // Otherwise fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Copy this URL manually from the address bar.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
      aria-label="Share playlist"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};
