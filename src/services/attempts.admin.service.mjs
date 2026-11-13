// Attempt administration: actions, live view, results.
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import * as responsesRepo from "../db/repositories/responses.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";
import * as feedbackRepo from "../db/repositories/feedback.repo.mjs";
import { scoreAttempt } from "../domain/scoring.mjs";
import { nowIso } from "../core/time.mjs";
import { badRequest, notFound } from "../core/errors.mjs";

export async function list({ status, assessmentId, term, page, pageSize, offset }) {
  const { total, rows } = await attemptsRepo.search({ status, assessmentId, term, limit: pageSize, offset });
  return { total, page, pageSize, attempts: rows };
}

export async function detail(id) {
  const attempt = await attemptsRepo.findById(id);
  if (!attempt) throw notFound("Attempt not found.");

  const responses = await responsesRepo.listWithQuestion(id);
  const options = {};
  for (const response of responses) {
    options[response.question_id] = await questionsRepo.listOptions(response.question_id);
  }

  return {
    attempt,
    candidate: await candidatesRepo.listBrief(attempt.candidate_id),
    assessment: await assessmentsRepo.findById(attempt.assessment_id),
    responses,
    options,
    audit: await auditRepo.listForAttempt(id),
    feedback: await feedbackRepo.listForAttempt(id),
  };
}

export async function remove(id) {
  if (!await attemptsRepo.findById(id)) throw notFound("Attempt not found.");
  await attemptsRepo.remove(id);
}

const actionAudit = async (attempt, event, detail, actor, ip) =>
  auditRepo.insert({
    attemptId: attempt.id,
    candidateId: attempt.candidate_id,
    event,
    detail: `${detail}${actor ? ` by ${actor}` : ""}`,
    ip: ip ?? "",
    at: nowIso(),
  });

/** Apply an admin action to an attempt. */
export async function act(id, action, { actor, ip, minutes }) {
  const attempt = await attemptsRepo.findById(id);
  if (!attempt) throw notFound("Attempt not found.");

  switch (action) {
    case "force-submit": {
      const result = await scoreAttempt(id);
      await attemptsRepo.markSubmitted(id, {
        at: nowIso(),
        score: result?.score ?? 0,
        maxScore: result?.maxScore ?? 0,
        percentage: result?.percentage ?? 0,
        clientScore: null,
      });
      await actionAudit(attempt, "admin_force_submit", "forced", actor, ip);
      return { result };
    }
    case "invalidate":
      await attemptsRepo.setStatus(id, "invalidated");
      await actionAudit(attempt, "admin_invalidate", "invalidated", actor, ip);
      return {};
    case "lock":
      await attemptsRepo.setStatus(id, "locked");
      await actionAudit(attempt, "admin_lock", "locked", actor, ip);
      return {};
    case "unlock":
    case "reopen":
      await attemptsRepo.setStatus(id, "in_progress");
      await actionAudit(attempt, "admin_reopen", "reopened", actor, ip);
      return {};
    case "extend": {
      const extra = Math.max(0, Number(minutes || 0));
      await actionAudit(attempt, "admin_extend", `+${extra} minutes`, actor, ip);
      return { minutes: extra };
    }
    default:
      throw badRequest(`Unknown attempt action: ${action}`);
  }
}

export const live = async () => attemptsRepo.listLive();
export const results = async (filters = {}) => attemptsRepo.listResults(filters);
