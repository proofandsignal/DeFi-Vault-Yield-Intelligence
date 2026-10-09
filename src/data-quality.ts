import type { DataConfidence, DataFreshness, DataQuality } from "./domain/types.js";

export interface DataQualityInput {
  source: string;
  fetchedAt: string;
  evaluatedAt?: string;
  sourceTimestampKnown?: boolean;
  missingCriticalFields?: string[];
  staleAfterSeconds?: number;
}

export function evaluateDataQuality(input: DataQualityInput): DataQuality {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
  const ageSeconds = Math.max(
    0,
    (Date.parse(evaluatedAt) - Date.parse(input.fetchedAt)) / 1000
  );
  const staleAfterSeconds = input.staleAfterSeconds ?? 300;
  const missingCriticalFields = input.missingCriticalFields ?? [];

  let freshness: DataFreshness = "UNKNOWN";
  if (Number.isFinite(ageSeconds)) {
    freshness = ageSeconds <= staleAfterSeconds ? "FRESH" : "STALE";
  }

  let confidence: DataConfidence;
  if (missingCriticalFields.length > 0) {
    confidence = "LOW";
  } else if (input.sourceTimestampKnown) {
    confidence = "HIGH";
  } else {
    confidence = "MEDIUM";
  }

  const warnings: string[] = [];
  if (!input.sourceTimestampKnown) {
    warnings.push(
      "Source-side update timestamp is unavailable; freshness measures fetch age only."
    );
  }
  if (freshness === "STALE") {
    warnings.push("Observation exceeded the configured freshness window.");
  }
  if (missingCriticalFields.length > 0) {
    warnings.push("Critical source fields are missing.");
  }

  return {
    source: input.source,
    fetchedAt: input.fetchedAt,
    evaluatedAt,
    ageSeconds,
    freshness,
    confidence,
    sourceTimestampKnown: input.sourceTimestampKnown ?? false,
    missingCriticalFields,
    warnings
  };
}
