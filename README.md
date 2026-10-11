# DeFi Vault & Yield Intelligence

Multi-protocol, multi-chain, multi-asset DeFi risk and yield intelligence infrastructure.

## Product thesis

The project does **not** build a lending protocol. It builds a protocol-neutral intelligence layer above existing DeFi markets and vault infrastructure.

**Everything is multi by architecture.**

```text
Aave / Morpho / Compound / Spark
              |
        Protocol Adapters
              |
     Canonical Market Schema
              |
 Independent Risk Evidence
  + concentration
  + oracle freshness
              |
 Calibrated Risk Engine
 GREEN / WATCH / RED / VERIFY
              |
 Yield / Comparison Layer
              |
Scanner / Reports / Alerts / API
```

## Current build — v0.3.1

v0.3.1 turns borrower concentration and calibration into explicit evidence layers.

Included:

- live Aave V3, Morpho Blue, Compound III and SparkLend market data
- reserve-wide borrower concentration for Morpho Blue
- event-history + current-debt reconciliation for Aave V3 and SparkLend
- explicit unresolved concentration for Compound III
- >=99.5% debt-reconciliation requirement before Aave/Spark concentration is accepted
- live oracle freshness where compatible
- versioned risk weights and thresholds
- historical stress calibration anchors
- hard RED gates for protocol pause and material stablecoin depeg

The model remains an **engineering risk model**, not a prediction of loss probability and not investment advice.

## Evidence boundary

Missing dimensions are never replaced with zero.

For Compound III, borrower concentration remains unresolved until a complete borrower enumeration source exists. This is intentional.

See [docs/RISK_METHODOLOGY.md](docs/RISK_METHODOLOGY.md), [docs/CALIBRATION.md](docs/CALIBRATION.md), and [docs/MULTI_PROTOCOL.md](docs/MULTI_PROTOCOL.md).

## Multi roadmap

Protocol: Aave → Morpho → Compound → Spark → future adapters  
Chain: Ethereum / Base / Arbitrum / Optimism / future chains  
Asset: USDC / USDT / USDS / DAI / WETH / future assets  
Output: Yield Scanner / monitoring / reports / API / partner infrastructure

## Safety and legal boundary

The current product is **read-only research infrastructure**.

It does not custody third-party assets, accept public deposits, execute deposits or withdrawals, rebalance public capital, or operate a public managed vault.

**PUBLIC CAPITAL: LOCKED** until the Legal Classification Gate is passed.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run live:aave-smoke
npm run validate:aave-100
npm run live:risk-smoke
npm run live:multi-protocol
npm run live:v031
```

Live commands require network access.
