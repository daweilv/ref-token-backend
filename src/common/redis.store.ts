import { createClient } from "redis";
import { Cfg } from "../../config";

export type RedisClientType = ReturnType<typeof createClient>;
export const r: RedisClientType = createClient({
  url: `redis://${Cfg.REDIS.HOST}:${Cfg.REDIS.PORT}`,
});

// export default async function start(): Promise<RedisClientType> {
//   const redis: RedisClientType = createClient({
//     url: `redis://${Cfg.REDIS.HOST}:${Cfg.REDIS.PORT}`,
//   });
//   await redis.connect();
//   return redis;
// }

r.on("error", (err) => console.log("Redis Client Error", err));
r.connect();
