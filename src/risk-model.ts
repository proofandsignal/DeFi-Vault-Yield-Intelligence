import type { RiskBreakdown } from "./domain/types.js";

export interface ConcentrationBand {
  maxTopBorrowerPct: number;
  riskScore: number;
}

export interface RiskModelConfig {
  version: string;
  weights: Record<keyof RiskBreakdown, number>;
  minDecisionCoverage: number;
  greenMaxScore: number;
  watchMaxScore: number;
  hardStablecoinDepegBps: number;
  concentrationBands: ConcentrationBand[];
}

export const RISK_MODEL_V031: RiskModelConfig = {
  version: "0.3.1",
  weights: {
    utilization: 0.16,
    liquidity: 0.16,
    concentration: 0.16,
    depeg: 0.16,
    oracle: 0.14,
    smartContract: 0.1,
    chain: 0.05,
    protocol: 0.07
  },
  minDecisionCoverage: 0.8,
  greenMaxScore: 32,
  watchMaxScore: 62,
  hardStablecoinDepegBps: 300,
  concentrationBands: [
    { maxTopBorrowerPct: 5, riskScore: 10 },
    { maxTopBorrowerPct: 10, riskScore: 25 },
    { maxTopBorrowerPct: 20, riskScore: 45 },
    { maxTopBorrowerPct: 35, riskScore: 70 },
    { maxTopBorrowerPct: 100, riskScore: 100 }
  ]
};

export function concentrationRiskScore(
  topBorrowerPct: number | null,
  model: RiskModelConfig = RISK_MODEL_V031
): number | null {
  if (topBorrowerPct === null || !Number.isFinite(topBorrowerPct)) {
    return null;
  }

  const pct = Math.max(0, Math.min(100, topBorrowerPct));
  return (
    model.concentrationBands.find(
      (band) => pct <= band.maxTopBorrowerPct
    )?.riskScore ?? 100
  );
}
