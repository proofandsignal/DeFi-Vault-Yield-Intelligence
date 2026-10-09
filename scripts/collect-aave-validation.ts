import { mkdir, writeFile } from "node:fs/promises";

import { AaveGraphQLDataSource } from "../src/index.js";

const DEFAULT_CHAINS = [
  1,
  10,
  56,
  100,
  137,
  324,
  1088,
  8453,
  42161,
  43114,
  534352,
  59144
];

const chainIds = (process.env.AAVE_VALIDATION_CHAIN_IDS
  ? process.env.AAVE_VALIDATION_CHAIN_IDS.split(",").map(Number)
  : DEFAULT_CHAINS
).filter(Number.isFinite);

const source = new AaveGraphQLDataSource();
const records = await source.listMarketRecords(chainIds);

const unique = new Map(records.map((record) => [record.reserveId, record]));
const observations = [...unique.values()].slice(0, 100);

if (observations.length < 100) {
  throw new Error(
    `Validation gate requires 100 unique reserve observations; received ${observations.length}.`
  );
}

await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/aave-validation-100.jsonl",
  observations.map((row) => JSON.stringify(row)).join("\n") + "\n",
  "utf8"
);

const stats = {
  generatedAt: new Date().toISOString(),
  rows: observations.length,
  chains: [...new Set(observations.map((row) => row.chainId))],
  markets: new Set(observations.map((row) => row.marketAddress)).size,
  assets: new Set(observations.map((row) => row.assetSymbol)).size,
  fresh: observations.filter((row) => row.dataQuality.freshness === "FRESH").length,
  mediumOrHighConfidence: observations.filter((row) =>
    row.dataQuality.confidence === "MEDIUM" ||
    row.dataQuality.confidence === "HIGH"
  ).length
};

await writeFile(
  "artifacts/aave-validation-100-summary.json",
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);

console.log(JSON.stringify(stats, null, 2));
