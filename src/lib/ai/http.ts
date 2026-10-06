import "server-only";
import { takeToken } from "@/lib/ai/rate-limit";

const noStore = { "cache-control": "no-store", "x-content-type-options": "nosniff" } as const;

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { ...noStore, ...headers } });
}

export function errorResponse(status: number, message: string, headers: Record<string, string> = {}) {
  return jsonResponse({ error: message }, status, headers);
}

function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "anonymous";
}

/** Reject cross-site browser requests. Same-origin fetches and non-browser tools without these headers pass. */
function isCrossSite(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

interface GuardOptions {
  /** Separate limits per feature so one busy tool can't starve another. */
  readonly bucket: string;
  readonly limit: number;
  readonly windowMs: number;
  readonly maxBytes: number;
}

/**
 * Shared guard for public POST endpoints: same-origin check, rate limit, content type,
 * payload size, and JSON parsing. Returns the parsed body or a ready error response.
 */
export async function guardJsonRequest(request: Request, options: GuardOptions): Promise<{ body: unknown } | { response: Response }> {
  if (isCrossSite(request)) return { response: errorResponse(403, "Requests must come from this site.") };

  const { allowed, retryAfterSeconds } = takeToken(`${options.bucket}:${clientAddress(request)}`, options);
  if (!allowed) {
    return {
      response: errorResponse(429, "A moment, please — too many requests. Try again shortly.", { "retry-after": String(retryAfterSeconds) }),
    };
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { response: errorResponse(415, "Expected JSON.") };
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > options.maxBytes) return { response: errorResponse(413, "That request is too large.") };

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { response: errorResponse(400, "The request could not be read.") };
  }
  if (new TextEncoder().encode(raw).length > options.maxBytes) return { response: errorResponse(413, "That request is too large.") };

  try {
    return { body: JSON.parse(raw) as unknown };
  } catch {
    return { response: errorResponse(400, "The request was not valid JSON.") };
  }
}

/** Normalise visitor text: strip control characters and collapse runs of whitespace. */
export function cleanText(value: string, maxLength: number): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}
