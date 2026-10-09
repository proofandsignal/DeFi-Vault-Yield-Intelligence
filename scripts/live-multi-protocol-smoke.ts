import {
  AaveAdapter,
  AaveGraphQLDataSource,
  CompoundAdapter,
  CompoundCometDataSource,
  IndependentRiskEnricher,
  MorphoAdapter,
  MorphoGraphQLDataSource,
  SparkAdapter,
  SparkRpcDataSource,
  assessRisk,
  type MarketSnapshot
} from "../src/index.js";

interface RankedMarket {
  protocol: string;
  marketId: string;
  grossApyPct: number | null;
  suppliedUsd: number | null;
  borrowedUsd: number | null;
  availableLiquidityUsd: number | null;
  riskStatus: string;
  riskScore: number | null;
  coveragePct: number;
  confidence: string;
  riskAdjustedYieldPct: number | null;
  unresolved: string[];
}

async function enrichAndRank(
  snapshot: MarketSnapshot
): Promise<RankedMarket> {
  const enriched = await new IndependentRiskEnricher().enrich(snapshot);
  const risk = assessRisk(enriched.snapshot);

  return {
    protocol: snapshot.protocol,
    marketId: snapshot.marketId,
    grossApyPct: snapshot.grossApyPct,
    suppliedUsd: snapshot.suppliedUsd,
    borrowedUsd: snapshot.borrowedUsd,
    availableLiquidityUsd: snapshot.availableLiquidityUsd,
    riskStatus: risk.status,
    riskScore: risk.score,
    coveragePct: risk.coveragePct,
    confidence: risk.confidence,
    riskAdjustedYieldPct:
      snapshot.grossApyPct !== null && risk.score !== null
        ? snapshot.grossApyPct * (1 - risk.score / 100)
        : null,
    unresolved: risk.missingFields
  };
}

const adapters = [
  new AaveAdapter(new AaveGraphQLDataSource()),
  new MorphoAdapter(new MorphoGraphQLDataSource()),
  new CompoundAdapter(new CompoundCometDataSource()),
  new SparkAdapter(new SparkRpcDataSource())
];

const rows: RankedMarket[] = [];

for (const adapter of adapters) {
  const snapshot = await adapter.fetchMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });

  if (
    snapshot.grossApyPct === null ||
    snapshot.suppliedUsd === null ||
    snapshot.availableLiquidityUsd === null
  ) {
    throw new Error(
      `${snapshot.protocol} did not satisfy canonical live-data fields.`
    );
  }

  rows.push(await enrichAndRank(snapshot));
}

rows.sort(
  (a, b) =>
    (b.riskAdjustedYieldPct ?? -Infinity) -
    (a.riskAdjustedYieldPct ?? -Infinity)
);

console.log(
  JSON.stringify(
    {
      observedAt: new Date().toISOString(),
      asset: "USDC",
      chainId: 1,
      protocols: rows.length,
      rankingMethod:
        "native supply APY * (1 - common Risk Engine score / 100); provisional and uncalibrated",
      rows
    },
    null,
    2
  )
);

if (rows.length !== 4) {
  throw new Error("Multi-protocol gate requires four protocol observations.");
}

for (const row of rows) {
  if (row.riskStatus === "VERIFY") {
    throw new Error(
      `${row.protocol} remained VERIFY after common enrichment.`
    );
  }
  if (row.coveragePct < 80) {
    throw new Error(
      `${row.protocol} risk evidence coverage is below 80%.`
    );
  }
}
