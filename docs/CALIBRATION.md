# Calibration v0.3.1

## Purpose

v0.3.1 is the first version in which the common Risk Engine is calibrated
against explicit stress anchors instead of relying only on intuitive weights.

This is still **engineering calibration**, not a statistically validated
predictive model.

## Versioned model

Risk model: `0.3.1`

Configured weights:

| Dimension | Weight |
| --- | ---: |
| Utilization | 16% |
| Liquidity | 16% |
| Borrow concentration | 16% |
| Stablecoin depeg | 16% |
| Oracle | 14% |
| Smart-contract / protocol | 10% |
| Chain | 5% |
| Protocol operational status | 7% |

Decision thresholds:

- GREEN: score <= 32
- WATCH: score <= 58
- RED: score > 58
- minimum evidence coverage: 80%

Hard safety gates:

- paused protocol -> RED
- stablecoin depeg >= 300 bps -> RED

## Borrow concentration

The raw signal is the largest current borrower share of total market debt.

Risk bands:

| Top borrower share | Concentration risk |
| --- | ---: |
| <= 5% | 10 |
| <= 10% | 25 |
| <= 20% | 45 |
| <= 35% | 70 |
| > 35% | 100 |

### Morpho Blue

Morpho market positions can be ordered by current borrow shares through the
official GraphQL API. v0.3.1 reads the largest five positions and compares
their current borrow USD values with total market debt.

### Aave V3 and SparkLend

v0.3.1 reconstructs the borrower set from the complete configured pool
`Borrow` event history and then reads each borrower's current variable debt
token balance.

A concentration result is accepted for scoring only when the sum of discovered
current balances reconciles to at least **99.5% of total variable debt**.

If reconciliation is lower, concentration remains unresolved.

### Compound III

Compound III is intentionally unresolved in v0.3.1.

`Withdraw` events can discover candidate borrowers, but they are not a
complete market-wide borrower registry because base-asset transfers can also
create debt. A partial candidate set is therefore not promoted to a
reserve-wide concentration metric.

## Oracle freshness

Where the configured oracle source exposes Chainlink-compatible
`latestRoundData()`, v0.3.1 reads `updatedAt` and compares its age with the
reviewed heartbeat.

For Morpho, the indexed oracle-state endpoint provides `last_updated_at`.

Freshness evidence can only increase the existing oracle-risk score. It never
reduces a protocol-specific oracle warning.

## Historical calibration anchors

The versioned test set includes:

1. diversified normal-market control -> GREEN
2. high-utilization / tight-liquidity control -> WATCH
3. March 2023 USDC depeg -> RED hard depeg gate
4. November 2022 Aave CRV concentrated-borrower stress -> RED
5. November 2023 Aave security pause -> RED hard protocol gate

Historical anchors are used to test whether the model reacts in the intended
direction to known classes of failure. They do not prove forecast accuracy.

## What is not yet calibrated

- probability of loss
- expected loss
- time-to-liquidation
- recovery rate after an incident
- correlation between dimensions
- incentive-token APY persistence
- gas / bridge / withdrawal friction
- protocol-specific liquidation mechanics

Those remain future validation work and must not be inferred from the current
score.
