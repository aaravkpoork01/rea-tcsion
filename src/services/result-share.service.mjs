// Read-only result access. A candidate opens /result.html and enters their
// Login ID (or follows a generated link that already contains the Login ID).
// The latest attempt for the requested assessment is returned with answers and
// timing. Candidate IDs and passwords are deliberately not used.
import { badRequest, notFound } from "../core/errors.mjs";
import { nowIso } from "../core/time.mjs";
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import * as responsesRepo from "../db/repositories/responses.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import { splitSelected } from "../domain/answers.mjs";
import { isObjectiveType, scoreAttempt } from "../domain/scoring.mjs";

const clean = (value) => String(value ?? "").trim();

/** Render stored HTML/XML answer bodies as compact plain text for the result page. */
const plainText = (value) => clean(value)
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

/** Find a candidate by Login ID. Candidate IDs are not accepted here. */
const resolveCandidate = async (value) => {
  const login = clean(value);
  if (!login) return null;
  return candidatesRepo.findByLogin(login);
};

/**
 * Open a result using a Login ID. When an assessment is supplied
 * (generated links include it), the latest attempt in that assessment is used.
 * Without one, a candidate who has attempts in several assessments gets a
 * small chooser instead of an arbitrary result.
 */
export async function openResult(body = {}) {
  const login = clean(body.candidateId);
  if (!login) throw badRequest("Login ID is required.");

  const candidate = await resolveCandidate(login);
  if (!candidate) throw notFound("Login ID not found. Check the Login ID and try again.");

  const assessmentId = clean(body.assessmentId);
  if (assessmentId) {
    const attempt = await attemptsRepo.findLatest(candidate.id, assessmentId);
    if (!attempt) throw notFound("No attempt found for this assessment.");
    return buildResult(attempt);
  }

  const attempts = await attemptsRepo.listByCandidate(candidate.id);
  if (!attempts.length) throw notFound("No attempts found for this candidate.");

  const assessmentIds = [...new Set(attempts.map((attempt) => attempt.assessment_id))];
  if (assessmentIds.length > 1) {
    return {
      requiresSelection: true,
      candidate: {
        id: candidate.id,
        name: candidate.name || candidate.login || candidate.id,
        login: candidate.login || "",
      },
      attempts: attempts.map((attempt) => ({
        attemptId: attempt.id,
        assessmentId: attempt.assessment_id,
        assessmentName: attempt.assessment_name || attempt.assessment_id,
        attemptNo: attempt.attempt_no,
        status: attempt.status,
        submittedAt: attempt.submitted_at || null,
      })),
    };
  }

  return buildResult(attempts[0]);
}

/** Build the complete, candidate-safe result view for one attempt. */
async function buildResult(attempt) {
  const [candidate, assessment, responses, stats] = await Promise.all([
    candidatesRepo.findById(attempt.candidate_id),
    assessmentsRepo.findById(attempt.assessment_id),
    responsesRepo.listWithQuestion(attempt.id),
    scoreAttempt(attempt.id),
  ]);

  const optionsByQuestion = new Map();
  for (const response of responses) {
    const questionId = Number(response.question_id);
    if (!optionsByQuestion.has(questionId)) {
      optionsByQuestion.set(questionId, await questionsRepo.listOptions(questionId));
    }
  }

  const total = responses.length;
  const notAttempted = Math.max(0, total - stats.answered);

  const questions = responses.map((response, index) => {
    const options = optionsByQuestion.get(Number(response.question_id)) || [];
    const selected = splitSelected(response.selected);
    const correctIds = options
      .filter((option) => Boolean(option.correct))
      .map((option) => String(option.ext_id));
    const attempted = selected.length > 0 || String(response.answer || "").trim().length > 0;

    let outcome = "not_attempted";
    if (attempted) {
      if (!isObjectiveType(response.type)) {
        outcome = "pending";
      } else {
        const isCorrect = correctIds.length > 0
          && selected.length === correctIds.length
          && selected.every((id) => correctIds.includes(String(id)));
        outcome = isCorrect && response.status !== "marked" ? "correct" : "wrong";
      }
    }

    const givenFromOptions = selected
      .map((id) => options.find((option) => String(option.ext_id) === String(id)))
      .filter(Boolean)
      .map((option) => plainText(option.body))
      .filter(Boolean);
    const textAnswer = plainText(response.answer);
    const correctAnswer = options
      .filter((option) => Boolean(option.correct))
      .map((option) => plainText(option.body))
      .filter(Boolean)
      .join(" · ");

    return {
      number: index + 1,
      extId: response.ext_id || String(response.question_id),
      group: response.group_name || "",
      section: response.section_name || "",
      type: response.type || "",
      question: plainText(response.question),
      status: outcome,
      marks: Number(response.marks) || 0,
      negativeMarks: Number(response.negative_marks) || 0,
      timeSpent: Math.max(0, Math.round(Number(response.time_spent) || 0)),
      selected,
      givenAnswer: givenFromOptions.length ? givenFromOptions.join(" · ") : (textAnswer || ""),
      correctAnswer,
      options: options.map((option) => ({
        extId: String(option.ext_id),
        text: plainText(option.body),
        correct: Boolean(option.correct),
        selected: selected.includes(String(option.ext_id)),
      })),
    };
  });

  const startedMs = Date.parse(attempt.started_at);
  const endedMs = attempt.submitted_at ? Date.parse(attempt.submitted_at) : Date.now();
  const wallSeconds = Number.isFinite(startedMs) && Number.isFinite(endedMs)
    ? Math.max(0, Math.round((endedMs - startedMs) / 1000))
    : 0;
  const questionSeconds = responses.reduce((sum, response) => sum + Math.max(0, Number(response.time_spent) || 0), 0);
  const durationSeconds = Math.max(0, Number(assessment?.duration_min) || 0) * 60;
  const timeTakenSeconds = durationSeconds > 0
    ? Math.min(wallSeconds, durationSeconds)
    : (wallSeconds || questionSeconds);

  const submitted = attempt.status === "submitted";
  const percentage = submitted
    ? Math.max(0, Number(attempt.percentage) || stats.percentage)
    : stats.percentage;

  return {
    candidate: {
      id: candidate?.id || attempt.candidate_id,
      name: candidate?.name || attempt.candidate_id,
      login: candidate?.login || "",
    },
    assessment: {
      id: attempt.assessment_id,
      name: assessment?.name || attempt.assessment_id,
      durationMinutes: Number(assessment?.duration_min) || 0,
    },
    attempt: {
      id: attempt.id,
      number: attempt.attempt_no,
      status: attempt.status,
      startedAt: attempt.started_at,
      submittedAt: attempt.submitted_at || null,
      lastSeenAt: attempt.last_seen_at || null,
      score: submitted ? (Number(attempt.score) || 0) : stats.score,
      maxScore: submitted ? (Number(attempt.max_score) || stats.maxScore) : stats.maxScore,
      percentage,
      fullscreenSeconds: Math.max(0, Math.round(Number(attempt.fullscreen_seconds) || 0)),
      fullscreenToggles: Math.max(0, Math.round(Number(attempt.fullscreen_toggle_count) || 0)),
      timeTakenSeconds,
    },
    summary: {
      total,
      answered: stats.answered,
      right: stats.correct,
      wrong: stats.wrong,
      pending: stats.pending,
      notAttempted,
      percentage,
    },
    questions,
    generatedAt: nowIso(),
  };
}
