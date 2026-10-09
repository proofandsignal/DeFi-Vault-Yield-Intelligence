import assert from "node:assert/strict";
import test from "node:test";

import { MorphoGraphQLDataSource } from "../src/index.js";

const payload = {
  data: {
    markets: {
      items: [
        {
          marketId: "0xmarket",
          listed: true,
          loanAsset: {
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            symbol: "USDC",
            decimals: 6,
            chain: {
              id: 1,
              network: "Ethereum"
            }
          },
          oracle: {
            address: "0xoracle"
          },
          state: {
            supplyAssetsUsd: 100_000_000,
            borrowAssetsUsd: 70_000_000,
            liquidityAssetsUsd: 30_000_000,
            supplyApy: 0.04,
            avgSupplyApy: 0.042,
            avgNetSupplyApy: 0.045
          }
        }
      ]
    }
  }
};

test("normalizes Morpho Blue market into protocol-neutral record", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" }
    });

  const source = new MorphoGraphQLDataSource(fakeFetch);
  const record = await source.getMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(record.marketId, "0xmarket");
  assert.equal(record.supplyApyPct, 4.2);
  assert.ok(Math.abs((record.rewardsApyPct ?? 0) - 0.3) < 1e-9);
  assert.equal(record.suppliedUsd, 100_000_000);
  assert.equal(record.borrowedUsd, 70_000_000);
  assert.equal(record.availableLiquidityUsd, 30_000_000);
  assert.equal(record.oracleAddress, "0xoracle");
});
