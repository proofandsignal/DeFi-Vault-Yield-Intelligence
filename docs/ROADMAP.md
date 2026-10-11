# Roadmap

## v0.1 — Core Multi Architecture ✅

Canonical schema, protocol adapter interface, shared Risk/Yield/Decision engines, tests, CI and legal lock.

## v0.2 — Live Aave Data + Data Quality ✅

Official Aave live data, APY/liquidity normalization, data-quality metadata and 100-observation validation evidence.

## v0.2.1 — Independent Risk Enrichment ✅

Independent stablecoin price evidence, oracle/protocol/chain evidence and weighted evidence coverage.

## v0.3 — Multi-Protocol Validation ✅

Aave V3, Morpho Blue, Compound III and SparkLend normalize into one `MarketSnapshot` and one shared engine.

Validated with live Ethereum USDC data across all four protocols.

## v0.3.1 — Calibration + Concentration ✅

Passed:

- evidence-complete borrower concentration for Aave/Morpho/Spark where architecture permits it
- explicit unresolved concentration for Compound III
- >=99.5% onchain debt reconciliation gate for Aave/Spark
- live oracle freshness
- versioned risk model
- historical stress anchors
- hard stablecoin-depeg safety gate
- all previous regression/live gates

## v0.4 — Yield Scanner + Comparison API

Product gate:

- public read-only web scanner
- `/api/v1/scan` current snapshot API
- `/api/v1/compare` comparison API
- APY / liquidity / risk / confidence / evidence coverage
- protocol filters
- source timestamps
- optional explicit net-yield assumptions
- risk-adjusted observed/net yield
- partial-source responses instead of all-or-nothing failure
- evidence source sanitization
- bounded cache for expensive evidence
- OPEN / KEYED API entitlement mode
- SHA-256 API-key hashes only
- API contract CI
- all prior live risk/data/calibration gates remain green
- deployable Node service with `/health`

Commercial validation target:

- free scanner can be used without an account
- keyed API boundary exists without premature billing complexity
- validate demand for history/alerts/full evidence/API before building customer/billing infrastructure

## v0.4.1 — Live Product Validation

Only after v0.4 technical gate:

- deploy scanner/API
- collect first real usage
- approach existing DeFi prospect shortlist
- test €9–19/month PRO willingness to pay
- test B2B API interest
- record requested features instead of guessing them

## v0.5 — Monitoring / History

Only if v0.4 usage validates demand:

- persistent market snapshots
- history charts/API
- watchlists
- alerts
- webhooks
- API quotas
- customer/account layer
- billing integration if justified by paid intent

## Future — Vault / Strategy Layer

Only after the Legal Classification Gate:

- testnet or own-capital vault experiments
- strategy allocation simulator
- withdrawal stress tests
- partner-operator integrations
- managed-vault functionality where legally permitted

**PUBLIC CAPITAL remains LOCKED throughout the scanner/API track.**
