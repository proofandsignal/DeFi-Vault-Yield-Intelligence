import {
  Contract,
  Interface,
  JsonRpcProvider
} from "ethers";

import type { MarketSnapshot } from "../domain/types.js";
import type {
  BorrowConcentrationProvider,
  BorrowConcentrationResult
} from "./types.js";

const MORPHO_GRAPHQL_URL = "https://api.morpho.org/graphql";
const BLOCKSCOUT_ETHEREUM_URL = "https://eth.blockscout.com";
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
];

const MULTICALL_ABI = [
  "function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) payable returns (tuple(bool success,bytes returnData)[] returnData)"
];

const ERC20_INTERFACE = new Interface(ERC20_ABI);

const DEBT_TOKEN_BY_POOL_ASSET: Record<string, string> = {
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
    "0x72e95b8931767c79ba4eee721354d6e99a61d004",
  "0xc13e21b648a5ee794902342038ff3adab66be987:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
    "0x7b70d04099cb9cfb1db7b6820badafb4c5c70a67"
};

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
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

interface BlockscoutHolder {
  address: string;
  value: string;
}

interface BlockscoutResponse {
  status?: string;
  message?: string;
  result?: BlockscoutHolder[] | string;
}

export class AaveLikeBorrowConcentrationProvider
  implements BorrowConcentrationProvider
{
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly rpcUrl =
      process.env.EVM_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
    private readonly fetchFn: typeof fetch = fetch,
    private readonly blockscoutBase = BLOCKSCOUT_ETHEREUM_URL
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

  private debtTokenAddress(
    snapshot: MarketSnapshot,
    pool: string
  ): string | null {
    return (
      DEBT_TOKEN_BY_POOL_ASSET[
        `${pool}:${snapshot.asset.address.toLowerCase()}`
      ] ?? null
    );
  }

  private async holderCandidates(
    debtTokenAddress: string
  ): Promise<string[] | null> {
    const holders = new Set<string>();
    const offset = 100;

    for (let page = 1; page <= 500; page += 1) {
      const url =
        `${this.blockscoutBase}/api?module=token&action=getTokenHolders` +
        `&contractaddress=${debtTokenAddress}&page=${page}&offset=${offset}`;

      const response = await this.fetchFn(url, {
        headers: {
          accept: "application/json",
          "user-agent": "defi-vault-yield-intelligence/0.3.1"
        }
      });
      if (!response.ok) {
        throw new Error(
          `Blockscout holder discovery HTTP ${response.status} for ${debtTokenAddress}.`
        );
      }

      const payload = (await response.json()) as BlockscoutResponse;
      if (
        payload.status !== "1" ||
        !Array.isArray(payload.result)
      ) {
        throw new Error(
          `Blockscout holder discovery failed for ${debtTokenAddress}: status=${payload.status ?? "missing"} message=${payload.message ?? "missing"} result=${typeof payload.result === "string" ? payload.result : "non-array"}`
        );
      }

      for (const holder of payload.result) {
        if (/^0x[a-fA-F0-9]{40}$/.test(holder.address)) {
          holders.add(holder.address.toLowerCase());
        }
      }

      if (payload.result.length < offset) {
        return [...holders];
      }
    }

    // Safety cap: do not treat a truncated holder index as complete.
    return null;
  }

  async concentration(
    snapshot: MarketSnapshot
  ): Promise<BorrowConcentrationResult | null> {
    const pool = this.poolAddress(snapshot);
    if (!pool || snapshot.chainId !== 1) return null;

    const debtTokenAddress = this.debtTokenAddress(snapshot, pool);
    if (!debtTokenAddress) return null;

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
          "Current variable-debt-token total supply is zero; borrower concentration is zero.",
        source: `${this.rpcUrl}#${debtTokenAddress}`,
        observedAt: new Date().toISOString()
      };
    }

    const candidates = await this.holderCandidates(debtTokenAddress);
    if (!candidates || candidates.length === 0) return null;

    if (candidates.length > 50_000) {
      return {
        topBorrowerPct: 0,
        top5BorrowersPct: 0,
        borrowerCount: candidates.length,
        evidenceCoveragePct: 0,
        complete: false,
        methodology:
          "Debt-token holder candidate set exceeded the v0.3.1 safety cap; result intentionally not used for risk scoring.",
        source: `${this.blockscoutBase}#${debtTokenAddress}`,
        observedAt: new Date().toISOString()
      };
    }

    const multicall = new Contract(
      MULTICALL3,
      MULTICALL_ABI,
      this.provider
    );

    const balances = await mapInBatches(
      candidates,
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
        "Blockscout enumerates current variable-debt-token holder addresses. Current balances are then read independently on-chain through Multicall3 and reconciled against on-chain totalSupply. Risk scoring accepts the result only at >=99.5% debt coverage.",
      source:
        `${this.blockscoutBase}/api?module=token&action=getTokenHolders&contractaddress=${debtTokenAddress}` +
        ` + ${this.rpcUrl}#balanceOf,totalSupply`,
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
