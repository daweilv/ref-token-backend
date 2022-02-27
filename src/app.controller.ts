import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";
import { TokenMetaInterface } from "./interfaces/token-meta.interface";
import { ListTokenPriceInterface } from "./interfaces/list-token-price.interface";
import { TokenPriceInterface } from "./interfaces/token-price.interface";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

  /**
   * all tokens price
   * price from coingecko or native pool
   * /list-token-price
   */
  @Get("list-token-price")
  getListTokenPrice(): Promise<ListTokenPriceInterface> {
    return this.appService.getListTokenPrice();
  }

  /**
   * all tokens metadata
   * /list-token
   */
  @Get("list-token")
  getListTokenMeta(): Promise<Record<string, TokenMetaInterface>> {
    return this.appService.getListTokenMeta();
  }

  /**
   * token price by token id
   * /get-token-price?token_id=<token_id>
   */
  @Get("get-token-price")
  getTokenPrice(
    @Query("token_id") token_contract_id: string
  ): Promise<TokenPriceInterface> {
    return this.appService.getTokenPrice(
      token_contract_id ? token_contract_id : "N/A"
    );
  }
}
