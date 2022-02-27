import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CacheModule } from "./common/cache/cache.module";
import { NearRPCModule } from "./common/nearRPC/near-RPC.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register(),
    NearRPCModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
