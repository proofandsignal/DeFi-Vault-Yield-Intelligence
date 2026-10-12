export type ConversionEventName =
  | "landing_view"
  | "scanner_click"
  | "scanner_view"
  | "scan_run"
  | "pro_interest"
  | "b2b_interest";

export interface ConversionEvent {
  event: ConversionEventName;
  at: string;
  path: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  intent?: string;
  referrerHost?: string;
}

function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value
    .trim()
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9._:-]/g, "_");

  return normalized || undefined;
}

function referrerHost(request: Request): string | undefined {
  const raw = request.headers.get("referer");
  if (!raw) return undefined;

  try {
    return clean(new URL(raw).hostname);
  } catch {
    return undefined;
  }
}

export function buildConversionEvent(
  event: ConversionEventName,
  request: Request,
  url: URL,
  overrides: Partial<ConversionEvent> = {}
): ConversionEvent {
  return {
    event,
    at: new Date().toISOString(),
    path: clean(url.pathname) ?? "/",
    source:
      clean(url.searchParams.get("utm_source")) ??
      clean(url.searchParams.get("source")),
    medium: clean(url.searchParams.get("utm_medium")),
    campaign:
      clean(url.searchParams.get("utm_campaign")) ??
      clean(url.searchParams.get("campaign")),
    content: clean(url.searchParams.get("utm_content")),
    intent: clean(url.searchParams.get("intent")),
    referrerHost: referrerHost(request),
    ...overrides
  };
}

export function logConversionEvent(event: ConversionEvent): void {
  console.log("DVY_EVENT " + JSON.stringify(event));
}

export function trackingQuery(params: URLSearchParams): string {
  const next = new URLSearchParams();

  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "source",
    "campaign",
    "intent"
  ]) {
    const value = clean(params.get(key));
    if (value) next.set(key, value);
  }

  const encoded = next.toString();
  return encoded ? "?" + encoded : "";
}

export function safeConfiguredDestination(
  raw: string | undefined
): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  if (
    value.startsWith("/") ||
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("mailto:")
  ) {
    return value.replace(/[\r\n"]/g, "");
  }

  return undefined;
}
