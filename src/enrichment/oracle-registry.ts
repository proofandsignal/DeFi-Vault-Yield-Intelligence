import type { RiskEvidence } from "./types.js";

export type OracleMarketRisk =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VERY_HIGH"
  | "NEW"
  | "CUSTOM"
  | "DEPRECATING";

export interface OracleProfile {
  chainId: number;
  assetSymbol: string;
  provider: string;
  feedType: "market-price" | "custom";
  feedAddress: string;
  heartbeatSeconds: number;
  deviationBps: number;
  marketRisk: OracleMarketRisk;
  source: string;
  heartbeatSource: string;
  reviewedAt: string;
}

const PROFILES: OracleProfile[] = [
  {
    chainId: 1,
    assetSymbol: "USDC",
    provider: "chainlink",
    feedType: "market-price",
    feedAddress: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
    heartbeatSeconds: 86400,
    deviationBps: 25,
    marketRisk: "LOW",
    source: "https://data.chain.link/feeds/ethereum/mainnet/usdc-usd",
    heartbeatSource: "https://docs.kpk.dev/fund-products/resources/deployment-addresses/",
    reviewedAt: "2026-10-09"
  },
  {
    chainId: 10,
    assetSymbol: "USDC",
    provider: "chainlink",
    feedType: "market-price",
    feedAddress: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
    heartbeatSeconds: 86400,
    deviationBps: 10,
    marketRisk: "LOW",
    source: "https://data.chain.link/feeds/optimism/mainnet/usdc-usd",
    heartbeatSource: "https://docs.kpk.dev/fund-products/resources/deployment-addresses/",
    reviewedAt: "2026-10-09"
  },
  {
    chainId: 42161,
    assetSymbol: "USDC",
    provider: "chainlink",
    feedType: "market-price",
    feedAddress: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    heartbeatSeconds: 86400,
    deviationBps: 10,
    marketRisk: "LOW",
    source: "https://data.chain.link/feeds/arbitrum/mainnet/usdc-usd",
    heartbeatSource: "https://docs.kpk.dev/fund-products/resources/deployment-addresses/",
    reviewedAt: "2026-10-09"
  }
];

const MARKET_RISK_SCORE: Record<OracleMarketRisk, number> = {
  LOW: 15,
  MEDIUM: 40,
  HIGH: 70,
  VERY_HIGH: 90,
  NEW: 60,
  CUSTOM: 70,
  DEPRECATING: 100
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function findOracleProfile(
  chainId: number,
  assetSymbol: string
): OracleProfile | null {
  return (
    PROFILES.find(
      (profile) =>
        profile.chainId === chainId &&
        profile.assetSymbol === assetSymbol.toUpperCase()
    ) ?? null
  );
}

/**
 * Transparent metadata score. It does not claim that the feed is live;
 * latestRoundData staleness monitoring is a separate future signal.
 */
export function oracleMetadataEvidence(
  profile: OracleProfile
): RiskEvidence {
  let score = MARKET_RISK_SCORE[profile.marketRisk];

  if (profile.feedType === "custom") score += 20;
  if (profile.deviationBps > 100) score += 15;
  else if (profile.deviationBps > 50) score += 10;
  else if (profile.deviationBps > 25) score += 5;

  if (profile.heartbeatSeconds > 86400) score += 10;
  else if (profile.heartbeatSeconds > 3600) score += 5;

  return {
    dimension: "oracle",
    source: profile.source,
    reviewedAt: profile.reviewedAt,
    confidence: "MEDIUM",
    methodology:
      "Chainlink market-risk category plus feed type, deviation threshold, and heartbeat metadata. Does not substitute for latestRoundData staleness monitoring.",
    value: clamp(score),
    details: {
      provider: profile.provider,
      feedType: profile.feedType,
      feedAddress: profile.feedAddress,
      heartbeatSeconds: profile.heartbeatSeconds,
      deviationBps: profile.deviationBps,
      marketRisk: profile.marketRisk,
      heartbeatSource: profile.heartbeatSource
    }
  };
}
