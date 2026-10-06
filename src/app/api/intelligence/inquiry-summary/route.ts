import { inquirySummaryInputSchema, summariseInquiry } from "@/lib/ai/features";
import { errorResponse, guardJsonRequest, jsonResponse } from "@/lib/ai/http";
import { validate } from "@/lib/ai/schema";
import type { InquiryAnswers } from "@/lib/discovery/results";

export const maxDuration = 30;

export async function POST(request: Request) {
  const guarded = await guardJsonRequest(request, { bucket: "inquiry-summary", limit: 8, windowMs: 60_000, maxBytes: 4_096 });
  if ("response" in guarded) return guarded.response;

  const input = validate<InquiryAnswers>(inquirySummaryInputSchema, guarded.body);
  if (!input.ok) return errorResponse(400, "Please choose what you're creating and what you're looking for.");

  return jsonResponse(await summariseInquiry(input.value));
}
