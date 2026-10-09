import assert from "node:assert/strict";
import test from "node:test";

import {
  IndependentRiskEnricher,
  assessRisk,
  type IndependentPriceSource,
  type MarketSnapshot
} from "../src/index.js";

const snapshot: MarketSnapshot = {
  protocol: "aave",
  chainId: 1,
  chain: "Ethereum",
  marketId: "market:usdc",
  asset: {
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    isStablecoin: true
  },
  grossApyPct: 4,
  rewardsApyPct: null,
  suppliedUsd: 100_000_000,
  borrowedUsd: 50_000_000,
  availableLiquidityUsd: 50_000_000,
  borrowConcentrationPct: null,
  stablecoinDepegBps: null,
  oracleAddress: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  oracleRiskScore: null,
  smartContractRiskScore: null,
  chainRiskScore: null,
  protocolStatus: "operational",
  observedAt: "2026-10-09T16:00:00.000Z",
  source: "fixture",
  dataQuality: {
    source: "fixture",
    fetchedAt: "2026-10-09T16:00:00.000Z",
    evaluatedAt: "2026-10-09T16:00:10.000Z",
    ageSeconds: 10,
    freshness: "FRESH",
    confidence: "MEDIUM",
    sourceTimestampKnown: false,
    missingCriticalFields: [],
    warnings: []
  }
};

const priceSource: IndependentPriceSource = {
  async quote() {
    return {
      priceUsd: 0.999,
      timestamp: 1791561600,
      confidence: 0.99,
      source: "fixture-independent-price"
    };
  }
};

test("independent enrichment fills stablecoin, oracle, protocol and chain risk inputs", async () => {
  const enriched = await new IndependentRiskEnricher(priceSource).enrich(
    snapshot
  );

  assert.ok(Math.abs((enriched.snapshot.stablecoinDepegBps ?? 0) - 10) < 1e-6);
  assert.equal(typeof enriched.snapshot.oracleRiskScore, "number");
  assert.equal(typeof enriched.snapshot.smartContractRiskScore, "number");
  assert.equal(typeof enriched.snapshot.chainRiskScore, "number");
  assert.ok(enriched.unresolved.includes("concentration"));
});

test("80% evidence coverage can produce a decision while exposing missing concentration", async () => {
  const enriched = await new IndependentRiskEnricher(priceSource).enrich(
    snapshot
  );
  const risk = assessRisk(enriched.snapshot);

  assert.notEqual(risk.status, "VERIFY");
  assert.ok(risk.coveragePct >= 80);
  assert.equal(risk.confidence, "MEDIUM");
  assert.ok(risk.missingFields.includes("concentration"));
});
