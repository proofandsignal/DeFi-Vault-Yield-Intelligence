import {
  createApiApplication,
  type ScannerResponse
} from "../src/index.js";

const fixture: ScannerResponse = {
  schemaVersion: "0.4.0",
  riskModelVersion: "0.3.1",
  generatedAt: new Date().toISOString(),
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
    note: "contract smoke"
  },
  rankingMetric: "riskAdjustedObservedYieldPct",
  rows: [],
  errors: []
};

const app = createApiApplication({
  scanner: {
    async scan() {
      return fixture;
    }
  },
  env: {
    DVY_API_ACCESS_MODE: "KEYED"
  } as NodeJS.ProcessEnv
});

const health = await app.fetch(
  new Request("http://localhost/health")
);
if (health.status !== 200) {
  throw new Error(`health returned ${health.status}`);
}

const free = await app.fetch(
  new Request(
    "http://localhost/api/v1/scan?chainId=1&asset=USDC"
  )
);
if (free.status !== 200) {
  throw new Error(`free scanner returned ${free.status}`);
}

const paid = await app.fetch(
  new Request(
    "http://localhost/api/v1/compare?chainId=1&asset=USDC"
  )
);
if (paid.status !== 401) {
  throw new Error(
    `KEYED comparison API should return 401 without a key, got ${paid.status}`
  );
}

console.log(
  JSON.stringify({
    health: health.status,
    freeScanner: free.status,
    keyedComparisonWithoutKey: paid.status,
    publicCapital: "LOCKED"
  })
);
