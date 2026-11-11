// Reads process.env. A local `.env` is loaded first when present; on Vercel the
// dashboard injects environment variables directly and there is no file.
import { existsSync, readFileSync } from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// Compute PROJECT_ROOT with robust fallback for serverless/Vercel environments.
function detectProjectRoot() {
  const candidates = [
    process.cwd(),
    resolve(fileURLToPath(import.meta.url), "../.."),
    "/var/task"
  ];
  for (const dir of candidates) {
    if (existsSync(resolve(dir, "public")) || existsSync(resolve(dir, "package.json"))) {
      return dir;
    }
  }
  return process.cwd();
}

const PROJECT_ROOT = detectProjectRoot();

/** Minimal .env reader: KEY=value, optional quotes, `export` prefix tolerated. */
function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

loadEnvFile(join(PROJECT_ROOT, ".env"));

const str = (key, fallback) => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};
const int = (key, fallback) => {
  const parsed = Number.parseInt(str(key, ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const bool = (key, fallback) => {
  const value = str(key, "").toLowerCase();
  if (value === "") return fallback;
  return value === "1" || value === "true" || value === "yes";
};
const abs = (key, fallback) => {
  const value = str(key, fallback);
  return isAbsolute(value) ? value : resolve(PROJECT_ROOT, value);
};

export const config = Object.freeze({
  env: str("NODE_ENV", "production"),
  isProduction: str("NODE_ENV", "production") === "production",
  host: str("HOST", "0.0.0.0"),
  port: int("PORT", 3000),

  paths: Object.freeze({
    root: PROJECT_ROOT,
    data: abs("DATA_DIR", "./data"),
    // On Vercel: raw/ lives as public/ — but paper files are in public/
    // Mirror path points to public/ at runtime (Vercel serves it as static, but
    // paper XML is still read by the server from the filesystem during import).
    mirror: abs("MIRROR_DIR", "./public"),
    adminUi: abs("ADMIN_UI_DIR", "./public/admin"),
    envFile: join(PROJECT_ROOT, ".env"),
  }),

  dbFile: str("DB_FILE", "ion.db"),

  session: Object.freeze({
    candidateTtlSec: int("CANDIDATE_SESSION_TTL", 12 * 3600),
    adminTtlSec: int("ADMIN_SESSION_TTL", 7 * 24 * 3600),
  }),

  seed: Object.freeze({
    orgId: str("SEED_ORG_ID", "726"),
    adminUser: str("SEED_ADMIN_USER", "admin"),
    adminPassword: str("SEED_ADMIN_PASSWORD", "admin123"),
    candidateLogin: str("SEED_CANDIDATE_LOGIN", "11111"),
    candidatePassword: str("SEED_CANDIDATE_PASSWORD", "Guest"),
    enabled: bool("SEED_ON_START", true),
  }),

  limits: Object.freeze({
    maxRequestBytes: int("MAX_REQUEST_BYTES", 8 * 1024 * 1024),
    maxAuditEntries: int("MAX_AUDIT_ENTRIES", 200),
    maxAnswerBytes: int("MAX_ANSWER_BYTES", 200_000),
  }),

  logLevel: str("LOG_LEVEL", "info"),
});

export { PROJECT_ROOT };
