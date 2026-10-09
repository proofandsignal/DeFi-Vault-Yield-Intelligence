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

## v0.1 scope

- canonical market schema
- protocol adapter contract
- Aave Adapter #001
- deterministic Risk Engine
- fail-closed VERIFY data-quality gate
- protocol-neutral yield/fee simulator
- read-only Decision Engine
- tests and CI
- explicit Legal Classification Gate

## Multi roadmap

Protocol: Aave -> Morpho -> Compound -> Spark -> future adapters  
Chain: Ethereum / Base / Arbitrum / Optimism / future chains  
Asset: USDC / USDT / USDS / DAI / WETH / future assets  
Output: scanner / monitoring / reports / API / partner vault infrastructure

## Safety and legal boundary

v0.1 is **read-only research infrastructure**.

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
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).
