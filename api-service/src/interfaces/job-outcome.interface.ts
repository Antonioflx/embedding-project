import type { JobOutcome } from "@modules/job-outcome/job-outcome.model.js";
import type { Job, QueueEvents } from "bullmq";

export interface IJobOutcomeResolver {
  execute<TResult>(
    job: Job<unknown, TResult>,
    queueEvents: QueueEvents,
    signal: AbortSignal,
  ): Promise<JobOutcome<TResult>>;
}
