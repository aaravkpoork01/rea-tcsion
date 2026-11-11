// Process entry point: seed, start HTTP, graceful shutdown.
import { createServer } from "node:http";

import { config } from "../config/index.mjs";
import { handler } from "./app.mjs";
import { logger } from "./core/logger.mjs";
import { db, dbPath } from "./db/connection.mjs";
import { seed } from "./db/seed.mjs";

if (config.seed.enabled) {
  seed().catch((err) => logger.error("Seed error on startup", err));
}

const server = createServer(handler);

server.listen(config.port, config.host, () => {
  logger.info(`listening on http://${config.host}:${config.port}`);
  logger.info(`database ${dbPath}`);
  logger.info(`candidate console http://${config.host}:${config.port}/index.html?${config.seed.orgId}@@M62`);
  logger.info(`admin panel       http://${config.host}:${config.port}/admin/`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received, closing`);
  server.close(() => {
    try {
      if (typeof db.end === "function") db.end();
      else if (typeof db.close === "function") db.close();
    } catch { /* already closed */ }
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => logger.error("unhandled rejection", reason));
process.on("uncaughtException", (error) => {
  logger.error("uncaught exception", error);
});
