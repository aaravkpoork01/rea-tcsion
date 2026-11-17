// First-run bootstrap: org, admin, demo candidate and the seeded paper.
import { join } from "node:path";

import { config } from "../../config/index.mjs";
import { hashPassword } from "../core/crypto.mjs";
import { nowIso } from "../core/time.mjs";
import { importPaper } from "../domain/paper-import.mjs";
import { SCHEMA_SQL } from "./schema.mjs";
import { db, one, run, usePostgres } from "./connection.mjs";
import * as orgsRepo from "./repositories/orgs.repo.mjs";
import * as adminsRepo from "./repositories/admins.repo.mjs";
import * as assessmentsRepo from "./repositories/assessments.repo.mjs";
import * as candidatesRepo from "./repositories/candidates.repo.mjs";
import * as settingsRepo from "./repositories/settings.repo.mjs";
import { logger } from "../core/logger.mjs";

const SEED_ASSESSMENT_ID = "M62";
const SEED_BASE_PATH = `/per/g03/pub/${"726"}/ASM/OnlineAssessment/${SEED_ASSESSMENT_ID}/`;

let schemaInitPromise = null;

/**
 * Columns added after the first release. `CREATE TABLE IF NOT EXISTS` leaves
 * an existing table untouched, so patch older databases explicitly.
 */
async function ensureCandidateColumns() {
  if (usePostgres) {
    await db.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS system_name TEXT NOT NULL DEFAULT ''");
    await db.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS group_id TEXT NOT NULL DEFAULT ''");
    await db.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS registration_source TEXT NOT NULL DEFAULT 'admin'");
    await db.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS reviewed_at TEXT");
    await db.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS reviewed_by TEXT NOT NULL DEFAULT ''");
    await db.query("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS rejection_reason TEXT NOT NULL DEFAULT ''");
    await db.query("CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status)");
    return;
  }
  const columns = db.prepare("PRAGMA table_info(candidates)").all();
  const missing = (name) => !columns.some((column) => column.name === name);
  if (missing("system_name")) {
    await db.query("ALTER TABLE candidates ADD COLUMN system_name TEXT NOT NULL DEFAULT ''");
  }
  if (missing("group_id")) {
    await db.query("ALTER TABLE candidates ADD COLUMN group_id TEXT NOT NULL DEFAULT ''");
  }
  if (missing("registration_source")) {
    await db.query("ALTER TABLE candidates ADD COLUMN registration_source TEXT NOT NULL DEFAULT 'admin'");
  }
  if (missing("reviewed_at")) {
    await db.query("ALTER TABLE candidates ADD COLUMN reviewed_at TEXT");
  }
  if (missing("reviewed_by")) {
    await db.query("ALTER TABLE candidates ADD COLUMN reviewed_by TEXT NOT NULL DEFAULT ''");
  }
  if (missing("rejection_reason")) {
    await db.query("ALTER TABLE candidates ADD COLUMN rejection_reason TEXT NOT NULL DEFAULT ''");
  }
  await db.query("CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status)");
}

/** Assessment access and fullscreen policy added after the first release. */
async function ensureAssessmentColumns() {
  if (usePostgres) {
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS open_to_all INTEGER NOT NULL DEFAULT 1");
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS require_fullscreen INTEGER NOT NULL DEFAULT 0");
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS enable_fullscreen INTEGER NOT NULL DEFAULT 0");
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS track_fullscreen INTEGER NOT NULL DEFAULT 1");
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS quiz_xml TEXT");
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS conf_xml TEXT");
    return;
  }
  const columns = db.prepare("PRAGMA table_info(assessments)").all();
  if (!columns.some((column) => column.name === "open_to_all")) {
    await db.query("ALTER TABLE assessments ADD COLUMN open_to_all INTEGER NOT NULL DEFAULT 1");
  }
  if (!columns.some((column) => column.name === "require_fullscreen")) {
    await db.query("ALTER TABLE assessments ADD COLUMN require_fullscreen INTEGER NOT NULL DEFAULT 0");
  }
  if (!columns.some((column) => column.name === "enable_fullscreen")) {
    await db.query("ALTER TABLE assessments ADD COLUMN enable_fullscreen INTEGER NOT NULL DEFAULT 0");
  }
  if (!columns.some((column) => column.name === "track_fullscreen")) {
    await db.query("ALTER TABLE assessments ADD COLUMN track_fullscreen INTEGER NOT NULL DEFAULT 1");
  }
  if (!columns.some((column) => column.name === "quiz_xml")) {
    await db.query("ALTER TABLE assessments ADD COLUMN quiz_xml TEXT");
  }
  if (!columns.some((column) => column.name === "conf_xml")) {
    await db.query("ALTER TABLE assessments ADD COLUMN conf_xml TEXT");
  }
}

/** Attempt metrics added after the first release. */
async function ensureAttemptColumns() {
  if (usePostgres) {
    await db.query("ALTER TABLE attempts ADD COLUMN IF NOT EXISTS fullscreen_seconds INTEGER NOT NULL DEFAULT 0");
    await db.query("ALTER TABLE attempts ADD COLUMN IF NOT EXISTS fullscreen_toggle_count INTEGER NOT NULL DEFAULT 0");
    return;
  }
  const columns = db.prepare("PRAGMA table_info(attempts)").all();
  if (!columns.some((column) => column.name === "fullscreen_seconds")) {
    await db.query("ALTER TABLE attempts ADD COLUMN fullscreen_seconds INTEGER NOT NULL DEFAULT 0");
  }
  if (!columns.some((column) => column.name === "fullscreen_toggle_count")) {
    await db.query("ALTER TABLE attempts ADD COLUMN fullscreen_toggle_count INTEGER NOT NULL DEFAULT 0");
  }
}

/**
 * Team/RBAC columns added after the first release. Also promotes the oldest
 * account when an existing installation has no super administrator, so the
 * person who already owns the console keeps control after the upgrade.
 */
async function ensureAdminColumns() {
  if (usePostgres) {
    await db.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'");
    await db.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions TEXT");
    await db.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_by INTEGER");
    await db.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login_at TEXT NOT NULL DEFAULT ''");
    await db.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS updated_at TEXT NOT NULL DEFAULT ''");
    await db.query("CREATE INDEX IF NOT EXISTS idx_admins_role_status ON admins(role, status)");
  } else {
    const columns = db.prepare("PRAGMA table_info(admins)").all();
    const missing = (name) => !columns.some((column) => column.name === name);
    if (missing("status")) {
      await db.query("ALTER TABLE admins ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
    }
    if (missing("permissions")) {
      await db.query("ALTER TABLE admins ADD COLUMN permissions TEXT");
    }
    if (missing("created_by")) {
      await db.query("ALTER TABLE admins ADD COLUMN created_by INTEGER");
    }
    if (missing("last_login_at")) {
      await db.query("ALTER TABLE admins ADD COLUMN last_login_at TEXT NOT NULL DEFAULT ''");
    }
    if (missing("updated_at")) {
      await db.query("ALTER TABLE admins ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''");
    }
    await db.query("CREATE INDEX IF NOT EXISTS idx_admins_role_status ON admins(role, status)");
  }

  const total = Number((await one("SELECT COUNT(*) AS n FROM admins"))?.n ?? 0);
  if (!total) return;
  const superAdmins = Number((await one(
    "SELECT COUNT(*) AS n FROM admins WHERE role = 'super_admin'",
  ))?.n ?? 0);
  if (superAdmins > 0) return;
  await run(`UPDATE admins
    SET role = 'super_admin', status = 'active', updated_at = ?
    WHERE id = (SELECT id FROM admins ORDER BY id LIMIT 1)`, nowIso());
  logger.warn("No super administrator existed; promoted the oldest admin account to super_admin.");
}

/**
 * Older databases stored a single group per candidate. Copy those values into
 * the membership table so the multi-group UI sees them. Assessments that were
 * already restricted keep their restriction instead of becoming open to all.
 */
async function migrateCandidateGroups() {
  await db.query(`INSERT INTO candidate_group_members(candidate_id, group_id)
    SELECT c.id, c.group_id FROM candidates c
    JOIN candidate_groups g ON g.id = c.group_id
    WHERE c.group_id <> ''
      AND NOT EXISTS (
        SELECT 1 FROM candidate_group_members m
        WHERE m.candidate_id = c.id AND m.group_id = c.group_id
      )`);
  await db.query(`UPDATE assessments SET open_to_all = 0
    WHERE EXISTS (
      SELECT 1 FROM assessment_candidate_groups acg
      WHERE acg.assessment_id = assessments.id
    )`);
}

export async function ensureSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      try {
        await db.query(SCHEMA_SQL);
        await ensureCandidateColumns();
        await ensureAssessmentColumns();
        await ensureAttemptColumns();
        await ensureAdminColumns();
        await migrateCandidateGroups();
        logger.debug("Database schema ensured");
      } catch (err) {
        logger.error("Failed to ensure schema", err);
      }
    })();
  }
  return schemaInitPromise;
}

export async function seed() {
  await ensureSchema();
  const orgId = config.seed.orgId;

  await orgsRepo.ensure(orgId, "TCS iON", nowIso());

  if (!(await adminsRepo.any())) {
    await adminsRepo.create({
      username: config.seed.adminUser,
      passwordHash: hashPassword(config.seed.adminPassword),
      name: "Administrator",
      role: "super_admin",
      createdAt: nowIso(),
    });
    logger.info(`seeded admin "${config.seed.adminUser}"`);
  }

  if (!(await assessmentsRepo.findById(SEED_ASSESSMENT_ID))) {
    const base = join(config.paths.mirror, ...SEED_BASE_PATH.replace(/^\/|\/$/g, "").split("/"));
    try {
      await importPaper({
        orgId,
        assessmentId: SEED_ASSESSMENT_ID,
        quizPath: join(base, "quiz.xml"),
        confPath: join(base, "confDetails.xml"),
        meta: { name: "TCS iON Mock Assessment", type: "mock", basePath: SEED_BASE_PATH },
      });
      logger.info("seeded assessment M62 from mirror XML");
    } catch (error) {
      logger.warn(`paper seed skipped: ${error.message}`);
    }
  }

  if (!(await candidatesRepo.findByLogin(config.seed.candidateLogin))) {
    await candidatesRepo.create({
      id: "C11111",
      orgId,
      login: config.seed.candidateLogin,
      passwordHash: hashPassword(config.seed.candidatePassword),
      name: "Your Name",
      email: "your.name@example.com",
      phone: "",
      status: "active",
      createdAt: nowIso(),
    });
    logger.info(`seeded candidate "${config.seed.candidateLogin}"`);
  }

  if (!(await settingsRepo.getSetting("site_name"))) await settingsRepo.setSetting("site_name", "TCS iON Assessment Platform");
  if (!(await settingsRepo.getSetting("org_name"))) await settingsRepo.setSetting("org_name", "TCS iON");
}
