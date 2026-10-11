import assert from "node:assert/strict";
import test from "node:test";

import {
  YieldScannerService,
  type MarketSnapshot,
  type ProtocolAdapter,
  type SupportedProtocol
} from "../src/index.js";

function snapshot(
  protocol: string,
  apy: number
): MarketSnapshot {
  return {
    protocol,
    chainId: 1,
    chain: "Ethereum",
    marketId: `market-${protocol}`,
    asset: {
      symbol: "USDC",
      address:
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6,
      isStablecoin: true
    },
    grossApyPct: apy,
    rewardsApyPct: null,
    suppliedUsd: 100_000_000,
    borrowedUsd: 60_000_000,
    availableLiquidityUsd: 40_000_000,
    borrowConcentrationPct: 5,
    stablecoinDepegBps: 5,
    oracleAddress:
      "0x0000000000000000000000000000000000000001",
    oracleRiskScore: 15,
    smartContractRiskScore: 20,
    chainRiskScore: 10,
    protocolStatus: "operational",
    observedAt: "2026-10-11T12:00:00.000Z",
    source: "fixture",
    dataQuality: {
      source: "fixture",
      fetchedAt: "2026-10-11T12:00:00.000Z",
      evaluatedAt: "2026-10-11T12:00:01.000Z",
      ageSeconds: 1,
      freshness: "FRESH",
      confidence: "HIGH",
      sourceTimestampKnown: true,
      missingCriticalFields: [],
      warnings: []
    }
  };
}

function adapter(
  protocol: SupportedProtocol,
  apy: number
): ProtocolAdapter {
  return {
    protocol,
    async fetchMarket() {
      return snapshot(protocol, apy);
    }
  };
}

const enricher = {
  async enrich(input: MarketSnapshot) {
    return {
      snapshot: structuredClone(input),
      evidence: [
        {
          dimension: "stablecoin" as const,
          source: "fixture-price",
          reviewedAt: "2026-10-11T12:00:00.000Z",
          confidence: "HIGH" as const,
          methodology: "fixture",
          value: 5,
          details: {}
        }
      ],
      unresolved: []
    };
  }
};

test("scanner ranks comparable protocols through the shared risk model", async () => {
  const scanner = new YieldScannerService({
    adapters: {
      aave: adapter("aave", 4),
      morpho: adapter("morpho", 5),
      compound: adapter("compound", 3),
      spark: adapter("spark", 2)
    },
    enricher,
    cacheTtlMs: 1
  });

  const result = await scanner.scan({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(result.complete, true);
  assert.equal(result.rows.length, 4);
  assert.equal(result.rows[0]!.protocol, "morpho");
  assert.equal(
    result.rankingMetric,
    "riskAdjustedObservedYieldPct"
  );
  assert.equal(result.rows[0]!.evidenceCoveragePct, 100);
});

test("net estimates are created only from explicit assumptions", async () => {
  const scanner = new YieldScannerService({
    adapters: {
      aave: adapter("aave", 5)
    },
    enricher,
    cacheTtlMs: 1
  });

  const withoutAssumptions = await scanner.scan({
    chainId: 1,
    assetSymbol: "USDC",
    protocols: ["aave"]
  });

  assert.equal(
    withoutAssumptions.rows[0]!.estimatedNetApyPct,
    null
  );

  const withAssumptions = await scanner.scan({
    chainId: 1,
    assetSymbol: "USDC",
    protocols: ["aave"],
    principalUsd: 10_000,
    annualCostsUsd: 100
  });

  assert.equal(
    withAssumptions.rankingMetric,
    "riskAdjustedNetYieldPct"
  );
  assert.ok(
    (withAssumptions.rows[0]!.estimatedNetApyPct ?? 0) < 5
  );
  assert.equal(
    withAssumptions.assumptions.annualCostsUsd,
    100
  );
});

test("one source failure returns a partial scan instead of hiding healthy protocols", async () => {
  const failing: ProtocolAdapter = {
    protocol: "spark",
    async fetchMarket() {
      throw new Error("RPC source unavailable");
    }
  };

  const scanner = new YieldScannerService({
    adapters: {
      aave: adapter("aave", 4),
      spark: failing
    },
    enricher,
    cacheTtlMs: 1
  });

  const result = await scanner.scan({
    chainId: 1,
    assetSymbol: "USDC",
    protocols: ["aave", "spark"]
  });

  assert.equal(result.complete, false);
  assert.equal(result.rows.length, 1);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0]!.protocol, "spark");
  assert.equal(result.errors[0]!.code, "SOURCE_UNAVAILABLE");
});
