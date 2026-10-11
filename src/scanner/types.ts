import type {
  RiskAssessment,
  RiskStatus
} from "../domain/types.js";
import type { RiskEvidence } from "../enrichment/types.js";

export type SupportedProtocol =
  | "aave"
  | "morpho"
  | "compound"
  | "spark";

export interface ScannerQuery {
  chainId: number;
  assetSymbol: string;
  protocols?: SupportedProtocol[];
  principalUsd?: number;
  annualCostsUsd?: number;
  performanceFeeRate?: number;
  includeEvidence?: boolean;
}

export interface ComparisonAssumptions {
  principalUsd: number | null;
  annualCostsUsd: number | null;
  performanceFeeRate: number | null;
  netEstimateAvailable: boolean;
  note: string;
}

export interface ScannerRow {
  protocol: SupportedProtocol;
  chainId: number;
  chain: string;
  assetSymbol: string;
  marketId: string;

  baseSupplyApyPct: number | null;
  knownRewardsApyPct: number | null;
  observedGrossApyPct: number | null;
  estimatedNetApyPct: number | null;
  riskAdjustedObservedYieldPct: number | null;
  riskAdjustedNetYieldPct: number | null;

  suppliedUsd: number | null;
  borrowedUsd: number | null;
  availableLiquidityUsd: number | null;
  utilizationPct: number | null;
  topBorrowerPct: number | null;

  riskStatus: RiskStatus;
  riskScore: number | null;
  riskConfidence: RiskAssessment["confidence"];
  evidenceCoveragePct: number;
  unresolved: string[];

  observedAt: string;
  dataFreshness: string;
  dataConfidence: string;
  evidenceCount: number;
  evidenceSources: string[];
  evidence?: RiskEvidence[];
}

export interface ScannerError {
  protocol: SupportedProtocol;
  code: "SOURCE_UNAVAILABLE" | "UNSUPPORTED_MARKET" | "INTERNAL";
  message: string;
}

export interface ScannerResponse {
  schemaVersion: "0.4.0";
  riskModelVersion: string;
  generatedAt: string;
  complete: boolean;
  query: {
    chainId: number;
    assetSymbol: string;
    protocols: SupportedProtocol[];
  };
  assumptions: ComparisonAssumptions;
  rankingMetric:
    | "riskAdjustedNetYieldPct"
    | "riskAdjustedObservedYieldPct";
  rows: ScannerRow[];
  errors: ScannerError[];
}
