import type { YieldScannerService } from "../scanner/service.js";
import { resolveAccess } from "./access.js";
import { landingPage } from "./landing-page.js";
import { parseScannerQuery } from "./query.js";
import { scannerPage } from "./scanner-page.js";
import {
  buildConversionEvent,
  logConversionEvent,
  safeConfiguredDestination,
  trackingQuery,
  type ConversionEvent
} from "./tracking.js";

export interface ApiApplicationDependencies {
  scanner: Pick<YieldScannerService, "scan">;
  env?: NodeJS.ProcessEnv;
  eventSink?: (event: ConversionEvent) => void;
}

function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

export function createApiApplication(
  dependencies: ApiApplicationDependencies
): {
  fetch(request: Request): Promise<Response>;
} {
  const env = dependencies.env ?? process.env;
  const eventSink = dependencies.eventSink ?? logConversionEvent;

  const emit = (
    event: ConversionEvent["event"],
    request: Request,
    url: URL,
    overrides: Partial<ConversionEvent> = {}
  ): void => {
    try {
      eventSink(buildConversionEvent(event, request, url, overrides));
    } catch {
      // Analytics must never block the product path.
    }
  };

  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const access = resolveAccess(request.headers, env);

      const accessHeaders = {
        "x-dvy-plan": access.plan,
        "x-dvy-api-mode": access.apiMode
      };

      if (request.method !== "GET") {
        return json(
          {
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: "Only GET is supported in v0.4."
            }
          },
          405,
          accessHeaders
        );
      }

      if (url.pathname === "/") {
        emit("landing_view", request, url);

        return new Response(
          landingPage(),
          {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
              "cache-control": "public, max-age=60",
              ...accessHeaders
            }
          }
        );
      }

      if (url.pathname === "/go/scanner") {
        emit("scanner_click", request, url);

        return Response.redirect(
          new URL("/scanner" + trackingQuery(url.searchParams), url),
          302
        );
      }

      if (url.pathname === "/go/interest") {
        const product = url.searchParams.get("product");
        const isB2b = product === "b2b";

        emit(isB2b ? "b2b_interest" : "pro_interest", request, url, {
          intent: isB2b ? "b2b_api" : "founding_beta"
        });

        const configured = safeConfiguredDestination(
          env.DVY_CONTACT_URL
        );

        if (configured) {
          return Response.redirect(new URL(configured, url), 302);
        }

        const fallback = new URL("/scanner", url);
        fallback.searchParams.set(
          "intent",
          isB2b ? "b2b-api" : "founding-beta"
        );
        fallback.searchParams.set("source", "landing");
        return Response.redirect(fallback, 302);
      }

      if (url.pathname === "/scanner") {
        emit("scanner_view", request, url);

        return new Response(scannerPage(), {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=60",
            ...accessHeaders
          }
        });
      }

      if (url.pathname === "/health") {
        return json(
          {
            status: "ok",
            service: "defi-vault-yield-intelligence",
            version: "0.4.0",
            mode: "READ_ONLY",
            publicCapital: "LOCKED"
          },
          200,
          accessHeaders
        );
      }

      if (
        url.pathname === "/api/v1/scan" ||
        url.pathname === "/api/v1/markets"
      ) {
        try {
          const query = parseScannerQuery(url.searchParams);

          if (url.searchParams.get("ui") === "1") {
            emit("scan_run", request, url);
          }

          if (query.includeEvidence && !access.canViewFullEvidence) {
            return json(
              {
                error: {
                  code: "UPGRADE_REQUIRED",
                  message:
                    "Full evidence payloads require an authenticated PRO or B2B API key."
                }
              },
              403,
              accessHeaders
            );
          }

          const result = await dependencies.scanner.scan(query);

          return json(
            {
              ...result,
              access: {
                plan: access.plan,
                authenticated: access.authenticated
              }
            },
            result.complete ? 200 : 206,
            accessHeaders
          );
        } catch (error) {
          return json(
            {
              error: {
                code: "BAD_REQUEST",
                message:
                  error instanceof Error
                    ? error.message
                    : String(error)
              }
            },
            400,
            accessHeaders
          );
        }
      }

      if (url.pathname === "/api/v1/compare") {
        if (!access.canUsePaidApi) {
          return json(
            {
              error: {
                code: "API_KEY_REQUIRED",
                message:
                  "Comparison API access requires a configured PRO or B2B API key in KEYED mode."
              }
            },
            401,
            accessHeaders
          );
        }

        try {
          const query = parseScannerQuery(url.searchParams);

          if (query.includeEvidence && !access.canViewFullEvidence) {
            return json(
              {
                error: {
                  code: "UPGRADE_REQUIRED",
                  message:
                    "Full evidence payloads require an authenticated PRO or B2B API key."
                }
              },
              403,
              accessHeaders
            );
          }

          const result = await dependencies.scanner.scan(query);

          return json(
            {
              ...result,
              access: {
                plan: access.plan,
                authenticated: access.authenticated,
                product: "comparison_api"
              }
            },
            result.complete ? 200 : 206,
            accessHeaders
          );
        } catch (error) {
          return json(
            {
              error: {
                code: "BAD_REQUEST",
                message:
                  error instanceof Error
                    ? error.message
                    : String(error)
              }
            },
            400,
            accessHeaders
          );
        }
      }

      return json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Route not found."
          }
        },
        404,
        accessHeaders
      );
    }
  };
}
