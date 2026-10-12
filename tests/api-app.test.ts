import assert from "node:assert/strict";
import test from "node:test";

import {
  createApiApplication,
  hashApiKey,
  type ScannerResponse
} from "../src/index.js";

const response: ScannerResponse = {
  schemaVersion: "0.4.0",
  riskModelVersion: "0.3.1",
  generatedAt: "2026-10-11T12:00:00.000Z",
  complete: true,
  query: {
    chainId: 1,
    assetSymbol: "USDC",
    protocols: ["aave"]
  },
  assumptions: {
    principalUsd: null,
    annualCostsUsd: null,
    performanceFeeRate: null,
    netEstimateAvailable: false,
    note: "fixture"
  },
  rankingMetric: "riskAdjustedObservedYieldPct",
  rows: [],
  errors: []
};

const scanner = {
  async scan() {
    return response;
  }
};

test("health exposes read-only and public-capital lock state", async () => {
  const app = createApiApplication({ scanner });
  const result = await app.fetch(
    new Request("http://localhost/health")
  );

  assert.equal(result.status, 200);
  const body = await result.json() as any;
  assert.equal(body.mode, "READ_ONLY");
  assert.equal(body.publicCapital, "LOCKED");
});

test("free scan route stays publicly accessible in KEYED mode", async () => {
  const app = createApiApplication({
    scanner,
    env: {
      DVY_API_ACCESS_MODE: "KEYED"
    } as NodeJS.ProcessEnv
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/scan?chainId=1&asset=USDC"
    )
  );

  assert.equal(result.status, 200);
});

test("comparison route requires a paid key in KEYED mode", async () => {
  const app = createApiApplication({
    scanner,
    env: {
      DVY_API_ACCESS_MODE: "KEYED"
    } as NodeJS.ProcessEnv
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/compare?chainId=1&asset=USDC"
    )
  );

  assert.equal(result.status, 401);
});

test("valid PRO key unlocks comparison API", async () => {
  const key = "paid-fixture-key";
  const app = createApiApplication({
    scanner,
    env: {
      DVY_API_ACCESS_MODE: "KEYED",
      DVY_API_KEY_HASHES_JSON: JSON.stringify({
        [hashApiKey(key)]: "PRO"
      })
    } as NodeJS.ProcessEnv
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/compare?chainId=1&asset=USDC",
      {
        headers: {
          "x-api-key": key
        }
      }
    )
  );

  assert.equal(result.status, 200);
  assert.equal(result.headers.get("x-dvy-plan"), "PRO");
});


test("root serves the product landing while scanner remains separate", async () => {
  const app = createApiApplication({ scanner });

  const landing = await app.fetch(new Request("http://localhost/"));
  const landingHtml = await landing.text();

  assert.equal(landing.status, 200);
  assert.match(landingHtml, /Proof & Signal — DeFi Yield Intelligence/);
  assert.match(landingHtml, /Compare DeFi yield beyond APY/);
  assert.match(landingHtml, /Join Founding Beta/);
  assert.match(landingHtml, /No custody/);

  const scannerPage = await app.fetch(
    new Request("http://localhost/scanner")
  );
  const scannerHtml = await scannerPage.text();

  assert.equal(scannerPage.status, 200);
  assert.match(scannerHtml, /Scan live markets/);
  assert.doesNotMatch(scannerHtml, /Join Founding Beta/);
});

test("conversion routes preserve attribution and emit anonymous events", async () => {
  const events: any[] = [];
  const app = createApiApplication({
    scanner,
    eventSink(event) {
      events.push(event);
    }
  });

  const landing = await app.fetch(
    new Request(
      "http://localhost/?utm_source=x&utm_medium=social&utm_campaign=prelaunch_problem"
    )
  );
  assert.equal(landing.status, 200);
  assert.equal(events[0].event, "landing_view");
  assert.equal(events[0].source, "x");
  assert.equal(events[0].campaign, "prelaunch_problem");

  const click = await app.fetch(
    new Request(
      "http://localhost/go/scanner?source=landing&campaign=hero-primary"
    )
  );
  assert.equal(click.status, 302);
  assert.match(
    click.headers.get("location") ?? "",
    /\/scanner\?source=landing&campaign=hero-primary/
  );
  assert.equal(events[1].event, "scanner_click");

  const scannerView = await app.fetch(
    new Request(
      "http://localhost/scanner?source=landing&campaign=hero-primary"
    )
  );
  assert.equal(scannerView.status, 200);
  assert.equal(events[2].event, "scanner_view");
});

test("PRO and B2B interest routes emit distinct intent events", async () => {
  const events: any[] = [];
  const app = createApiApplication({
    scanner,
    env: {
      DVY_CONTACT_URL: "https://example.com/founding-beta"
    } as NodeJS.ProcessEnv,
    eventSink(event) {
      events.push(event);
    }
  });

  const pro = await app.fetch(
    new Request(
      "http://localhost/go/interest?product=pro&source=landing&campaign=founding-beta"
    )
  );
  assert.equal(pro.status, 302);
  assert.equal(
    pro.headers.get("location"),
    "https://example.com/founding-beta"
  );
  assert.equal(events[0].event, "pro_interest");
  assert.equal(events[0].intent, "founding_beta");

  const b2b = await app.fetch(
    new Request(
      "http://localhost/go/interest?product=b2b&source=landing&campaign=b2b-api"
    )
  );
  assert.equal(b2b.status, 302);
  assert.equal(events[1].event, "b2b_interest");
  assert.equal(events[1].intent, "b2b_api");
});

test("scanner UI request is counted as scan_run without changing API output", async () => {
  const events: any[] = [];
  const app = createApiApplication({
    scanner,
    eventSink(event) {
      events.push(event);
    }
  });

  const result = await app.fetch(
    new Request(
      "http://localhost/api/v1/scan?chainId=1&asset=USDC&ui=1&source=landing&campaign=hero-primary"
    )
  );

  assert.equal(result.status, 200);
  assert.equal(events[0].event, "scan_run");
  assert.equal(events[0].source, "landing");
  assert.equal(events[0].campaign, "hero-primary");
});
