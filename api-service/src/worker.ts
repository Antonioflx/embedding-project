import { logger } from "@modules/logger/logger.js";
import { ASK_QUEUE_NAME } from "@modules/queue/ask-queue.js";
import "@modules/queue/ask-worker.js";

logger.info(`worker process started, listening on queue "${ASK_QUEUE_NAME}"`);
