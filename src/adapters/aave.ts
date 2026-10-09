import type { MarketSnapshot, ProtocolStatus } from "../domain/types.js";
import type { MarketQuery, ProtocolAdapter } from "./protocol.js";

export interface AaveMarketRecord {
  chainId: number;
  chain: string;
  reserveId: string;
  assetSymbol: string;
  assetAddress: string;
  assetDecimals: number;
  supplyApyPct: number | null;
  rewardsApyPct: number | null;
  suppliedUsd: number | null;
  borrowedUsd: number | null;
  availableLiquidityUsd: number | null;
  borrowConcentrationPct: number | null;
  stablecoinDepegBps: number | null;
  oracleRiskScore: number | null;
  smartContractRiskScore: number | null;
  chainRiskScore: number | null;
  protocolStatus: ProtocolStatus;
  observedAt: string;
  source: string;
}

export interface AaveDataSource {
  getMarket(query: MarketQuery): Promise<AaveMarketRecord>;
}

/**
 * Adapter #001.
 *
 * The adapter is deliberately thin: Aave-specific retrieval belongs in the
 * data source while every downstream engine consumes MarketSnapshot only.
 */
export class AaveAdapter implements ProtocolAdapter {
  readonly protocol = "aave";

  constructor(private readonly source: AaveDataSource) {}

  async fetchMarket(query: MarketQuery): Promise<MarketSnapshot> {
    const raw = await this.source.getMarket(query);

    return {
      protocol: this.protocol,
      chainId: raw.chainId,
      chain: raw.chain,
      marketId: raw.reserveId,
      asset: {
        symbol: raw.assetSymbol,
        address: raw.assetAddress,
        decimals: raw.assetDecimals
      },
      grossApyPct: raw.supplyApyPct,
      rewardsApyPct: raw.rewardsApyPct,
      suppliedUsd: raw.suppliedUsd,
      borrowedUsd: raw.borrowedUsd,
      availableLiquidityUsd: raw.availableLiquidityUsd,
      borrowConcentrationPct: raw.borrowConcentrationPct,
      stablecoinDepegBps: raw.stablecoinDepegBps,
      oracleRiskScore: raw.oracleRiskScore,
      smartContractRiskScore: raw.smartContractRiskScore,
      chainRiskScore: raw.chainRiskScore,
      protocolStatus: raw.protocolStatus,
      observedAt: raw.observedAt,
      source: raw.source
    };
  }
}
