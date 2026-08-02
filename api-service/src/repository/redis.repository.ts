import { redisConnection } from "@modules/redis/redis-connection.js";

export class RedisRepository {
  private static readonly DEFAULT_TTL_SECONDS = 60;

  private constructor() {}

  static async create(
    key: string,
    value: string,
    ttlSeconds: number = RedisRepository.DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    await redisConnection.set(key, value, "EX", ttlSeconds);
  }

  static read(key: string): Promise<string | null> {
    return redisConnection.get(key);
  }

  static async delete(key: string): Promise<void> {
    await redisConnection.del(key);
  }

  static async exists(key: string): Promise<boolean> {
    const count = await redisConnection.exists(key);
    return count > 0;
  }
}
