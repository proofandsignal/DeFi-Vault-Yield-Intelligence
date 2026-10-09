import assert from "node:assert/strict";
import test from "node:test";

import { simulateAnnualYield } from "../src/index.js";

test("splits performance fee between platform and manager recipients", () => {
  const result = simulateAnnualYield({
    principalUsd: 1_000_000,
    grossApyPct: 5,
    feeModel: {
      performanceFeeRate: 0.1,
      platformShareRate: 0.5
    }
  });

  assert.equal(result.grossYieldUsd, 50_000);
  assert.equal(result.totalPerformanceFeeUsd, 5_000);
  assert.equal(result.platformFeeShareUsd, 2_500);
  assert.equal(result.managerFeeShareUsd, 2_500);
  assert.equal(result.userNetYieldUsd, 45_000);
  assert.equal(result.userNetApyPct, 4.5);
});

test("does not charge a performance fee on negative yield", () => {
  const result = simulateAnnualYield({
    principalUsd: 100_000,
    grossApyPct: -2,
    feeModel: {
      performanceFeeRate: 0.1,
      platformShareRate: 0.5
    }
  });

  assert.equal(result.totalPerformanceFeeUsd, 0);
});
