import assert from "node:assert/strict";
import test from "node:test";

import {
  annualRayToApyPct,
  perSecondWadToApyPct
} from "../src/index.js";

test("Compound per-second WAD rate annualizes to expected APY range", () => {
  const onePercentAprRate = BigInt(
    Math.round((0.01 / (365 * 24 * 60 * 60)) * 1e18)
  );
  const apy = perSecondWadToApyPct(onePercentAprRate);

  assert.ok(apy > 1);
  assert.ok(apy < 1.02);
});

test("Aave-style annual RAY rate compounds to APY", () => {
  const fivePercentRay = 50_000_000_000_000_000_000_000_000n;
  const apy = annualRayToApyPct(fivePercentRay);

  assert.ok(apy > 5);
  assert.ok(apy < 5.2);
});
