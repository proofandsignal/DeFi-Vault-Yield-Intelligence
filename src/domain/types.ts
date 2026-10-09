export type RiskStatus = "GREEN" | "WATCH" | "RED" | "VERIFY";
export type ProtocolStatus = "operational" | "degraded" | "paused" | "unknown";

export interface AssetRef {
  symbol: string;
  address: string;
  decimals: number;
}

export interface MarketSnapshot {
  protocol: string;
  chainId: number;
  chain: string;
  marketId: string;
  asset: AssetRef;

  grossApyPct: number | null;
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

export interface RiskBreakdown {
  utilization: number | null;
  liquidity: number | null;
  concentration: number | null;
  depeg: number | null;
  oracle: number | null;
  smartContract: number | null;
  chain: number | null;
  protocol: number | null;
}

export interface RiskAssessment {
  score: number | null;
  status: RiskStatus;
  breakdown: RiskBreakdown;
  reasons: string[];
  missingFields: string[];
}

export interface FeeModel {
  performanceFeeRate: number;
  platformShareRate: number;
}

export interface YieldSimulationInput {
  principalUsd: number;
  grossApyPct: number;
  rewardsApyPct?: number;
  feeModel: FeeModel;
  annualOperatingCostUsd?: number;
}

export interface YieldSimulation {
  grossYieldUsd: number;
  totalPerformanceFeeUsd: number;
  platformFeeShareUsd: number;
  managerFeeShareUsd: number;
  operatingCostUsd: number;
  userNetYieldUsd: number;
  userNetApyPct: number;
}
