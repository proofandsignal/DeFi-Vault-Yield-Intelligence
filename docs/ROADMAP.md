# Roadmap

## v0.1 — Core Multi Architecture ✅

- canonical multi-protocol market schema
- protocol adapter interface
- Aave Adapter #001
- deterministic Risk Engine
- fail-closed UNKNOWN/VERIFY data-quality behavior
- protocol-neutral yield and fee simulator
- non-executing Decision Engine
- unit tests and CI
- legal lock documented

## v0.2 — Live Aave Data + Data Quality

Build gate:

- official Aave v3 GraphQL market data source
- live supply APY, supplied USD, borrowed USD and available liquidity
- reserve pause/freeze state
- oracle address capture
- stablecoin depeg signal from Aave USD exchange rate
- explicit fetch freshness and confidence metadata
- APY history query support
- live Ethereum/USDC smoke test
- 100 unique live reserve observations across supported chains
- validation evidence uploaded as a CI artifact

Risk integrity rule:

Aave market data does **not** automatically provide independent borrow-concentration,
oracle-quality, smart-contract-risk, or chain-risk scores. Those values remain null and
the Decision Engine stays **VERIFY** until independent enrichment models are connected.

## v0.2.1 — Risk Enrichment / Calibration

Only after the live 100-observation gate:

- independent stablecoin price cross-check
- oracle type / heartbeat / deviation analysis
- protocol and smart-contract risk registry
- chain / bridge risk inputs
- borrower concentration input
- calibrate risk thresholds against observed distributions

## v0.3 — Multi-Protocol Validation

- Morpho adapter
- Compound adapter
- Spark adapter
- canonical-schema compatibility tests
- cross-protocol comparison
- risk-adjusted net yield ranking

## v0.4 — Monitoring Product

- wallet/position read-only monitor
- alerts
- historical journal
- scanner/report UI
- API surface
- first paid software validation

## Future — Vault / Strategy Layer

Only after the Legal Classification Gate:

- testnet or own-capital vault experiments
- strategy allocation simulator
- withdrawal stress tests
- partner-operator integrations
- managed-vault functionality where legally permitted
