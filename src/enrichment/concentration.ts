import {
  Contract,
  Interface,
  JsonRpcProvider,
  zeroPadValue
} from "ethers";

import type { MarketSnapshot } from "../domain/types.js";
import type {
  BorrowConcentrationProvider,
  BorrowConcentrationResult
} from "./types.js";

const MORPHO_GRAPHQL_URL = "https://api.morpho.org/graphql";
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";

const AAVE_LIKE_POOL_ABI = [
  "function getReserveVariableDebtToken(address asset) view returns (address)"
];

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
];

const MULTICALL_ABI = [
  "function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) payable returns (tuple(bool success,bytes returnData)[] returnData)"
];

const BORROW_INTERFACE = new Interface([
  "event Borrow(address indexed reserve,address user,address indexed onBehalfOf,uint256 amount,uint8 interestRateMode,uint256 borrowRate,uint16 indexed referralCode)"
]);

const ERC20_INTERFACE = new Interface(ERC20_ABI);
const BORROW_TOPIC = BORROW_INTERFACE.getEvent("Borrow")!.topicHash;

const DEBT_TOKEN_BY_POOL_ASSET: Record<string, string> = {
  "0xc13e21b648a5ee794902342038ff3adab66be987:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
    "0x7B70D04099CB9cfb1Db7B6820baDAfB4C5C70A67"
};

const START_BLOCK_BY_POOL: Record<string, number> = {
  // Conservative blocks before the corresponding Ethereum deployments.
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": 16_200_000,
  "0xc13e21b648a5ee794902342038ff3adab66be987": 17_000_000
};

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function addressFromTopic(topic: string): string {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

async function mapInBatches<T, R>(
  values: T[],
  size: number,
  fn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < values.length; i += size) {
    results.push(...(await fn(values.slice(i, i + size))));
  }
  return results;
}

export class MorphoBorrowConcentrationProvider
  implements BorrowConcentrationProvider
{
  constructor(
    private readonly fetchFn: typeof fetch = fetch,
    private readonly endpoint = MORPHO_GRAPHQL_URL
  ) {}

  async concentration(
    snapshot: MarketSnapshot
  ): Promise<BorrowConcentrationResult | null> {
    if (snapshot.protocol !== "morpho") return null;
    if (snapshot.borrowedUsd === null || snapshot.borrowedUsd < 0) {
      return null;
    }
    if (snapshot.borrowedUsd === 0) {
      return {
        topBorrowerPct: 0,
        top5BorrowersPct: 0,
        borrowerCount: 0,
        evidenceCoveragePct: 100,
        complete: true,
        methodology:
          "Morpho market has zero current borrowed USD; concentration is zero.",
        source: this.endpoint,
        observedAt: new Date().toISOString()
      };
    }

    const query = `
      query MarketBorrowers {
        marketPositions(
          first: 5
          orderBy: BorrowShares
          orderDirection: Desc
          where: {
            marketUniqueKey_in: ["${snapshot.marketId}"]
          }
        ) {
          items {
            user { address }
            state {
              borrowShares
              borrowAssets
              borrowAssetsUsd
            }
          }
        }
      }
    `;

    const response = await this.fetchFn(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "defi-vault-yield-intelligence/0.3.1"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      data?: {
        marketPositions?: {
          items?: Array<{
            user?: { address?: string };
            state?: {
              borrowAssetsUsd?: number | string | null;
            };
          }>;
        };
      };
      errors?: Array<{ message?: string }>;
    };

    if (payload.errors?.length) return null;

    const amounts = (payload.data?.marketPositions?.items ?? [])
      .map((item) => Number(item.state?.borrowAssetsUsd ?? 0))
      .filter((value) => Number.isFinite(value) && value > 0);

    const top = amounts[0] ?? 0;
    const top5 = amounts.reduce((sum, value) => sum + value, 0);

    return {
      topBorrowerPct: clampPct((top / snapshot.borrowedUsd) * 100),
      top5BorrowersPct: clampPct((top5 / snapshot.borrowedUsd) * 100),
      borrowerCount: null,
      evidenceCoveragePct: 100,
      complete: true,
      methodology:
        "Morpho GraphQL orders current market positions by BorrowShares descending. Top borrower and top-five shares are divided by the market's current total borrowed USD.",
      source: this.endpoint,
      observedAt: new Date().toISOString()
    };
  }
}

export class AaveLikeBorrowConcentrationProvider
  implements BorrowConcentrationProvider
{
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly rpcUrl =
      process.env.EVM_RPC_URL ?? "https://ethereum-rpc.publicnode.com"
  ) {
    this.provider = new JsonRpcProvider(this.rpcUrl);
  }

  private poolAddress(snapshot: MarketSnapshot): string | null {
    if (snapshot.protocol === "aave") {
      return snapshot.marketId.split(":")[0]?.toLowerCase() ?? null;
    }
    if (snapshot.protocol === "spark") {
      return snapshot.marketId.toLowerCase();
    }
    return null;
  }

  private async borrowerCandidates(
    pool: string,
    asset: string,
    fromBlock: number,
    toBlock: number
  ): Promise<Set<string>> {
    const candidates = new Set<string>();
    let start = fromBlock;
    let chunk = 250_000;

    while (start <= toBlock) {
      const end = Math.min(toBlock, start + chunk - 1);

      try {
        const logs = await this.provider.getLogs({
          address: pool,
          fromBlock: start,
          toBlock: end,
          topics: [
            BORROW_TOPIC,
            zeroPadValue(asset.toLowerCase(), 32)
          ]
        });

        for (const log of logs) {
          if (log.topics[2]) {
            candidates.add(addressFromTopic(log.topics[2]));
          }
        }

        start = end + 1;
        chunk = Math.min(250_000, chunk * 2);
      } catch {
        if (chunk <= 5_000) {
          throw new Error(
            `Unable to scan complete Borrow history for ${pool} at block ${start}.`
          );
        }
        chunk = Math.max(5_000, Math.floor(chunk / 2));
      }
    }

    return candidates;
  }

  async concentration(
    snapshot: MarketSnapshot
  ): Promise<BorrowConcentrationResult | null> {
    const pool = this.poolAddress(snapshot);
    if (!pool || snapshot.chainId !== 1) return null;

    const fromBlock = START_BLOCK_BY_POOL[pool];
    if (!fromBlock) return null;

    const latest = await this.provider.getBlockNumber();
    const candidates = await this.borrowerCandidates(
      pool,
      snapshot.asset.address,
      fromBlock,
      latest
    );

    const poolContract = new Contract(
      pool,
      AAVE_LIKE_POOL_ABI,
      this.provider
    );
    const fallbackDebtToken =
      DEBT_TOKEN_BY_POOL_ASSET[
        `${pool}:${snapshot.asset.address.toLowerCase()}`
      ];

    let debtTokenAddress: string;
    try {
      debtTokenAddress =
        (await poolContract.getReserveVariableDebtToken(
          snapshot.asset.address
        )) as string;
    } catch {
      if (!fallbackDebtToken) return null;
      debtTokenAddress = fallbackDebtToken;
    }

    const debtToken = new Contract(
      debtTokenAddress,
      ERC20_ABI,
      this.provider
    );
    const totalDebt = (await debtToken.totalSupply()) as bigint;

    if (totalDebt === 0n) {
      return {
        topBorrowerPct: 0,
        top5BorrowersPct: 0,
        borrowerCount: 0,
        evidenceCoveragePct: 100,
        complete: true,
        methodology:
          "Complete pool Borrow-event history plus current variable-debt-token balances; reserve currently has zero debt.",
        source: `${this.rpcUrl}#${pool}`,
        observedAt: new Date().toISOString()
      };
    }

    if (candidates.size > 50_000) {
      return {
        topBorrowerPct: 0,
        top5BorrowersPct: 0,
        borrowerCount: candidates.size,
        evidenceCoveragePct: 0,
        complete: false,
        methodology:
          "Borrower candidate set exceeded the v0.3.1 safety cap; result intentionally not used for risk scoring.",
        source: `${this.rpcUrl}#${pool}`,
        observedAt: new Date().toISOString()
      };
    }

    const multicall = new Contract(
      MULTICALL3,
      MULTICALL_ABI,
      this.provider
    );
    const candidateList = [...candidates];

    const balances = await mapInBatches(
      candidateList,
      300,
      async (batch) => {
        const calls = batch.map((address) => ({
          target: debtTokenAddress,
          allowFailure: true,
          callData: ERC20_INTERFACE.encodeFunctionData(
            "balanceOf",
            [address]
          )
        }));

        const results = (await multicall.aggregate3(calls)) as Array<{
          success: boolean;
          returnData: string;
        }>;

        return results.map((result) => {
          if (!result.success) return 0n;
          const decoded = ERC20_INTERFACE.decodeFunctionResult(
            "balanceOf",
            result.returnData
          );
          return decoded[0] as bigint;
        });
      }
    );

    const nonZero = balances.filter((balance) => balance > 0n);
    nonZero.sort((a, b) => (a === b ? 0 : a > b ? -1 : 1));

    const observedDebt = nonZero.reduce(
      (sum, balance) => sum + balance,
      0n
    );
    const coveragePct =
      Number((observedDebt * 1_000_000n) / totalDebt) / 10_000;
    const complete = coveragePct >= 99.5;

    const top = nonZero[0] ?? 0n;
    const top5 = nonZero
      .slice(0, 5)
      .reduce((sum, balance) => sum + balance, 0n);

    const pct = (value: bigint): number =>
      Number((value * 1_000_000n) / totalDebt) / 10_000;

    return {
      topBorrowerPct: clampPct(pct(top)),
      top5BorrowersPct: clampPct(pct(top5)),
      borrowerCount: nonZero.length,
      evidenceCoveragePct: Math.min(100, coveragePct),
      complete,
      methodology:
        "Scans the complete configured pool Borrow-event history, discovers every onBehalfOf borrower, reads current variable-debt-token balances through Multicall3, and verifies discovered balances against total debt. Risk scoring accepts the result only at >=99.5% debt coverage.",
      source: `${this.rpcUrl}#${pool}:Borrow:${fromBlock}-${latest}`,
      observedAt: new Date().toISOString()
    };
  }
}

export class CompositeBorrowConcentrationProvider
  implements BorrowConcentrationProvider
{
  constructor(
    private readonly morpho =
      new MorphoBorrowConcentrationProvider(),
    private readonly aaveLike =
      new AaveLikeBorrowConcentrationProvider()
  ) {}

  async concentration(
    snapshot: MarketSnapshot
  ): Promise<BorrowConcentrationResult | null> {
    if (snapshot.protocol === "morpho") {
      return this.morpho.concentration(snapshot);
    }
    if (
      snapshot.protocol === "aave" ||
      snapshot.protocol === "spark"
    ) {
      return this.aaveLike.concentration(snapshot);
    }

    // Compound III has no complete enumerable borrower registry. Withdraw
    // events are useful for candidate discovery but are not complete because
    // transferBase can create debt without a Withdraw event.
    return null;
  }
}
