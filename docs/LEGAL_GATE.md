# Legal Classification Gate

## Default state

**PUBLIC CAPITAL: LOCKED**

No public deposits, pooled third-party capital, discretionary portfolio management, or automated execution should be enabled until the intended product structure has received legal classification.

## Questions for counsel

The written legal memo should classify the exact architecture against, at minimum:

- AIF / AIFMD
- MiFID financial instrument classification
- MiCA CASP activities
- advice on crypto-assets
- portfolio management
- custody / control of client assets
- marketing to retail clients
- AML / KYC obligations
- Bulgarian and EU requirements
- cross-border / passporting implications

## Product paths

### Path A — Software / analytics

Risk scanner, monitoring, reports, alerts, data products, and API.

### Path B — B2B infrastructure

Risk and yield infrastructure supplied to a licensed or otherwise appropriately structured operator.

### Path C — Managed vault

Potential fee-bearing vault management or strategy execution.

**Path C remains locked until the Legal Classification Gate is passed.**

## Engineering consequence

Core analytics must remain useful even if Path C is rejected. Regulatory classification must not be a single point of failure for the product.
