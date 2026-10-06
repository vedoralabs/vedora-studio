import "server-only";
import { AiProviderError, type AiProvider } from "@/lib/ai/provider";

interface OpenAiCompatibleOptions {
  id: string;
  apiKey: string;
  model: string;
  /** For example https://api.openai.com/v1 or any provider exposing a compatible /chat/completions endpoint. */
  baseUrl: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string | null; refusal?: string | null }; finish_reason?: string }[];
}

export function createOpenAiCompatibleProvider({ id, apiKey, model, baseUrl }: OpenAiCompatibleOptions): AiProvider {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  return {
    id,
    model,
    async generateJson({ system, user, schema, schemaName, maxOutputTokens, signal }) {
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          signal,
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            max_tokens: maxOutputTokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_schema", json_schema: { name: schemaName, strict: true, schema } },
          }),
        });
      } catch {
        throw new AiProviderError("Provider unavailable.", "unavailable");
      }

      if (response.status === 429) throw new AiProviderError("Provider rate limit reached.", "rate-limited");
      if (response.status === 401 || response.status === 403) throw new AiProviderError("Provider credentials were rejected.", "configuration");
      if (!response.ok) throw new AiProviderError(`Provider returned ${response.status}.`, "unavailable");

      const payload = (await response.json().catch(() => null)) as ChatCompletionResponse | null;
      const choice = payload?.choices?.[0];
      if (choice?.message?.refusal) throw new AiProviderError("The model declined this request.", "refused");
      if (choice?.finish_reason === "length") throw new AiProviderError("The response was cut short.", "invalid-response");
      const content = choice?.message?.content;
      if (typeof content !== "string" || content.length === 0) throw new AiProviderError("No text in response.", "invalid-response");
      return content;
    },
  };
}
