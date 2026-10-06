import "server-only";
import { createAnthropicProvider } from "@/lib/ai/providers/anthropic";
import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";

export interface StructuredRequest {
  /** Stable instructions. Never contains visitor input. */
  readonly system: string;
  /** Visitor input and grounding data, already validated and size-limited. */
  readonly user: string;
  /** Provider-facing JSON schema for the response. */
  readonly schema: Record<string, unknown>;
  readonly schemaName: string;
  readonly maxOutputTokens: number;
  readonly signal: AbortSignal;
}

export interface AiProvider {
  readonly id: string;
  readonly model: string;
  /** Returns the raw JSON text from the model, or throws `AiProviderError`. */
  generateJson(request: StructuredRequest): Promise<string>;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly kind: "refused" | "rate-limited" | "unavailable" | "invalid-response" | "configuration",
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export const supportedProviders = ["anthropic", "openai", "openai-compatible"] as const;
export type SupportedProvider = (typeof supportedProviders)[number];

/** Server-only AI configuration. All values come from private environment variables. */
export function readAiConfig() {
  const apiKey = process.env.AI_API_KEY?.trim() ?? "";
  const providerName = (process.env.AI_PROVIDER?.trim().toLowerCase() || "anthropic") as SupportedProvider;
  const model = process.env.AI_MODEL?.trim() ?? "";
  const baseUrl = process.env.AI_BASE_URL?.trim() ?? "";
  return { apiKey, providerName, model, baseUrl };
}

let cachedProvider: AiProvider | null | undefined;

/** The configured provider, or `null` when AI is not configured and the site should use its curated fallback. */
export function getAiProvider(): AiProvider | null {
  if (cachedProvider !== undefined) return cachedProvider;

  const { apiKey, providerName, model, baseUrl } = readAiConfig();
  if (!apiKey || !supportedProviders.includes(providerName)) {
    cachedProvider = null;
    return cachedProvider;
  }

  switch (providerName) {
    case "anthropic":
      cachedProvider = createAnthropicProvider({ apiKey, model: model || "claude-opus-5-5" });
      break;
    case "openai":
      // OpenAI model names change often, so the model must be chosen explicitly.
      if (!model) {
        cachedProvider = null;
        break;
      }
      cachedProvider = createOpenAiCompatibleProvider({ id: "openai", apiKey, model, baseUrl: baseUrl || "https://api.openai.com/v1" });
      break;
    case "openai-compatible":
      if (!baseUrl || !model) {
        cachedProvider = null;
        break;
      }
      cachedProvider = createOpenAiCompatibleProvider({ id: "openai-compatible", apiKey, model, baseUrl });
      break;
  }
  return cachedProvider ?? null;
}
