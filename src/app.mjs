// Request dispatcher. Wires routes, admin UI, mirror and error handling.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { config } from "../config/index.mjs";
import { createRouter } from "./http/router.mjs";
import { resolveWithin, serveStatic } from "./http/static.mjs";
import { sendJson, sendFromError } from "./http/respond.mjs";
import { registerCandidateRoutes } from "./http/routes/candidate.routes.mjs";
import { registerAdminRoutes } from "./http/routes/admin.routes.mjs";
import { logger } from "./core/logger.mjs";
import { seed, ensureSchema } from "./db/seed.mjs";
import { extractLanguages } from "./domain/paper-languages.mjs";
import { ensureInstructionFiles } from "./domain/paper-instructions.mjs";
import { discoverPapers } from "./domain/paper-discovery.mjs";
import { paperPath } from "./services/assessments.service.mjs";
import * as assessmentsRepo from "./db/repositories/assessments.repo.mjs";

const router = createRouter();
registerCandidateRoutes(router);
registerAdminRoutes(router);

const ADMIN_PREFIX = "/admin";

/**
 * Papers imported before instruction generation existed would send the
 * candidate instructions page to error.html?E404. Create the two files from
 * the paper's declared languages, but never overwrite existing ones.
 */
async function backfillInstructions() {
  for (const assessment of await assessmentsRepo.listBrief()) {
    try {
      const quizPath = paperPath(assessment, "quiz.xml");
      if (!existsSync(quizPath)) continue;
      const folder = dirname(quizPath);
      if (existsSync(join(folder, "sysInstructions.xml")) && existsSync(join(folder, "custInstructions.xml"))) continue;
      ensureInstructionFiles(folder, extractLanguages(readFileSync(quizPath, "utf8")));
      logger.info(`created default instructions for ${assessment.id}`);
    } catch (error) {
      logger.error(`instruction backfill failed for ${assessment.id}`, error);
    }
  }
}

let initPromise = null;
async function ensureInit() {
  if (!initPromise) {
    const start = config.seed.enabled ? seed() : ensureSchema();
    initPromise = start
      .then(discoverPapers)
      .then(backfillInstructions)
      .catch((err) => {
        logger.error("Initialization / seed error", err);
      });
  }
  return initPromise;
}

async function serveAdminUi(res, pathname) {
  const relative = pathname === `${ADMIN_PREFIX}/` || pathname === ADMIN_PREFIX
    ? "/index.html"
    : pathname.slice(ADMIN_PREFIX.length);
  return serveStatic(res, config.paths.adminUi, relative);
}

const PAPER_XML_RE = /\/([^/]+)\/+(quiz|confDetails)\.xml$/i;

/**
 * The legacy engine reads group ids with `parseInt($(this).attr("id"))` and
 * keys the group-instruction maps by that number. Papers imported with textual
 * ids (`G1`, `grp-a`) therefore end up with `groupId = NaN`, which breaks the
 * group instruction timer and the Group/Section instruction buttons. Renumber
 * the groups in document order while serving; the stored paper keeps its
 * admin-facing ids.
 */
function normalizeGroupIds(xml) {
  let sequence = 0;
  return xml.replace(/<group\b([^>]*)>/gi, (match, attributes) => {
    if (!/\bid\s*=\s*["'][^"']*["']/i.test(attributes)) return match;
    sequence += 1;
    return `<group${attributes.replace(/\bid\s*=\s*["'][^"']*["']/i, `id="${sequence}"`)}>`;
  });
}

/**
 * The legacy engine needs a few values that older papers do not carry:
 *  - `questionPaperTotalTime` on quiz.xml drives the countdown. Without it the
 *    timer starts at null and the attempt is submitted immediately.
 *  - `CandidateResponseHandlerURL` in confDetails.xml is the endpoint used for
 *    the final submit. Without it the engine posts to quiz.html and the submit
 *    handler crashes.
 * Fill the defaults while serving so the stored paper files stay untouched.
 */
async function servePaperXml(res, pathname) {
  const hit = PAPER_XML_RE.exec(pathname);
  if (!hit) return false;

  let id;
  try {
    id = decodeURIComponent(hit[1]);
  } catch {
    return false;
  }

  const assessment = await assessmentsRepo.findById(id);
  if (!assessment) return false;

  const file = resolveWithin(config.paths.mirror, pathname);
  if (!existsSync(file)) return false;

  let xml = readFileSync(file, "utf8");
  if (hit[2].toLowerCase() === "quiz") {
    xml = normalizeGroupIds(xml);
    const duration = Math.round(Number(assessment.duration_min) || 0);
    if (duration > 0 && !/\bquestionPaperTotalTime\s*=/i.test(xml)) {
      xml = xml.replace(/<questionPaperXML\b/i, `<questionPaperXML questionPaperTotalTime="${duration}"`);
    }

    // Legacy papers store group/section/question instructions as plain text.
    // The engine splits them on <instSep> and crashes when the language prefix
    // is missing. Prefix the primary language while serving so the stored paper
    // stays byte-identical.
    const primaryLang = extractLanguages(xml).find((language) => language.primary) || { id: 1 };
    for (const tag of ["groupInstructions", "sectionInstruction", "questionInstruction"]) {
      const re = new RegExp(`(<${tag}(?:\\s[^>]*)?>)([\\s\\S]*?)(</${tag}>)`, "gi");
      xml = xml.replace(re, (match, open, inner, close) => {
        const raw = inner.trim();
        if (!raw || raw.includes("<instSep>")) return match;
        const cdata = /^<!\[CDATA\[([\s\S]*)\]\]>$/.exec(raw);
        const body = cdata ? cdata[1] : raw;
        if (!body.trim()) return match;
        return cdata
          ? `${open}<![CDATA[${primaryLang.id}<instSep>${body}]]>${close}`
          : `${open}${primaryLang.id}<instSep>${raw}${close}`;
      });
    }
  } else if (!/<CandidateResponseHandlerURL\b/i.test(xml)) {
    xml = xml.replace(/(<Details\b[^>]*>)/i, `$1\n<CandidateResponseHandlerURL>/IBA/MockCandResponseHandler</CandidateResponseHandlerURL>`);
  }

  // Legacy papers store useful-data/reference paths relative to the
  // assessment root (for example `726/ASM/.../file.pdf`) while the console
  // serves them from the versioned mirror (`/per/g03/pub/726/...`). Rewrite
  // them while serving so the embedded viewer does not request a 404.
  if (hit[2].toLowerCase() !== "quiz") {
    const prefix = String(assessment.base_path || "").match(/^(\/per\/[^/]+\/pub\/)/i)?.[1] || "";
    const orgPrefix = `${assessment.org_id}/`;
    if (prefix && orgPrefix) {
      xml = xml.replace(
        /(<(UsefulDataFile\d+|ReferenceDocumentpath)>)(\s*)([^<]*?)(\s*)(<\/\2>)/gi,
        (match, open, tag, before, value, after, close) => {
          const path = value.trim();
          if (!path || path.startsWith("/") || /^[a-z]+:\/\//i.test(path) || !path.startsWith(orgPrefix)) return match;
          return `${open}${prefix}${path}${close}`;
        },
      );
    }

    // Useful-data files are indexed by language id. Legacy papers often ship
    // only language 1 (English); when the candidate switches the paper to
    // another language the modal would otherwise stay empty.
    const primary = /<UsefulDataFile1>([^<]*)<\/UsefulDataFile1>/i.exec(xml)?.[1].trim();
    if (primary) {
      const declared = /<SoftwareLanguages>([^<]*)<\/SoftwareLanguages>/i.exec(xml)?.[1] || "";
      const languageCount = Math.max(1, declared.split(",").filter((name) => name.trim()).length);
      for (let index = 2; index <= languageCount; index += 1) {
        const empty = new RegExp(`(<UsefulDataFile${index}>)(\\s*)(</UsefulDataFile${index}>)`, "i");
        xml = xml.replace(empty, `$1${primary}$3`);
      }
    }
  }

  res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(xml);
  return true;
}

/** Fallback for the mirrored candidate console. */
async function serveMirror(res, pathname) {
  let target = pathname;
  if (!target || target === "/" || target === "/OnlineAssessment" || target === "/OnlineAssessment/") {
    target = "/index.html";
  } else if (target.startsWith("/OnlineAssessment/")) {
    target = target.slice("/OnlineAssessment".length);
  }
  if (await servePaperXml(res, target)) return true;
  return serveStatic(res, config.paths.mirror, target);
}

// Default export satisfies Vercel's module-validation pass on bundled .mjs files.
export default async function handler(req, res) {
  // On Vercel rewrites:
  // - Wildcard path parameter is injected as query param (e.g. ?_prefix=IBA&path=api/login/verify)
  // - Also check x-forwarded-uri, x-matched-path, or x-original-url
  const incomingUrl = new URL(req.url || "/", `http://${req.headers.host || config.host}`);
  let pathname = incomingUrl.pathname;

  const prefix = incomingUrl.searchParams.get("_prefix");
  const pathParam = incomingUrl.searchParams.get("path") || incomingUrl.searchParams.get("match");
  
  if (prefix && pathname === "/api") {
    pathname = `/${prefix}/${pathParam || ""}`.replace(/\/+/g, "/");
  } else if (pathParam && pathname === "/api") {
    pathname = `/api/admin/${pathParam}`.replace(/\/+/g, "/");
  } else if (pathname === "/api" || pathname === "/api/index.mjs" || pathname === "/api/index") {
    const original = req.headers["x-forwarded-uri"] || req.headers["x-original-url"];
    if (original) {
      pathname = new URL(original, "http://localhost").pathname;
    }
  }

  const url = new URL(pathname + incomingUrl.search, `http://${req.headers.host || config.host}`);

  const run = async () => {
    await ensureInit();
    if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
      return await serveAdminUi(res, pathname);
    }
    if (router.has(req.method || "GET", pathname)) {
      const { handler: route, params } = router.match(req.method || "GET", pathname);
      return await route(req, res, { url, params });
    }
    return await serveMirror(res, pathname);
  };

  return run().catch((error) => {
    // The browser aborts in-flight beacons/backups on navigation. Nothing was
    // processed and there is no socket left to answer — not an application error.
    const message = String(error?.message || "");
    if (message === "aborted" || error?.code === "ECONNRESET") return;
    return sendFromError(res, error, `${req.method} ${pathname}`);
  });
}

export { handler, router };
export const notFoundJson = (res) => sendJson(res, 404, { ok: false, error: "Not found." });
export { logger };
