import { QueueDto } from "@dto/queue.dto.js";
import type { IAskJobResponse } from "@interface/job.interface.js";
import type { IGenerateConfig } from "@interface/llm-config.interface.js";
import { AskJobRepository } from "@repository/ask-job.repository.js";

export class CreateAskJobUseCase {
  async execute(
    question: string,
    config?: IGenerateConfig,
  ): Promise<IAskJobResponse> {
    const job = await AskJobRepository.create("ask", { question, config });
    const { id } = QueueDto.ensureCreated(job);
    return { jobId: id };
  }
}
