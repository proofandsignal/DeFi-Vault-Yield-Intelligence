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
https://defi-vault-yield-intelligence.onrender.com/?utm_source=x&utm_medium=social&utm_campaign=prelaunch_problem
```

Example X launch URL:

```text
https://defi-vault-yield-intelligence.onrender.com/?utm_source=x&utm_medium=social&utm_campaign=launch
```

Example direct prospect URL:

```text
https://defi-vault-yield-intelligence.onrender.com/?utm_source=outreach&utm_medium=dm&utm_campaign=validation10&utm_content=prospect01
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

Proposed product hostname:

```text
yield.proofandsignal.com
```

Do not activate or publish this hostname until ownership/control of the parent domain and its DNS provider are confirmed.

When domain control is confirmed:

1. Add `yield.proofandsignal.com` as a custom domain to the existing Render service `defi-vault-yield-intelligence`.
2. Render will provide the required DNS target.
3. Add the requested DNS record at the domain provider.
4. Wait for Render to verify the custom domain and issue TLS.
5. Re-run production health, landing, scanner and API smoke checks.
6. Change campaign links from the Render hostname to the verified custom domain.

No separate hosting service is required.
