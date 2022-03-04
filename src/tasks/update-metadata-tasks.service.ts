import { Injectable, Logger } from "@nestjs/common";
import { Cron, Interval } from "@nestjs/schedule";
import { Cfg } from "../../config";
import { CacheService } from "../common/cache/cache.service";
import { NearRPCService } from "../common/nearRPC/near-RPC.service";

@Injectable()
export class UpdateMetadataTasksService {
  private readonly logger = new Logger(UpdateMetadataTasksService.name);

  constructor(
    private nearRPCService: NearRPCService,
    private cacheService: CacheService
  ) {}

  @Cron("0 * * * * *")
  handleCron() {
    this.logger.debug("Called every minute at the 0 sec");
    // this.init_token_metadata_to_redis().catch((e) => {
    //   this.logger.error(e);
    // });
    this.syncTokenMeta().catch((e) => {
      this.logger.log(e);
    });
  }

  // @Interval(10000)
  // handleInterval() {
  //   this.logger.debug("Called every 30 seconds");
  //   this.update().catch((e) => {
  //     this.logger.log(e);
  //   });
  // }

  async syncTokenMeta() {
    let token_metadata = {};

    try {
      token_metadata = await this.cacheService.list_token_metadata();
      if (Object.keys(token_metadata).length === 0) {
        // init
        const contract = Cfg.NETWORK[Cfg.NETWORK_ID].REF_CONTRACT;
        const ret = await this.nearRPCService.view_call(
          contract,
          "get_whitelisted_tokens",
          ""
        );
        if (!ret.result) {
          throw new Error(`update cannot find contract ${contract}`);
        }
        const whitelist_tokens = JSON.parse(String.fromCharCode(...ret.result));
        const len = whitelist_tokens.length;
        let i = 0;
        for (const token of whitelist_tokens) {
          this.logger.log(`total ${++i}/${len} token need init`);
          await this.internal_update_token_metadata(token, {
            spec: "",
            name: "",
            symbol: "",
            icon: "",
            reference: "",
            reference_hash: "",
            decimals: 0,
          });
        }
        this.logger.log(`total ${len} token finish init`);
      } else {
        //update
        const len = Object.keys(token_metadata).length;
        let i = 0;
        for (const [token, metadata] of Object.entries(token_metadata)) {
          this.logger.log(`total ${++i}/${len} token need update`);
          await this.internal_update_token_metadata(token, metadata);
        }
        this.logger.log(`total ${len} token finish update`);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  //
  // async init_token_metadata_to_redis() {
  //   let metadata_obj = {
  //     spec: "",
  //     name: "",
  //     symbol: "",
  //     icon: "",
  //     reference: "",
  //     reference_hash: "",
  //     decimals: 0,
  //   };
  //   const contract = Cfg.NETWORK[Cfg.NETWORK_ID].REF_CONTRACT;
  //   try {
  //     const ret = await this.nearRPCService.view_call(
  //       contract,
  //       "get_whitelisted_tokens",
  //       ""
  //     );
  //     if (!ret.result) {
  //       throw new Error(
  //         `init_token_metadata_to_redis cannot find contract ${contract}`
  //       );
  //     }
  //     const whitelist_tokens = JSON.parse(String.fromCharCode(...ret.result));
  //     for (const token of whitelist_tokens) {
  //       await this.internal_update_token_metadata(token, metadata_obj);
  //     }
  //   } catch (e) {
  //     this.logger.error(e);
  //   }
  // }

  async internal_update_token_metadata(contract_id, metadata) {
    let ret = null;
    try {
      ret = await this.nearRPCService.view_call(contract_id, "ft_metadata", "");
      if (!ret.result) {
        throw new Error(`Does not got token metadata ${contract_id}`);
      }
      const metadata_obj = JSON.parse(String.fromCharCode(...ret.result));

      if (JSON.stringify(metadata) !== JSON.stringify(metadata_obj)) {
        await this.cacheService.add_token_metadata(
          contract_id,
          JSON.stringify(metadata_obj)
        );
      }
    } catch (e) {
      this.logger.error("internal_update_token_metadata", e);
    }
    return !!ret;
  }
}
