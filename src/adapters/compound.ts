import type { DataQuality, MarketSnapshot, ProtocolStatus } from "../domain/types.js";
import type { MarketQuery, ProtocolAdapter } from "./protocol.js";

export interface CompoundMarketRecord {
  chainId: number;
  chain: string;
  marketId: string;
  assetSymbol: string;
  assetAddress: string;
  assetDecimals: number;
  isStablecoin: boolean | null;
  supplyApyPct: number | null;
  suppliedUsd: number | null;
  borrowedUsd: number | null;
  availableLiquidityUsd: number | null;
  oracleAddress: string | null;
  protocolStatus: ProtocolStatus;
  observedAt: string;
  source: string;
  dataQuality: DataQuality;
}

export interface CompoundDataSource {
  getMarket(query: MarketQuery): Promise<CompoundMarketRecord>;
}

export class CompoundAdapter implements ProtocolAdapter {
  readonly protocol = "compound";

  constructor(private readonly source: CompoundDataSource) {}

  async fetchMarket(query: MarketQuery): Promise<MarketSnapshot> {
    const raw = await this.source.getMarket(query);

    return {
      protocol: this.protocol,
      chainId: raw.chainId,
      chain: raw.chain,
      marketId: raw.marketId,
      asset: {
        symbol: raw.assetSymbol,
        address: raw.assetAddress,
        decimals: raw.assetDecimals,
        isStablecoin: raw.isStablecoin
      },
      grossApyPct: raw.supplyApyPct,
      rewardsApyPct: null,
      suppliedUsd: raw.suppliedUsd,
      borrowedUsd: raw.borrowedUsd,
      availableLiquidityUsd: raw.availableLiquidityUsd,
      borrowConcentrationPct: null,
      stablecoinDepegBps: null,
      oracleAddress: raw.oracleAddress,
      oracleRiskScore: null,
      smartContractRiskScore: null,
      chainRiskScore: null,
      protocolStatus: raw.protocolStatus,
      observedAt: raw.observedAt,
      source: raw.source,
      dataQuality: raw.dataQuality
    };
  }
}
