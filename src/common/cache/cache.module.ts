import { DynamicModule, Global } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { redisClientProvider } from "./redis.provider";

@Global()
export class CacheModule {
  static register(): DynamicModule {
    return {
      module: CacheModule,
      providers: [redisClientProvider, CacheService],
      exports: [CacheService],
    };
  }
}
