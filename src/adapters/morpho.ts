import type { DataQuality, MarketSnapshot, ProtocolStatus } from "../domain/types.js";
import type { MarketQuery, ProtocolAdapter } from "./protocol.js";

export interface MorphoMarketRecord {
  chainId: number;
  chain: string;
  marketId: string;
  assetSymbol: string;
  assetAddress: string;
  assetDecimals: number;
  isStablecoin: boolean | null;
  supplyApyPct: number | null;
  rewardsApyPct: number | null;
  suppliedUsd: number | null;
  borrowedUsd: number | null;
  availableLiquidityUsd: number | null;
  borrowConcentrationPct: number | null;
  oracleAddress: string | null;
  oracleRiskScore: number | null;
  protocolStatus: ProtocolStatus;
  observedAt: string;
  source: string;
  dataQuality: DataQuality;
}

export interface MorphoDataSource {
  getMarket(query: MarketQuery): Promise<MorphoMarketRecord>;
}

export class MorphoAdapter implements ProtocolAdapter {
  readonly protocol = "morpho";

  constructor(private readonly source: MorphoDataSource) {}

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
      rewardsApyPct: raw.rewardsApyPct,
      suppliedUsd: raw.suppliedUsd,
      borrowedUsd: raw.borrowedUsd,
      availableLiquidityUsd: raw.availableLiquidityUsd,
      borrowConcentrationPct: raw.borrowConcentrationPct,
      stablecoinDepegBps: null,
      oracleAddress: raw.oracleAddress,
      oracleRiskScore: raw.oracleRiskScore,
      smartContractRiskScore: null,
      chainRiskScore: null,
      protocolStatus: raw.protocolStatus,
      observedAt: raw.observedAt,
      source: raw.source,
      dataQuality: raw.dataQuality
    };
  }
}
