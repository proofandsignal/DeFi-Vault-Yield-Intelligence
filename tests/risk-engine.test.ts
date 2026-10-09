import assert from "node:assert/strict";
import test from "node:test";

import { assessRisk, type MarketSnapshot } from "../src/index.js";

const base: MarketSnapshot = {
  protocol: "aave",
  chainId: 1,
  chain: "ethereum",
  marketId: "aave-v3-usdc",
  asset: {
    symbol: "USDC",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 6
  },
  grossApyPct: 4.5,
  rewardsApyPct: 0,
  suppliedUsd: 100_000_000,
  borrowedUsd: 50_000_000,
  availableLiquidityUsd: 50_000_000,
  borrowConcentrationPct: 20,
  stablecoinDepegBps: 5,
  oracleRiskScore: 15,
  smartContractRiskScore: 15,
  chainRiskScore: 10,
  protocolStatus: "operational",
  observedAt: "2026-10-09T00:00:00.000Z",
  source: "fixture"
};

test("returns a scored decision when all risk inputs are present", () => {
  const result = assessRisk(base);

  assert.notEqual(result.status, "VERIFY");
  assert.equal(result.missingFields.length, 0);
  assert.equal(typeof result.score, "number");
});

test("fails closed to VERIFY when a required input is missing", () => {
  const result = assessRisk({ ...base, stablecoinDepegBps: null });

  assert.equal(result.status, "VERIFY");
  assert.equal(result.score, null);
  assert.ok(result.missingFields.includes("depeg"));
});

test("paused protocol produces RED", () => {
  const result = assessRisk({ ...base, protocolStatus: "paused" });

  assert.equal(result.status, "RED");
  assert.ok(result.reasons.includes("Protocol is paused."));
});
