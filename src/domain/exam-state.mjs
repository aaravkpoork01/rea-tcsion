// Exam state persistence: the client posts its whole `mockVar` snapshot; this
// module reduces it to responses + attempt columns and closes the attempt.
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as responsesRepo from "../db/repositories/responses.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";
import * as sessionsRepo from "../db/repositories/sessions.repo.mjs";
import * as metaRepo from "../db/repositories/meta.repo.mjs";

import { config } from "../../config/index.mjs";
import { nowIso } from "../core/time.mjs";
import { normaliseAnswer, normaliseSelected } from "./answers.mjs";
import { scoreAttempt } from "./scoring.mjs";

export const CLOSED_STATUSES = new Set(["submitted", "invalidated", "locked", "expired"]);

export const isClosed = (status) => CLOSED_STATUSES.has(status);

export const CLOSED_MESSAGES = {
  submitted: "Assessment has already been submitted.",
  invalidated: "Your attempt has been invalidated by admin.",
  locked: "Your attempt has been locked by admin.",
  expired: "Your attempt has expired.",
};

function countAnswered(groups) {
  let answered = 0;
  let seen = 0;
  for (const group of groups) {
    for (const section of group.secDetails || []) {
      for (const question of section.questions || []) {
        if (!question?.quesId) continue;
        seen += 1;
        const status = String(question.quesParam?.status || "notanswered");
        if (status === "answered" || status === "markedAndAnswered") answered += 1;
      }
    }
  }
  return { answered, seen };
}

/**
 * Persist a client state snapshot.
 * @param {object} attempt attempt row
 * @param {object} snapshot the client `mockVar`
 * @param {{saveState?: boolean}} [options] skip the large state blob when closing
 */
export async function persistSnapshot(attempt, snapshot, options = {}) {
  const groups = Array.isArray(snapshot.groups) ? snapshot.groups : [];
  const at = nowIso();

  // Final submit used to look up and upsert each question separately. Against
  // a remote database that meant hundreds of round-trips and could exceed the
  // serverless timeout, leaving the candidate stuck on the submit dialog.
  const known = await questionsRepo.listIdsForAssessment(attempt.assessment_id);
  const idByExt = new Map(known.map((row) => [String(row.ext_id), Number(row.id)]));

  const rows = [];
  for (const group of groups) {
    for (const section of group.secDetails || []) {
      for (const question of section.questions || []) {
        const extId = String(question.quesId ?? "");
        if (!extId) continue;
        const questionId = idByExt.get(extId);
        if (!questionId) continue;

        const params = question.quesParam || {};
        rows.push({
          attemptId: attempt.id,
          questionId,
          extId,
          status: String(params.status || "notanswered"),
          selected: normaliseSelected(params.selectedOptId),
          answer: normaliseAnswer(params.answer).slice(0, config.limits.maxAnswerBytes),
          timeSpent: Number(question.timespent ?? params.timespent ?? 0) || 0,
          updatedAt: at,
        });
      }
    }
  }

  let incomingAnswered = 0;
  for (const row of rows) {
    if (row.selected || row.answer) incomingAnswered += 1;
  }
  if (rows.length === 0) incomingAnswered = 0;
  const { answered, seen } = countAnswered(groups);

  // A blank/stale client state must never erase answers that were already
  // captured by earlier backups (this happened after reopening an attempt).
  const existing = await responsesRepo.listForScoring(attempt.id);
  const existingAnswered = existing.filter((row) =>
    String(row.selected || "").trim() || String(row.answer || "").trim()).length;
  const wouldErase = incomingAnswered === 0 && existingAnswered > 0;
  if (wouldErase) {
    await auditRepo.insert({
      attemptId: attempt.id,
      candidateId: attempt.candidate_id,
      event: "backup-ignored-empty",
      detail: `incoming answered=0, kept ${existingAnswered} saved response(s)`,
      at,
    });
  } else if (rows.length) {
    await responsesRepo.upsertMany(rows);
  }

  const currentGroup = Number(snapshot.currentGrp ?? 0) || 0;
  const clientScore = Number(snapshot.score ?? snapshot.totalScore ?? snapshot.mockScore);
  const fullscreen = Number(snapshot.fullscreenSeconds ?? snapshot.fullScreenSeconds);
  const fullscreenToggles = Number(snapshot.fullscreenToggleCount);

  const progress = {
    at,
    currentGroup,
    currentSection: Number(groups[currentGroup]?.curSection ?? 0) || 0,
    currentQuestion: Number(groups[currentGroup]?.curQues ?? 0) || 0,
    answered: wouldErase ? existingAnswered : answered,
    clientScore: Number.isFinite(clientScore) ? clientScore : null,
    fullscreenSeconds: Number.isFinite(fullscreen) ? Math.max(0, Math.round(fullscreen)) : null,
    fullscreenToggleCount: Number.isFinite(fullscreenToggles) ? Math.max(0, Math.round(fullscreenToggles)) : null,
  };

  if (options.saveState === false) {
    await attemptsRepo.saveProgress(attempt.id, progress);
  } else {
    await attemptsRepo.saveState(attempt.id, { ...progress, stateJson: JSON.stringify(snapshot) });
  }

  if (seen === 0) {
    await auditRepo.insert({
      attemptId: attempt.id,
      candidateId: attempt.candidate_id,
      event: "backup-empty",
      detail: `groups=${groups.length}`,
      at,
    });
  }

  return { answered: progress.answered, seen };
}

/**
 * Close an attempt: persist the final snapshot, score it, freeze sessions.
 * @param {number} attemptId
 * @param {object|null} snapshot final client state
 * @param {{ip?:string}} context
 * @param {string} source which endpoint triggered the close
 */
export async function finaliseAttempt(attemptId, snapshot, context = {}, source = "auto") {
  const attempt = await attemptsRepo.findById(attemptId);
  if (!attempt) return null;
  if (attempt.status !== "in_progress" && attempt.status !== "expired") return attempt;

  if (snapshot && Array.isArray(snapshot.groups)) {
    await persistSnapshot(attempt, snapshot, { saveState: false });
  }

  const result = await scoreAttempt(attempt.id);
  const at = nowIso();
  const clientScore = Number(snapshot?.score ?? snapshot?.totalScore ?? snapshot?.mockScore);

  await attemptsRepo.markSubmitted(attempt.id, {
    at,
    score: result?.score ?? 0,
    maxScore: result?.maxScore ?? 0,
    percentage: result?.percentage ?? 0,
    clientScore: Number.isFinite(clientScore) ? clientScore : null,
  });

  await sessionsRepo.expireFor("candidate", `${attempt.candidate_id}|${attempt.id}`, at);
  await auditRepo.insert({
    attemptId: attempt.id,
    candidateId: attempt.candidate_id,
    event: "submitted",
    detail: JSON.stringify({ source, ...result }),
    ip: context.ip ?? "",
    at,
  });
  await metaRepo.set("last_submission_at", at);

  return attemptsRepo.findById(attempt.id);
}
