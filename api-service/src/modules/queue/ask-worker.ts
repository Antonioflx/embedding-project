import type { IAskJobData, IAskJobResult } from "@interface/job.interface.js";
import { logger } from "@modules/logger/logger.js";
import { redisConnection } from "@modules/redis/redis-connection.js";
import { ProcessAskJobUseCase } from "@use-case/process-ask-job.use-case.js";
import { type Job, Worker } from "bullmq";
import { ASK_QUEUE_NAME } from "./ask-queue.js";

const processAskJobUseCase = new ProcessAskJobUseCase();

export const askWorker = new Worker<IAskJobData, IAskJobResult>(
  ASK_QUEUE_NAME,
  (job: Job<IAskJobData, IAskJobResult>) => processAskJobUseCase.execute(job),
  { connection: redisConnection },
);

askWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});

askWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
});
