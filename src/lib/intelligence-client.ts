/** Browser-side helper for the studio's own API routes. Never talks to an AI provider directly. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string; aborted?: boolean };

export async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<ApiResult<T>> {
  const timeout = AbortSignal.timeout(30_000);
  // AbortSignal.any is missing in some older browsers; the caller's signal still cancels there.
  const combined = signal ? (typeof AbortSignal.any === "function" ? AbortSignal.any([signal, timeout]) : signal) : timeout;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: combined,
    });
    const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!response.ok || !payload) {
      return { ok: false, message: payload?.error ?? "Something interrupted the request. Please try again." };
    }
    return { ok: true, data: payload };
  } catch (error) {
    if (signal?.aborted) return { ok: false, message: "", aborted: true };
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, message: "That took longer than expected. Please try again." };
    }
    return { ok: false, message: "You appear to be offline. The portfolio is still here to browse." };
  }
}
