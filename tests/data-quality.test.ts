import assert from "node:assert/strict";
import test from "node:test";

import { evaluateDataQuality } from "../src/index.js";

test("complete official-source fetch without source timestamp is MEDIUM confidence", () => {
  const quality = evaluateDataQuality({
    source: "https://api.v3.aave.com/graphql",
    fetchedAt: "2026-10-09T06:00:00.000Z",
    evaluatedAt: "2026-10-09T06:01:00.000Z",
    sourceTimestampKnown: false
  });

  assert.equal(quality.freshness, "FRESH");
  assert.equal(quality.confidence, "MEDIUM");
  assert.equal(quality.sourceTimestampKnown, false);
});

test("missing critical fields force LOW confidence", () => {
  const quality = evaluateDataQuality({
    source: "fixture",
    fetchedAt: "2026-10-09T06:00:00.000Z",
    evaluatedAt: "2026-10-09T06:00:30.000Z",
    missingCriticalFields: ["suppliedUsd"]
  });

  assert.equal(quality.confidence, "LOW");
});

test("old observations become STALE", () => {
  const quality = evaluateDataQuality({
    source: "fixture",
    fetchedAt: "2026-10-09T06:00:00.000Z",
    evaluatedAt: "2026-10-09T06:10:00.000Z",
    staleAfterSeconds: 300
  });

  assert.equal(quality.freshness, "STALE");
});
