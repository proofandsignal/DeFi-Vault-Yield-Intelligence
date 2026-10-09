# Risk Methodology v0.2.1

## Goal

Turn the Risk Engine from an APY/liquidity classifier into an evidence-based decision engine without inventing missing inputs.

## Decision model

Configured weights:

| Dimension | Weight |
| --- | ---: |
| Utilization | 18% |
| Liquidity | 18% |
| Borrow concentration | 12% |
| Stablecoin depeg | 14% |
| Oracle evidence | 12% |
| Smart-contract / protocol security | 12% |
| Chain risk | 7% |
| Protocol operational status | 7% |

A decision requires:

- fresh source data
- no LOW/UNKNOWN source confidence
- all critical dimensions present
- at least **80% weighted evidence coverage**

Critical dimensions are:

- stablecoin depeg evidence for stablecoins
- oracle evidence
- smart-contract/protocol evidence
- chain evidence

Borrow concentration may remain unresolved temporarily. If it is missing, the decision exposes that fact and reports partial evidence coverage instead of pretending the value is zero.

Scores are renormalized over the available evidence weight.

## Stablecoin evidence

Primary independent source in v0.2.1: DefiLlama Coins API.

The engine compares the independent USD price to $1 and converts absolute deviation into basis points.

Aave's own USD exchange rate is retained as protocol data, but is not used as the independent price source after enrichment.

## Oracle evidence

The oracle registry stores reviewed independent reference-feed metadata:

- provider
- feed type
- market-risk category
- heartbeat
- deviation threshold
- source URL
- review date

Important: the reference Chainlink proxy is not assumed to be identical to the oracle address exposed by Aave. Aave may route through adapters, CAPO, SVR, or other oracle infrastructure.

v0.2.1 therefore scores **reference-oracle quality evidence**, not a complete proof of the live configured Aave oracle path.

Future hardening should add onchain `latestRoundData()` freshness checks and resolve Aave oracle adapter topology.

## Smart-contract / protocol evidence

The protocol registry uses a deterministic, reviewable heuristic over:

- operating history
- published audits/reviews
- live bug-bounty coverage
- onchain governance
- governance timelock
- active critical incident state

These are evidence inputs, not guarantees of safety.

## Chain evidence

The chain registry uses a deterministic architecture heuristic over:

- L1 vs rollup architecture
- centralized sequencer dependency
- L1 data availability
- forced inclusion / self-sequencing escape path
- maturity stage
- emergency upgrade / exit-window risk

The initial reviewed profiles cover Ethereum, OP Mainnet, and Arbitrum One.

## Borrow concentration

AaveKit's public user-position interfaces fetch positions for a specified user address. v0.2.1 does not infer market-wide borrower concentration from that API.

A future concentration provider must supply independently derived reserve-wide borrower distribution evidence.

Until then, concentration is explicitly unresolved and reduces evidence coverage by 12%.

## Calibration

The numeric heuristics in v0.2.1 are intentionally simple and transparent. They are not claimed to be statistically calibrated.

Calibration should use:

1. historical incidents and stress periods
2. observed distributions across the 100+ market dataset
3. false-positive / false-negative review
4. protocol-by-protocol compatibility testing

The methodology should change only through versioned code and tests.
