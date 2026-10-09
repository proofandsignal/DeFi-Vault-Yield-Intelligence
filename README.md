# DeFi Vault & Yield Intelligence

Multi-protocol, multi-chain, multi-asset DeFi risk and yield intelligence infrastructure.

## Product thesis

The project does **not** build a lending protocol. It builds a protocol-neutral intelligence layer above existing DeFi markets and vault infrastructure.

**Everything is multi by architecture.** Aave is Adapter #001, not the product boundary.

```text
Aave / Morpho / Compound / Spark
              |
        Protocol Adapters
              |
     Canonical Market Schema
              |
     Independent Risk Evidence
              |
Risk Engine ------> GREEN / WATCH / RED / VERIFY
              |
Yield Engine -----> Gross / Fees / Costs / Net Yield
              |
Scanner / Reports / Alerts / API / Partner Infrastructure
```

## Current build — v0.3

v0.3 validates the canonical core across four different lending designs.

Adapters:

- **Aave V3** — official GraphQL reserve data
- **Morpho Blue** — official GraphQL isolated lending markets
- **Compound III** — onchain Comet base-asset markets
- **SparkLend** — onchain reserve data through its canonical protocol data provider

All four normalize into the same `MarketSnapshot` and use the same Risk, Yield, and Decision engines.

The live v0.3 gate compares Ethereum USDC markets and requires:

- canonical APY / supply / borrow / liquidity fields
- fresh data
- common independent risk enrichment
- no unresolved critical risk dimension
- at least 80% weighted evidence coverage

The provisional cross-protocol comparison uses:

```text
riskAdjustedYield = grossSupplyAPY * (1 - riskScore / 100)
```

This is an engineering validation metric, **not** a calibrated investment model or investment recommendation.

## Evidence boundary

Missing risk dimensions are never silently converted to zero.

Borrow concentration may remain unresolved and is exposed in the result. Oracle evidence is protocol-aware: for example, Morpho Blue's collateral/loan-asset oracle is not replaced by a generic USDC/USD reference feed.

See [docs/RISK_METHODOLOGY.md](docs/RISK_METHODOLOGY.md) and [docs/MULTI_PROTOCOL.md](docs/MULTI_PROTOCOL.md).

## Multi roadmap

Protocol: Aave → Morpho → Compound → Spark → future adapters  
Chain: Ethereum / Base / Arbitrum / Optimism / future chains  
Asset: USDC / USDT / USDS / DAI / WETH / future assets  
Output: scanner / monitoring / reports / API / partner vault infrastructure

## Safety and legal boundary

The current product is **read-only research infrastructure**.

It does not:

- custody third-party assets
- accept public deposits
- execute deposits or withdrawals
- rebalance public capital
- provide personalized transaction execution
- operate a public managed vault

**PUBLIC CAPITAL: LOCKED** until the Legal Classification Gate is passed.

See [docs/LEGAL_GATE.md](docs/LEGAL_GATE.md).

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
```

Live commands require network access.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/RISK_METHODOLOGY.md](docs/RISK_METHODOLOGY.md), [docs/MULTI_PROTOCOL.md](docs/MULTI_PROTOCOL.md), and [docs/ROADMAP.md](docs/ROADMAP.md).
