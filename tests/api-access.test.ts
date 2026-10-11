import assert from "node:assert/strict";
import test from "node:test";

import {
  hashApiKey,
  resolveAccess
} from "../src/index.js";

test("OPEN mode permits comparison API without authenticating free users", () => {
  const access = resolveAccess(
    new Headers(),
    { DVY_API_ACCESS_MODE: "OPEN" } as NodeJS.ProcessEnv
  );

  assert.equal(access.plan, "FREE");
  assert.equal(access.canUsePaidApi, true);
  assert.equal(access.canViewFullEvidence, false);
});

test("KEYED mode rejects unauthenticated paid API use", () => {
  const access = resolveAccess(
    new Headers(),
    { DVY_API_ACCESS_MODE: "KEYED" } as NodeJS.ProcessEnv
  );

  assert.equal(access.canUsePaidApi, false);
});

test("hashed PRO key unlocks API and full evidence without storing raw key", () => {
  const rawKey = "test-pro-key";
  const hash = hashApiKey(rawKey);
  const headers = new Headers({
    "x-api-key": rawKey
  });

  const access = resolveAccess(
    headers,
    {
      DVY_API_ACCESS_MODE: "KEYED",
      DVY_API_KEY_HASHES_JSON: JSON.stringify({
        [hash]: "PRO"
      })
    } as NodeJS.ProcessEnv
  );

  assert.equal(access.plan, "PRO");
  assert.equal(access.authenticated, true);
  assert.equal(access.canUsePaidApi, true);
  assert.equal(access.canViewFullEvidence, true);
});
