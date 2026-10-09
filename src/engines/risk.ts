import type {
  MarketSnapshot,
  RiskAssessment,
  RiskBreakdown,
  RiskConfidence,
  RiskStatus
} from "../domain/types.js";

const MIN_DECISION_COVERAGE = 0.8;

const WEIGHTS: Record<keyof RiskBreakdown, number> = {
  utilization: 0.18,
  liquidity: 0.18,
  concentration: 0.12,
  depeg: 0.14,
  oracle: 0.12,
  smartContract: 0.12,
  chain: 0.07,
  protocol: 0.07
};

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

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

function protocolRisk(status: MarketSnapshot["protocolStatus"]): number | null {
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

function statusFromScore(score: number): RiskStatus {
  if (score <= 30) return "GREEN";
  if (score <= 60) return "WATCH";
  return "RED";
}

function confidenceFromCoverage(
  coverage: number,
  sourceConfidence: MarketSnapshot["dataQuality"]["confidence"]
): RiskConfidence {
  if (coverage >= 0.999 && sourceConfidence === "HIGH") return "HIGH";
  if (coverage >= MIN_DECISION_COVERAGE) return "MEDIUM";
  return "LOW";
}

export function assessRisk(snapshot: MarketSnapshot): RiskAssessment {
  const breakdown: RiskBreakdown = {
    utilization: utilizationRisk(snapshot),
    liquidity: liquidityRisk(snapshot),
    concentration: snapshot.borrowConcentrationPct,
    depeg: depegRisk(snapshot),
    oracle: snapshot.oracleRiskScore,
    smartContract: snapshot.smartContractRiskScore,
    chain: snapshot.chainRiskScore,
    protocol: protocolRisk(snapshot.protocolStatus)
  };

  const missingFields = Object.entries(breakdown)
    .filter(([, value]) => value === null || !Number.isFinite(value))
    .map(([key]) => key);

  const availableWeight = Object.entries(breakdown).reduce(
    (total, [key, value]) =>
      value === null || !Number.isFinite(value)
        ? total
        : total + WEIGHTS[key as keyof RiskBreakdown],
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
  if ((breakdown.utilization ?? 0) > 80) reasons.push("High market utilization.");
  if ((breakdown.liquidity ?? 0) > 70) reasons.push("Low available liquidity.");
  if ((breakdown.concentration ?? 0) > 60) reasons.push("Borrow concentration is elevated.");
  if ((breakdown.depeg ?? 0) > 50) reasons.push("Asset depeg risk is elevated.");
  if (snapshot.protocolStatus === "degraded") reasons.push("Protocol status is degraded.");
  if (snapshot.protocolStatus === "paused") reasons.push("Protocol is paused.");
  if (coverage < 1) {
    reasons.push(
      `Decision uses partial evidence coverage: ${coveragePct}% of configured risk weight.`
    );
  }

  if (snapshot.protocolStatus === "paused") {
    return {
      score: null,
      status: "RED",
      confidence: confidenceFromCoverage(
        coverage,
        snapshot.dataQuality.confidence
      ),
      coveragePct,
      breakdown,
      reasons,
      missingFields: [
        ...new Set([...missingFields, ...dataQualityBlocks])
      ]
    };
  }

  const unresolved = [...new Set([...missingFields, ...dataQualityBlocks])];

  if (dataQualityBlocks.length > 0 || coverage < MIN_DECISION_COVERAGE) {
    return {
      score: null,
      status: "VERIFY",
      confidence: confidenceFromCoverage(
        coverage,
        snapshot.dataQuality.confidence
      ),
      coveragePct,
      breakdown,
      reasons: [
        "Risk decision blocked because evidence coverage or data quality is below the decision gate.",
        ...reasons
      ],
      missingFields: unresolved
    };
  }

  const weightedRisk = Object.entries(breakdown).reduce(
    (total, [key, value]) => {
      if (value === null || !Number.isFinite(value)) return total;
      return total + value * WEIGHTS[key as keyof RiskBreakdown];
    },
    0
  );

  const score = clamp(weightedRisk / availableWeight);

  return {
    score: Math.round(score * 100) / 100,
    status: statusFromScore(score),
    confidence: confidenceFromCoverage(
      coverage,
      snapshot.dataQuality.confidence
    ),
    coveragePct,
    breakdown,
    reasons,
    missingFields
  };
}
