// Import legacy question papers that exist in the mirror but not in the DB.
//
// The candidate console is launched with a mock id (for example `M62`) and the
// engine asks for that paper's files directly. If the assessment row is
// missing, assessment lookup falls back to the first paper of the org, so the
// candidate sees another paper's name, duration, languages and questions.
// Scanning the mirror at startup keeps every shipped paper selectable without
// requiring a manual re-import.
import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { config } from "../../config/index.mjs";
import { logger } from "../core/logger.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import { importPaper } from "./paper-import.mjs";

const hasPaperFiles = (dir) =>
  existsSync(join(dir, "quiz.xml")) && existsSync(join(dir, "confDetails.xml"));

/** Root folders that contain both paper files; language copies are nested. */
function findPaperFolders(root) {
  const found = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const files = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name.toLowerCase()));
    if (files.has("quiz.xml") && files.has("confdetails.xml")) {
      found.push(dir);
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(join(dir, entry.name));
    }
  };
  walk(root);
  return found;
}

/** `/per/g03/pub/726/...` → `726`; fall back to the seed org. */
function orgIdFromPath(relativePath) {
  const parts = relativePath.split(/[\\/]+/);
  const pub = parts.lastIndexOf("pub");
  return pub >= 0 && parts[pub + 1] ? parts[pub + 1] : config.seed.orgId;
}

export async function discoverPapers() {
  const existing = new Set((await assessmentsRepo.listBrief()).map((assessment) => assessment.id));

  for (const folder of findPaperFolders(config.paths.mirror)) {
    const id = folder.split(/[\\/]/).pop();
    if (!id || existing.has(id)) continue;

    const relativePath = relative(config.paths.mirror, folder);
    const basePath = `/${relativePath.split(sep).join("/")}/`;
    try {
      await importPaper({
        orgId: orgIdFromPath(relativePath),
        assessmentId: id,
        quizPath: join(folder, "quiz.xml"),
        confPath: join(folder, "confDetails.xml"),
        meta: { basePath },
        // Legacy papers ship their own instruction files; keep them verbatim.
        generateInstructions: false,
      });
      existing.add(id);
      logger.info(`discovered legacy paper ${id} at ${basePath}`);
    } catch (error) {
      logger.error(`legacy paper discovery failed for ${id}`, error);
    }
  }
}
