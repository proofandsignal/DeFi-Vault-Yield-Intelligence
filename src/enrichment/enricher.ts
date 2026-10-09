import type { MarketSnapshot } from "../domain/types.js";
import { chainRiskEvidence } from "./chain-registry.js";
import { DefiLlamaPriceSource } from "./defillama-price.js";
import {
  findOracleProfile,
  oracleMetadataEvidence
} from "./oracle-registry.js";
import { protocolSecurityEvidence } from "./protocol-registry.js";
import type {
  BorrowConcentrationProvider,
  EnrichmentResult,
  IndependentPriceSource,
  RiskDimension,
  RiskEvidence
} from "./types.js";

export class IndependentRiskEnricher {
  constructor(
    private readonly priceSource: IndependentPriceSource =
      new DefiLlamaPriceSource(),
    private readonly concentrationProvider?: BorrowConcentrationProvider
  ) {}

  async enrich(input: MarketSnapshot): Promise<EnrichmentResult> {
    const snapshot: MarketSnapshot = structuredClone(input);
    const evidence: RiskEvidence[] = [];
    const unresolved = new Set<RiskDimension>();

    if (snapshot.asset.isStablecoin) {
      const quote = await this.priceSource.quote(snapshot);
      if (quote) {
        const depegBps = Math.abs(quote.priceUsd - 1) * 10_000;
        snapshot.stablecoinDepegBps = depegBps;

        evidence.push({
          dimension: "stablecoin",
          source: quote.source,
          reviewedAt: new Date().toISOString(),
          confidence:
            quote.confidence !== null && quote.confidence >= 0.9
              ? "HIGH"
              : "MEDIUM",
          methodology:
            "Independent spot-price cross-check versus the USD peg. Risk input is absolute deviation from $1 expressed in basis points.",
          value: depegBps,
          details: {
            priceUsd: quote.priceUsd,
            timestamp: quote.timestamp,
            sourceConfidence: quote.confidence
          }
        });
      } else {
        snapshot.stablecoinDepegBps = null;
        unresolved.add("stablecoin");
      }
    }

    if (snapshot.oracleRiskScore !== null) {
      evidence.push({
        dimension: "oracle",
        source: snapshot.source,
        reviewedAt: snapshot.observedAt,
        confidence: "MEDIUM",
        methodology:
          "Protocol-specific oracle evidence supplied by the protocol adapter from live oracle type/status or warning signals.",
        value: snapshot.oracleRiskScore,
        details: {
          configuredOracleAddress: snapshot.oracleAddress,
          protocol: snapshot.protocol
        }
      });
    } else {
      const oracleProfile = findOracleProfile(
        snapshot.chainId,
        snapshot.asset.symbol
      );
      if (oracleProfile) {
        const oracleEvidence = oracleMetadataEvidence(oracleProfile);
        snapshot.oracleRiskScore = oracleEvidence.value;
        oracleEvidence.details.configuredOracleAddress =
          snapshot.oracleAddress;
        evidence.push(oracleEvidence);
      } else {
        snapshot.oracleRiskScore = null;
        unresolved.add("oracle");
      }
    }

    const protocolEvidence = protocolSecurityEvidence(snapshot.protocol);
    if (protocolEvidence) {
      snapshot.smartContractRiskScore = protocolEvidence.value;
      evidence.push(protocolEvidence);
    } else {
      snapshot.smartContractRiskScore = null;
      unresolved.add("smartContract");
    }

    const chainEvidence = chainRiskEvidence(snapshot.chainId);
    if (chainEvidence) {
      snapshot.chainRiskScore = chainEvidence.value;
      evidence.push(chainEvidence);
    } else {
      snapshot.chainRiskScore = null;
      unresolved.add("chain");
    }

    if (this.concentrationProvider) {
      const concentration =
        await this.concentrationProvider.concentration(snapshot);
      if (concentration) {
        snapshot.borrowConcentrationPct = concentration.topBorrowerPct;
        evidence.push({
          dimension: "concentration",
          source: concentration.source,
          reviewedAt: concentration.observedAt,
          confidence: "MEDIUM",
          methodology:
            "Largest observed borrower share of reserve borrows.",
          value: concentration.topBorrowerPct,
          details: {
            topBorrowerPct: concentration.topBorrowerPct
          }
        });
      } else {
        snapshot.borrowConcentrationPct = null;
        unresolved.add("concentration");
      }
    } else {
      snapshot.borrowConcentrationPct = null;
      unresolved.add("concentration");
    }

    return {
      snapshot,
      evidence,
      unresolved: [...unresolved]
    };
  }
}
