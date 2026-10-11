import assert from "node:assert/strict";
import test from "node:test";

import {
  MorphoBorrowConcentrationProvider,
  type MarketSnapshot
} from "../src/index.js";

const snapshot: MarketSnapshot = {
  protocol: "morpho",
  chainId: 1,
  chain: "Ethereum",
  marketId: "0xmarket",
  asset: {
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    isStablecoin: true
  },
  grossApyPct: 4,
  rewardsApyPct: null,
  suppliedUsd: 150,
  borrowedUsd: 100,
  availableLiquidityUsd: 50,
  borrowConcentrationPct: null,
  stablecoinDepegBps: null,
  oracleAddress: "0xoracle",
  oracleRiskScore: 30,
  smartContractRiskScore: null,
  chainRiskScore: null,
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

test("Morpho concentration uses ordered live borrower positions", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          marketPositions: {
            items: [
              {
                user: { address: "0x1" },
                state: { borrowAssetsUsd: 40 }
              },
              {
                user: { address: "0x2" },
                state: { borrowAssetsUsd: 25 }
              },
              {
                user: { address: "0x3" },
                state: { borrowAssetsUsd: 10 }
              }
            ]
          }
        }
      }),
      { status: 200 }
    );

  const result =
    await new MorphoBorrowConcentrationProvider(fakeFetch).concentration(
      snapshot
    );

  assert.ok(result);
  assert.equal(result.complete, true);
  assert.equal(result.evidenceCoveragePct, 100);
  assert.equal(result.topBorrowerPct, 40);
  assert.equal(result.top5BorrowersPct, 75);
});
