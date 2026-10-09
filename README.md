# DeFi Vault & Yield Intelligence

Multi-protocol, multi-chain, multi-asset DeFi risk and yield intelligence infrastructure.

## Product thesis

The project does **not** build a lending protocol. It builds a protocol-neutral intelligence layer above existing DeFi markets and vault infrastructure.

**Everything is multi by architecture.** Aave is Adapter #001, not the product boundary.

```text
Data Sources
    |
Protocol Adapters
    |
Canonical Market Schema
    |
    +--> Risk Engine ------> GREEN / WATCH / RED / VERIFY
    +--> Yield Engine -----> Gross / Fees / Costs / Net Yield
    |
Decision + Monitoring Layer
    |
Scanner / Reports / Alerts / API / Partner Infrastructure
```

## Current build — v0.2

v0.2 connects the core to the official Aave v3 GraphQL API and adds evidence-based data-quality gates.

Included:

- live Aave market/reserve ingestion
- supply APY and liquidity normalization
- APY history support
- pause/freeze status
- oracle-address metadata
- stablecoin USD-deviation signal
- freshness and confidence metadata
- live smoke test
- 100-observation cross-chain validation collector

Unknown independent risk signals are never replaced with optimistic defaults.
Missing borrow concentration, oracle-quality, smart-contract-risk, or chain-risk inputs keep the Risk Engine at **VERIFY**.

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
```

The last two commands use live public Aave data and require network access.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).
