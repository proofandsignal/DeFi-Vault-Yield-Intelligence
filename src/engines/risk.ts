import type {
  MarketSnapshot,
  RiskAssessment,
  RiskBreakdown,
  RiskConfidence,
  RiskStatus
} from "../domain/types.js";
import {
  concentrationRiskScore,
  RISK_MODEL_V031,
  type RiskModelConfig
} from "../risk-model.js";

const clamp = (value: number): number =>
  Math.max(0, Math.min(100, value));

function utilizationRisk(snapshot: MarketSnapshot): number | null {
  if (
    snapshot.suppliedUsd === null ||
    snapshot.borrowedUsd === null ||
    snapshot.suppliedUsd <= 0
  ) {
    return null;
  }

  return clamp((snapshot.borrowedUsd / snapshot.suppliedUsd) * 100);
}

function liquidityRisk(snapshot: MarketSnapshot): number | null {
  if (
    snapshot.availableLiquidityUsd === null ||
    snapshot.suppliedUsd === null ||
    snapshot.suppliedUsd <= 0
  ) {
    return null;
  }

  return clamp(
    (1 - snapshot.availableLiquidityUsd / snapshot.suppliedUsd) * 100
  );
}

function depegRisk(snapshot: MarketSnapshot): number | null {
  if (snapshot.asset.isStablecoin === false) return 0;
  if (snapshot.stablecoinDepegBps === null) return null;
  return clamp(Math.abs(snapshot.stablecoinDepegBps) / 2);
}

function protocolRisk(
  status: MarketSnapshot["protocolStatus"]
): number | null {
  switch (status) {
    case "operational":
      return 10;
    case "degraded":
      return 65;
    case "paused":
      return 100;
    case "unknown":
      return null;
  }
}

function statusFromScore(
  score: number,
  model: RiskModelConfig
): RiskStatus {
  if (score <= model.greenMaxScore) return "GREEN";
  if (score <= model.watchMaxScore) return "WATCH";
  return "RED";
}

function confidenceFromCoverage(
  coverage: number,
  sourceConfidence: MarketSnapshot["dataQuality"]["confidence"],
  model: RiskModelConfig
): RiskConfidence {
  if (coverage >= 0.999 && sourceConfidence === "HIGH") return "HIGH";
  if (coverage >= model.minDecisionCoverage) return "MEDIUM";
  return "LOW";
}

export function assessRisk(
  snapshot: MarketSnapshot,
  model: RiskModelConfig = RISK_MODEL_V031
): RiskAssessment {
  const breakdown: RiskBreakdown = {
    utilization: utilizationRisk(snapshot),
    liquidity: liquidityRisk(snapshot),
    concentration: concentrationRiskScore(
      snapshot.borrowConcentrationPct,
      model
    ),
    depeg: depegRisk(snapshot),
    oracle: snapshot.oracleRiskScore,
    smartContract: snapshot.smartContractRiskScore,
    chain: snapshot.chainRiskScore,
    protocol: protocolRisk(snapshot.protocolStatus)
  };

  const missingFields = Object.entries(breakdown)
    .filter(([, value]) => value === null || !Number.isFinite(value))
    .map(([key]) => key);

  const criticalRiskBlocks: string[] = [];
  if (snapshot.asset.isStablecoin && breakdown.depeg === null) {
    criticalRiskBlocks.push("depeg");
  }
  if (breakdown.oracle === null) criticalRiskBlocks.push("oracle");
  if (breakdown.smartContract === null) {
    criticalRiskBlocks.push("smartContract");
  }
  if (breakdown.chain === null) criticalRiskBlocks.push("chain");

  const availableWeight = Object.entries(breakdown).reduce(
    (total, [key, value]) =>
      value === null || !Number.isFinite(value)
        ? total
        : total + model.weights[key as keyof RiskBreakdown],
    0
  );

  const coverage = Math.max(0, Math.min(1, availableWeight));
  const coveragePct = Math.round(coverage * 10_000) / 100;

  const dataQualityBlocks: string[] = [];
  if (snapshot.dataQuality.freshness !== "FRESH") {
    dataQualityBlocks.push("data.freshness");
  }
  if (
    snapshot.dataQuality.confidence === "LOW" ||
    snapshot.dataQuality.confidence === "UNKNOWN"
  ) {
    dataQualityBlocks.push("data.confidence");
  }
  for (const field of snapshot.dataQuality.missingCriticalFields) {
    dataQualityBlocks.push(`data.${field}`);
  }

  const reasons: string[] = [];
  if ((breakdown.utilization ?? 0) > 80) {
    reasons.push("High market utilization.");
  }
  if ((breakdown.liquidity ?? 0) > 70) {
    reasons.push("Low available liquidity.");
  }
  if ((snapshot.borrowConcentrationPct ?? 0) > 20) {
    reasons.push("Top-borrower concentration is elevated.");
  }
  if ((breakdown.depeg ?? 0) > 50) {
    reasons.push("Asset depeg risk is elevated.");
  }
  if (snapshot.protocolStatus === "degraded") {
    reasons.push("Protocol status is degraded.");
  }
  if (snapshot.protocolStatus === "paused") {
    reasons.push("Protocol is paused.");
  }
  if (coverage < 1) {
    reasons.push(
      `Decision uses partial evidence coverage: ${coveragePct}% of configured risk weight.`
    );
  }

  const hardDepeg =
    snapshot.asset.isStablecoin === true &&
    snapshot.stablecoinDepegBps !== null &&
    Math.abs(snapshot.stablecoinDepegBps) >=
      model.hardStablecoinDepegBps;

  if (hardDepeg) {
    reasons.unshift(
      `Stablecoin depeg exceeded the ${model.hardStablecoinDepegBps} bps hard safety gate.`
    );
  }

  if (snapshot.protocolStatus === "paused" || hardDepeg) {
    return {
      score: null,
      status: "RED",
      confidence: confidenceFromCoverage(
        coverage,
        snapshot.dataQuality.confidence,
        model
      ),
      coveragePct,
      breakdown,
      reasons,
      missingFields: [
        ...new Set([
          ...missingFields,
          ...criticalRiskBlocks,
          ...dataQualityBlocks
        ])
      ]
    };
  }

  const unresolved = [
    ...new Set([
      ...missingFields,
      ...criticalRiskBlocks,
      ...dataQualityBlocks
    ])
  ];

  if (
    dataQualityBlocks.length > 0 ||
    criticalRiskBlocks.length > 0 ||
    coverage < model.minDecisionCoverage
  ) {
    return {
      score: null,
      status: "VERIFY",
      confidence: confidenceFromCoverage(
        coverage,
        snapshot.dataQuality.confidence,
        model
      ),
      coveragePct,
      breakdown,
      reasons: [
        "Risk decision blocked because critical evidence, evidence coverage, or data quality is below the decision gate.",
        ...reasons
      ],
      missingFields: unresolved
    };
  }

  const weightedRisk = Object.entries(breakdown).reduce(
    (total, [key, value]) => {
      if (value === null || !Number.isFinite(value)) return total;
      return total + value * model.weights[key as keyof RiskBreakdown];
    },
    0
  );

  const score = clamp(weightedRisk / availableWeight);

  return {
    score: Math.round(score * 100) / 100,
    status: statusFromScore(score, model),
    confidence: confidenceFromCoverage(
      coverage,
      snapshot.dataQuality.confidence,
      model
    ),
    coveragePct,
    breakdown,
    reasons,
    missingFields
  };
}
