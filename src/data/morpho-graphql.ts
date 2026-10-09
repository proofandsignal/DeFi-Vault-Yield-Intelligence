import type { MarketQuery } from "../adapters/protocol.js";
import type {
  MorphoDataSource,
  MorphoMarketRecord
} from "../adapters/morpho.js";
import { evaluateDataQuality } from "../data-quality.js";

export const MORPHO_GRAPHQL_URL = "https://api.morpho.org/graphql";

const STABLECOINS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "USDS",
  "GHO",
  "LUSD",
  "FRAX",
  "CRVUSD",
  "PYUSD",
  "USDE"
]);

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface MorphoWarning {
  type: string;
  level: "YELLOW" | "RED" | string;
}

interface MorphoGraphQLMarket {
  marketId: string;
  listed: boolean;
  loanAsset: {
    address: string;
    symbol: string;
    decimals: number;
    chain?: {
      id?: number;
      network?: string;
    };
  };
  oracle: null | {
    address: string;
    type?: string | null;
  };
  warnings?: MorphoWarning[];
  state: null | {
    supplyAssetsUsd: number | string | null;
    borrowAssetsUsd: number | string | null;
    liquidityAssetsUsd: number | string | null;
    supplyApy: number | string | null;
    avgSupplyApy: number | string | null;
    avgNetSupplyApy: number | string | null;
  };
}

const chainName = (chainId: number): string => {
  const names: Record<number, string> = {
    1: "Ethereum",
    10: "Optimism",
    8453: "Base",
    42161: "Arbitrum"
  };
  return names[chainId] ?? `chain-${chainId}`;
};

const finite = (
  value: number | string | null | undefined
): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function oracleRiskScore(
  oracle: MorphoGraphQLMarket["oracle"],
  warnings: MorphoWarning[] = []
): number | null {
  if (!oracle?.address) return null;

  const oracleUnusable = warnings.some(
    (warning) =>
      warning.level === "RED" &&
      warning.type.toLowerCase() === "oracle_unusable"
  );
  if (oracleUnusable) return 100;

  const priceDerivation = warnings.some(
    (warning) =>
      warning.level === "RED" &&
      warning.type.toLowerCase() === "oracle_price_derivation"
  );
  if (priceDerivation) return 90;

  const type = oracle.type?.toLowerCase() ?? "";
  if (type.includes("chainlink")) return 30;

  // A custom/unknown oracle is not treated as broken, but receives a
  // conservative score until its composition is independently classified.
  return 55;
}

export class MorphoGraphQLDataSource implements MorphoDataSource {
  constructor(
    private readonly fetchFn: typeof fetch = fetch,
    private readonly endpoint = MORPHO_GRAPHQL_URL
  ) {}

  private async request<T>(query: string): Promise<T> {
    const response = await this.fetchFn(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "defi-vault-yield-intelligence/0.3"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(
        `Morpho GraphQL HTTP ${response.status}: ${response.statusText}`
      );
    }

    const payload = (await response.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      throw new Error(
        `Morpho GraphQL error: ${payload.errors
          .map((error) => error.message ?? "unknown error")
          .join("; ")}`
      );
    }
    if (!payload.data) {
      throw new Error("Morpho GraphQL response did not contain data.");
    }

    return payload.data;
  }

  async listMarkets(chainId: number): Promise<MorphoMarketRecord[]> {
    if (!Number.isInteger(chainId) || chainId <= 0) {
      throw new RangeError("chainId must be a positive integer.");
    }

    const query = `
      query Markets {
        markets(
          first: 100
          orderBy: SupplyAssetsUsd
          orderDirection: Desc
          where: { chainId_in: [${chainId}], listed: true }
        ) {
          items {
            marketId
            listed
            loanAsset {
              address
              symbol
              decimals
              chain {
                id
                network
              }
            }
            oracle {
              address
              type
            }
            warnings {
              type
              level
            }
            state {
              supplyAssetsUsd
              borrowAssetsUsd
              liquidityAssetsUsd
              supplyApy
              avgSupplyApy
              avgNetSupplyApy
            }
          }
        }
      }
    `;

    const fetchedAt = new Date().toISOString();
    const data = await this.request<{
      markets: { items: MorphoGraphQLMarket[] };
    }>(query);

    return data.markets.items.map((market) => {
      const baseApy =
        finite(market.state?.avgSupplyApy) ??
        finite(market.state?.supplyApy);
      const netApy = finite(market.state?.avgNetSupplyApy);
      const suppliedUsd = finite(market.state?.supplyAssetsUsd);
      const borrowedUsd = finite(market.state?.borrowAssetsUsd);
      const availableLiquidityUsd = finite(
        market.state?.liquidityAssetsUsd
      );
      const oracleAddress = market.oracle?.address ?? null;

      const missingCriticalFields: string[] = [];
      if (baseApy === null) missingCriticalFields.push("supplyApyPct");
      if (suppliedUsd === null) missingCriticalFields.push("suppliedUsd");
      if (availableLiquidityUsd === null) {
        missingCriticalFields.push("availableLiquidityUsd");
      }
      if (!oracleAddress) missingCriticalFields.push("oracleAddress");

      return {
        chainId,
        chain:
          market.loanAsset.chain?.network ??
          chainName(chainId),
        marketId: market.marketId,
        assetSymbol: market.loanAsset.symbol,
        assetAddress: market.loanAsset.address,
        assetDecimals: market.loanAsset.decimals,
        isStablecoin: STABLECOINS.has(
          market.loanAsset.symbol.toUpperCase()
        ),
        supplyApyPct: baseApy === null ? null : baseApy * 100,
        rewardsApyPct:
          baseApy !== null && netApy !== null
            ? Math.max(0, (netApy - baseApy) * 100)
            : null,
        suppliedUsd,
        borrowedUsd,
        availableLiquidityUsd,
        borrowConcentrationPct: null,
        oracleAddress,
        oracleRiskScore: oracleRiskScore(
          market.oracle,
          market.warnings ?? []
        ),
        protocolStatus: market.listed ? "operational" : "unknown",
        observedAt: fetchedAt,
        source: this.endpoint,
        dataQuality: evaluateDataQuality({
          source: this.endpoint,
          fetchedAt,
          sourceTimestampKnown: false,
          missingCriticalFields
        })
      } satisfies MorphoMarketRecord;
    });
  }

  async getMarket(query: MarketQuery): Promise<MorphoMarketRecord> {
    const records = await this.listMarkets(query.chainId);
    const symbol = query.assetSymbol.toUpperCase();

    const matches = records.filter(
      (record) =>
        record.assetSymbol.toUpperCase() === symbol &&
        (!query.marketId ||
          record.marketId.toLowerCase() === query.marketId.toLowerCase())
    );

    if (matches.length === 0) {
      throw new Error(
        `No listed Morpho Blue market found for ${query.assetSymbol} on chain ${query.chainId}.`
      );
    }

    return matches[0]!;
  }
}
