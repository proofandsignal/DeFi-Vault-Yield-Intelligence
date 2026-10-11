import assert from "node:assert/strict";
import test from "node:test";

import {
  CALIBRATION_CASES_V031,
  assessRisk,
  type MarketSnapshot
} from "../src/index.js";

function snapshotForCase(
  item: (typeof CALIBRATION_CASES_V031)[number]
): MarketSnapshot {
  const isStablecoin = item.id !== "aave-crv-concentration-2022-11";

  return {
    protocol: "aave",
    chainId: 1,
    chain: "Ethereum",
    marketId: item.id,
    asset: {
      symbol: isStablecoin ? "USDC" : "CRV",
      address: "0x0000000000000000000000000000000000000001",
      decimals: isStablecoin ? 6 : 18,
      isStablecoin
    },
    grossApyPct: 4,
    rewardsApyPct: null,
    suppliedUsd: 100,
    borrowedUsd: item.dimensions.utilizationRisk,
    availableLiquidityUsd: Math.max(
      0,
      100 - item.dimensions.liquidityRisk
    ),
    borrowConcentrationPct: item.dimensions.topBorrowerPct,
    stablecoinDepegBps: isStablecoin
      ? item.dimensions.depegBps
      : 0,
    oracleAddress:
      "0x0000000000000000000000000000000000000002",
    oracleRiskScore: item.dimensions.oracleRisk,
    smartContractRiskScore: item.dimensions.smartContractRisk,
    chainRiskScore: item.dimensions.chainRisk,
    protocolStatus: item.dimensions.protocolStatus,
    observedAt: `${item.date}T12:00:00.000Z`,
    source: item.source,
    dataQuality: {
      source: item.source,
      fetchedAt: `${item.date}T12:00:00.000Z`,
      evaluatedAt: `${item.date}T12:00:01.000Z`,
      ageSeconds: 1,
      freshness: "FRESH",
      confidence: "HIGH",
      sourceTimestampKnown: true,
      missingCriticalFields: [],
      warnings: []
    }
  };
}

for (const item of CALIBRATION_CASES_V031) {
  test(`calibration case ${item.id} resolves to ${item.expectedStatus}`, () => {
    const risk = assessRisk(snapshotForCase(item));

    assert.equal(
      risk.status,
      item.expectedStatus,
      `${item.id} returned score=${risk.score} reasons=${risk.reasons.join(" | ")}`
    );
  });
}

test("material stablecoin depeg is a hard RED even with otherwise low risk", () => {
  const control = snapshotForCase(CALIBRATION_CASES_V031[0]!);
  const risk = assessRisk({
    ...control,
    stablecoinDepegBps: 350
  });

  assert.equal(risk.status, "RED");
  assert.equal(risk.score, null);
  assert.ok(
    risk.reasons.some((reason) =>
      reason.includes("hard safety gate")
    )
  );
});
