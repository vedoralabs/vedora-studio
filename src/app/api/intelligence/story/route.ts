import { storyInputSchema, tellStory } from "@/lib/ai/features";
import { errorResponse, guardJsonRequest, jsonResponse } from "@/lib/ai/http";
import { validate } from "@/lib/ai/schema";

export const maxDuration = 30;

export async function POST(request: Request) {
  const guarded = await guardJsonRequest(request, { bucket: "story", limit: 20, windowMs: 60_000, maxBytes: 512 });
  if ("response" in guarded) return guarded.response;

  const input = validate<{ slug: string }>(storyInputSchema, guarded.body);
  if (!input.ok) return errorResponse(400, "Unknown project.");

  const story = await tellStory(input.value.slug);
  return story ? jsonResponse(story) : errorResponse(404, "Unknown project.");
}
