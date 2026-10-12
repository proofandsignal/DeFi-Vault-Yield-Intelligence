# v0.4.1 — Live Product Validation

## Production service

Render service:

```text
defi-vault-yield-intelligence
```

Public URL:

```text
https://defi-vault-yield-intelligence.onrender.com
```

Deployment:

- branch: `main`
- runtime: Node
- plan: Free
- region: Frankfurt
- auto deploy: enabled
- API mode: `OPEN`
- product mode: `READ_ONLY`
- public capital: `LOCKED`

## Production smoke gate

The `Production Smoke` workflow validates the actual deployed service from an external GitHub runner.

Required checks:

1. `GET /health`
   - `status=ok`
   - version `0.4.0`
   - `READ_ONLY`
   - `publicCapital=LOCKED`

2. `GET /scanner`
   - scanner HTML renders
   - live-scan control exists
   - public-capital lock message remains present

3. `GET /api/v1/scan`
   - live Ethereum USDC Compound observation
   - schema `0.4.0`
   - Risk Model `0.3.1`
   - live APY and risk fields returned

4. `GET /api/v1/compare`
   - OPEN validation mode is reachable
   - comparison product marker is returned

## Commercial validation phase

Technical deployment is not proof of demand.

After the production smoke passes, the next evidence is customer behavior:

- show the scanner to the existing DeFi prospect shortlist;
- record repeated usage and requested features;
- test whether users ask for history, alerts, exports or saved watchlists;
- test a **€9–19/month PRO** offer;
- separately test B2B interest in keyed API access.

Do not build billing, accounts or large dashboards solely from assumptions.

## Promotion gate

The API should remain `OPEN` during initial product validation.

Switch `DVY_API_ACCESS_MODE` to `KEYED` only when a real PRO/B2B access test is ready.

No public-capital functionality is part of v0.4.1.
