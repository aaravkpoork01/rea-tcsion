// Attempt lifecycle for candidate logins.
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";
import * as structureRepo from "../db/repositories/structure.repo.mjs";
import { nowIso } from "../core/time.mjs";
import { forbidden, notFound } from "../core/errors.mjs";

/** Return the open attempt for the pair, creating a fresh one when allowed. */
export async function openAttempt({ candidate, assessment, context = {} }) {
  const existing = await attemptsRepo.findInProgress(candidate.id, assessment.id);
  if (existing) return { attempt: existing, resumed: true };

  const used = await attemptsRepo.countFor(candidate.id, assessment.id);
  if (assessment.max_attempts > 0 && used >= assessment.max_attempts) {
    throw forbidden(`You have used all ${assessment.max_attempts} attempt(s) for this assessment.`);
  }

  const created = await attemptsRepo.create({
    assessmentId: assessment.id,
    candidateId: candidate.id,
    attemptNo: used + 1,
    status: "in_progress",
    startedAt: nowIso(),
    lastSeenAt: nowIso(),
    totalQuestions: await structureRepo.countQuestions(assessment.id),
    ip: context.ip ?? "",
    userAgent: String(context.userAgent ?? "").slice(0, 400),
  });

  const attempt = await attemptsRepo.findById(Number(created.lastInsertRowid));
  await auditRepo.insert({
    attemptId: attempt.id,
    candidateId: candidate.id,
    event: "attempt_started",
    detail: `attempt ${attempt.attempt_no}`,
    ip: context.ip ?? "",
    at: nowIso(),
  });
  return { attempt, resumed: false };
}

export async function markSeen(candidateId, attemptId) {
  await candidatesRepo.touchLogin(candidateId, nowIso());
  await attemptsRepo.touch(attemptId, nowIso());
}

/** Locate the attempt referenced by a query/session/candidate id, in that order. */
export async function resolveAttemptForState({ attemptId, candidateId, assessmentId, session }) {
  if (attemptId && candidateId && assessmentId) {
    const exact = await attemptsRepo.findByIdForCandidate(attemptId, candidateId, assessmentId);
    if (exact) return exact;
  }
  if (session?.attemptId) {
    const bySession = await attemptsRepo.findById(session.attemptId);
    if (bySession) return bySession;
  }
  if (candidateId && assessmentId) return attemptsRepo.findLatest(candidateId, assessmentId);
  return null;
}

/** Resolve the attempt a snapshot belongs to (autosave path). */
export async function resolveAttemptForSnapshot(snapshot, session) {
  const attemptId = Number(snapshot?.attemptId || session?.attemptId || 0);
  if (attemptId) {
    const row = await attemptsRepo.findById(attemptId);
    if (row) return row;
  }
  const candidateId = snapshot?.candMasterId || session?.candidateId;
  return candidateId ? attemptsRepo.findLatestForCandidate(candidateId) : null;
}

export async function requireAttempt(id) {
  const attempt = await attemptsRepo.findById(Number(id));
  if (!attempt) throw notFound("Attempt not found.");
  return attempt;
}
