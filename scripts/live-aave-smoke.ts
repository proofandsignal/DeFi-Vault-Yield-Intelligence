import { AaveAdapter, AaveGraphQLDataSource, assessRisk } from "../src/index.js";

const source = new AaveGraphQLDataSource();
const adapter = new AaveAdapter(source);

const snapshot = await adapter.fetchMarket({
  chainId: 1,
  assetSymbol: "USDC"
});

const risk = assessRisk(snapshot);

console.log(
  JSON.stringify(
    {
      protocol: snapshot.protocol,
      chain: snapshot.chain,
      asset: snapshot.asset.symbol,
      marketId: snapshot.marketId,
      grossApyPct: snapshot.grossApyPct,
      suppliedUsd: snapshot.suppliedUsd,
      availableLiquidityUsd: snapshot.availableLiquidityUsd,
      oracleAddress: snapshot.oracleAddress,
      dataQuality: snapshot.dataQuality,
      riskStatus: risk.status,
      unresolvedRiskInputs: risk.missingFields
    },
    null,
    2
  )
);

if (snapshot.grossApyPct === null || snapshot.suppliedUsd === null) {
  throw new Error("Live Aave smoke test returned incomplete market data.");
}
