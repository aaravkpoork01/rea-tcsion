// Which storage engine this process talks to.
//
// Set DATABASE_URL (a Postgres/Neon connection string) and the app uses
// Postgres. Leave it unset and the app uses a local SQLite file via
// `node:sqlite`. One codebase, both targets — every repository already awaits.

// Side-effect import: config loads `.env` before we read DATABASE_URL here.
import "../../config/index.mjs";

export const usePostgres = Boolean(String(process.env.DATABASE_URL || "").trim());

export const dialect = usePostgres ? "postgres" : "sqlite";
