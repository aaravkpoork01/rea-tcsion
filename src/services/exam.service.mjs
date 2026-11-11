// Candidate exam API behaviour: login, iON action endpoints, state backup.
import { addSeconds, nowIso } from "../core/time.mjs";
import { badRequest, unauthorized } from "../core/errors.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import { config } from "../../config/index.mjs";
import { average, collectRatings } from "../domain/answers.mjs";
import { finaliseAttempt, isClosed, CLOSED_MESSAGES, persistSnapshot } from "../domain/exam-state.mjs";
import * as assessmentsService from "./assessments.service.mjs";
import { paperPath } from "./assessments.service.mjs";
import * as attemptsService from "./attempts.service.mjs";
import * as authService from "./auth.service.mjs";
import * as feedbackService from "./feedback.service.mjs";
import * as translationsRepo from "../db/repositories/translations.repo.mjs";
import * as candidateGroupsService from "./candidate-groups.service.mjs";
import { extractLanguages } from "../domain/paper-languages.mjs";
import { statSync } from "node:fs";

const PAPER_FILES = ["quiz.xml", "confDetails.xml", "sysInstructions.xml", "custInstructions.xml"];

/** Paper revision: newest paper-file mtime, used to bust the browser XML cache. */
function paperRevision(assessment) {
  let stamp = Date.parse(assessment.created_at) || Date.now();
  for (const name of PAPER_FILES) {
    try {
      stamp = Math.max(stamp, statSync(paperPath(assessment, name)).mtimeMs);
    } catch {}
  }
  return Math.round(stamp);
}

const SESSION_COOKIES = (candidate, assessment, attempt, resumed, languages) => {
  const primary = languages.find((language) => language.primary) || languages[0] || { id: 1, name: "English" };
  const qpLanguages = languages.map((language) => `${language.name}#${language.id}`).join(",");
  return [
    { name: authService.COOKIE_NAMES.candidate, value: "", httpOnly: true },
    { name: "cand_master_id", value: candidate.id },
    { name: "candidate_Id", value: candidate.id },
    { name: "app_seq_no", value: candidate.id },
    { name: "username", value: candidate.name },
    { name: "loginId", value: candidate.login },
    { name: "attemptId", value: String(attempt.id) },
    { name: "orgId", value: assessment.org_id },
    { name: "assessmentId", value: assessment.id },
    { name: "qp_id", value: assessment.id },
    { name: "defaultLang", value: String(primary.id) },
    { name: "isOnline", value: "1" },
    { name: "viewLangName", value: primary.name },
    { name: "qpLanguages", value: qpLanguages },
    { name: "duration", value: String(assessment.duration_min || 0) },
    { name: "questionCount", value: String(attempt.total_questions || 0) },
    { name: "subscribed_for", value: "" },
    { name: "isResumed", value: resumed ? "1" : "0" },
    { name: "candidateExtraTime", value: "0" },
    { name: "noOfInterruptions", value: "0" },
  ];
};

/** Paper languages: imported rows first, quiz.xml declarations as fallback. */
async function assessmentLanguages(assessment) {
  const rows = await translationsRepo.listAssessmentLanguages(assessment.id);
  const fromDb = rows
    .map((row) => ({ id: Number(row.lang_id), name: row.name, primary: Number(row.is_primary) === 1 }))
    .filter((language) => Number.isFinite(language.id) && language.id > 0 && language.name);
  if (fromDb.length) return fromDb;

  const declared = extractLanguages(assessmentsService.quizXml(assessment));
  return declared.length ? declared : [{ id: 1, name: "English", primary: true }];
}


const candidatePayload = (candidate) => ({
  id: candidate.id,
  mockCandId: candidate.id,
  name: candidate.name,
  login: candidate.login,
  email: candidate.email,
  systemName: candidate.system_name || "",
  photo: candidate.photo || "",
});

/** Full candidate sign-in: validate, open/resume the attempt, mint session cookies. */
export async function signIn({ orgId, assessmentId, login, password, context = {} }) {
  if (!String(login || "").trim()) throw badRequest("Login ID is required.");

  const assessment = await assessmentsService.requireAssessment(orgId, assessmentId);
  if (assessment.status !== "active") throw unauthorized("This assessment is not active.");

  const candidate = await authService.checkCandidateCredentials(login, password);
  await candidateGroupsService.assertEligible(assessment.id, candidate);
  const { attempt } = await attemptsService.openAttempt({ candidate, assessment, context });
  await attemptsService.markSeen(candidate.id, attempt.id);

  const token = await authService.loginCandidate(candidate.id, attempt.id);
  await auditRepo.insert({
    attemptId: attempt.id,
    candidateId: candidate.id,
    event: "login",
    detail: `attempt ${attempt.attempt_no}`,
    ip: context.ip ?? "",
    at: nowIso(),
  });

  const resumed = Boolean(attempt.state_json);
  const languages = await assessmentLanguages(assessment);
  const primary = languages.find((language) => language.primary) || languages[0];
  const cookies = SESSION_COOKIES(candidate, assessment, attempt, resumed, languages).map((item) => ({
    ...item,
    maxAge: config.session.candidateTtlSec,
  }));
  cookies[0].value = token;

  return {
    payload: {
      // Public candidate identifier shown on the console and used by admins.
      // Same value as candidate.id so the two surfaces cannot drift apart.
      mockCandId: candidate.id,
      candidate: candidatePayload(candidate),
      attempt: {
        id: attempt.id,
        attemptNo: attempt.attempt_no,
        status: attempt.status,
        resumed,
        score: attempt.score,
      },
      assessment: {
        id: assessment.id,
        orgId: assessment.org_id,
        name: assessment.name,
        basePath: assessment.base_path,
        durationMin: assessment.duration_min,
        showFeedback: assessment.show_feedback,
        enableFullscreen: Boolean(assessment.enable_fullscreen ?? assessment.require_fullscreen),
        requireFullscreen: Boolean(assessment.enable_fullscreen ? assessment.require_fullscreen : false),
        trackFullscreen: Boolean(assessment.enable_fullscreen ? (assessment.track_fullscreen ?? 1) : false),
        questions: attempt.total_questions,
        duration: assessment.duration_min,
        questionCount: attempt.total_questions,
        // The candidate console stores this so the instructions page can
        // repopulate the paper-language picker (top.js reads sessionStorage).
        languages: languages.map((language) => `${language.name}#${language.id}`).join(","),
        primaryLanguage: { id: primary.id, name: primary.name },
      },
    },
    cookies,
  };
}

/**
 * Login-page verification step: confirm the credentials and return the identity
 * panel data without opening an attempt, writing cookies or auditing a login.
 */
export async function verifySignIn({ orgId, assessmentId, login, password }) {
  if (!String(login || "").trim()) throw badRequest("Login ID is required.");

  const assessment = await assessmentsService.requireAssessment(orgId, assessmentId);
  if (assessment.status !== "active") throw unauthorized("This assessment is not active.");

  const candidate = await authService.checkCandidateCredentials(login, password);
  await candidateGroupsService.assertEligible(assessment.id, candidate);
  return {
    candidate: candidatePayload(candidate),
    assessment: { id: assessment.id, orgId: assessment.org_id, name: assessment.name },
  };
}

/** `getXMLPath` — tiny config probe the engine makes before loading the quiz. */
export async function xmlPathDescriptor(orgId, assessmentId) {
  const assessment = await assessmentsService.resolveAssessment(orgId, assessmentId);
  if (!assessment) return { validity: "Expired" };

  const base = assessment.base_path.endsWith("/") ? assessment.base_path : `${assessment.base_path}/`;
  const stamp = paperRevision(assessment);
  return {
    RequiredData: `${assessment.id}@@${assessment.org_id}@@static@@0@@0`,
    hasCustLangXml: "false",
    cdnPath: "",
    xmlProcFilePath: { quizPath: `${base}quiz.xml`, confPath: `${base}confDetails.xml` },
    xmlPath: base,
    validity: assessment.status === "active" ? "Live" : "Expired",
    version: "17.07.00",
    lastModified: String(stamp),
    custJsonLastModified: String(stamp),
    lastLangModified: String(stamp),
  };
}

/** `getCandidateData` — resume payload for an existing attempt. */
export async function candidateData({ orgId, assessmentId, candidateId, attemptNo, session }) {
  const assessment = await assessmentsService.resolveAssessment(orgId, assessmentId);
  if (!assessment) return { Error: "Assessment not found." };

  const attempt = await attemptsService.resolveAttemptForState({
    attemptId: /^\d+$/.test(attemptNo) ? Number(attemptNo) : 0,
    candidateId: candidateId || session?.candidateId,
    assessmentId: assessment.id,
    session,
  });
  if (!attempt) return {};

  await attemptsRepo.touch(attempt.id, nowIso());

  if (isClosed(attempt.status)) return { Error: CLOSED_MESSAGES[attempt.status] };
  if (attempt.state_json) {
    return { ResponseType: "CAND", Response: attempt.state_json, quesPaper: assessmentsService.quizXml(assessment) };
  }
  return { attemptId: attempt.id, resumed: false };
}

/** Auditing endpoints the engine posts to. */
export async function recordInterruption({ attemptNo, interruptions, status, ip }) {
  if (!attemptNo) return;
  await auditRepo.insert({
    attemptId: Number(attemptNo),
    candidateId: null,
    event: "interruptions",
    detail: `interruptions=${interruptions} status=${status}`,
    ip: ip ?? "",
    at: nowIso(),
  });
}

export async function persistAuditPayload(raw, attempt, ip) {
  if (!raw) return 0;
  let parsed;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return 0;
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  let written = 0;
  for (const entry of entries.slice(0, config.limits.maxAuditEntries)) {
    if (!entry || typeof entry !== "object") continue;
    await auditRepo.insert({
      attemptId: attempt?.id ?? null,
      candidateId: attempt?.candidate_id ?? null,
      event: String(entry.event || entry.Event || entry.type || "audit").slice(0, 120),
      detail: JSON.stringify(entry),
      ip: ip ?? "",
      at: nowIso(),
    });
    written += 1;
  }
  return written;
}

/** `MockCandResponseHandler` — periodic state backup and final hand-off. */
export async function handleBackup({ snapshot, isFinal, ip, session }) {
  const attempt = await attemptsService.resolveAttemptForSnapshot(snapshot, session);
  if (!attempt) {
    return { BackUpStatus: "success", attemptConfigFileDate: Date.now() };
  }

  if (isClosed(attempt.status) && !isFinal) {
    return {
      BackUpStatus: "success",
      ERROR: attempt.status === "submitted" ? CLOSED_MESSAGES.submitted : undefined,
      attemptConfigFileDate: Date.now(),
    };
  }

  await persistSnapshot(attempt, snapshot ?? {});

  if (isFinal) {
    await finaliseAttempt(attempt.id, snapshot, { ip }, "backup-final");
    return {
      BackUpStatus: "success",
      ERROR: "Assessment has been submitted successfully.",
      hasNotEvaluatedQuestions: false,
      attemptConfigFileDate: Date.now(),
      quizPageLaunchTime: Date.now(),
    };
  }

  return {
    BackUpStatus: "success",
    attemptConfigFileDate: Date.now(),
    quizPageLaunchTime: Date.now(),
  };
}

/** Bridge-triggered finalisation. */
export async function finalise({ snapshot, ip, session }) {
  const attempt = await attemptsService.resolveAttemptForSnapshot(snapshot, session);
  if (!attempt) return null;
  return finaliseAttempt(attempt.id, snapshot, { ip }, "bridge");
}

/** Last persisted snapshot for the signed-in attempt, used by the client resume overlay. */
export async function currentState({ session }) {
  if (!session?.attemptId) return { resumed: false, snapshot: null };
  const attempt = await attemptsRepo.findById(Number(session.attemptId));
  if (!attempt) return { resumed: false, snapshot: null };

  let snapshot = null;
  if (attempt.state_json) {
    try {
      snapshot = JSON.parse(attempt.state_json);
    } catch {
      snapshot = null;
    }
  }

  const assessment = await assessmentsService.resolveAssessment("", attempt.assessment_id);

  return {
    resumed: Boolean(snapshot),
    attemptId: attempt.id,
    status: attempt.status,
    answered: attempt.answered,
    updatedAt: attempt.last_seen_at,
    enableFullscreen: Boolean(assessment?.enable_fullscreen ?? assessment?.require_fullscreen),
    requireFullscreen: Boolean(assessment?.enable_fullscreen ? assessment?.require_fullscreen : false),
    trackFullscreen: Boolean(assessment?.enable_fullscreen ? (assessment?.track_fullscreen ?? 1) : false),
    fullscreenSeconds: Number(attempt.fullscreen_seconds) || 0,
    fullscreenToggleCount: Number(attempt.fullscreen_toggle_count) || 0,
    snapshot,
  };
}

/** Feedback submission (rating derived from the answers). */
export async function saveFeedback({ payload, attemptId, candidateId, ip, session }) {
  const resolvedAttempt = Number(attemptId) || session?.attemptId || null;
  const parsed = (() => {
    if (typeof payload !== "string") return payload ?? {};
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  })();

  const rating = average(collectRatings(parsed));

  return feedbackService.save({
    attemptId: resolvedAttempt,
    candidateId: candidateId || session?.candidateId || null,
    payload: parsed,
    rating,
    ip,
  });
}

export const submitConfirmation = () => "Your assessment has been submitted successfully.";

export async function raceGuard(attempt) {
  if (!attempt) return false;
  return isClosed(attempt.status);
}

export const sessionExpiry = (hours = 12) => addSeconds(hours * 3600);

export { questionsRepo };
