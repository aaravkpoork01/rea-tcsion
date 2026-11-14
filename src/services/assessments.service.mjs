// Assessment lookup and the paper path helpers shared by candidate endpoints.
import { readFileSync } from "node:fs";
import { join, isAbsolute } from "node:path";

import { config } from "../../config/index.mjs";
import { notFound } from "../core/errors.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";

/**
 * Resolve an assessment by id. The legacy engine strips the leading `M` from
 * mock ids before asking for the paper path, so try the canonical `M<id>` form
 * too. Only an empty id falls back to the org's first assessment: an explicitly
 * requested but unknown id must not silently open a different paper.
 */
export async function resolveAssessment(orgId, assessmentId) {
  const id = String(assessmentId || "").trim();
  if (!id) return assessmentsRepo.findFirstForOrg(String(orgId || ""));
  return (await assessmentsRepo.findById(id))
    || (!/^M/i.test(id) ? await assessmentsRepo.findById(`M${id}`) : null);
}

export async function requireAssessment(orgId, assessmentId) {
  const assessment = await resolveAssessment(orgId, assessmentId);
  if (!assessment) throw notFound("Assessment not found.");
  return assessment;
}

export function mirrorPath(...parts) {
  return join(config.paths.mirror, ...parts);
}

/** Absolute path of the assessment's paper file. */
export function paperPath(assessment, filename) {
  const relative = String(assessment.base_path || "").replace(/^\/|\/$/g, "").split("/");
  return mirrorPath(...relative, filename);
}

export function quizXml(assessment) {
  try {
    return readFileSync(paperPath(assessment, "quiz.xml"), "utf8");
  } catch {
    return "";
  }
}

export const normaliseBasePath = (value) => {
  const trimmed = String(value || "").replace(/^\/|\/$/g, "");
  return trimmed ? `/${trimmed}/` : "";
};

export const isAbsolutePath = isAbsolute;
