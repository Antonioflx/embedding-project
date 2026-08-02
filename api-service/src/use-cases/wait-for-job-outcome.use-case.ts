import type { IJobOutcomeResolver } from "@interface/job-outcome.interface.js";
import { JobOutcome } from "@modules/job-outcome/job-outcome.model.js";
import { JobRepository } from "@repository/job.repository.js";
import type { Job, QueueEvents } from "bullmq";
import { AbortUtils } from "@/utils/abort.utils.js";
import { ErrorUtils } from "@/utils/error.utils.js";

export class WaitForJobOutcomeUseCase implements IJobOutcomeResolver {
  async execute<TResult>(
    job: Job<unknown, TResult>,
    queueEvents: QueueEvents,
    signal: AbortSignal,
  ): Promise<JobOutcome<TResult>> {
    // Races the job's completion against the caller aborting (e.g. the
    // client closing an SSE connection), so this never hangs around
    // waiting on a job nobody is listening to anymore.
    return Promise.race([
      this.waitForCompletion(job, queueEvents),
      this.waitForAbort<TResult>(signal),
    ]);
  }

  private async waitForCompletion<TResult>(
    job: Job<unknown, TResult>,
    queueEvents: QueueEvents,
  ): Promise<JobOutcome<TResult>> {
    try {
      const result = await JobRepository.waitUntilFinished(job, queueEvents);
      return JobOutcome.ok(result);
    } catch (error) {
      return JobOutcome.failed(ErrorUtils.getMessage(error));
    }
  }

  private async waitForAbort<TResult>(
    signal: AbortSignal,
  ): Promise<JobOutcome<TResult>> {
    await AbortUtils.toPromise(signal);
    return JobOutcome.aborted();
  }
}
