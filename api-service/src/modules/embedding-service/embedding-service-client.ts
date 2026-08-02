import type { IGenerateConfig } from "@interface/llm-config.interface.js";
import { EmbeddingServiceError } from "@modules/errors/embedding-service.error.js";
import { HttpClient } from "@modules/http/http-client.js";
import { env } from "@/config/env.js";

// embed + retrieve + generate all happen behind this one call, so it gets a
// longer budget than a single LLM call (BaseLLMProvider used 15s for that alone).
const TIMEOUT_MS = 30_000;

const api = new HttpClient({
  baseUrl: env.EMBEDDING_SERVICE_URL,
  headers: { "X-API-KEY": env.EMBEDDING_SERVICE_API_KEY },
  timeoutMs: TIMEOUT_MS,
});

interface IAnswerResponse {
  answer: string;
}

export async function askEmbeddingService(
  question: string,
  config?: IGenerateConfig,
): Promise<string> {
  try {
    const data = await api.post<IAnswerResponse>("/answer", {
      question,
      config,
    });
    return data.answer;
  } catch (error) {
    throw EmbeddingServiceError.forRequest(error);
  }
}
