import assert from "node:assert/strict";
import test from "node:test";

import {
  createApiApplication,
  hashApiKey,
  type ScannerResponse
} from "../src/index.js";

const response: ScannerResponse = {
  schemaVersion: "0.4.0",
  riskModelVersion: "0.3.1",
  generatedAt: "2026-10-11T12:00:00.000Z",
  complete: true,
  query: {
    chainId: 1,
    assetSymbol: "USDC",
    protocols: ["aave"]
  },
  assumptions: {
    principalUsd: null,
    annualCostsUsd: null,
    performanceFeeRate: null,
    netEstimateAvailable: false,
    note: "fixture"
  },
  rankingMetric: "riskAdjustedObservedYieldPct",
  rows: [],
  errors: []
};

const scanner = {
  async scan() {
    return response;
  }
};

test("health exposes read-only and public-capital lock state", async () => {
  const app = createApiApplication({ scanner });
  const result = await app.fetch(
    new Request("http://localhost/health")
  );

  assert.equal(result.status, 200);
  const body = await result.json() as any;
  assert.equal(body.mode, "READ_ONLY");
  assert.equal(body.publicCapital, "LOCKED");
});

test("free scan route stays publicly accessible in KEYED mode", async () => {
  const app = createApiApplication({
    scanner,
    env: {
      DVY_API_ACCESS_MODE: "KEYED"
    } as NodeJS.ProcessEnv
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/scan?chainId=1&asset=USDC"
    )
  );

  assert.equal(result.status, 200);
});

test("comparison route requires a paid key in KEYED mode", async () => {
  const app = createApiApplication({
    scanner,
    env: {
      DVY_API_ACCESS_MODE: "KEYED"
    } as NodeJS.ProcessEnv
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/compare?chainId=1&asset=USDC"
    )
  );

  assert.equal(result.status, 401);
});

test("valid PRO key unlocks comparison API", async () => {
  const key = "paid-fixture-key";
  const app = createApiApplication({
    scanner,
    env: {
      DVY_API_ACCESS_MODE: "KEYED",
      DVY_API_KEY_HASHES_JSON: JSON.stringify({
        [hashApiKey(key)]: "PRO"
      })
    } as NodeJS.ProcessEnv
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/compare?chainId=1&asset=USDC",
      {
        headers: {
          "x-api-key": key
        }
      }
    )
  );

  assert.equal(result.status, 200);
  assert.equal(result.headers.get("x-dvy-plan"), "PRO");
});
