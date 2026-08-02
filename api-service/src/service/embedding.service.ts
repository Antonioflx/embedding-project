import type { IEmbeddingService } from "@interface/embedding-service.interface.js";
import type { IGenerateConfig } from "@interface/llm-config.interface.js";
import { EmbeddingServiceError } from "@modules/errors/embedding-service.error.js";
import { HttpClient } from "@modules/http/http-client.js";
import { env } from "@/config/env.js";

interface IAnswerResponse {
  answer: string;
}

export class EmbeddingService implements IEmbeddingService {
  // embed + retrieve + generate all happen behind this one call, so it gets
  // a longer budget than a single LLM call (BaseLLMProvider used 15s for
  // that alone).
  private static readonly TIMEOUT_MS = 30_000;

  private readonly api: HttpClient;

  constructor() {
    this.api = new HttpClient({
      baseUrl: env.EMBEDDING_SERVICE_URL,
      headers: { "X-API-KEY": env.EMBEDDING_SERVICE_API_KEY },
      timeoutMs: EmbeddingService.TIMEOUT_MS,
    });
  }

  async ask(question: string, config?: IGenerateConfig): Promise<string> {
    try {
      const data = await this.api.post<IAnswerResponse>("/answer", {
        question,
        config,
      });
      return data.answer;
    } catch (error) {
      throw EmbeddingServiceError.forRequest(error);
    }
  }
}
