// Storage connection — dual mode.
//
//   DATABASE_URL set     → Postgres / Neon via @neondatabase/serverless
//   DATABASE_URL unset   → local SQLite file via node:sqlite
//
// Callers always see the same async surface: run / one / all / transaction.
// SQL is written in SQLite dialect (`?` placeholders); for Postgres the
// placeholders are rewritten to `$1..$n` and `INSERT` gets `RETURNING id`.
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { config } from "../../config/index.mjs";
import { dialect, usePostgres } from "./dialect.mjs";

// ---------------------------------------------------------------------------
// SQLite dialect fixes applied to shared SQL
// ---------------------------------------------------------------------------

// Postgres accepts `AVG(x)::numeric`; SQLite only knows AVG(x).
const PG_CAST = /::\s*(numeric|decimal|integer|int|bigint|text|varchar|real|float|double precision|boolean)\b/gi;

const sqliteSql = (sql) => sql.replace(PG_CAST, "");

/** node:sqlite refuses undefined and booleans; normalise them. */
function bindable(params) {
  const values = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  return values.map((value) => {
    if (value === undefined) return null;
    if (typeof value === "boolean") return value ? 1 : 0;
    return value;
  });
}

// ---------------------------------------------------------------------------
// Backend selection
// ---------------------------------------------------------------------------

let pool = null;
let sqlite = null;
let sqliteFile = null;

if (usePostgres) {
  const { Pool } = await import("@neondatabase/serverless");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  // On Vercel without DATABASE_URL the filesystem is read-only — use /tmp.
  const { DatabaseSync } = await import("node:sqlite");
  const dataDir = process.env.VERCEL
    ? "/tmp"
    : resolve(config.paths.data);
  sqliteFile = resolve(dataDir, config.dbFile);
  mkdirSync(dirname(sqliteFile), { recursive: true });
  sqlite = new DatabaseSync(sqliteFile);
  // WAL keeps reads from blocking writes; foreign_keys is off by default.
  try {
    sqlite.exec("PRAGMA journal_mode = WAL");
  } catch {
    // Some network filesystems refuse WAL — the default journal still works.
  }
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec("PRAGMA busy_timeout = 5000");
}

// ---------------------------------------------------------------------------
// Postgres helpers
// ---------------------------------------------------------------------------

/** Convert SQLite-style positional `?` to Postgres `$1, $2, $3…` */
function pgSql(sql, params) {
  let idx = 0;
  const values = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  const text = sql.replace(/\?/g, () => `$${++idx}`);
  return { text, values };
}

function sqliteStatement(sql) {
  return sqlite.prepare(sqliteSql(sql));
}

/** Normalise node:sqlite's bigint-ish results to plain numbers. */
function sqliteResult(result) {
  return {
    changes: Number(result.changes ?? 0),
    lastInsertRowid: Number(result.lastInsertRowid ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/** Run a statement. Returns { changes, lastInsertRowid }. */
export async function run(sql, ...params) {
  if (!usePostgres) return sqliteResult(sqliteStatement(sql).run(...bindable(params)));

  const isInsert = /^\s*INSERT/i.test(sql);
  const q = pgSql(sql, params);
  const finalSql = isInsert && !/ RETURNING /i.test(q.text)
    ? q.text + " RETURNING id"
    : q.text;
  const result = await pool.query(finalSql, q.values);
  return {
    changes: result.rowCount ?? 0,
    lastInsertRowid: result.rows[0]?.id ?? null,
  };
}

/** Fetch one row or null. */
export async function one(sql, ...params) {
  if (!usePostgres) {
    const row = sqliteStatement(sql).get(...bindable(params));
    return row ?? null;
  }
  const q = pgSql(sql, params);
  const result = await pool.query(q.text, q.values);
  return result.rows[0] ?? null;
}

/** Fetch all rows. */
export async function all(sql, ...params) {
  if (!usePostgres) return sqliteStatement(sql).all(...bindable(params));
  const q = pgSql(sql, params);
  const result = await pool.query(q.text, q.values);
  return result.rows;
}

/** Wrap a function in a transaction. The fn must be async. */
export async function transaction(fn) {
  if (!usePostgres) {
    sqlite.exec("BEGIN");
    try {
      const result = await fn();
      sqlite.exec("COMMIT");
      return result;
    } catch (error) {
      try {
        sqlite.exec("ROLLBACK");
      } catch {
        // Transaction was already aborted by SQLite.
      }
      throw error;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Raw handle used only for bootstrap (`seed.mjs` runs the DDL, `server.mjs`
 * closes on shutdown). `query` stays promise-shaped so both dialects agree.
 */
export const db = usePostgres
  ? pool
  : {
      dialect,
      query: async (sql) => {
        sqlite.exec(sqliteSql(sql));
      },
      exec: (sql) => sqlite.exec(sqliteSql(sql)),
      prepare: (sql) => sqliteStatement(sql),
      close: () => sqlite.close(),
    };

/** Human-readable storage target for startup logs. Never the credentials. */
export const dbPath = usePostgres ? "postgres" : sqliteFile;

export { dialect, usePostgres };
