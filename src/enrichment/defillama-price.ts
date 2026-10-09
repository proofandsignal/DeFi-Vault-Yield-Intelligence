import type { MarketSnapshot } from "../domain/types.js";
import type {
  IndependentPriceQuote,
  IndependentPriceSource
} from "./types.js";

export const DEFILLAMA_COINS_URL = "https://coins.llama.fi";

const CHAIN_SLUGS: Record<number, string> = {
  1: "ethereum",
  10: "optimism",
  56: "bsc",
  100: "xdai",
  137: "polygon",
  324: "era",
  8453: "base",
  42161: "arbitrum",
  43114: "avax",
  59144: "linea",
  534352: "scroll"
};

interface LlamaCoin {
  price?: number;
  timestamp?: number;
  confidence?: number;
}

interface LlamaResponse {
  coins?: Record<string, LlamaCoin>;
}

export class DefiLlamaPriceSource implements IndependentPriceSource {
  constructor(
    private readonly fetchFn: typeof fetch = fetch,
    private readonly baseUrl = DEFILLAMA_COINS_URL
  ) {}

  async quote(snapshot: MarketSnapshot): Promise<IndependentPriceQuote | null> {
    const chain = CHAIN_SLUGS[snapshot.chainId];
    if (!chain) return null;

    const key = `${chain}:${snapshot.asset.address.toLowerCase()}`;
    const response = await this.fetchFn(
      `${this.baseUrl}/prices/current/${encodeURIComponent(key)}`
    );

    if (!response.ok) {
      throw new Error(
        `DefiLlama price HTTP ${response.status}: ${response.statusText}`
      );
    }

    const payload = (await response.json()) as LlamaResponse;
    const coins = payload.coins ?? {};
    const exact = coins[key];
    const normalized =
      exact ??
      Object.entries(coins).find(
        ([coinKey]) => coinKey.toLowerCase() === key.toLowerCase()
      )?.[1];

    if (!normalized || !Number.isFinite(normalized.price)) return null;

    return {
      priceUsd: normalized.price!,
      timestamp: Number.isFinite(normalized.timestamp)
        ? normalized.timestamp!
        : null,
      confidence: Number.isFinite(normalized.confidence)
        ? normalized.confidence!
        : null,
      source: `${this.baseUrl}/prices/current/${key}`
    };
  }
}
