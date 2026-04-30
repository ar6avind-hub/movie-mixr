/**
 * Translate raw backend / network errors into short, friendly copy.
 * Keep messages calm, plainspoken, and never expose stack traces or
 * internal identifiers.
 */

const AUTH_MAP: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "That email and password don't match."],
  [/email not confirmed/i, "Please confirm your email before signing in."],
  [/email rate limit|over.*requests|rate limit/i, "Too many attempts. Try again in a moment."],
  [/user already registered|already exists/i, "An account with this email already exists."],
  [/password.*(short|6 characters)/i, "Use a password with at least 6 characters."],
  [/invalid email/i, "That email doesn't look right."],
  [/network|failed to fetch|load failed/i, "Network trouble. Check your connection and try again."],
];

export const friendlyAuthError = (msg: string | null | undefined): string => {
  const m = (msg ?? "").trim();
  if (!m) return "Something went wrong. Please try again.";
  for (const [re, friendly] of AUTH_MAP) {
    if (re.test(m)) return friendly;
  }
  return "Something went wrong. Please try again.";
};

export const friendlyError = (err: unknown, fallback = "Something went wrong."): string => {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (/network|failed to fetch|load failed/i.test(raw)) {
    return "Network trouble. Check your connection and try again.";
  }
  if (/timeout/i.test(raw)) return "That took too long. Please try again.";
  return fallback;
};
