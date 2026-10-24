/**
 * Isolated, read-only OP Mainnet evidence normalization.
 * NOT wired to the scanner or any live RPC provider.
 * This accepts independently retrieved evidence and refuses unsupported claims.
 */
export const OP_MAINNET = Object.freeze({ chainId: 10, name: "OP Mainnet" });

const isNonnegativeFinite = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;

/**
 * @param {{chainId:number,protocol:string,marketId:string,observedAt:string,
 *   sourceUrl:string, liquidityUsd?:number, suppliedApyPct?:number}} input
 */
export function normalizeOpMarketEvidence(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Evidence object required");
  }
  if (input.chainId !== OP_MAINNET.chainId) {
    throw new RangeError("OP Mainnet chainId 10 required");
  }
  for (const field of ["protocol", "marketId"]) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      throw new TypeError(`Missing ${field}`);
    }
  }
  if (typeof input.sourceUrl !== "string" || !/^https:\/\//.test(input.sourceUrl)) {
    throw new TypeError("HTTPS evidence source required");
  }
  const time = Date.parse(input.observedAt);
  if (typeof input.observedAt !== "string" || !Number.isFinite(time)) {
    throw new TypeError("Valid observedAt required");
  }
  for (const field of ["liquidityUsd", "suppliedApyPct"]) {
    if (input[field] !== undefined && !isNonnegativeFinite(input[field])) {
      throw new TypeError(`Invalid ${field}`);
    }
  }
  return Object.freeze({
    chainId: OP_MAINNET.chainId,
    network: OP_MAINNET.name,
    protocol: input.protocol.trim(),
    marketId: input.marketId.trim(),
    observedAt: new Date(time).toISOString(),
    evidence: Object.freeze({ sourceUrl: input.sourceUrl, verification: "UNVERIFIED" }),
    liquidityUsd: input.liquidityUsd ?? null,
    suppliedApyPct: input.suppliedApyPct ?? null,
    creditExposureUsd: null,
    riskState: "VERIFY",
    coverage: "PARTIAL",
  });
}
