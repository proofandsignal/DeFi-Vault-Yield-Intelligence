import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOpMarketEvidence } from "./normalize-evidence.mjs";

const valid = Object.freeze({
  chainId: 10,
  protocol: "TEST_PROTOCOL",
  marketId: "synthetic-market-001",
  observedAt: "2026-10-23T00:00:00Z",
  sourceUrl: "https://example.org/evidence/synthetic",
  liquidityUsd: 1000,
});

test("normalizes explicitly synthetic input without claiming risk verification", () => {
  const value = normalizeOpMarketEvidence(valid);
  assert.equal(value.chainId, 10);
  assert.equal(value.liquidityUsd, 1000);
  assert.equal(value.suppliedApyPct, null);
  assert.equal(value.creditExposureUsd, null);
  assert.equal(value.riskState, "VERIFY");
  assert.equal(value.coverage, "PARTIAL");
  assert.equal(value.evidence.verification, "UNVERIFIED");
});
test("rejects incompatible chains", () => {
  assert.throws(() => normalizeOpMarketEvidence({...valid, chainId: 8453}), /chainId 10/);
});
test("rejects missing attribution", () => {
  assert.throws(() => normalizeOpMarketEvidence({...valid, sourceUrl: ""}), /HTTPS/);
});
test("rejects ungrounded numeric inputs", () => {
  assert.throws(() => normalizeOpMarketEvidence({...valid, liquidityUsd: -1}), /Invalid/);
  assert.throws(() => normalizeOpMarketEvidence({...valid, suppliedApyPct: NaN}), /Invalid/);
});
test("rejects malformed timestamps", () => {
  assert.throws(() => normalizeOpMarketEvidence({...valid, observedAt: "invalid"}), /observedAt/);
});
