import { createServer } from "node:http";

import { YieldScannerService } from "../scanner/service.js";
import { createApiApplication } from "./app.js";

const port = Number(process.env.PORT ?? 8787);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

const application = createApiApplication({
  scanner: new YieldScannerService()
});

const server = createServer(async (req, res) => {
  try {
    const host = req.headers.host ?? `127.0.0.1:${port}`;
    const url = new URL(req.url ?? "/", `http://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item);
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    const request = new Request(url, {
      method: req.method ?? "GET",
      headers
    });

    const response = await application.fetch(request);

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          code: "INTERNAL",
          message:
            error instanceof Error ? error.message : String(error)
        }
      })
    );
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      status: "listening",
      port,
      mode: "READ_ONLY",
      publicCapital: "LOCKED"
    })
  );
});
