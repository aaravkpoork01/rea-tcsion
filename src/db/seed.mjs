// First-run bootstrap: org, admin, demo candidate and the seeded paper.
import { join } from "node:path";

import { config } from "../../config/index.mjs";
import { hashPassword } from "../core/crypto.mjs";
import { nowIso } from "../core/time.mjs";
import { importPaper } from "../domain/paper-import.mjs";
import { SCHEMA_SQL } from "./schema.mjs";
import { db, usePostgres } from "./connection.mjs";
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
    return;
  }
  const columns = db.prepare("PRAGMA table_info(candidates)").all();
  if (!columns.some((column) => column.name === "system_name")) {
    await db.query("ALTER TABLE candidates ADD COLUMN system_name TEXT NOT NULL DEFAULT ''");
  }
  if (!columns.some((column) => column.name === "group_id")) {
    await db.query("ALTER TABLE candidates ADD COLUMN group_id TEXT NOT NULL DEFAULT ''");
  }
}

/** Assessment access and fullscreen policy added after the first release. */
async function ensureAssessmentColumns() {
  if (usePostgres) {
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS open_to_all INTEGER NOT NULL DEFAULT 1");
    await db.query("ALTER TABLE assessments ADD COLUMN IF NOT EXISTS require_fullscreen INTEGER NOT NULL DEFAULT 0");
    return;
  }
  const columns = db.prepare("PRAGMA table_info(assessments)").all();
  if (!columns.some((column) => column.name === "open_to_all")) {
    await db.query("ALTER TABLE assessments ADD COLUMN open_to_all INTEGER NOT NULL DEFAULT 1");
  }
  if (!columns.some((column) => column.name === "require_fullscreen")) {
    await db.query("ALTER TABLE assessments ADD COLUMN require_fullscreen INTEGER NOT NULL DEFAULT 0");
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
      role: "admin",
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
