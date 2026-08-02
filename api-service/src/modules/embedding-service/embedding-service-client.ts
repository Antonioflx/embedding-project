import type { IGenerateConfig } from "@interface/llm-config.interface.js";
import { EmbeddingServiceError } from "@modules/errors/embedding-service.error.js";
import { env } from "@/config/env.js";

// embed + retrieve + generate all happen behind this one call, so it gets a
// longer budget than a single LLM call (BaseLLMProvider used 15s for that alone).
const TIMEOUT_MS = 30_000;

interface IAnswerResponse {
  answer: string;
}

export async function askEmbeddingService(
  question: string,
  config?: IGenerateConfig,
): Promise<string> {
  try {
    const response = await fetch(`${env.EMBEDDING_SERVICE_URL}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.EMBEDDING_SERVICE_API_KEY,
      },
      body: JSON.stringify({ question, config }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`embedding-service responded with ${response.status}`);
    }

    const data = (await response.json()) as IAnswerResponse;
    return data.answer;
  } catch (error) {
    throw EmbeddingServiceError.forRequest(error);
  }
}
