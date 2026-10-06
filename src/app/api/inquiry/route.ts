import { cleanText, errorResponse, guardJsonRequest, jsonResponse } from "@/lib/ai/http";
import { object, oneOf, text, validate } from "@/lib/ai/schema";
import { inquiryCreating, inquiryLookingFor } from "@/lib/discovery/results";

export const maxDuration = 15;

const inquirySchema = object(
  {
    name: { type: "string", minLength: 1, maxLength: 120 },
    email: { type: "string", minLength: 3, maxLength: 200 },
    creating: oneOf(inquiryCreating),
    lookingFor: oneOf(inquiryLookingFor),
    summary: { type: "string", minLength: 10, maxLength: 2_000 },
    timing: text(120),
    project: text(80),
    /** Honeypot: real visitors never see or fill this field. */
    website: text(200),
  },
  ["name", "email", "creating", "lookingFor", "summary"],
);

interface InquiryPayload {
  name: string;
  email: string;
  creating: string;
  lookingFor: string;
  summary: string;
  timing?: string;
  project?: string;
  website?: string;
}

const emailPattern = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

/** Only HTTPS webhooks are accepted, so a misconfiguration can't send inquiries in clear text. */
function webhookUrl(): URL | null {
  const value = process.env.INQUIRY_WEBHOOK_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const guarded = await guardJsonRequest(request, { bucket: "inquiry", limit: 5, windowMs: 10 * 60_000, maxBytes: 8_192 });
  if ("response" in guarded) return guarded.response;

  const input = validate<InquiryPayload>(inquirySchema, guarded.body);
  if (!input.ok) return errorResponse(400, "Please add your name, a valid email, and a short summary.");

  const inquiry = input.value;
  if (inquiry.website) return jsonResponse({ status: "sent" }); // Quietly accept and discard likely bots.

  const email = cleanText(inquiry.email, 200);
  if (!emailPattern.test(email)) return errorResponse(400, "That email address doesn't look quite right.");

  const destination = webhookUrl();
  if (!destination) {
    // No delivery channel is configured: say so honestly rather than pretending it was sent.
    return jsonResponse({ status: "not-configured" });
  }

  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        name: cleanText(inquiry.name, 120),
        email,
        creating: inquiry.creating,
        lookingFor: inquiry.lookingFor,
        summary: cleanText(inquiry.summary, 2_000),
        timing: cleanText(inquiry.timing ?? "", 120),
        project: cleanText(inquiry.project ?? "", 80),
        source: "vedora-studio-smart-inquiry",
      }),
    });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    return jsonResponse({ status: "sent" });
  } catch {
    console.warn("[vedora-inquiry] delivery failed");
    return errorResponse(502, "We couldn't send that just now. Please try again, or email the studio directly.");
  }
}
