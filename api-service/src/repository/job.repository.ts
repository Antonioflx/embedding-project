import type { Job, QueueEvents } from "bullmq";

export class JobRepository {
  private constructor() {}

  static waitUntilFinished<TResult>(
    job: Job<unknown, TResult>,
    queueEvents: QueueEvents,
  ): Promise<TResult> {
    return job.waitUntilFinished(queueEvents);
  }
}
