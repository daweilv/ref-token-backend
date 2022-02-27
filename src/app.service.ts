import { Injectable, Logger } from "@nestjs/common";
import { TokenMetaInterface } from "./interfaces/token-meta.interface";
import { Cfg } from "../config";
import { ListTokenPriceInterface } from "./interfaces/list-token-price.interface";
import { TokenPriceInterface } from "./interfaces/token-price.interface";
import { CacheService } from "./common/cache/cache.service";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly cacheService: CacheService) {}

  async getHello(): Promise<string> {
    return "Welcome to ref datacenter API server, version 20220213.01, Powered by NestJS.";
  }

  async getListTokenPrice(): Promise<ListTokenPriceInterface> {
    const ret = {};
    const prices = await this.cacheService.list_token_price();

    Cfg.TOKENS[Cfg.NETWORK_ID].forEach((token) => {
      if (token.NEAR_ID in prices)
        ret[token.NEAR_ID] = {
          price: prices[token.NEAR_ID],
          decimal: token.DECIMAL,
          symbol: token.SYMBOL,
        };
    });

    if ("token.v2.ref-finance.near" in ret)
      ret["rftt.tkn.near"] = {
        price: prices["token.v2.ref-finance.near"],
        decimal: 8,
        symbol: "RFTT",
      };

    return ret;
  }

  async getListTokenMeta(): Promise<Record<string, TokenMetaInterface>> {
    const metadata_obj = await this.cacheService.list_token_metadata();
    this.logger.debug(metadata_obj);
    return metadata_obj;
  }

  async getTokenPrice(token_contract_id: string): Promise<TokenPriceInterface> {
    const price = await this.cacheService.get_token_price(token_contract_id);
    this.logger.debug(price);
    const ret = {
      token_contract_id,
      price: price ?? "N/A",
    };
    this.logger.debug(ret);
    return ret;
  }
}
