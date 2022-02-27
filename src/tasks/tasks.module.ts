import { Module } from "@nestjs/common";
import { TokenPriceTasksService } from "./token-price-tasks.service";
import { NearRPCModule } from "../common/nearRPC/near-RPC.module";
import { CacheModule } from "../common/cache/cache.module";
import { UpdateMetadataTasksService } from "./update-metadata-tasks.service";

@Module({
  imports: [NearRPCModule, CacheModule],
  providers: [UpdateMetadataTasksService, TokenPriceTasksService],
})
export class TasksModule {}
