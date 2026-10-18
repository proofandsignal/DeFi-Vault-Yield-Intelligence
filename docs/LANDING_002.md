# LANDING-002 — Domain + Analytics + Conversion Tracking

## Goal

Measure the validation funnel before building billing:

```text
X / outreach
  → landing_view
  → scanner_click
  → scanner_view
  → scan_run
  → pro_interest / b2b_interest
  → human follow-up
  → payment signal
```

## Privacy-first event tracking

The product uses first-party server-side conversion events written to Render application logs.

No cookies are set by this tracking layer.

The event model intentionally does **not** record:

- IP address
- wallet address
- API key
- email address
- browser fingerprint
- full referrer URL
- private RPC URL

Events can contain only the conversion event name, timestamp, route, sanitized campaign attribution and referrer hostname.

Structured log prefix:

```text
DVY_EVENT
```

Events:

- `landing_view`
- `scanner_click`
- `scanner_view`
- `scan_run`
- `pro_interest`
- `b2b_interest`

## Campaign attribution

Supported parameters:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `source`
- `campaign`
- `intent`

Example X warm-up URL:

```text
https://yield.proofandsignal.xyz/?utm_source=x&utm_medium=social&utm_campaign=prelaunch_problem
```

Example X launch URL:

```text
https://yield.proofandsignal.xyz/?utm_source=x&utm_medium=social&utm_campaign=launch
```

Example direct prospect URL:

```text
https://yield.proofandsignal.xyz/?utm_source=outreach&utm_medium=dm&utm_campaign=validation10&utm_content=prospect01
```

## CTA routing

Landing CTA clicks pass through first-party redirect routes before the user reaches the scanner or configured contact target.

- `/go/scanner` → logs `scanner_click` → redirects to `/scanner`
- `/go/interest?product=pro` → logs `pro_interest`
- `/go/interest?product=b2b` → logs `b2b_interest`

If `DVY_CONTACT_URL` is configured, PRO/B2B interest routes redirect there.

If it is not configured, the user falls back safely to the scanner while the intent event is still recorded.

## Validation metric

For the first 10 qualified prospects, record:

```text
QUALIFIED
LANDING_VIEW
SCANNER_CLICK
SCAN_RUN
PAIN_SIGNAL
PRO_INTEREST
B2B_INTEREST
PAID
```

The product decision remains:

```text
10 QUALIFIED → 5 USED → 3 PAIN SIGNALS → 1 PAID
```

## Custom domain

Canonical public product hostname:

```text
yield.proofandsignal.xyz
```

The product continues to run on the existing Render service `defi-vault-yield-intelligence`.

The Render hostname remains a technical origin/fallback for diagnostics only:

```text
https://defi-vault-yield-intelligence.onrender.com
```

Public campaign, launch and outreach links should use `https://yield.proofandsignal.xyz`.

Production completion gate:

1. Render custom-domain verification passes.
2. DNS resolves publicly.
3. TLS/HTTPS is valid for `yield.proofandsignal.xyz`.
4. Landing, scanner, tracked redirects and health checks pass through the custom domain.
5. GitHub production smoke validates the custom domain rather than the Render fallback hostname.

No separate hosting service is required.
