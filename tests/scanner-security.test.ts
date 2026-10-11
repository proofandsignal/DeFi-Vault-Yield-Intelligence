import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeEvidenceSource } from "../src/index.js";

test("public evidence URLs preserve useful public paths without query secrets", () => {
  const source =
    "https://api.morpho.org/v0/oracles/1:0xabc/state?token=secret";

  assert.equal(
    sanitizeEvidenceSource(source),
    "https://api.morpho.org/v0/oracles/1:0xabc/state"
  );
});

test("unknown RPC URLs are reduced to origin and safe fragment", () => {
  const source =
    "https://eth-mainnet.g.alchemy.com/v2/super-secret-key#0xabc:latestRoundData";

  assert.equal(
    sanitizeEvidenceSource(source),
    "https://eth-mainnet.g.alchemy.com#0xabc:latestRoundData"
  );
});
