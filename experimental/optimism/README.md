# Optimism read-only evidence experiment — 001

Status: **EXPERIMENTAL / NOT INTEGRATED / NOT VERIFIED LIVE**

Purpose: an opt-in OP Mainnet (chain ID 10) evidence-normalization boundary, isolated from the existing DeFi Yield Scanner and API. No RPC fetches, protocol claims, deployments, customer-facing changes, or expenses.

## Run isolated tests

```bash
node --test experimental/optimism/normalize-evidence.test.mjs
```

Synthetic test source `example.org` is an illustration, **not real evidence**.

## Acceptance gates

- [ ] Isolated tests run and pass in CI or reviewed local environment
- [ ] Verify primary network and protocol data sources independently
- [ ] Validate chain identity and block reference on each real source
- [ ] Define freshness, coverage and failure semantics
- [ ] Independent security and semantic review
- [ ] Regression tests on core scanner and API pass
- [ ] Explicit human approval for any integration or merge

Unverified inputs always produce `VERIFY`, not a claimed GREEN/SAFE risk state.
No source data is interpreted as credit exposure. No permission to change `main` or production is implied.

Related future tracks: settlement verifier and POI governance evidence, both separate and not implemented by this experiment.
