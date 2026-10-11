# Monetization Ladder v0.4

## Principle

Monetize the intelligence layer before taking regulatory or operational risk around public capital.

## Free

Purpose: acquisition and trust.

Surface:

- web Yield Scanner
- current market snapshot
- APY / liquidity / risk status
- risk score / confidence / evidence coverage
- limited summary evidence

Target behavior to validate:

- users repeatedly compare markets
- users return when APY/risk changes
- users ask for history, alerts, exports or API access

## PRO hypothesis

Purpose: validate willingness to pay from individual/professional users.

Potential paid features after v0.4 proves usage:

- history
- alerts / monitoring
- full evidence trail
- saved watchlists
- CSV/JSON exports
- more assets/chains
- risk-change notifications

Initial price hypothesis: **€9–19/month**, subject to real customer validation.

## B2B / API hypothesis

Purpose: sell the same intelligence core to wallets, dashboards, treasury teams, fintechs, CASPs and other operators.

v0.4 introduces the keyed Comparison API boundary without a billing provider.

Potential commercial surface:

- higher request limits
- full evidence payloads
- deterministic schema/versioning
- monitoring/webhooks
- SLA / support
- additional protocols/assets/chains

Pricing should be validated with actual integrations before committing to a long-term tariff.

## API entitlement design

`DVY_API_ACCESS_MODE=KEYED` locks the comparison API behind hashed API keys.

Environment configuration contains only SHA-256 hashes:

```json
{
  "<sha256>": "PRO",
  "<sha256>": "B2B"
}
```

This is an entitlement boundary, not a billing system.

## Success gate

Do not build a large billing platform before demand exists.

v0.4 is commercially useful when we can show at least one of:

1. a user asks to pay for monitoring/history;
2. a B2B prospect asks for API access;
3. repeat scanner usage demonstrates a real recurring workflow.

Only then should billing, quotas and persistent customer accounts become the next build priority.
