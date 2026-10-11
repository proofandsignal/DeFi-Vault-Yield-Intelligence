export interface CalibrationCase {
  id: string;
  date: string;
  expectedStatus: "GREEN" | "WATCH" | "RED";
  rationale: string;
  source: string;
  dimensions: {
    utilizationRisk: number;
    liquidityRisk: number;
    topBorrowerPct: number;
    depegBps: number;
    oracleRisk: number;
    smartContractRisk: number;
    chainRisk: number;
    protocolStatus:
      | "operational"
      | "degraded"
      | "paused"
      | "unknown";
  };
}

/**
 * These are engineering calibration anchors, not a statistically sufficient
 * training set. Historical cases encode the failure mode documented by the
 * source; numeric non-observed dimensions are conservative scenario values.
 */
export const CALIBRATION_CASES_V031: CalibrationCase[] = [
  {
    id: "normal-diversified-control",
    date: "2026-10-11",
    expectedStatus: "GREEN",
    rationale:
      "Control case: moderate utilization/liquidity, diversified borrowers, fresh oracle and operational protocol.",
    source: "internal-control",
    dimensions: {
      utilizationRisk: 45,
      liquidityRisk: 45,
      topBorrowerPct: 4,
      depegBps: 5,
      oracleRisk: 15,
      smartContractRisk: 15,
      chainRisk: 10,
      protocolStatus: "operational"
    }
  },
  {
    id: "tight-liquidity-control",
    date: "2026-10-11",
    expectedStatus: "WATCH",
    rationale:
      "Control case: high utilization and low available liquidity without a hard failure signal.",
    source: "internal-control",
    dimensions: {
      utilizationRisk: 88,
      liquidityRisk: 88,
      topBorrowerPct: 12,
      depegBps: 10,
      oracleRisk: 20,
      smartContractRisk: 20,
      chainRisk: 10,
      protocolStatus: "operational"
    }
  },
  {
    id: "usdc-svb-depeg-2023-03",
    date: "2023-03-11",
    expectedStatus: "RED",
    rationale:
      "USDC reserve uncertainty around Silicon Valley Bank created a real dollar de-peg; v0.3.1 hard-gates a material stablecoin depeg instead of diluting it through weighted averaging.",
    source:
      "https://www.circle.com/pressroom/3-3-billion-of-usdc-reserve-risk-removed-dollar-de-peg-closes",
    dimensions: {
      utilizationRisk: 70,
      liquidityRisk: 70,
      topBorrowerPct: 8,
      depegBps: 500,
      oracleRisk: 20,
      smartContractRisk: 20,
      chainRisk: 10,
      protocolStatus: "operational"
    }
  },
  {
    id: "aave-crv-concentration-2022-11",
    date: "2022-11-22",
    expectedStatus: "RED",
    rationale:
      "A single Aave v2 user built an approximately 92M CRV short and the market ended with bad debt; this anchors borrower-concentration as a first-class risk input.",
    source:
      "https://governance.aave.com/t/arc-repay-excess-debt-in-crv-market-for-aave-v2-eth/10779",
    dimensions: {
      utilizationRisk: 92,
      liquidityRisk: 92,
      topBorrowerPct: 45,
      depegBps: 0,
      oracleRisk: 55,
      smartContractRisk: 20,
      chainRisk: 10,
      protocolStatus: "degraded"
    }
  },
  {
    id: "aave-security-pause-2023-11",
    date: "2023-11-04",
    expectedStatus: "RED",
    rationale:
      "Aave protection measures paused/froze affected markets after a critical vulnerability report. Protocol pause remains a hard RED gate.",
    source:
      "https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335",
    dimensions: {
      utilizationRisk: 50,
      liquidityRisk: 50,
      topBorrowerPct: 8,
      depegBps: 0,
      oracleRisk: 20,
      smartContractRisk: 100,
      chainRisk: 10,
      protocolStatus: "paused"
    }
  }
];
