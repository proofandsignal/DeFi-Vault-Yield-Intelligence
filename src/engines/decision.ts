import type { MarketSnapshot, RiskAssessment } from "../domain/types.js";
import { assessRisk } from "./risk.js";

export interface MarketDecision {
  market: MarketSnapshot;
  risk: RiskAssessment;
  eligibleForResearch: boolean;
}

/**
 * v0.1 is intentionally non-executing.
 * This function produces research/monitoring decisions only.
 */
export function evaluateMarket(snapshot: MarketSnapshot): MarketDecision {
  const risk = assessRisk(snapshot);

  return {
    market: snapshot,
    risk,
    eligibleForResearch: risk.status === "GREEN" || risk.status === "WATCH"
  };
}
