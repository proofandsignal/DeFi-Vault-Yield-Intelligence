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

## v0.2 — Live Aave Data + Data Quality ✅

- official Aave v3 GraphQL market data source
- live supply APY, supplied USD, borrowed USD and available liquidity
- reserve pause/freeze state
- oracle address capture
- stablecoin USD-deviation signal
- explicit fetch freshness and confidence metadata
- APY history query support
- live Ethereum/USDC smoke test
- 100 unique live reserve observations
- validation evidence artifact

## v0.2.1 — Independent Risk Enrichment

Build gate:

- DefiLlama independent stablecoin price cross-check
- reviewed oracle type / heartbeat / deviation reference metadata
- reviewed protocol and smart-contract security evidence
- reviewed chain-risk evidence
- explicit borrower-concentration provider boundary
- weighted evidence coverage
- critical-risk evidence gates
- live Ethereum USDC enriched risk decision

Integrity rule:

- no missing risk dimension is silently converted to zero
- borrower concentration may remain unresolved but must remain visible
- no GREEN/WATCH/RED decision below 80% weighted coverage
- no decision when stablecoin, oracle, smart-contract, or chain evidence is missing
- heuristics are versioned and explicitly documented as uncalibrated

## v0.2.2 — Calibration / Concentration

- reserve-wide borrower concentration source
- onchain oracle latestRoundData freshness
- Aave adapter/CAPO/SVR topology resolution
- historical incident / stress-period calibration
- threshold calibration against observed distributions

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
