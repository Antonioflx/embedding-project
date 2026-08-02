import type { IAskJobData, IAskJobResult } from "@interface/job.interface.js";
import { HttpError } from "@modules/errors/http.error.js";
import type { Job } from "bullmq";
import { StringUtils } from "@/utils/string.utils.js";

export class QueueDto {
  private constructor() {}

  static ensureCreated(job: Job<IAskJobData, IAskJobResult>): {
    id: string;
    job: Job<IAskJobData, IAskJobResult>;
  } {
    if (!StringUtils.isNotEmpty(job.id)) {
      throw new Error("BullMQ did not assign an id to the created job.");
    }

    return { id: job.id, job };
  }

  static ensureFound(
    jobId: string,
    job: Job<IAskJobData, IAskJobResult> | undefined,
  ): Job<IAskJobData, IAskJobResult> {
    if (!job) {
      throw HttpError.NotFoundError(`Job ${jobId} not found.`);
    }

    return job;
  }
}
