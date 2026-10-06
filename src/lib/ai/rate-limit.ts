import "server-only";

interface LimitOptions {
  readonly limit: number;
  readonly windowMs: number;
}

const windows = new Map<string, number[]>();
const maxTrackedKeys = 5_000;

/**
 * Sliding-window limiter held in memory. It protects each server instance from bursts;
 * for multi-region deployments, back it with a shared store (for example Redis) behind the same interface.
 */
export function takeToken(key: string, { limit, windowMs }: LimitOptions): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const recent = (windows.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    windows.set(key, recent);
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  windows.set(key, recent);

  if (windows.size > maxTrackedKeys) {
    for (const [trackedKey, timestamps] of windows) {
      if (timestamps.every((timestamp) => now - timestamp >= windowMs)) windows.delete(trackedKey);
      if (windows.size <= maxTrackedKeys * 0.8) break;
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
