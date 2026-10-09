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
  }
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * v0.2.1 transparent heuristic, intentionally simple and recalibratable.
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
      "Deterministic security-posture heuristic using operating history, published reviews, bug-bounty coverage, governance, timelock, and active-incident flag.",
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
