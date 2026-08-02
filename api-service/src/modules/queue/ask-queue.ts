import type { IAskJobData, IAskJobResult } from "@interface/job.interface.js";
import { redisConnection } from "@modules/redis/redis-connection.js";
import { Queue } from "bullmq";

export const ASK_QUEUE_NAME = "ask-queue";

export const askQueue = new Queue<IAskJobData, IAskJobResult>(ASK_QUEUE_NAME, {
  connection: redisConnection,
});
