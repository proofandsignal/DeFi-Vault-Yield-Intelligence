# Yield Scanner + Comparison API v0.4

## Product boundary

v0.4 is read-only intelligence infrastructure.

It does not custody assets, accept deposits, create transactions, rebalance capital, or operate a public vault.

**PUBLIC CAPITAL: LOCKED.**

## Routes

### `GET /health`

Returns service/version state and the public-capital lock.

### `GET /scanner`

Minimal free web scanner.

Current pilot catalog:

- chain: Ethereum
- asset: USDC
- protocols: Aave V3, Morpho Blue, Compound III, SparkLend

### `GET /api/v1/scan`

Free current-snapshot scanner endpoint.

Example query:

```text
/api/v1/scan?chainId=1&asset=USDC
```

Optional filters:

```text
protocols=aave,morpho
principalUsd=10000
annualCostsUsd=100
performanceFeeRate=0.10
includeEvidence=true
```

`includeEvidence=true` requires an authenticated PRO/B2B key.

### `GET /api/v1/markets`

Alias of the current free scanner contract.

### `GET /api/v1/compare`

Comparison API product surface.

Access behavior:

- `DVY_API_ACCESS_MODE=OPEN`: development/validation mode
- `DVY_API_ACCESS_MODE=KEYED`: requires a valid PRO/B2B API key

API key header:

```text
X-API-Key: <raw-client-key>
```

The server hashes the presented key with SHA-256 and compares the hash to `DVY_API_KEY_HASHES_JSON`.

Raw production keys do not need to be stored in repository configuration.

## Response semantics

Each row exposes:

- protocol / chain / market id
- base supply APY
- known rewards APY
- observed gross APY
- optional assumption-based estimated net APY
- risk-adjusted observed/net yield
- supplied / borrowed / available liquidity
- utilization
- top borrower concentration when evidence-complete
- GREEN / WATCH / RED / VERIFY
- risk score
- confidence
- evidence coverage
- unresolved dimensions
- source freshness and timestamps
- evidence-source count and links

## Net APY integrity rule

v0.4 does **not** label an APY as net by silently assuming zero costs.

`estimatedNetApyPct` stays null unless `principalUsd` is explicitly supplied.

When a net estimate is requested, the response returns the exact assumptions used:

- principal USD
- annual costs USD
- performance fee rate

Gas, bridge, tax and execution costs are not inferred.

## Partial-source behavior

A failed protocol source does not erase healthy protocols.

The API returns:

- healthy rows
- per-protocol errors
- `complete=false`
- HTTP 206 for a partial result

This allows monitoring clients to distinguish a source outage from a market/risk decision.

## Risk model

Current risk model version: `0.3.1`.

The scanner consumes the same calibrated Risk Engine already validated by v0.3.1. v0.4 does not introduce a separate UI/API scoring model.

## Disclaimer

The ranking is an analytical comparison output, not a recommendation, guaranteed return, or probability-of-loss estimate.
