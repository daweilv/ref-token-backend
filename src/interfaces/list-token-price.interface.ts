export interface ListTokenPriceItemInterface {
  decimal: number;
  price: string;
  symbol: string;
}

export type ListTokenPriceInterface = Record<
  string,
  ListTokenPriceItemInterface
>;
