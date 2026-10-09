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
- explicit fetch freshness and confidence metadata
- APY history support
- live Ethereum/USDC smoke test
- 100 unique live reserve observations
- validation evidence artifact

## v0.2.1 — Independent Risk Enrichment ✅

- DefiLlama independent stablecoin price cross-check
- reviewed oracle reference metadata
- reviewed protocol/security evidence
- reviewed chain-risk evidence
- explicit borrower-concentration provider boundary
- weighted evidence coverage
- critical-risk evidence gates
- live Ethereum USDC enriched risk decision

Validated live result on 2026-10-09:

- status: WATCH
- score: 43.68
- weighted evidence coverage: 88%
- confidence: MEDIUM
- unresolved: borrower concentration only

## v0.3 — Multi-Protocol Validation

Build gate:

- Morpho Blue adapter
- Compound III adapter
- SparkLend adapter
- Aave Adapter #001 retained
- canonical-schema compatibility tests
- protocol-specific normalization tests
- shared rate-normalization utilities
- live Ethereum USDC comparison across all four protocols
- common independent risk enrichment
- provisional risk-adjusted yield ranking
- all four observations must satisfy >=80% evidence coverage
- no protocol may remain VERIFY because of an adapter/schema defect

Integrity rules:

- no separate Risk Engine per protocol
- no vault product is disguised as a lending market
- Morpho v0.3 targets Blue markets, not Vault V2
- protocol-specific oracle evidence may be supplied by an adapter when semantics differ
- ranking is explicitly provisional and uncalibrated

## v0.3.1 — Calibration / Concentration

- reserve-wide borrower concentration sources
- onchain oracle freshness / latestRoundData where applicable
- richer oracle topology resolution
- historical incident / stress-period calibration
- threshold calibration against observed distributions
- protocol-security registry review and calibration
- incentive APY normalization

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
