import type { MarketQuery } from "../adapters/protocol.js";
import type {
  AaveDataSource,
  AaveMarketRecord
} from "../adapters/aave.js";
import { evaluateDataQuality } from "../data-quality.js";

export const AAVE_V3_GRAPHQL_URL = "https://api.v3.aave.com/graphql";

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

const MARKETS_QUERY = `
  query Markets($request: MarketsRequest!) {
    value: markets(request: $request) {
      name
      address
      chain {
        name
        chainId
      }
      reserves {
        underlyingToken {
          address
          symbol
          decimals
        }
        size {
          usd
          amount {
            value
          }
        }
        usdExchangeRate
        usdOracleAddress
        isFrozen
        isPaused
        supplyInfo {
          apy {
            formatted
          }
        }
        borrowInfo {
          total {
            usd
            amount {
              value
            }
          }
          availableLiquidity {
            usd
            amount {
              value
            }
          }
          utilizationRate {
            formatted
          }
        }
      }
    }
  }
`;

const SUPPLY_APY_HISTORY_QUERY = `
  query SupplyAPYHistory($request: SupplyAPYHistoryRequest!) {
    value: supplyAPYHistory(request: $request) {
      avgRate {
        formatted
      }
      date
    }
  }
`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface AaveTokenAmount {
  usd: string;
  amount: {
    value: string;
  };
}

interface AaveGraphQLReserve {
  underlyingToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  size: AaveTokenAmount;
  usdExchangeRate: string;
  usdOracleAddress: string;
  isFrozen: boolean;
  isPaused: boolean;
  supplyInfo: {
    apy: {
      formatted: string;
    };
  };
  borrowInfo: null | {
    total: AaveTokenAmount;
    availableLiquidity: AaveTokenAmount;
    utilizationRate: {
      formatted: string;
    };
  };
}

interface AaveGraphQLMarket {
  name: string;
  address: string;
  chain: {
    name: string;
    chainId: number;
  };
  reserves: AaveGraphQLReserve[];
}

export interface ApyHistorySample {
  date: string;
  avgApyPct: number;
}

export type AaveFetch = typeof fetch;

function finiteNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isStablecoin(symbol: string): boolean {
  return STABLECOINS.has(symbol.toUpperCase());
}

function missingFields(record: {
  suppliedUsd: number | null;
  availableLiquidityUsd: number | null;
  supplyApyPct: number | null;
  oracleAddress: string | null;
}): string[] {
  const missing: string[] = [];
  if (record.suppliedUsd === null) missing.push("suppliedUsd");
  if (record.availableLiquidityUsd === null) missing.push("availableLiquidityUsd");
  if (record.supplyApyPct === null) missing.push("supplyApyPct");
  if (!record.oracleAddress) missing.push("oracleAddress");
  return missing;
}

export class AaveGraphQLDataSource implements AaveDataSource {
  constructor(
    private readonly fetchFn: AaveFetch = fetch,
    private readonly endpoint: string = AAVE_V3_GRAPHQL_URL
  ) {}

  private async request<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const response = await this.fetchFn(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "defi-vault-yield-intelligence/0.2"
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(
        `Aave GraphQL HTTP ${response.status}: ${response.statusText}`
      );
    }

    const payload = (await response.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      throw new Error(
        `Aave GraphQL error: ${payload.errors
          .map((error) => error.message ?? "unknown error")
          .join("; ")}`
      );
    }
    if (!payload.data) {
      throw new Error("Aave GraphQL response did not contain data.");
    }

    return payload.data;
  }

  async listMarketRecords(chainIds: number[]): Promise<AaveMarketRecord[]> {
    const fetchedAt = new Date().toISOString();
    const data = await this.request<{ value: AaveGraphQLMarket[] }>(
      MARKETS_QUERY,
      { request: { chainIds } }
    );

    return data.value.flatMap((market) =>
      market.reserves.map((reserve): AaveMarketRecord => {
        const suppliedUsd = finiteNumber(reserve.size.usd);
        const borrowedUsd =
          reserve.borrowInfo === null
            ? 0
            : finiteNumber(reserve.borrowInfo.total.usd);
        const availableLiquidityUsd =
          reserve.borrowInfo === null
            ? suppliedUsd
            : finiteNumber(reserve.borrowInfo.availableLiquidity.usd);
        const supplyApyPct = finiteNumber(reserve.supplyInfo.apy.formatted);
        const oracleAddress = reserve.usdOracleAddress || null;
        const usdExchangeRate = finiteNumber(reserve.usdExchangeRate);
        const stablecoin = isStablecoin(reserve.underlyingToken.symbol);
        const stablecoinDepegBps =
          stablecoin && usdExchangeRate !== null
            ? Math.abs(usdExchangeRate - 1) * 10_000
            : stablecoin
              ? null
              : 0;

        const partial = {
          suppliedUsd,
          availableLiquidityUsd,
          supplyApyPct,
          oracleAddress
        };

        const protocolStatus = reserve.isPaused
          ? "paused"
          : reserve.isFrozen
            ? "degraded"
            : "operational";

        return {
          chainId: Number(market.chain.chainId),
          chain: market.chain.name,
          marketAddress: market.address,
          reserveId: `${market.address.toLowerCase()}:${reserve.underlyingToken.address.toLowerCase()}`,
          assetSymbol: reserve.underlyingToken.symbol,
          assetAddress: reserve.underlyingToken.address,
          assetDecimals: reserve.underlyingToken.decimals,
          isStablecoin: stablecoin,
          supplyApyPct,
          rewardsApyPct: null,
          suppliedUsd,
          borrowedUsd,
          availableLiquidityUsd,
          borrowConcentrationPct: null,
          stablecoinDepegBps,
          oracleAddress,
          oracleRiskScore: null,
          smartContractRiskScore: null,
          chainRiskScore: null,
          protocolStatus,
          observedAt: fetchedAt,
          source: this.endpoint,
          dataQuality: evaluateDataQuality({
            source: this.endpoint,
            fetchedAt,
            sourceTimestampKnown: false,
            missingCriticalFields: missingFields(partial)
          })
        };
      })
    );
  }

  async getMarket(query: MarketQuery): Promise<AaveMarketRecord> {
    const records = await this.listMarketRecords([query.chainId]);
    const symbol = query.assetSymbol.toUpperCase();

    const matches = records.filter(
      (record) =>
        record.assetSymbol.toUpperCase() === symbol &&
        (!query.marketId ||
          record.marketAddress.toLowerCase() === query.marketId.toLowerCase() ||
          record.reserveId.toLowerCase() === query.marketId.toLowerCase())
    );

    if (matches.length === 0) {
      throw new Error(
        `No Aave reserve found for ${query.assetSymbol} on chain ${query.chainId}.`
      );
    }

    return matches[0]!;
  }

  async supplyApyHistory(input: {
    chainId: number;
    market: string;
    underlyingToken: string;
    window?: "LAST_DAY" | "LAST_WEEK" | "LAST_MONTH" | "LAST_SIX_MONTHS" | "LAST_YEAR";
  }): Promise<ApyHistorySample[]> {
    const data = await this.request<{
      value: Array<{ date: string; avgRate: { formatted: string } }>;
    }>(SUPPLY_APY_HISTORY_QUERY, {
      request: {
        chainId: input.chainId,
        market: input.market,
        underlyingToken: input.underlyingToken,
        window: input.window ?? "LAST_WEEK"
      }
    });

    return data.value.map((sample) => ({
      date: sample.date,
      avgApyPct: Number(sample.avgRate.formatted)
    }));
  }
}
