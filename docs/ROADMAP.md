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

## v0.3.1 — Calibration + Concentration

Build gate:

- Morpho market-wide top-borrower concentration
- Aave/Spark complete Borrow-event discovery
- current variable-debt reconciliation
- accept Aave/Spark concentration only at >=99.5% debt coverage
- keep Compound concentration unresolved unless complete enumeration exists
- live oracle freshness where supported
- versioned risk weights and thresholds
- historical stress anchors
- hard stablecoin-depeg safety gate
- CI + all prior live validation gates remain green
- live v0.3.1 evidence report

## v0.4 — Yield Scanner / Comparison API

After v0.3.1 passes:

- normalized live market scanner
- APY / liquidity / risk / confidence / evidence coverage
- protocol and chain filters
- evidence links / timestamps
- history
- comparison API
- first paid software validation

The first monetization target is the intelligence layer, not public capital management.

## Future — Vault / Strategy Layer

Only after the Legal Classification Gate:

- testnet or own-capital vault experiments
- strategy allocation simulator
- withdrawal stress tests
- partner-operator integrations
- managed-vault functionality where legally permitted
