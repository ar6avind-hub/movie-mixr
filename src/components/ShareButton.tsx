import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string | null;
}

export const ShareButton = ({ title, description }: Props) => {
  const [pulse, setPulse] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    setPulse(true);
    window.setTimeout(() => setPulse(false), 350);

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
      toast.success("Link copied", {
        description: "Share it anywhere you like.",
      });
      setJustCopied(true);
      window.setTimeout(() => setJustCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy link", {
        description: "Copy this URL manually from the address bar.",
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          aria-label="Share playlist"
          className={cn(
            "group gap-2 transition-transform duration-200 ease-out active:scale-95",
            pulse && "scale-95",
          )}
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center">
            <Share2
              className={cn(
                "h-4 w-4 transition-all duration-200",
                justCopied ? "scale-0 opacity-0" : "scale-100 opacity-100",
              )}
            />
            <Check
              className={cn(
                "absolute h-4 w-4 transition-all duration-200",
                justCopied ? "scale-100 opacity-100" : "scale-0 opacity-0",
              )}
            />
          </span>
          <span className="hidden sm:inline">
            {justCopied ? "Copied" : "Share"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Share playlist</TooltipContent>
    </Tooltip>
  );
};
