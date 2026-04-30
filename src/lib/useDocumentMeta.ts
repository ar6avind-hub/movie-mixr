import { useEffect } from "react";

type Meta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
};

const setMeta = (
  selector: string,
  attr: "name" | "property",
  key: string,
  content: string,
): (() => void) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  let created = false;
  const previous = el?.getAttribute("content") ?? null;

  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
    created = true;
  }
  el.setAttribute("content", content);

  return () => {
    if (created) {
      el?.parentNode?.removeChild(el);
    } else if (previous != null) {
      el?.setAttribute("content", previous);
    }
  };
};

/**
 * Build a small SVG data URL showing the cover emoji on a dark canvas —
 * used as a graceful Open Graph fallback when no image is available.
 */
export const emojiToOgImage = (emoji: string): string => {
  const safe = emoji || "🎬";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <text x="600" y="380" font-size="320" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${safe}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const useDocumentMeta = ({ title, description, image, url, type }: Meta) => {
  useEffect(() => {
    const restorers: Array<() => void> = [];
    const previousTitle = document.title;

    if (title) {
      document.title = title;
      restorers.push(() => {
        document.title = previousTitle;
      });
    }

    if (description) {
      restorers.push(
        setMeta('meta[name="description"]', "name", "description", description),
      );
      restorers.push(
        setMeta(
          'meta[property="og:description"]',
          "property",
          "og:description",
          description,
        ),
      );
      restorers.push(
        setMeta(
          'meta[name="twitter:description"]',
          "name",
          "twitter:description",
          description,
        ),
      );
    }

    if (title) {
      restorers.push(
        setMeta('meta[property="og:title"]', "property", "og:title", title),
      );
      restorers.push(
        setMeta(
          'meta[name="twitter:title"]',
          "name",
          "twitter:title",
          title,
        ),
      );
    }

    if (image) {
      restorers.push(
        setMeta('meta[property="og:image"]', "property", "og:image", image),
      );
      restorers.push(
        setMeta(
          'meta[name="twitter:image"]',
          "name",
          "twitter:image",
          image,
        ),
      );
    }

    if (url) {
      restorers.push(
        setMeta('meta[property="og:url"]', "property", "og:url", url),
      );
    }

    restorers.push(
      setMeta(
        'meta[property="og:type"]',
        "property",
        "og:type",
        type ?? "website",
      ),
    );

    restorers.push(
      setMeta(
        'meta[name="twitter:card"]',
        "name",
        "twitter:card",
        "summary_large_image",
      ),
    );

    return () => {
      // Restore in reverse for cleanest unwind.
      for (let i = restorers.length - 1; i >= 0; i--) restorers[i]();
    };
  }, [title, description, image, url, type]);
};
