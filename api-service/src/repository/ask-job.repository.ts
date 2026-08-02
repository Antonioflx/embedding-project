import { randomUUID } from "node:crypto";
import type { IAskJobData, IAskJobResult } from "@interface/job.interface.js";
import { askQueue } from "@modules/queue/ask-queue.js";
import type { Job } from "bullmq";

export class AskJobRepository {
  private constructor() {}

  static create(
    name: string,
    data: IAskJobData,
  ): Promise<Job<IAskJobData, IAskJobResult>> {
    // UUID instead of BullMQ's default sequential id, so job ids can't be
    // enumerated to peek at other people's questions/answers (IDOR).
    return askQueue.add(name, data, { jobId: randomUUID() });
  }

  static findById(
    jobId: string,
  ): Promise<Job<IAskJobData, IAskJobResult> | undefined> {
    return askQueue.getJob(jobId);
  }
}
