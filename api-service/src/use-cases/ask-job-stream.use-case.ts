import { QueueDto } from "@dto/queue.dto.js";
import { askQueueEvents } from "@event/ask-queue.events.js";
import type {
  IAskJobResult,
  IJobEvent,
  IJobProgress,
} from "@interface/job.interface.js";
import { JobProgressSubscription } from "@modules/job-outcome/job-progress.subscription.js";
import { AskJobRepository } from "@repository/ask-job.repository.js";
import { WaitForJobOutcomeUseCase } from "./wait-for-job-outcome.use-case.js";

export class AskJobStreamUseCase {
  private readonly waitForJobOutcomeUseCase = new WaitForJobOutcomeUseCase();

  async execute(
    jobId: string,
    onEvent: (event: IJobEvent) => void,
    signal: AbortSignal,
  ): Promise<void> {
    const rawJob = await AskJobRepository.findById(jobId);
    const job = QueueDto.ensureFound(jobId, rawJob);

    onEvent({ jobId, status: "PROCESSING", step: "VALIDATING" });

    const subscription = new JobProgressSubscription<IJobProgress>(
      askQueueEvents,
      jobId,
      (progress) =>
        onEvent({ jobId, status: "PROCESSING", step: progress.step }),
    );

    const outcome = await this.waitForJobOutcomeUseCase
      .execute<IAskJobResult>(job, askQueueEvents, signal)
      .finally(() => subscription.dispose());

    if (outcome.isAborted()) {
      return;
    }

    if (outcome.isOk()) {
      onEvent({
        jobId,
        status: "SEND",
        step: "DONE",
        answer: outcome.getResult().answer,
      });
      return;
    }

    onEvent({
      jobId,
      status: "REJECT",
      step: "DONE",
      error: outcome.getMessage(),
    });
  }
}
