import {
  AaveAdapter,
  AaveGraphQLDataSource,
  IndependentRiskEnricher,
  assessRisk
} from "../src/index.js";

const aave = new AaveAdapter(new AaveGraphQLDataSource());
const raw = await aave.fetchMarket({
  chainId: 1,
  assetSymbol: "USDC"
});

const enriched = await new IndependentRiskEnricher().enrich(raw);
const risk = assessRisk(enriched.snapshot);

console.log(
  JSON.stringify(
    {
      market: {
        protocol: enriched.snapshot.protocol,
        chain: enriched.snapshot.chain,
        asset: enriched.snapshot.asset.symbol
      },
      evidence: enriched.evidence,
      unresolved: enriched.unresolved,
      risk: {
        status: risk.status,
        score: risk.score,
        coveragePct: risk.coveragePct,
        confidence: risk.confidence,
        missingFields: risk.missingFields
      }
    },
    null,
    2
  )
);

if (risk.status === "VERIFY") {
  throw new Error(
    `Independent risk smoke gate remained VERIFY at ${risk.coveragePct}% coverage.`
  );
}

if (risk.coveragePct < 80) {
  throw new Error("Risk evidence coverage fell below the 80% decision gate.");
}
