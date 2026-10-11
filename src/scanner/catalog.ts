import type { SupportedProtocol } from "./types.js";

export interface SupportedScan {
  chainId: number;
  chain: string;
  assetSymbol: string;
  protocols: SupportedProtocol[];
}

export const SUPPORTED_SCANS: SupportedScan[] = [
  {
    chainId: 1,
    chain: "Ethereum",
    assetSymbol: "USDC",
    protocols: ["aave", "morpho", "compound", "spark"]
  }
];

export function supportedProtocols(
  chainId: number,
  assetSymbol: string
): SupportedProtocol[] {
  const match = SUPPORTED_SCANS.find(
    (item) =>
      item.chainId === chainId &&
      item.assetSymbol === assetSymbol.toUpperCase()
  );

  return match?.protocols ?? [];
}
