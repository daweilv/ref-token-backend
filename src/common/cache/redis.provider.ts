import { createClient } from "redis";
import { Provider } from "@nestjs/common";
import { Cfg } from "../../../config";

export type RedisClient = ReturnType<typeof createClient>;

export const redisClientProvider: Provider = {
  provide: "REDIS_CLIENT",
  useFactory: async (): Promise<RedisClient> => {
    const redisClient: RedisClient = createClient({
      url: `redis://${Cfg.REDIS.HOST}:${Cfg.REDIS.PORT}`,
    });
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    await redisClient.connect();
    return redisClient;
  },
};
