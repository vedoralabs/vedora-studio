import { briefInputSchema, buildBrief } from "@/lib/ai/features";
import { errorResponse, guardJsonRequest, jsonResponse } from "@/lib/ai/http";
import { validate } from "@/lib/ai/schema";
import type { BriefAnswers } from "@/lib/discovery/results";

export const maxDuration = 30;

export async function POST(request: Request) {
  const guarded = await guardJsonRequest(request, { bucket: "brief", limit: 6, windowMs: 60_000, maxBytes: 6_144 });
  if ("response" in guarded) return guarded.response;

  const input = validate<BriefAnswers>(briefInputSchema, guarded.body);
  if (!input.ok) return errorResponse(400, "Tell us at least what you're shooting.");

  return jsonResponse(await buildBrief(input.value));
}
