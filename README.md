# DeFi Vault & Yield Intelligence

Multi-protocol, multi-chain, multi-asset DeFi risk and yield intelligence infrastructure.

## Product thesis

The project does **not** build a lending protocol. It builds a protocol-neutral intelligence layer above existing DeFi markets and vault infrastructure.

**Everything is multi by architecture.**

```text
Aave / Morpho / Compound / Spark
              |
        Protocol Adapters
              |
     Canonical Market Schema
              |
 Independent Risk Evidence
  + concentration
  + oracle freshness
              |
 Calibrated Risk Engine
 GREEN / WATCH / RED / VERIFY
              |
      Yield Scanner v0.4
              |
   Web Scanner / Comparison API
              |
Monitoring / History / B2B Infrastructure
```

## Current build — v0.4

v0.4 turns the validated intelligence core into the first product surface.

Included:

- free read-only web Yield Scanner
- `GET /api/v1/scan`
- `GET /api/v1/markets`
- comparison API at `GET /api/v1/compare`
- calibrated shared Risk Engine v0.3.1
- live Aave V3, Morpho Blue, Compound III and SparkLend sources
- risk / confidence / evidence-coverage output
- optional assumption-based net APY
- risk-adjusted observed/net yield
- protocol-source partial-failure handling
- five-minute in-memory evidence cache
- OPEN / KEYED API access modes
- SHA-256 API-key entitlement boundary
- evidence-source secret redaction
- Render-ready Node HTTP server
- explicit monetization ladder

## Net-yield integrity

v0.4 does **not** silently treat unknown costs as zero and call the result "net".

Without explicit `principalUsd`, the scanner returns observed APY and risk-adjusted observed yield.

When principal/cost assumptions are supplied, the API returns the exact assumptions next to `estimatedNetApyPct`.

## Monetization boundary

The intended sequence is:

```text
FREE
current Yield Scanner
        ↓
PRO
history + alerts + watchlists + full evidence
        ↓
B2B
keyed Comparison API + monitoring infrastructure
```

The initial PRO price hypothesis remains **€9–19/month**, but billing is deliberately not built before willingness-to-pay is validated.

See [docs/MONETIZATION.md](docs/MONETIZATION.md).

## Current pilot catalog

- Ethereum
- USDC
- Aave V3
- Morpho Blue
- Compound III
- SparkLend

The architecture remains multi-chain / multi-asset; v0.4 limits the public scanner catalog while the product contract is validated.

## Risk model

Current model: **v0.3.1**.

Borrow concentration is evidence-complete for Aave/Morpho/Spark where the v0.3.1 reconciliation gates pass. Compound III concentration remains explicitly unresolved until a complete borrower-enumeration source exists.

The model remains an **engineering risk classification**, not a loss-probability prediction or investment recommendation.

## Safety and legal boundary

The current product is **read-only analytics**.

It does not custody third-party assets, accept public deposits, execute deposits or withdrawals, rebalance public capital, or operate a public managed vault.

**PUBLIC CAPITAL: LOCKED** until the Legal Classification Gate is passed.

## Run locally

```bash
npm install
npm run check
npm test
npm run build
npm run dev:api
```

Then open:

```text
http://127.0.0.1:8787/scanner
```

## Evidence / validation

Existing live gates remain part of the repository:

```bash
npm run live:aave-smoke
npm run validate:aave-100
npm run live:risk-smoke
npm run live:multi-protocol
npm run live:v031
npm run api:contract
```

See [docs/API.md](docs/API.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/RISK_METHODOLOGY.md](docs/RISK_METHODOLOGY.md), [docs/CALIBRATION.md](docs/CALIBRATION.md), and [docs/MULTI_PROTOCOL.md](docs/MULTI_PROTOCOL.md).
