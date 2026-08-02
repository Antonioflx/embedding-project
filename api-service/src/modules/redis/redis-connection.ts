import { logger } from "@modules/logger/logger.js";
import { Redis } from "ioredis";
import { env } from "@/config/env.js";

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  logger.info("Redis connection established");
});

redisConnection.on("ready", () => {
  logger.info("Redis connection ready");
});

redisConnection.on("error", (error: Error) => {
  logger.error(`Redis connection error: ${error.message}`);
});

redisConnection.on("close", () => {
  logger.warn("Redis connection closed");
});

redisConnection.on("reconnecting", () => {
  logger.warn("Redis reconnecting");
});
