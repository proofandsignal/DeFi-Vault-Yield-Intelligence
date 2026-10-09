import assert from "node:assert/strict";
import test from "node:test";

import { AaveGraphQLDataSource } from "../src/index.js";

const marketsPayload = {
  data: {
    value: [
      {
        name: "Aave V3 Ethereum",
        address: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
        chain: { name: "Ethereum", chainId: 1 },
        reserves: [
          {
            underlyingToken: {
              address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
              symbol: "USDC",
              decimals: 6
            },
            size: {
              usd: "100000000",
              amount: { value: "100000000" }
            },
            usdExchangeRate: "0.9995",
            usdOracleAddress: "0x0000000000000000000000000000000000000001",
            isFrozen: false,
            isPaused: false,
            supplyInfo: {
              apy: { formatted: "4.25" }
            },
            borrowInfo: {
              total: {
                usd: "60000000",
                amount: { value: "60000000" }
              },
              availableLiquidity: {
                usd: "40000000",
                amount: { value: "40000000" }
              },
              utilizationRate: { formatted: "60.00" }
            }
          }
        ]
      }
    ]
  }
};

test("normalizes live Aave GraphQL reserve shape into an AaveMarketRecord", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(JSON.stringify(marketsPayload), {
      status: 200,
      headers: { "content-type": "application/json" }
    });

  const source = new AaveGraphQLDataSource(fakeFetch);
  const record = await source.getMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(record.assetSymbol, "USDC");
  assert.equal(record.supplyApyPct, 4.25);
  assert.equal(record.suppliedUsd, 100_000_000);
  assert.equal(record.borrowedUsd, 60_000_000);
  assert.equal(record.availableLiquidityUsd, 40_000_000);
  assert.ok(Math.abs((record.stablecoinDepegBps ?? 0) - 5) < 0.000001);
  assert.equal(record.protocolStatus, "operational");
  assert.equal(record.dataQuality.confidence, "MEDIUM");
});

test("frozen Aave reserve maps to degraded protocol status", async () => {
  const payload = structuredClone(marketsPayload);
  payload.data.value[0]!.reserves[0]!.isFrozen = true;

  const fakeFetch: typeof fetch = async () =>
    new Response(JSON.stringify(payload), { status: 200 });

  const source = new AaveGraphQLDataSource(fakeFetch);
  const record = await source.getMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(record.protocolStatus, "degraded");
});
