import type { RiskEvidence } from "./types.js";

export interface ChainRiskProfile {
  chainId: number;
  architecture: "L1" | "OPTIMISTIC_ROLLUP";
  stage: number | null;
  centralizedSequencer: boolean;
  dataAvailabilityOnL1: boolean;
  forcedInclusionOrSelfSequence: boolean;
  emergencyUpgradeWithoutExitWindow: boolean;
  source: string;
  reviewedAt: string;
}

const PROFILES: ChainRiskProfile[] = [
  {
    chainId: 1,
    architecture: "L1",
    stage: null,
    centralizedSequencer: false,
    dataAvailabilityOnL1: true,
    forcedInclusionOrSelfSequence: true,
    emergencyUpgradeWithoutExitWindow: false,
    source: "https://ethereum.org/",
    reviewedAt: "2026-10-09"
  },
  {
    chainId: 10,
    architecture: "OPTIMISTIC_ROLLUP",
    stage: 1,
    centralizedSequencer: true,
    dataAvailabilityOnL1: true,
    forcedInclusionOrSelfSequence: true,
    emergencyUpgradeWithoutExitWindow: true,
    source: "https://l2beat.com/layer2s/projects/op-mainnet",
    reviewedAt: "2026-10-09"
  },
  {
    chainId: 42161,
    architecture: "OPTIMISTIC_ROLLUP",
    stage: 1,
    centralizedSequencer: true,
    dataAvailabilityOnL1: true,
    forcedInclusionOrSelfSequence: true,
    emergencyUpgradeWithoutExitWindow: true,
    source: "https://l2beat.com/layer2s/projects/arbitrum",
    reviewedAt: "2026-10-09"
  }
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function chainRiskEvidence(chainId: number): RiskEvidence | null {
  const profile = PROFILES.find((item) => item.chainId === chainId);
  if (!profile) return null;

  let score = profile.architecture === "L1" ? 10 : 15;
  if (profile.centralizedSequencer) score += 15;
  if (profile.emergencyUpgradeWithoutExitWindow) score += 15;
  if (profile.dataAvailabilityOnL1) score -= 5;
  if (profile.forcedInclusionOrSelfSequence) score -= 5;
  if (profile.stage !== null && profile.stage >= 1) score -= 5;

  return {
    dimension: "chain",
    source: profile.source,
    reviewedAt: profile.reviewedAt,
    confidence: "MEDIUM",
    methodology:
      "Deterministic architecture heuristic over settlement model, sequencer dependency, L1 data availability, forced-inclusion/self-sequencing escape path, maturity stage, and emergency upgrade risk.",
    value: clamp(score),
    details: {
      architecture: profile.architecture,
      stage: profile.stage,
      centralizedSequencer: profile.centralizedSequencer,
      dataAvailabilityOnL1: profile.dataAvailabilityOnL1,
      forcedInclusionOrSelfSequence: profile.forcedInclusionOrSelfSequence,
      emergencyUpgradeWithoutExitWindow:
        profile.emergencyUpgradeWithoutExitWindow
    }
  };
}
