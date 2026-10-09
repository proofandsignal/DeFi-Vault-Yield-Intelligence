# Multi-Protocol Normalization

## Goal

v0.3 validates that different lending designs can feed one canonical market schema without creating protocol-specific Risk, Yield, or Decision engines.

## Protocol semantics

### Aave V3

Adapter type: reserve market.

Canonical supply represents supplied reserve value. Borrow represents reserve debt. Available liquidity represents withdrawable reserve liquidity reported by Aave.

### SparkLend

Adapter type: reserve market.

SparkLend uses Aave V3-compatible reserve primitives. The adapter reads the canonical Spark address registry / protocol data provider and normalizes the same supply, borrow, liquidity, APY, oracle-address, and operational-state concepts.

### Compound III

Adapter type: Comet base-asset market.

Compound III suppliers earn on the base asset. The adapter reads total base supply, total base borrow, utilization, the current supply rate, the base-token price feed, and supply pause status from Comet.

Compound exposes a per-second WAD supply rate. v0.3 compounds that rate to normalized APY for comparison with the canonical APY field.

### Morpho Blue

Adapter type: isolated variable-rate lending market.

For v0.3 the Morpho adapter deliberately targets **Morpho Blue markets**, not MetaMorpho / Vault V2 products. This keeps canonical supplied / borrowed / liquidity / APY semantics comparable to Aave, Compound, and Spark.

Morpho markets also have a collateral/loan-asset oracle. The adapter carries Morpho-native oracle type and active oracle warnings into the common oracle-risk dimension. It does not substitute a generic USDC/USD oracle for the market's collateral/loan oracle.

## Canonical fields

Every protocol adapter must produce the same core fields:

- protocol
- chain / chainId
- marketId
- asset identity
- gross supply APY
- rewards APY when separable
- supplied USD
- borrowed USD
- available liquidity USD
- protocol operational status
- oracle address/evidence where meaningful
- observedAt / source / data quality

The common Risk Engine and Decision Engine consume only the canonical snapshot.

## Cross-protocol ranking

v0.3 includes a provisional comparison metric:

```text
riskAdjustedYield = grossSupplyAPY * (1 - riskScore / 100)
```

This is an engineering validation metric, not a calibrated investment model or investment recommendation.

## Known gaps

- borrower concentration remains unresolved for the initial adapters
- oracle topology is not fully resolved for every protocol
- protocol-security heuristics are transparent but uncalibrated
- chain risk coverage is currently limited to reviewed chains
- incentive APY normalization varies by protocol and needs deeper validation
- gas, withdrawal friction, bridge costs, and vault fees are not yet included in the cross-protocol ranking

Those gaps remain explicit instead of being replaced with optimistic defaults.
