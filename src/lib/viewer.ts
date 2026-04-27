/**
 * Returns a stable key identifying the current viewer for analytics.
 *
 * - Signed-in viewers are identified by their auth user id.
 * - Anonymous viewers get a random id stored in localStorage so the same
 *   browser doesn't double-count when refreshing within the dedupe window.
 */
const STORAGE_KEY = "cineblend.viewer_key";

export function getViewerKey(authUserId?: string | null): string {
  if (authUserId) return `u:${authUserId}`;

  if (typeof window === "undefined") {
    // SSR / non-browser fallback — opaque, won't be deduped meaningfully
    return "anon";
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = `a:${crypto.randomUUID()}`;
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return "anon";
  }
}
