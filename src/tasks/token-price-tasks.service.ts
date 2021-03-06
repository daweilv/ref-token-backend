import BigNumber from "bignumber.js";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, Interval } from "@nestjs/schedule";
import { Cfg } from "../../config";
import axios from "axios";
import { CacheService } from "../common/cache/cache.service";
import { NearRPCService } from "../common/nearRPC/near-RPC.service";

@Injectable()
export class TokenPriceTasksService {
  private readonly logger = new Logger(TokenPriceTasksService.name);

  constructor(
    private nearRPCService: NearRPCService,
    private cacheService: CacheService
  ) {}

  // @Interval(10000)
  // handleInterval() {
  //   this.logger.debug("Called every 10 seconds");
  //   this.update_price().catch((err) => {
  //     this.logger.error(err);
  //   });
  // }

  @Cron("10 * * * * *")
  handleCron() {
    this.logger.debug("Called every minute at the 10 sec");
    this.update_price().catch((err) => {
      this.logger.error(err);
    });
  }

  async update_price() {
    let pool_tokens = [];
    let market_tokens = [];
    let tokens_prices = [];
    let decimals = {};
    let price_ref = {};

    Cfg.TOKENS[Cfg.NETWORK_ID].forEach(function (token) {
      decimals[token["NEAR_ID"]] = token["DECIMAL"];
      if (token["MD_ID"].split("|").length === 3) {
        pool_tokens.push(token);
      } else {
        market_tokens.push(token);
      }
    });

    const market_tokens_prices = await this.market_price(market_tokens);
    for (const token of market_tokens_prices) {
      price_ref[token["NEAR_ID"]] = token["price"];
    }

    const pool_prices = await this.pool_price(pool_tokens);

    tokens_prices = [...market_tokens_prices, ...pool_prices];

    let len = tokens_prices.length;
    let i = 0;
    for (const token of tokens_prices) {
      this.logger.log(`total ${++i}/${len} token need update`);
      if (token["BASE_ID"] != "") {
        if (price_ref[token["BASE_ID"]]) {
          const price = new BigNumber(token["price"])
            .div(new BigNumber(10).pow(decimals[token["BASE_ID"]]))
            .times(new BigNumber(price_ref[token["BASE_ID"]]));

          this.logger.debug(`token[${token.NEAR_ID}]:${price.toFixed(8)}`);

          await this.cacheService.add_token_price(
            token["NEAR_ID"],
            price.toFixed(8)
          );
        } else {
          this.logger.log(
            `${token["NEAR_ID"]} has no ref price ${token["BASE_ID"]}/usd`
          );
        }
      } else {
        await this.cacheService.add_token_price(
          token["NEAR_ID"],
          token["price"]
        );
      }
    }
  }

  async market_price(tokens) {
    this.logger.debug(`total ${tokens.length} need sync from market`);
    const market_tokens_price = [];
    const md_ids = [];

    tokens.forEach((token) => {
      md_ids.push(token["MD_ID"]);
    });

    let obj;

    try {
      const { data } = await axios({
        method: "get",
        baseURL: `https://${Cfg.MARKET_URL}/api/v3`,
        headers: {
          "Content-type": "application/json; charset=utf-8",
          "cache-control": "no-cache",
        },
        url: "/simple/price",
        params: {
          ids: md_ids.join(","),
          vs_currencies: "usd",
        },
        timeout: 2000,
      });
      obj = data;
    } catch (err) {
      this.logger.error("MARKET_URL NET ERROR", err);
    }

    if (obj) {
      this.logger.debug(`sync market_price success ${JSON.stringify(obj)}`);
    }

    tokens.forEach((token) => {
      const md_id = token["MD_ID"];
      if (obj[md_id]) {
        market_tokens_price.push({
          NEAR_ID: token["NEAR_ID"],
          BASE_ID: "",
          price: obj[md_id]["usd"],
        });
      }
    });

    return market_tokens_price;
  }

  async pool_price(tokens) {
    // todo change batch query with limit
    this.logger.debug(`total ${tokens.length} need sync from rpc`);
    let pool_tokens_price = [];
    try {
      for (const token of tokens) {
        const [src, pool_id, base] = token["MD_ID"].split("|");
        const ret = await this.nearRPCService.view_call(
          src,
          "get_return",
          `{"pool_id": ${pool_id}, "token_in": "${
            token["NEAR_ID"]
          }", "amount_in": "${new BigNumber(10).pow(
            token["DECIMAL"]
          ).toFixed()}", "token_out": "${base}"}`
        );
        // this.logger.debug("pool_price nearRPCService res", ret);
        if (!ret.result) {
          throw new Error(`${src} get_return failed`);
        }
        let price = JSON.parse(String.fromCharCode(...ret.result));
        this.logger.debug(`${src} ${price}`)

        pool_tokens_price.push({
          NEAR_ID: token["NEAR_ID"],
          BASE_ID: base,
          price: price,
        });
      }
    } catch (err) {
      this.logger.error(err);
      pool_tokens_price = [];
    }
    return pool_tokens_price;
  }
}
