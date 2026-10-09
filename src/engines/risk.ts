import type {
  MarketSnapshot,
  RiskAssessment,
  RiskBreakdown,
  RiskStatus
} from "../domain/types.js";

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

function utilizationRisk(snapshot: MarketSnapshot): number | null {
  if (
    snapshot.suppliedUsd === null ||
    snapshot.borrowedUsd === null ||
    snapshot.suppliedUsd <= 0
  ) {
    return null;
  }

  const utilization = snapshot.borrowedUsd / snapshot.suppliedUsd;
  return clamp(utilization * 100);
}

function liquidityRisk(snapshot: MarketSnapshot): number | null {
  if (
    snapshot.availableLiquidityUsd === null ||
    snapshot.suppliedUsd === null ||
    snapshot.suppliedUsd <= 0
  ) {
    return null;
  }

  const liquidityRatio = snapshot.availableLiquidityUsd / snapshot.suppliedUsd;
  return clamp((1 - liquidityRatio) * 100);
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

  const weights: Record<keyof RiskBreakdown, number> = {
    utilization: 0.18,
    liquidity: 0.18,
    concentration: 0.12,
    depeg: 0.14,
    oracle: 0.12,
    smartContract: 0.12,
    chain: 0.07,
    protocol: 0.07
  };

  const missingFields = Object.entries(breakdown)
    .filter(([, value]) => value === null || !Number.isFinite(value))
    .map(([key]) => key);

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

  // A confirmed pause is a conservative hard RED even if other inputs are absent.
  if (snapshot.protocolStatus === "paused") {
    return {
      score: null,
      status: "RED",
      breakdown,
      reasons,
      missingFields: [...new Set([...missingFields, ...dataQualityBlocks])]
    };
  }

  const unresolved = [...new Set([...missingFields, ...dataQualityBlocks])];
  if (unresolved.length > 0) {
    return {
      score: null,
      status: "VERIFY",
      breakdown,
      reasons: [
        "Risk decision blocked because required risk or data-quality inputs are unresolved.",
        ...reasons
      ],
      missingFields: unresolved
    };
  }

  const score = clamp(
    Object.entries(breakdown).reduce((total, [key, value]) => {
      return total + (value as number) * weights[key as keyof RiskBreakdown];
    }, 0)
  );

  return {
    score: Math.round(score * 100) / 100,
    status: statusFromScore(score),
    breakdown,
    reasons,
    missingFields: []
  };
}
