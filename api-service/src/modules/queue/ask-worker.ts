import type { IAskJobData, IAskJobResult } from "@interface/job.interface.js";
import { askEmbeddingService } from "@modules/embedding-service/embedding-service-client.js";
import { logger } from "@modules/logger/logger.js";
import { redisConnection } from "@modules/redis/redis-connection.js";
import { type Job, Worker } from "bullmq";
import { ASK_QUEUE_NAME } from "./ask-queue.js";

async function processAskJob(
  job: Job<IAskJobData, IAskJobResult>,
): Promise<IAskJobResult> {
  await job.updateProgress({ step: "EMBEDDING_PROCESSING" });
  const answer = await askEmbeddingService(job.data.question, job.data.config);
  return { answer };
}

export const askWorker = new Worker<IAskJobData, IAskJobResult>(
  ASK_QUEUE_NAME,
  processAskJob,
  { connection: redisConnection },
);

askWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});

askWorker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
});
