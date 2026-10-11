import { Contract, JsonRpcProvider } from "ethers";

import type { MarketSnapshot } from "../domain/types.js";
import { findOracleProfile } from "./oracle-registry.js";
import type {
  OracleFreshnessProvider,
  OracleFreshnessResult
} from "./types.js";

const CHAINLINK_ABI = [
  "function latestRoundData() view returns (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound)"
];

export class CompositeOracleFreshnessProvider
  implements OracleFreshnessProvider
{
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly rpcUrl =
      process.env.EVM_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
    private readonly fetchFn: typeof fetch = fetch
  ) {
    this.provider = new JsonRpcProvider(this.rpcUrl);
  }

  private heartbeat(snapshot: MarketSnapshot): number {
    return (
      findOracleProfile(
        snapshot.chainId,
        snapshot.asset.symbol
      )?.heartbeatSeconds ?? 86_400
    );
  }

  private risk(ageSeconds: number, heartbeatSeconds: number): number {
    if (ageSeconds <= heartbeatSeconds + 300) return 15;
    if (ageSeconds <= heartbeatSeconds * 2) return 60;
    return 100;
  }

  private async morpho(
    snapshot: MarketSnapshot
  ): Promise<OracleFreshnessResult | null> {
    if (!snapshot.oracleAddress) return null;

    const url =
      `https://api.morpho.org/v0/oracles/` +
      `${snapshot.chainId}:${snapshot.oracleAddress}/state`;
    const response = await this.fetchFn(url, {
      headers: { accept: "application/json" }
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      data?: {
        last_updated_at?: number | string | null;
        last_indexed_block?: number | string | null;
      };
    };
    const updatedAt = Number(payload.data?.last_updated_at);
    if (!Number.isFinite(updatedAt) || updatedAt <= 0) return null;

    const now = Math.floor(Date.now() / 1000);
    const ageSeconds = Math.max(0, now - updatedAt);
    const heartbeatSeconds = this.heartbeat(snapshot);

    return {
      ageSeconds,
      heartbeatSeconds,
      stale: ageSeconds > heartbeatSeconds + 300,
      riskScore: this.risk(ageSeconds, heartbeatSeconds),
      source: url,
      observedAt: new Date().toISOString(),
      method: "Morpho indexed oracle state last_updated_at"
    };
  }

  private async chainlinkCompatible(
    snapshot: MarketSnapshot
  ): Promise<OracleFreshnessResult | null> {
    if (!snapshot.oracleAddress || snapshot.chainId !== 1) return null;

    try {
      const feed = new Contract(
        snapshot.oracleAddress,
        CHAINLINK_ABI,
        this.provider
      );
      const round = await feed.latestRoundData();
      const updatedAt = Number(round[3]);
      if (!Number.isFinite(updatedAt) || updatedAt <= 0) return null;

      const block = await this.provider.getBlock("latest");
      const now = block?.timestamp ?? Math.floor(Date.now() / 1000);
      const ageSeconds = Math.max(0, now - updatedAt);
      const heartbeatSeconds = this.heartbeat(snapshot);

      return {
        ageSeconds,
        heartbeatSeconds,
        stale: ageSeconds > heartbeatSeconds + 300,
        riskScore: this.risk(ageSeconds, heartbeatSeconds),
        source: `${this.rpcUrl}#${snapshot.oracleAddress}:latestRoundData`,
        observedAt: new Date(now * 1000).toISOString(),
        method: "Chainlink-compatible latestRoundData.updatedAt"
      };
    } catch {
      return null;
    }
  }

  async freshness(
    snapshot: MarketSnapshot
  ): Promise<OracleFreshnessResult | null> {
    if (snapshot.protocol === "morpho") {
      return this.morpho(snapshot);
    }
    return this.chainlinkCompatible(snapshot);
  }
}
