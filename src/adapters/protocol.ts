import type { MarketSnapshot } from "../domain/types.js";

export interface MarketQuery {
  chainId: number;
  assetSymbol: string;
  marketId?: string;
}

export interface ProtocolAdapter {
  readonly protocol: string;
  fetchMarket(query: MarketQuery): Promise<MarketSnapshot>;
}
