import { Cfg } from "../../../config";
import { Inject, Injectable } from "@nestjs/common";
import { RedisClient } from "./redis.provider";

@Injectable()
export class CacheService {
  @Inject("REDIS_CLIENT") private readonly r: RedisClient;

  async add_token_price(contract_id, price_str) {
    return this.r.hSet(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_PRICE_KEY,
      contract_id,
      price_str
    );
  }

  async get_token_price(token_contract_id) {
    return this.r.hGet(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_PRICE_KEY,
      token_contract_id
    );
  }

  async list_token_price() {
    return this.r.hGetAll(Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_PRICE_KEY);
  }

  async list_token_metadata() {
    const metas = await this.r.hGetAll(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_METADATA_KEY
    );

    const metadata_obj = {};
    for (const [key, value] of Object.entries(metas)) {
      metadata_obj[key] = JSON.parse(value);
    }
    return metadata_obj;
  }

  async add_token_metadata(contract_id, metadata_str) {
    return this.r.hSet(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_METADATA_KEY,
      contract_id,
      metadata_str
    );
  }
}
