import {
  AaveAdapter,
  AaveGraphQLDataSource,
  CompoundAdapter,
  CompoundCometDataSource,
  CompositeBorrowConcentrationProvider,
  CompositeOracleFreshnessProvider,
  DefiLlamaPriceSource,
  IndependentRiskEnricher,
  MorphoAdapter,
  MorphoGraphQLDataSource,
  SparkAdapter,
  SparkRpcDataSource,
  assessRisk,
  type MarketSnapshot
} from "../src/index.js";

const concentrationProvider =
  new CompositeBorrowConcentrationProvider();
const oracleFreshnessProvider =
  new CompositeOracleFreshnessProvider();

const enricher = new IndependentRiskEnricher(
  new DefiLlamaPriceSource(),
  concentrationProvider,
  oracleFreshnessProvider
);

const adapters = [
  new AaveAdapter(new AaveGraphQLDataSource()),
  new MorphoAdapter(new MorphoGraphQLDataSource()),
  new CompoundAdapter(new CompoundCometDataSource()),
  new SparkAdapter(new SparkRpcDataSource())
];

interface ValidationRow {
  protocol: string;
  marketId: string;
  grossApyPct: number | null;
  topBorrowerPct: number | null;
  top5BorrowersPct: number | null;
  borrowerCount: number | null;
  concentrationCoveragePct: number | null;
  concentrationComplete: boolean | null;
  oracleAgeSeconds: number | null;
  oracleStale: boolean | null;
  riskStatus: string;
  riskScore: number | null;
  riskCoveragePct: number;
  riskConfidence: string;
  unresolved: string[];
}

async function validate(
  snapshot: MarketSnapshot
): Promise<ValidationRow> {
  const enriched = await enricher.enrich(snapshot);
  const risk = assessRisk(enriched.snapshot);

  const concentration = enriched.evidence.find(
    (item) => item.dimension === "concentration"
  );
  const freshness = enriched.evidence
    .filter((item) => item.dimension === "oracle")
    .find((item) => "ageSeconds" in item.details);

  return {
    protocol: snapshot.protocol,
    marketId: snapshot.marketId,
    grossApyPct: snapshot.grossApyPct,
    topBorrowerPct: enriched.snapshot.borrowConcentrationPct,
    top5BorrowersPct:
      (concentration?.details.top5BorrowersPct as number | null) ??
      null,
    borrowerCount:
      (concentration?.details.borrowerCount as number | null) ??
      null,
    concentrationCoveragePct:
      (concentration?.details.evidenceCoveragePct as number | null) ??
      null,
    concentrationComplete:
      (concentration?.details.complete as boolean | null) ??
      null,
    oracleAgeSeconds:
      (freshness?.details.ageSeconds as number | null) ?? null,
    oracleStale:
      (freshness?.details.stale as boolean | null) ?? null,
    riskStatus: risk.status,
    riskScore: risk.score,
    riskCoveragePct: risk.coveragePct,
    riskConfidence: risk.confidence,
    unresolved: risk.missingFields
  };
}

const rows: ValidationRow[] = [];

for (const adapter of adapters) {
  const snapshot = await adapter.fetchMarket({
    chainId: 1,
    assetSymbol: "USDC"
  });
  rows.push(await validate(snapshot));
}

console.log(
  JSON.stringify(
    {
      observedAt: new Date().toISOString(),
      modelVersion: "0.3.1",
      asset: "USDC",
      chainId: 1,
      rows
    },
    null,
    2
  )
);

for (const row of rows) {
  if (row.riskStatus === "VERIFY") {
    throw new Error(
      `${row.protocol} remained VERIFY under v0.3.1.`
    );
  }
  if (row.riskCoveragePct < 80) {
    throw new Error(
      `${row.protocol} risk evidence coverage fell below 80%.`
    );
  }
}

for (const protocol of ["aave", "morpho", "spark"]) {
  const row = rows.find((item) => item.protocol === protocol);
  if (!row) {
    throw new Error(`Missing live ${protocol} observation.`);
  }
  if (row.unresolved.includes("concentration")) {
    throw new Error(
      `${protocol} concentration remained unresolved.`
    );
  }
  if (
    row.concentrationComplete !== true ||
    (row.concentrationCoveragePct ?? 0) < 99.5
  ) {
    throw new Error(
      `${protocol} concentration evidence was not complete.`
    );
  }
}

const compound = rows.find(
  (item) => item.protocol === "compound"
);
if (!compound?.unresolved.includes("concentration")) {
  throw new Error(
    "Compound concentration must remain explicitly unresolved until complete borrower enumeration exists."
  );
}
