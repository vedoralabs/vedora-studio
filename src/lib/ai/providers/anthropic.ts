import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AiProviderError, type AiProvider } from "@/lib/ai/provider";

interface AnthropicOptions {
  apiKey: string;
  model: string;
}

export function createAnthropicProvider({ apiKey, model }: AnthropicOptions): AiProvider {
  // Timeouts are owned by the caller's AbortSignal; one quick retry covers transient blips.
  const client = new Anthropic({ apiKey, maxRetries: 1 });

  return {
    id: "anthropic",
    model,
    async generateJson({ system, user, schema, maxOutputTokens, signal }) {
      try {
        const response = await client.beta.messages.create(
          {
            model,
            max_tokens: maxOutputTokens,
            system,
            messages: [{ role: "user", content: user }],
            // Short, structured editorial tasks: low effort keeps responses quick and inexpensive.
            output_config: { effort: "low", format: { type: "json_schema", schema } },
            // On a safety decline, let the API re-run on its recommended fallback model.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
          },
          { signal },
        );

        if (response.stop_reason === "refusal") throw new AiProviderError("The model declined this request.", "refused");
        if (response.stop_reason === "max_tokens") throw new AiProviderError("The response was cut short.", "invalid-response");

        const textBlock = response.content.find((block) => block.type === "text");
        if (!textBlock || textBlock.type !== "text") throw new AiProviderError("No text in response.", "invalid-response");
        return textBlock.text;
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        if (error instanceof Anthropic.RateLimitError) throw new AiProviderError("Provider rate limit reached.", "rate-limited");
        if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
          throw new AiProviderError("Provider credentials were rejected.", "configuration");
        }
        if (error instanceof Anthropic.BadRequestError) throw new AiProviderError("Provider rejected the request.", "configuration");
        throw new AiProviderError("Provider unavailable.", "unavailable");
      }
    },
  };
}
