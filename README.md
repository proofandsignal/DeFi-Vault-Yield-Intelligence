# DeFi Vault & Yield Intelligence

Multi-protocol, multi-chain, multi-asset DeFi risk and yield intelligence infrastructure.

## Product thesis

The project does **not** build a lending protocol. It builds a protocol-neutral intelligence layer above existing DeFi markets and vault infrastructure.

**Everything is multi by architecture.** Aave is Adapter #001, not the product boundary.

```text
Protocol Data
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

## Current build — v0.2.1

v0.2.1 adds independent risk enrichment above the live-data foundation.

Included:

- live Aave V3 market data
- DefiLlama independent stablecoin-price cross-check
- reviewed oracle reference metadata
- reviewed protocol/security evidence
- reviewed chain architecture evidence
- explicit borrower-concentration provider boundary
- weighted evidence coverage
- critical-evidence gates
- live independent Ethereum/USDC risk smoke test

A risk decision requires at least **80% weighted evidence coverage** and no unresolved critical dimension.

Missing borrower concentration is not converted to zero. It remains visible and reduces confidence/coverage.

## Evidence boundary

Reference oracle metadata does not imply that Aave directly uses the same Chainlink proxy. Aave may use adapters, CAPO, SVR, or other routing.

The methodology and current limitations are documented in [docs/RISK_METHODOLOGY.md](docs/RISK_METHODOLOGY.md).

## Multi roadmap

Protocol: Aave -> Morpho -> Compound -> Spark -> future adapters  
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
```

Live commands require network access.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/RISK_METHODOLOGY.md](docs/RISK_METHODOLOGY.md), and [docs/ROADMAP.md](docs/ROADMAP.md).
