import { Injectable, Logger } from "@nestjs/common";
import { TokenMetaInterface } from "./interfaces/token-meta.interface";
import { r } from "./common/redis.store";
import { Cfg } from "../config";
import { ListTokenPriceInterface } from "./interfaces/list-token-price.interface";
import { TokenPriceInterface } from "./interfaces/token-price.interface";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async getHello(): Promise<string> {
    return "Welcome to ref datacenter API server, version 20220213.01, Powered by NestJS.";
  }

  async getListTokenPrice(): Promise<ListTokenPriceInterface> {
    const ret = {};
    const prices = await r.hGetAll(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_PRICE_KEY
    );

    Cfg.TOKENS[Cfg.NETWORK_ID].forEach((token) => {
      if (token.NEAR_ID in prices)
        ret[token.NEAR_ID] = {
          price: prices[token.NEAR_ID],
          decimal: token.DECIMAL,
          symbol: token.SYMBOL
        };
    });

    if ("token.v2.ref-finance.near" in ret)
      ret["rftt.tkn.near"] = {
        price: prices["token.v2.ref-finance.near"],
        decimal: 8,
        symbol: "RFTT"
      };

    return ret;
  }

  async getListTokenMeta(): Promise<Record<string, TokenMetaInterface>> {
    const metas = await r.hGetAll(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_METADATA_KEY
    );

    const metadata_obj = {};
    for (const [key, value] of Object.entries(metas)) {
      metadata_obj[key] = JSON.parse(value);
    }

    return metadata_obj;
  }

  async getTokenPrice(token_contract_id: string): Promise<TokenPriceInterface> {
    const price = await r.hGet(
      Cfg.NETWORK[Cfg.NETWORK_ID].REDIS_TOKEN_PRICE_KEY,
      token_contract_id
    );
    this.logger.log(price);
    const ret = {
      token_contract_id,
      price: price ?? "N/A"
    };
    return ret;
  }
}
