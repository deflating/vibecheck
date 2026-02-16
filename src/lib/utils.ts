/**
 * Returns a Tailwind color class based on a review score (1-10 scale).
 * Used in dashboard, reviewer page, and review report components.
 */
export function scoreColor(score: number | null): string {
  if (score === null) return "bg-border";
  if (score >= 7) return "bg-success/10 text-success";
  if (score >= 4) return "bg-warning/10 text-warning";
  return "bg-danger/10 text-danger";
}

/**
 * Returns a bar-style Tailwind color class for score progress bars.
 * Used in the review report component.
 */
export function scoreBarColor(score: number | null): string {
  if (score === null) return "bg-border";
  if (score <= 3) return "bg-danger";
  if (score <= 5) return "bg-warning";
  if (score <= 7) return "bg-accent";
  return "bg-success";
}

/**
 * Safely parses a JSON string with a fallback value.
 * Prevents unhandled exceptions from malformed JSON in the database.
 */
export function safeParseJson<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
