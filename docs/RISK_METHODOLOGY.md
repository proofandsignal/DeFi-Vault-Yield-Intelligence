# Risk Methodology v0.3.1

## Goal

Produce a common, evidence-backed risk decision across Aave, Morpho, Compound and Spark without inventing missing protocol data.

## Versioned weights

| Dimension | Weight |
| --- | ---: |
| Utilization | 16% |
| Liquidity | 16% |
| Borrow concentration | 16% |
| Stablecoin depeg | 16% |
| Oracle evidence | 14% |
| Smart-contract / protocol security | 10% |
| Chain risk | 5% |
| Protocol operational status | 7% |

A normal scored decision requires fresh source data, no LOW/UNKNOWN source confidence, all critical dimensions and at least **80% weighted evidence coverage**.

Critical dimensions remain stablecoin depeg for stablecoins, oracle evidence, smart-contract/protocol evidence and chain evidence.

## Hard safety gates

Some failure classes should not be diluted through weighted averaging:

- protocol paused -> **RED**
- stablecoin deviation >= **300 bps** -> **RED**

## Borrow concentration

The canonical raw concentration signal is **largest current borrower share of total current debt**.

The signal is transformed through versioned bands:

- <=5% -> risk 10
- <=10% -> risk 25
- <=20% -> risk 45
- <=35% -> risk 70
- >35% -> risk 100

Morpho Blue uses ordered current market positions.

Aave V3 and SparkLend enumerate variable-debt-token holder addresses through Blockscout, then independently read current `balanceOf` values on-chain. The signal is accepted only when those on-chain balances reconcile to at least **99.5%** of on-chain variable-debt-token `totalSupply`.

Compound III remains unresolved because available event-based candidate discovery is not a complete borrower registry.

## Oracle evidence

Oracle evidence has two layers:

1. protocol/reference oracle metadata and warnings;
2. live freshness evidence when the configured source exposes a supported timestamp.

Chainlink-compatible sources use `latestRoundData().updatedAt`. Morpho uses indexed oracle-state `last_updated_at`.

Freshness can increase oracle risk; it never erases an existing protocol warning.

## Stablecoin evidence

DefiLlama remains the independent spot-price cross-check. Absolute USD deviation is converted to basis points.

## Calibration

v0.3.1 introduces versioned historical stress anchors covering:

- normal diversified conditions
- high utilization / tight liquidity
- March 2023 USDC depeg
- November 2022 Aave CRV concentrated borrower stress
- November 2023 Aave security pause

These anchors verify model behavior against known failure classes. They are not a statistically sufficient training dataset and do not establish predictive accuracy.

See [CALIBRATION.md](CALIBRATION.md).

## Interpretation

`GREEN / WATCH / RED` is a structured research classification.

It is not:

- a probability of default
- an expected-loss estimate
- a guarantee of protocol safety
- an investment recommendation
- a substitute for legal, financial or security due diligence
