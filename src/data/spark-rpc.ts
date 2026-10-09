import { Contract, JsonRpcProvider, formatUnits } from "ethers";

import type { MarketQuery } from "../adapters/protocol.js";
import type {
  SparkDataSource,
  SparkMarketRecord
} from "../adapters/spark.js";
import { evaluateDataQuality } from "../data-quality.js";
import { annualRayToApyPct } from "../utils/rates.js";

const DATA_PROVIDER_ABI = [
  "function getReserveConfigurationData(address asset) view returns (uint256 decimals,uint256 ltv,uint256 liquidationThreshold,uint256 liquidationBonus,uint256 reserveFactor,bool usageAsCollateralEnabled,bool borrowingEnabled,bool stableBorrowRateEnabled,bool isActive,bool isFrozen)",
  "function getPaused(address asset) view returns (bool)",
  "function getReserveData(address asset) view returns (uint256 unbacked,uint256 accruedToTreasuryScaled,uint256 totalAToken,uint256 totalStableDebt,uint256 totalVariableDebt,uint256 liquidityRate,uint256 variableBorrowRate,uint256 stableBorrowRate,uint256 averageStableBorrowRate,uint256 liquidityIndex,uint256 variableBorrowIndex,uint40 lastUpdateTimestamp)",
  "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress,address stableDebtTokenAddress,address variableDebtTokenAddress)"
];

const ORACLE_ABI = [
  "function getAssetPrice(address asset) view returns (uint256)",
  "function BASE_CURRENCY_UNIT() view returns (uint256)"
];

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)"
];

interface Deployment {
  chainId: number;
  chain: string;
  pool: string;
  protocolDataProvider: string;
  oracle: string;
  assets: Record<string, string>;
}

const DEPLOYMENTS: Deployment[] = [
  {
    chainId: 1,
    chain: "Ethereum",
    pool: "0xC13e21B648A5Ee794902342038FF3aDAB66BE987",
    protocolDataProvider: "0xFc21d6d146E6086B8359705C8b28512a983db0cb",
    oracle: "0x8105f69D9C41644c6A0803fDA7D03Aa70996cFD9",
    assets: {
      USDC: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    }
  }
];

const STABLECOINS = new Set(["USDC", "USDT", "USDS", "DAI", "GHO"]);

export class SparkRpcDataSource implements SparkDataSource {
  private readonly provider: JsonRpcProvider;

  constructor(
    private readonly rpcUrl =
      process.env.EVM_RPC_URL ?? "https://ethereum-rpc.publicnode.com"
  ) {
    this.provider = new JsonRpcProvider(this.rpcUrl);
  }

  async getMarket(query: MarketQuery): Promise<SparkMarketRecord> {
    const deployment = DEPLOYMENTS.find(
      (item) => item.chainId === query.chainId
    );
    const assetSymbol = query.assetSymbol.toUpperCase();
    const asset = deployment?.assets[assetSymbol];

    if (
      !deployment ||
      !asset ||
      (query.marketId &&
        deployment.pool.toLowerCase() !== query.marketId.toLowerCase())
    ) {
      throw new Error(
        `Unsupported SparkLend market for ${query.assetSymbol} on chain ${query.chainId}.`
      );
    }

    const dataProvider = new Contract(
      deployment.protocolDataProvider,
      DATA_PROVIDER_ABI,
      this.provider
    );
    const oracle = new Contract(
      deployment.oracle,
      ORACLE_ABI,
      this.provider
    );
    const token = new Contract(asset, ERC20_ABI, this.provider);

    const [
      reserve,
      configuration,
      paused,
      tokenAddresses,
      symbol,
      tokenDecimals,
      priceRaw,
      baseCurrencyUnit,
      block
    ] = await Promise.all([
      dataProvider.getReserveData(asset),
      dataProvider.getReserveConfigurationData(asset),
      dataProvider.getPaused(asset) as Promise<boolean>,
      dataProvider.getReserveTokensAddresses(asset),
      token.symbol() as Promise<string>,
      token.decimals() as Promise<bigint>,
      oracle.getAssetPrice(asset) as Promise<bigint>,
      oracle.BASE_CURRENCY_UNIT() as Promise<bigint>,
      this.provider.getBlock("latest")
    ]);

    if (!block) {
      throw new Error("Unable to read latest Ethereum block.");
    }

    const aTokenAddress = tokenAddresses[0] as string;
    const availableRaw = (await token.balanceOf(
      aTokenAddress
    )) as bigint;

    const decimals = Number(tokenDecimals);
    const totalAToken = reserve[2] as bigint;
    const totalVariableDebt = reserve[4] as bigint;
    const liquidityRate = reserve[5] as bigint;

    const suppliedTokens = Number(formatUnits(totalAToken, decimals));
    const borrowedTokens = Number(
      formatUnits(totalVariableDebt, decimals)
    );
    const availableTokens = Number(
      formatUnits(availableRaw, decimals)
    );
    const priceUsd =
      Number(priceRaw) / Number(baseCurrencyUnit);
    const observedAt = new Date(block.timestamp * 1000).toISOString();

    const suppliedUsd = suppliedTokens * priceUsd;
    const borrowedUsd = borrowedTokens * priceUsd;
    const availableLiquidityUsd = availableTokens * priceUsd;
    const supplyApyPct = annualRayToApyPct(liquidityRate);

    const isActive = Boolean(configuration[8]);
    const isFrozen = Boolean(configuration[9]);

    const protocolStatus =
      paused || !isActive
        ? "paused"
        : isFrozen
          ? "degraded"
          : "operational";

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

    return {
      chainId: deployment.chainId,
      chain: deployment.chain,
      marketId: deployment.pool,
      assetSymbol: symbol,
      assetAddress: asset,
      assetDecimals: decimals,
      isStablecoin: STABLECOINS.has(symbol.toUpperCase()),
      supplyApyPct,
      suppliedUsd,
      borrowedUsd,
      availableLiquidityUsd,
      oracleAddress: deployment.oracle,
      protocolStatus,
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
