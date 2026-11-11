// Delete the local SQLite database (and WAL side files) so the next server
// start re-creates and re-seeds it. Usage: npm run db:reset
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

import { config } from "../config/index.mjs";
import { usePostgres } from "../src/db/dialect.mjs";

if (usePostgres) {
  console.log("DATABASE_URL is set — this project is using Postgres. Nothing local to delete.");
  process.exit(0);
}

const dbPath = join(config.paths.data, config.dbFile);
let removed = 0;

for (const suffix of ["", "-wal", "-shm"]) {
  const file = `${dbPath}${suffix}`;
  if (!existsSync(file)) continue;
  rmSync(file);
  removed += 1;
}

console.log(removed ? `removed ${dbPath}` : `nothing to remove at ${dbPath}`);
