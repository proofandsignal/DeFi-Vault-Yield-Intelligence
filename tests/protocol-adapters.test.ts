import assert from "node:assert/strict";
import test from "node:test";

import {
  CompoundAdapter,
  MorphoAdapter,
  SparkAdapter,
  type CompoundDataSource,
  type DataQuality,
  type MorphoDataSource,
  type SparkDataSource
} from "../src/index.js";

const quality: DataQuality = {
  source: "fixture",
  fetchedAt: "2026-10-09T16:00:00.000Z",
  evaluatedAt: "2026-10-09T16:00:01.000Z",
  ageSeconds: 1,
  freshness: "FRESH",
  confidence: "HIGH",
  sourceTimestampKnown: true,
  missingCriticalFields: [],
  warnings: []
};

test("Morpho adapter emits canonical MarketSnapshot", async () => {
  const source: MorphoDataSource = {
    async getMarket() {
      return {
        chainId: 1,
        chain: "Ethereum",
        marketId: "0xmorpho",
        assetSymbol: "USDC",
        assetAddress: "0xusdc",
        assetDecimals: 6,
        isStablecoin: true,
        supplyApyPct: 4.2,
        rewardsApyPct: 0.3,
        suppliedUsd: 100,
        borrowedUsd: 70,
        availableLiquidityUsd: 30,
        borrowConcentrationPct: null,
        oracleAddress: "0xoracle",
        protocolStatus: "operational",
        observedAt: quality.fetchedAt,
        source: quality.source,
        dataQuality: quality
      };
    }
  };

  const snapshot = await new MorphoAdapter(source).fetchMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(snapshot.protocol, "morpho");
  assert.equal(snapshot.grossApyPct, 4.2);
  assert.equal(snapshot.suppliedUsd, 100);
  assert.equal(snapshot.asset.symbol, "USDC");
});

test("Compound adapter emits the same canonical MarketSnapshot shape", async () => {
  const source: CompoundDataSource = {
    async getMarket() {
      return {
        chainId: 1,
        chain: "Ethereum",
        marketId: "0xcomet",
        assetSymbol: "USDC",
        assetAddress: "0xusdc",
        assetDecimals: 6,
        isStablecoin: true,
        supplyApyPct: 3.9,
        suppliedUsd: 100,
        borrowedUsd: 60,
        availableLiquidityUsd: 40,
        oracleAddress: "0xoracle",
        protocolStatus: "operational",
        observedAt: quality.fetchedAt,
        source: quality.source,
        dataQuality: quality
      };
    }
  };

  const snapshot = await new CompoundAdapter(source).fetchMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(snapshot.protocol, "compound");
  assert.equal(snapshot.grossApyPct, 3.9);
  assert.equal(snapshot.borrowedUsd, 60);
  assert.equal(snapshot.asset.symbol, "USDC");
});

test("Spark adapter emits the same canonical MarketSnapshot shape", async () => {
  const source: SparkDataSource = {
    async getMarket() {
      return {
        chainId: 1,
        chain: "Ethereum",
        marketId: "0xspark",
        assetSymbol: "USDC",
        assetAddress: "0xusdc",
        assetDecimals: 6,
        isStablecoin: true,
        supplyApyPct: 4.1,
        suppliedUsd: 100,
        borrowedUsd: 55,
        availableLiquidityUsd: 45,
        oracleAddress: "0xoracle",
        protocolStatus: "operational",
        observedAt: quality.fetchedAt,
        source: quality.source,
        dataQuality: quality
      };
    }
  };

  const snapshot = await new SparkAdapter(source).fetchMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  assert.equal(snapshot.protocol, "spark");
  assert.equal(snapshot.grossApyPct, 4.1);
  assert.equal(snapshot.availableLiquidityUsd, 45);
  assert.equal(snapshot.asset.symbol, "USDC");
});
