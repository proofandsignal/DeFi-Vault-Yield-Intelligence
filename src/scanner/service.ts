import {
  AaveAdapter,
  AaveGraphQLDataSource,
  CompoundAdapter,
  CompoundCometDataSource,
  MorphoAdapter,
  MorphoGraphQLDataSource,
  SparkAdapter,
  SparkRpcDataSource
} from "../index-internal.js";
import type { ProtocolAdapter } from "../adapters/protocol.js";
import type { MarketSnapshot } from "../domain/types.js";
import {
  CompositeBorrowConcentrationProvider
} from "../enrichment/concentration.js";
import { IndependentRiskEnricher } from "../enrichment/enricher.js";
import {
  CompositeOracleFreshnessProvider
} from "../enrichment/oracle-freshness.js";
import { assessRisk } from "../engines/risk.js";
import { simulateAnnualYield } from "../engines/yield.js";
import { RISK_MODEL_V031 } from "../risk-model.js";
import { PromiseTtlCache } from "./cache.js";
import { supportedProtocols } from "./catalog.js";
import type {
  ComparisonAssumptions,
  ScannerError,
  ScannerQuery,
  ScannerResponse,
  ScannerRow,
  SupportedProtocol
} from "./types.js";

interface ScannerDependencies {
  adapters?: Partial<Record<SupportedProtocol, ProtocolAdapter>>;
  enricher?: Pick<IndependentRiskEnricher, "enrich">;
  cacheTtlMs?: number;
}

function defaultAdapters(): Record<SupportedProtocol, ProtocolAdapter> {
  return {
    aave: new AaveAdapter(new AaveGraphQLDataSource()),
    morpho: new MorphoAdapter(new MorphoGraphQLDataSource()),
    compound: new CompoundAdapter(new CompoundCometDataSource()),
    spark: new SparkAdapter(new SparkRpcDataSource())
  };
}

function defaultEnricher(): IndependentRiskEnricher {
  return new IndependentRiskEnricher(
    undefined,
    new CompositeBorrowConcentrationProvider(),
    new CompositeOracleFreshnessProvider()
  );
}

function validateFiniteNonNegative(
  name: string,
  value: number | undefined
): void {
  if (
    value !== undefined &&
    (!Number.isFinite(value) || value < 0)
  ) {
    throw new RangeError(
      `${name} must be a non-negative finite number.`
    );
  }
}

function assumptions(query: ScannerQuery): ComparisonAssumptions {
  validateFiniteNonNegative("principalUsd", query.principalUsd);
  validateFiniteNonNegative("annualCostsUsd", query.annualCostsUsd);

  if (
    query.performanceFeeRate !== undefined &&
    (
      !Number.isFinite(query.performanceFeeRate) ||
      query.performanceFeeRate < 0 ||
      query.performanceFeeRate > 1
    )
  ) {
    throw new RangeError(
      "performanceFeeRate must be between 0 and 1."
    );
  }

  const explicit =
    query.principalUsd !== undefined ||
    query.annualCostsUsd !== undefined ||
    query.performanceFeeRate !== undefined;

  if (!explicit || query.principalUsd === undefined) {
    return {
      principalUsd: query.principalUsd ?? null,
      annualCostsUsd: query.annualCostsUsd ?? null,
      performanceFeeRate: query.performanceFeeRate ?? null,
      netEstimateAvailable: false,
      note:
        "Net APY is not estimated unless principalUsd is explicitly supplied. Observed APY excludes user-specific gas, bridge, tax and execution costs."
    };
  }

  return {
    principalUsd: query.principalUsd,
    annualCostsUsd: query.annualCostsUsd ?? 0,
    performanceFeeRate: query.performanceFeeRate ?? 0,
    netEstimateAvailable: true,
    note:
      "Estimated net APY uses only the explicit principal, annualCostsUsd and performanceFeeRate assumptions returned here. It is not a realized return forecast."
  };
}

function observedGrossApy(snapshot: MarketSnapshot): number | null {
  if (snapshot.grossApyPct === null) return null;
  return snapshot.grossApyPct + (snapshot.rewardsApyPct ?? 0);
}

function utilizationPct(snapshot: MarketSnapshot): number | null {
  if (
    snapshot.suppliedUsd === null ||
    snapshot.borrowedUsd === null ||
    snapshot.suppliedUsd <= 0
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.min(
      100,
      (snapshot.borrowedUsd / snapshot.suppliedUsd) * 100
    )
  );
}

const PUBLIC_SOURCE_HOSTS = new Set([
  "api.v3.aave.com",
  "api.morpho.org",
  "coins.llama.fi",
  "data.chain.link",
  "docs.kpk.dev",
  "www.aave.com",
  "aave.com",
  "docs.morpho.org",
  "ethereum.org",
  "www.ethereum.org",
  "l2beat.com",
  "www.l2beat.com",
  "spark.fi",
  "www.spark.fi",
  "eth.blockscout.com"
]);

export function sanitizeEvidenceSource(source: string): string {
  if (!/^https?:\/\//i.test(source)) return source;

  const hashIndex = source.indexOf("#");
  const fragment =
    hashIndex >= 0 ? source.slice(hashIndex + 1) : "";
  const base =
    hashIndex >= 0 ? source.slice(0, hashIndex) : source;

  try {
    const url = new URL(base);

    if (PUBLIC_SOURCE_HOSTS.has(url.hostname.toLowerCase())) {
      url.search = "";
      url.username = "";
      url.password = "";
      return (
        url.toString().replace(/\/$/, "") +
        (fragment ? `#${fragment}` : "")
      );
    }

    return (
      url.origin +
      (fragment ? `#${fragment}` : "")
    );
  } catch {
    return "redacted-source";
  }
}

function sanitizeMessage(message: string): string {
  return message.replace(
    /https?:\/\/[^\s)]+/gi,
    (match) => sanitizeEvidenceSource(match)
  );
}

function sourceError(
  protocol: SupportedProtocol,
  error: unknown
): ScannerError {
  const rawMessage =
    error instanceof Error ? error.message : String(error);
  const message = sanitizeMessage(rawMessage);

  return {
    protocol,
    code: /unsupported|no .* found/i.test(rawMessage)
      ? "UNSUPPORTED_MARKET"
      : /HTTP|GraphQL|RPC|network|fetch/i.test(rawMessage)
        ? "SOURCE_UNAVAILABLE"
        : "INTERNAL",
    message
  };
}

export class YieldScannerService {
  private readonly adapters: Record<
    SupportedProtocol,
    ProtocolAdapter
  >;
  private readonly enricher: Pick<IndependentRiskEnricher, "enrich">;
  private readonly cache: PromiseTtlCache<ScannerRow>;

  constructor(dependencies: ScannerDependencies = {}) {
    this.adapters = {
      ...defaultAdapters(),
      ...(dependencies.adapters ?? {})
    };
    this.enricher = dependencies.enricher ?? defaultEnricher();
    this.cache = new PromiseTtlCache<ScannerRow>(
      dependencies.cacheTtlMs ?? 300_000
    );
  }

  private async buildRow(
    protocol: SupportedProtocol,
    query: ScannerQuery,
    comparison: ComparisonAssumptions
  ): Promise<ScannerRow> {
    const cacheKey = [
      protocol,
      query.chainId,
      query.assetSymbol.toUpperCase(),
      query.principalUsd ?? "none",
      query.annualCostsUsd ?? "none",
      query.performanceFeeRate ?? "none",
      query.includeEvidence ? "evidence" : "summary"
    ].join(":");

    return this.cache.getOrCreate(cacheKey, async () => {
      const adapter = this.adapters[protocol];
      const raw = await adapter.fetchMarket({
        chainId: query.chainId,
        assetSymbol: query.assetSymbol
      });

      const enriched = await this.enricher.enrich(raw);
      const risk = assessRisk(
        enriched.snapshot,
        RISK_MODEL_V031
      );

      const observed = observedGrossApy(enriched.snapshot);
      let estimatedNetApyPct: number | null = null;

      if (
        comparison.netEstimateAvailable &&
        comparison.principalUsd !== null &&
        observed !== null
      ) {
        estimatedNetApyPct = simulateAnnualYield({
          principalUsd: comparison.principalUsd,
          grossApyPct: observed,
          feeModel: {
            performanceFeeRate:
              comparison.performanceFeeRate ?? 0,
            platformShareRate: 0
          },
          annualOperatingCostUsd:
            comparison.annualCostsUsd ?? 0
        }).userNetApyPct;
      }

      const riskMultiplier =
        risk.score === null ? null : 1 - risk.score / 100;

      const publicEvidence = enriched.evidence.map((item) => ({
        ...item,
        source: sanitizeEvidenceSource(item.source)
      }));

      const evidenceSources = [
        ...new Set(
          publicEvidence
            .map((item) => item.source)
            .filter(Boolean)
        )
      ];

      return {
        protocol,
        chainId: enriched.snapshot.chainId,
        chain: enriched.snapshot.chain,
        assetSymbol: enriched.snapshot.asset.symbol,
        marketId: enriched.snapshot.marketId,

        baseSupplyApyPct: enriched.snapshot.grossApyPct,
        knownRewardsApyPct: enriched.snapshot.rewardsApyPct,
        observedGrossApyPct: observed,
        estimatedNetApyPct,
        riskAdjustedObservedYieldPct:
          observed !== null && riskMultiplier !== null
            ? observed * riskMultiplier
            : null,
        riskAdjustedNetYieldPct:
          estimatedNetApyPct !== null &&
          riskMultiplier !== null
            ? estimatedNetApyPct * riskMultiplier
            : null,

        suppliedUsd: enriched.snapshot.suppliedUsd,
        borrowedUsd: enriched.snapshot.borrowedUsd,
        availableLiquidityUsd:
          enriched.snapshot.availableLiquidityUsd,
        utilizationPct: utilizationPct(enriched.snapshot),
        topBorrowerPct:
          enriched.snapshot.borrowConcentrationPct,

        riskStatus: risk.status,
        riskScore: risk.score,
        riskConfidence: risk.confidence,
        evidenceCoveragePct: risk.coveragePct,
        unresolved: risk.missingFields,

        observedAt: enriched.snapshot.observedAt,
        dataFreshness:
          enriched.snapshot.dataQuality.freshness,
        dataConfidence:
          enriched.snapshot.dataQuality.confidence,
        evidenceCount: enriched.evidence.length,
        evidenceSources,
        evidence: query.includeEvidence
          ? publicEvidence
          : undefined
      };
    });
  }

  async scan(query: ScannerQuery): Promise<ScannerResponse> {
    const assetSymbol = query.assetSymbol.toUpperCase();
    const available = supportedProtocols(
      query.chainId,
      assetSymbol
    );

    if (available.length === 0) {
      throw new RangeError(
        `Unsupported scanner market: chainId=${query.chainId}, asset=${assetSymbol}.`
      );
    }

    const requested =
      query.protocols?.length
        ? query.protocols
        : available;

    const protocols = requested.filter((protocol) =>
      available.includes(protocol)
    );

    if (protocols.length === 0) {
      throw new RangeError(
        "No requested protocols are supported for this market."
      );
    }

    const comparison = assumptions(query);
    const rows: ScannerRow[] = [];
    const errors: ScannerError[] = [];

    // Enrichment is deliberately sequential because Aave/Spark
    // concentration evidence uses public discovery providers with rate limits.
    for (const protocol of protocols) {
      try {
        rows.push(
          await this.buildRow(protocol, query, comparison)
        );
      } catch (error) {
        errors.push(sourceError(protocol, error));
      }
    }

    const rankingMetric =
      comparison.netEstimateAvailable
        ? "riskAdjustedNetYieldPct"
        : "riskAdjustedObservedYieldPct";

    rows.sort((a, b) => {
      const av =
        rankingMetric === "riskAdjustedNetYieldPct"
          ? a.riskAdjustedNetYieldPct
          : a.riskAdjustedObservedYieldPct;
      const bv =
        rankingMetric === "riskAdjustedNetYieldPct"
          ? b.riskAdjustedNetYieldPct
          : b.riskAdjustedObservedYieldPct;

      return (bv ?? -Infinity) - (av ?? -Infinity);
    });

    return {
      schemaVersion: "0.4.0",
      riskModelVersion: RISK_MODEL_V031.version,
      generatedAt: new Date().toISOString(),
      complete:
        errors.length === 0 &&
        rows.length === protocols.length,
      query: {
        chainId: query.chainId,
        assetSymbol,
        protocols
      },
      assumptions: comparison,
      rankingMetric,
      rows,
      errors
    };
  }
}
