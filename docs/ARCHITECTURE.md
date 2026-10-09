# Architecture v0.1

## Principle

**Everything is multi.** The core must not depend on one protocol, chain, asset, vault, strategy, data source, operator, or customer type.

Aave is **Adapter #001**, not the product boundary.

## Flow

```text
Protocol / Chain Data
        |
        v
Protocol Adapters
        |
        v
Canonical MarketSnapshot
        |
        +--> Risk Engine ------> GREEN / WATCH / RED / VERIFY
        |
        +--> Yield Engine -----> gross / fees / costs / net yield
        |
        v
Decision / Monitoring Layer
        |
        +--> Scanner
        +--> Reports
        +--> Alerts
        +--> B2B API
        +--> Partner Vault Infrastructure
        +--> Future strategy execution (LEGAL GATE required)
```

## Adapter rule

A protocol adapter may know Aave, Morpho, Compound, Spark, or another protocol.
No risk/yield/decision engine may contain protocol-specific field names.

## v0.1 adapter roadmap

1. Aave
2. Morpho
3. Compound
4. Spark
5. Additional protocols only after the canonical schema survives the first four.

## Chain roadmap

The schema is chain-neutral. A specific pilot may start on one chain, but every observation carries `chainId` and `chain`.

## Data quality

Missing risk-critical inputs are not silently replaced with optimistic defaults.
The Risk Engine fails closed to **VERIFY**.

## Execution boundary

v0.1 is read-only research infrastructure. It does not custody assets, build user-specific transactions, rebalance public capital, or execute deposits/withdrawals.
