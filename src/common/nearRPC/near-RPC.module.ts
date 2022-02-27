import { Module } from "@nestjs/common";
import { NearRPCService } from "./near-RPC.service";

@Module({
  providers: [NearRPCService],
  exports: [NearRPCService],
})
export class NearRPCModule {}
