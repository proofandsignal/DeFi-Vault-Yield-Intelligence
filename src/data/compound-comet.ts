import { Contract, JsonRpcProvider, formatUnits } from "ethers";

import type {
  CompoundDataSource,
  CompoundMarketRecord
} from "../adapters/compound.js";
import type { MarketQuery } from "../adapters/protocol.js";
import { evaluateDataQuality } from "../data-quality.js";
import { perSecondWadToApyPct } from "../utils/rates.js";

const COMET_ABI = [
  "function baseToken() view returns (address)",
  "function baseTokenPriceFeed() view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function totalBorrow() view returns (uint256)",
  "function getUtilization() view returns (uint256)",
  "function getSupplyRate(uint256 utilization) view returns (uint64)",
  "function getPrice(address priceFeed) view returns (uint128)",
  "function isSupplyPaused() view returns (bool)"
];

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

interface Deployment {
  chainId: number;
  chain: string;
  assetSymbol: string;
  comet: string;
}

const DEPLOYMENTS: Deployment[] = [
  {
    chainId: 1,
    chain: "Ethereum",
    assetSymbol: "USDC",
    comet: "0xc3d688B66703497DAA19211EEdff47f25384cdc3"
  }
];

const STABLECOINS = new Set(["USDC", "USDT", "USDS", "DAI", "GHO"]);

export class CompoundCometDataSource implements CompoundDataSource {
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly rpcUrl =
      process.env.EVM_RPC_URL ?? "https://ethereum-rpc.publicnode.com"
  ) {
    this.provider = new JsonRpcProvider(this.rpcUrl);
  }

  async getMarket(query: MarketQuery): Promise<CompoundMarketRecord> {
    const deployment = DEPLOYMENTS.find(
      (item) =>
        item.chainId === query.chainId &&
        item.assetSymbol === query.assetSymbol.toUpperCase() &&
        (!query.marketId ||
          item.comet.toLowerCase() === query.marketId.toLowerCase())
    );

    if (!deployment) {
      throw new Error(
        `Unsupported Compound III market for ${query.assetSymbol} on chain ${query.chainId}.`
      );
    }

    const comet = new Contract(
      deployment.comet,
      COMET_ABI,
      this.provider
    );

    const [
      baseToken,
      priceFeed,
      totalSupply,
      totalBorrow,
      utilization,
      supplyPaused,
      block
    ] = await Promise.all([
      comet.baseToken() as Promise<string>,
      comet.baseTokenPriceFeed() as Promise<string>,
      comet.totalSupply() as Promise<bigint>,
      comet.totalBorrow() as Promise<bigint>,
      comet.getUtilization() as Promise<bigint>,
      comet.isSupplyPaused() as Promise<boolean>,
      this.provider.getBlock("latest")
    ]);

    if (!block) {
      throw new Error("Unable to read latest Ethereum block.");
    }

    const token = new Contract(baseToken, ERC20_ABI, this.provider);
    const [symbol, decimals, supplyRate, priceRaw] = await Promise.all([
      token.symbol() as Promise<string>,
      token.decimals() as Promise<bigint>,
      comet.getSupplyRate(utilization) as Promise<bigint>,
      comet.getPrice(priceFeed) as Promise<bigint>
    ]);

    const decimalsNumber = Number(decimals);
    const suppliedTokens = Number(
      formatUnits(totalSupply, decimalsNumber)
    );
    const borrowedTokens = Number(
      formatUnits(totalBorrow, decimalsNumber)
    );
    const priceUsd = Number(priceRaw) / 1e8;
    const observedAt = new Date(block.timestamp * 1000).toISOString();

    const suppliedUsd = suppliedTokens * priceUsd;
    const borrowedUsd = borrowedTokens * priceUsd;
    const availableLiquidityUsd =
      Math.max(0, suppliedTokens - borrowedTokens) * priceUsd;
    const supplyApyPct = perSecondWadToApyPct(supplyRate);

    const missingCriticalFields: string[] = [];
    if (!Number.isFinite(suppliedUsd)) {
      missingCriticalFields.push("suppliedUsd");
    }
    if (!Number.isFinite(availableLiquidityUsd)) {
      missingCriticalFields.push("availableLiquidityUsd");
    }
    if (!Number.isFinite(supplyApyPct)) {
      missingCriticalFields.push("supplyApyPct");
    }
    if (!priceFeed) missingCriticalFields.push("oracleAddress");

    return {
      chainId: deployment.chainId,
      chain: deployment.chain,
      marketId: deployment.comet,
      assetSymbol: symbol,
      assetAddress: baseToken,
      assetDecimals: decimalsNumber,
      isStablecoin: STABLECOINS.has(symbol.toUpperCase()),
      supplyApyPct,
      suppliedUsd,
      borrowedUsd,
      availableLiquidityUsd,
      oracleAddress: priceFeed,
      protocolStatus: supplyPaused ? "paused" : "operational",
      observedAt,
      source: this.rpcUrl,
      dataQuality: evaluateDataQuality({
        source: this.rpcUrl,
        fetchedAt: observedAt,
        sourceTimestampKnown: true,
        missingCriticalFields
      })
    };
  }
}
