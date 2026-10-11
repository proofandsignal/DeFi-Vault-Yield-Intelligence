# v0.4 Deployment Contract

The v0.4 API is a standard Node HTTP service and is ready for a Render-style web service.

## Build

```bash
npm install
npm run build
```

## Start

```bash
npm start
```

The process binds to:

```text
0.0.0.0:$PORT
```

Default local port: `8787`.

## Health check

```text
GET /health
```

Expected core state:

```json
{
  "status": "ok",
  "service": "defi-vault-yield-intelligence",
  "version": "0.4.0",
  "mode": "READ_ONLY",
  "publicCapital": "LOCKED"
}
```

## Required environment

```text
PORT=<provided by hosting platform>
EVM_RPC_URL=<Ethereum RPC>
DVY_API_ACCESS_MODE=OPEN
DVY_API_KEY_HASHES_JSON={}
```

For first product validation, `OPEN` mode is acceptable.

Before selling API access, switch to:

```text
DVY_API_ACCESS_MODE=KEYED
```

and add SHA-256 API key hashes to `DVY_API_KEY_HASHES_JSON`.

## Security boundary

Never place production API keys in repository files.

The scanner sanitizes evidence sources before API serialization so a private RPC URL cannot expose a provider key through evidence links or source-error messages.

Unexpected server errors return a generic message.

## Current scale limitation

v0.4 uses an in-memory five-minute scanner cache.

This is intentional for the first single-instance validation deployment.

Before horizontal scaling, persistent shared cache/history should be introduced so expensive concentration evidence is not recomputed independently by every instance.
