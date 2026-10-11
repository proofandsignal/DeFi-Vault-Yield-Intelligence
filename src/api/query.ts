import type {
  ScannerQuery,
  SupportedProtocol
} from "../scanner/types.js";

const PROTOCOLS = new Set<SupportedProtocol>([
  "aave",
  "morpho",
  "compound",
  "spark"
]);

function optionalNumber(
  params: URLSearchParams,
  key: string
): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return undefined;

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new RangeError(`${key} must be a finite number.`);
  }

  return value;
}

export function parseScannerQuery(
  params: URLSearchParams
): ScannerQuery {
  const chainId = Number(params.get("chainId") ?? 1);
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new RangeError("chainId must be a positive integer.");
  }

  const assetSymbol =
    (params.get("asset") ?? "USDC").trim().toUpperCase();

  if (!assetSymbol || !/^[A-Z0-9._-]{2,20}$/.test(assetSymbol)) {
    throw new RangeError("asset must be a valid asset symbol.");
  }

  const protocolsRaw = params.get("protocols");
  let protocols: SupportedProtocol[] | undefined;

  if (protocolsRaw) {
    protocols = protocolsRaw
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .map((item) => {
        if (!PROTOCOLS.has(item as SupportedProtocol)) {
          throw new RangeError(
            `Unsupported protocol filter: ${item}.`
          );
        }
        return item as SupportedProtocol;
      });
  }

  return {
    chainId,
    assetSymbol,
    protocols,
    principalUsd: optionalNumber(params, "principalUsd"),
    annualCostsUsd: optionalNumber(params, "annualCostsUsd"),
    performanceFeeRate: optionalNumber(
      params,
      "performanceFeeRate"
    ),
    includeEvidence:
      params.get("includeEvidence") === "1" ||
      params.get("includeEvidence") === "true"
  };
}
