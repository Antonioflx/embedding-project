import type { IAskJobData, IAskJobResult } from "@interface/job.interface.js";
import { EmbeddingService } from "@service/embedding.service.js";
import type { Job } from "bullmq";

export class ProcessAskJobUseCase {
  private readonly embeddingService = new EmbeddingService();

  async execute(job: Job<IAskJobData, IAskJobResult>): Promise<IAskJobResult> {
    await job.updateProgress({ step: "EMBEDDING_PROCESSING" });
    const answer = await this.embeddingService.ask(
      job.data.question,
      job.data.config,
    );
    return { answer };
  }
}
