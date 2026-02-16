/**
 * Simple in-memory sliding-window rate limiter.
 * Swap to Redis-backed implementation for multi-instance deployments.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 5 * 60_000);

/**
 * Check if a request should be rate-limited.
 * @returns { limited: true, retryAfter } if blocked, { limited: false } if allowed
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { limited: true, retryAfter };
  }

  entry.timestamps.push(now);
  return { limited: false };
}
