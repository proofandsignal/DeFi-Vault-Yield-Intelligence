import type { MarketSnapshot } from "../domain/types.js";

export type EvidenceConfidence = "HIGH" | "MEDIUM" | "LOW";
export type RiskDimension =
  | "stablecoin"
  | "oracle"
  | "smartContract"
  | "chain"
  | "concentration";

export interface RiskEvidence {
  dimension: RiskDimension;
  source: string;
  reviewedAt: string;
  confidence: EvidenceConfidence;
  methodology: string;
  value: number | null;
  details: Record<string, string | number | boolean | null>;
}

export interface IndependentPriceQuote {
  priceUsd: number;
  timestamp: number | null;
  confidence: number | null;
  source: string;
}

export interface IndependentPriceSource {
  quote(snapshot: MarketSnapshot): Promise<IndependentPriceQuote | null>;
}

export interface BorrowConcentrationResult {
  topBorrowerPct: number;
  source: string;
  observedAt: string;
}

export interface BorrowConcentrationProvider {
  concentration(
    snapshot: MarketSnapshot
  ): Promise<BorrowConcentrationResult | null>;
}

export interface EnrichmentResult {
  snapshot: MarketSnapshot;
  evidence: RiskEvidence[];
  unresolved: RiskDimension[];
}
