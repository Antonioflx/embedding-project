import { ASK_QUEUE_NAME } from "@modules/queue/ask-queue.js";
import { redisConnection } from "@modules/redis/redis-connection.js";
import { QueueEvents } from "bullmq";

export const askQueueEvents = new QueueEvents(ASK_QUEUE_NAME, {
  connection: redisConnection,
});
