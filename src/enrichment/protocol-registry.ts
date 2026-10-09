import type { RiskEvidence } from "./types.js";

export interface ProtocolSecurityProfile {
  protocol: string;
  yearsContinuousOperation: number;
  publishedAuditsAndReviews: number;
  maxLiveBugBountyUsd: number;
  onchainGovernance: boolean;
  mandatoryTimelock: boolean;
  activeCriticalIncident: boolean;
  source: string;
  reviewedAt: string;
}

const PROFILES: ProtocolSecurityProfile[] = [
  {
    protocol: "aave",
    yearsContinuousOperation: 6,
    publishedAuditsAndReviews: 65,
    maxLiveBugBountyUsd: 5_000_000,
    onchainGovernance: true,
    mandatoryTimelock: true,
    activeCriticalIncident: false,
    source: "https://www.aave.com/security",
    reviewedAt: "2026-10-09"
  },
  {
    protocol: "morpho",
    yearsContinuousOperation: 2,
    publishedAuditsAndReviews: 4,
    maxLiveBugBountyUsd: 2_500_000,
    onchainGovernance: false,
    mandatoryTimelock: false,
    activeCriticalIncident: false,
    source: "https://docs.morpho.org/learn/resources/risks/",
    reviewedAt: "2026-10-09"
  },
  {
    protocol: "compound",
    yearsContinuousOperation: 4,
    publishedAuditsAndReviews: 2,
    maxLiveBugBountyUsd: 1_000_000,
    onchainGovernance: true,
    mandatoryTimelock: true,
    activeCriticalIncident: false,
    source: "https://docs.compound.finance/",
    reviewedAt: "2026-10-09"
  },
  {
    protocol: "spark",
    yearsContinuousOperation: 3,
    publishedAuditsAndReviews: 2,
    maxLiveBugBountyUsd: 5_000_000,
    onchainGovernance: true,
    mandatoryTimelock: false,
    activeCriticalIncident: false,
    source: "https://spark.fi/",
    reviewedAt: "2026-10-09"
  }
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Transparent security-posture heuristic, intentionally simple and
 * recalibratable. Audit counts are conservative verified lower bounds rather
 * than claims that every review covers the exact live market configuration.
 *
 * Lower score = lower observed smart-contract/protocol security risk.
 */
export function protocolSecurityEvidence(
  protocol: string
): RiskEvidence | null {
  const profile = PROFILES.find(
    (item) => item.protocol === protocol.toLowerCase()
  );
  if (!profile) return null;

  let score = 100;
  if (profile.yearsContinuousOperation >= 3) score -= 20;
  if (profile.publishedAuditsAndReviews >= 10) score -= 25;
  if (profile.maxLiveBugBountyUsd >= 1_000_000) score -= 25;
  if (profile.onchainGovernance) score -= 10;
  if (profile.mandatoryTimelock) score -= 10;
  if (profile.activeCriticalIncident) score += 50;

  return {
    dimension: "smartContract",
    source: profile.source,
    reviewedAt: profile.reviewedAt,
    confidence: "MEDIUM",
    methodology:
      "Deterministic security-posture heuristic using operating history, conservative verified review count, bug-bounty coverage, governance, timelock, and active-incident flag. This score is explicitly uncalibrated.",
    value: clamp(score),
    details: {
      yearsContinuousOperation: profile.yearsContinuousOperation,
      publishedAuditsAndReviews: profile.publishedAuditsAndReviews,
      maxLiveBugBountyUsd: profile.maxLiveBugBountyUsd,
      onchainGovernance: profile.onchainGovernance,
      mandatoryTimelock: profile.mandatoryTimelock,
      activeCriticalIncident: profile.activeCriticalIncident
    }
  };
}
