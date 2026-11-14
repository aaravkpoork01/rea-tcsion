// Sync schema and data from local SQLite (data/ion.db) to PostgreSQL.
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import pg from "pg";
import { PG_SCHEMA_SQL } from "../src/db/schema.mjs";

const pgUrl = process.env.DATABASE_URL;
if (!pgUrl) {
  console.error("Error: DATABASE_URL environment variable is required. Please set DATABASE_URL or define it in .env");
  process.exit(1);
}
const cleanPgUrl = pgUrl.replace(/[\?&]sslmode=[^&]+/g, "");

const sqliteFile = resolve("data/ion.db");
const sqlite = new DatabaseSync(sqliteFile);

const pool = new pg.Pool({
  connectionString: cleanPgUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Connecting to PostgreSQL...");
  const client = await pool.connect();
  try {
    console.log("Applying schema...");
    await client.query(PG_SCHEMA_SQL);

    // Apply incremental column updates if not present
    const columnChecks = [
      "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS open_to_all INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS require_fullscreen INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS enable_fullscreen INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS track_fullscreen INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS quiz_xml TEXT",
      "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS conf_xml TEXT",
      "ALTER TABLE attempts ADD COLUMN IF NOT EXISTS fullscreen_seconds INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE attempts ADD COLUMN IF NOT EXISTS fullscreen_toggle_count INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS system_name TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS group_id TEXT NOT NULL DEFAULT ''"
    ];

    for (const sql of columnChecks) {
      try {
        await client.query(sql);
      } catch (err) {
        console.warn("Column check warning:", err.message);
      }
    }

    console.log("Schema applied successfully.");

    // Tables to sync in dependency order
    const tables = [
      "meta",
      "orgs",
      "assessments",
      "assessment_languages",
      "groups",
      "sections",
      "questions",
      "question_languages",
      "options",
      "option_languages",
      "comprehensions",
      "candidates",
      "candidate_groups",
      "candidate_group_members",
      "assessment_candidate_groups",
      "attempts",
      "responses",
      "audit_log",
      "feedback",
      "admins",
      "sessions",
      "settings"
    ];

    console.log("\nStarting data synchronization from SQLite to PostgreSQL...");

    for (const table of tables) {
      // Check if sqlite has this table
      const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
      if (!tableExists) {
        console.log(`- Table ${table}: not present in SQLite, skipping.`);
        continue;
      }

      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      console.log(`- Syncing ${table}: ${rows.length} rows in SQLite`);

      if (rows.length === 0) continue;

      // Disable triggers/foreign keys temporarily or handle conflicts
      const cols = Object.keys(rows[0]);
      const colList = cols.map(c => `"${c}"`).join(", ");
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");

      // Get primary key / conflict target
      for (const row of rows) {
        const values = cols.map(c => row[c]);
        // Insert with ON CONFLICT DO UPDATE
        const updateSets = cols.map(c => `"${c}" = EXCLUDED."${c}"`).join(", ");
        
        let insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;
        if (table === "meta" || table === "orgs" || table === "assessments" || table === "candidates" || table === "candidate_groups" || table === "sessions" || table === "settings") {
          insertSql += ` ON CONFLICT ("${cols[0]}") DO UPDATE SET ${updateSets}`;
        } else if (table === "assessment_languages") {
          insertSql += ` ON CONFLICT ("assessment_id", "lang_id") DO UPDATE SET ${updateSets}`;
        } else if (table === "candidate_group_members") {
          insertSql += ` ON CONFLICT ("candidate_id", "group_id") DO UPDATE SET ${updateSets}`;
        } else if (table === "assessment_candidate_groups") {
          insertSql += ` ON CONFLICT ("assessment_id", "group_id") DO UPDATE SET ${updateSets}`;
        } else if (table === "question_languages") {
          insertSql += ` ON CONFLICT ("question_id", "lang_id") DO UPDATE SET ${updateSets}`;
        } else if (table === "option_languages") {
          insertSql += ` ON CONFLICT ("option_id", "lang_id") DO UPDATE SET ${updateSets}`;
        } else if (table === "responses") {
          insertSql += ` ON CONFLICT ("attempt_id", "question_id") DO UPDATE SET ${updateSets}`;
        } else if (table === "admins") {
          insertSql += ` ON CONFLICT ("username") DO UPDATE SET ${updateSets}`;
        } else if (cols.includes("id")) {
          insertSql += ` ON CONFLICT ("id") DO UPDATE SET ${updateSets}`;
        } else {
          insertSql += ` ON CONFLICT DO NOTHING`;
        }

        try {
          await client.query(insertSql, values);
        } catch (err) {
          console.error(`Error inserting into ${table}:`, err.message);
        }
      }

      // Reset sequence if table has SERIAL id
      if (cols.includes("id")) {
        try {
          await client.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}"`);
        } catch (seqErr) {
          // ignore if no sequence
        }
      }
    }

    console.log("\nVerifying PostgreSQL table counts:");
    for (const table of tables) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`  ${table.padEnd(28)} : ${countRes.rows[0].count} rows`);
      } catch (e) {
        console.log(`  ${table.padEnd(28)} : table not found`);
      }
    }

    console.log("\nPostgreSQL database updated successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
