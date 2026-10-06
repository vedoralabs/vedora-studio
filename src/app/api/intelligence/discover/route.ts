import { discover, discoverInputSchema } from "@/lib/ai/features";
import { errorResponse, guardJsonRequest, jsonResponse } from "@/lib/ai/http";
import { validate } from "@/lib/ai/schema";

export const maxDuration = 30;

export async function POST(request: Request) {
  const guarded = await guardJsonRequest(request, { bucket: "discover", limit: 12, windowMs: 60_000, maxBytes: 4_096 });
  if ("response" in guarded) return guarded.response;

  const input = validate<{ query: string; previous?: string[] }>(discoverInputSchema, guarded.body);
  if (!input.ok) return errorResponse(400, "Describe what you're looking for in a few words.");

  return jsonResponse(await discover(input.value));
}
