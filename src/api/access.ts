import { createHash } from "node:crypto";

export type AccessPlan = "FREE" | "PRO" | "B2B";
export type ApiAccessMode = "OPEN" | "KEYED";

export interface AccessContext {
  plan: AccessPlan;
  authenticated: boolean;
  apiMode: ApiAccessMode;
  canUsePaidApi: boolean;
  canViewFullEvidence: boolean;
}

function parseMode(value: string | undefined): ApiAccessMode {
  return value?.toUpperCase() === "KEYED" ? "KEYED" : "OPEN";
}

function parseHashMap(
  raw: string | undefined
): Record<string, AccessPlan> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, AccessPlan> = {};

    for (const [hash, plan] of Object.entries(parsed)) {
      const normalizedPlan = plan.toUpperCase();
      if (
        normalizedPlan === "PRO" ||
        normalizedPlan === "B2B"
      ) {
        out[hash.toLowerCase()] = normalizedPlan;
      }
    }

    return out;
  } catch {
    return {};
  }
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256")
    .update(apiKey, "utf8")
    .digest("hex");
}

export function resolveAccess(
  headers: Headers,
  env: NodeJS.ProcessEnv = process.env
): AccessContext {
  const apiMode = parseMode(env.DVY_API_ACCESS_MODE);
  const provided = headers.get("x-api-key")?.trim();

  if (!provided) {
    return {
      plan: "FREE",
      authenticated: false,
      apiMode,
      canUsePaidApi: apiMode === "OPEN",
      canViewFullEvidence: false
    };
  }

  const hashes = parseHashMap(env.DVY_API_KEY_HASHES_JSON);
  const plan = hashes[hashApiKey(provided)];

  if (!plan) {
    return {
      plan: "FREE",
      authenticated: false,
      apiMode,
      canUsePaidApi: apiMode === "OPEN",
      canViewFullEvidence: false
    };
  }

  return {
    plan,
    authenticated: true,
    apiMode,
    canUsePaidApi: true,
    canViewFullEvidence: true
  };
}
