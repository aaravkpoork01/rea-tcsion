// Admin API routes. Every route below `/api/admin` is session-guarded.
import { cookies, clearCookie, serialiseCookie } from "../cookies.mjs";
import { readJson } from "../body.mjs";
import { sendCsv, sendJson, sendOk, sendCreated } from "../respond.mjs";
import { requireAdmin } from "../../services/auth.service.mjs";
import * as authService from "../../services/auth.service.mjs";
import * as overviewService from "../../services/overview.service.mjs";
import * as assessmentsService from "../../services/assessments.admin.service.mjs";
import * as candidatesService from "../../services/candidates.service.mjs";
import * as candidateGroupsService from "../../services/candidate-groups.service.mjs";
import * as attemptsAdmin from "../../services/attempts.admin.service.mjs";
import * as feedbackService from "../../services/feedback.service.mjs";
import * as settingsService from "../../services/settings.service.mjs";
import * as reportService from "../../services/report.service.mjs";
import * as auditRepo from "../../db/repositories/audit.repo.mjs";
import * as orgsRepo from "../../db/repositories/orgs.repo.mjs";
import { config } from "../../../config/index.mjs";

const ADMIN_COOKIE = authService.COOKIE_NAMES.admin;

const pageParams = (url) => {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(200, Math.max(5, Number(url.searchParams.get("pageSize") || 25)));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
};

const adminCookie = (token, maxAge) => ({
  "Set-Cookie": serialiseCookie(ADMIN_COOKIE, token, { maxAge, httpOnly: true }),
});

export function registerAdminRoutes(router) {
  // ---- session -------------------------------------------------------------
  router.post("/api/admin/login", async (req, res) => {
    const body = await readJson(req);
    const { token, admin } = await authService.loginAdmin(body);
    return sendOk(res, { admin: authService.publicAdmin(admin) }, adminCookie(token, config.session.adminTtlSec));
  });

  router.post("/api/admin/logout", async (req, res) => {
    await authService.logoutAdmin(cookies(req)[ADMIN_COOKIE]);
    return sendOk(res, {}, { "Set-Cookie": clearCookie(ADMIN_COOKIE) });
  });

  router.get("/api/admin/me", async (req, res) => {
    const admin = await requireAdmin(cookies(req)[ADMIN_COOKIE]);
    return sendOk(res, { admin: authService.publicAdmin(admin) });
  });

  // ---- guarded routes ------------------------------------------------------
  const guarded = [
    router.get.bind(router),
    router.post.bind(router),
    router.put.bind(router),
    router.delete.bind(router),
  ];

  const auth = (handler) => async (req, res, match) => {
    const admin = await requireAdmin(cookies(req)[ADMIN_COOKIE]);
    return handler(req, res, match, admin);
  };

  guarded[2]("/api/admin/me", auth(async (req, res, _match, admin) => {
    const updated = await authService.updateAdminProfile(admin, await readJson(req));
    return sendOk(res, { admin: authService.publicAdmin(updated) });
  }));

  guarded[0]("/api/admin/admins", auth(async (_req, res) =>
    sendOk(res, { admins: await authService.listAdmins() })));
  guarded[1]("/api/admin/admins", auth(async (req, res) => {
    const admin = await authService.createAdmin(await readJson(req));
    return sendCreated(res, { admin: authService.publicAdmin(admin) });
  }));

  guarded[0]("/api/admin/overview", auth(async (_req, res) => sendOk(res, await overviewService.overview())));

  guarded[0]("/api/admin/assessments", auth(async (_req, res) => sendOk(res, { assessments: await assessmentsService.list() })));
  guarded[1]("/api/admin/assessments", auth(async (req, res) => {
    const result = await assessmentsService.create(await readJson(req));
    return sendCreated(res, result);
  }));
  guarded[1]("/api/admin/assessments/import", auth(async (req, res) =>
    sendOk(res, await assessmentsService.importAssessmentsCsv(await readJson(req)))));
  guarded[0]("/api/admin/assessments/:id", auth(async (_req, res, { params }) => sendOk(res, await assessmentsService.get(params.id))));
  guarded[2]("/api/admin/assessments/:id", auth(async (req, res, { params }) =>
    sendOk(res, { assessment: await assessmentsService.update(params.id, await readJson(req)) })));
  guarded[3]("/api/admin/assessments/:id", auth(async (_req, res, { params }) => {
    await assessmentsService.remove(params.id);
    return sendOk(res);
  }));
  guarded[1]("/api/admin/assessments/:id/import", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.importFrom(await readJson(req), params.id))));
  guarded[1]("/api/admin/assessments/:id/papers", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.uploadPapers(await readJson(req), params.id))));
  guarded[1]("/api/admin/assessments/:id/questions/import", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.importQuestionsCsv(params.id, await readJson(req)))));
  guarded[3]("/api/admin/assessments/:id/questions", auth(async (_req, res, { params }) =>
    sendOk(res, await assessmentsService.removeAllQuestions(params.id))));
  guarded[1]("/api/admin/assessments/:id/groups", auth(async (req, res, { params }) =>
    sendCreated(res, { group: await assessmentsService.createAssessmentGroup(params.id, await readJson(req)) })));
  guarded[1]("/api/admin/assessments/:id/sections", auth(async (req, res, { params }) =>
    sendCreated(res, { section: await assessmentsService.createAssessmentSection(params.id, await readJson(req)) })));
  guarded[2]("/api/admin/groups/:id", auth(async (req, res, { params }) =>
    sendOk(res, { group: await assessmentsService.updateAssessmentGroup(Number(params.id), await readJson(req)) })));
  guarded[3]("/api/admin/groups/:id", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.removeAssessmentGroup(Number(params.id), await readJson(req)))));
  guarded[2]("/api/admin/sections/:id", auth(async (req, res, { params }) =>
    sendOk(res, { section: await assessmentsService.updateAssessmentSection(Number(params.id), await readJson(req)) })));
  guarded[3]("/api/admin/sections/:id", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.removeAssessmentSection(Number(params.id), await readJson(req)))));

  guarded[0]("/api/admin/assessments/:id/presentation", auth(async (_req, res, { params }) =>
    sendOk(res, await settingsService.assessmentPresentation(params.id))));
  guarded[2]("/api/admin/assessments/:id/presentation", auth(async (req, res, { params }) =>
    sendOk(res, await settingsService.updateAssessmentPresentation(params.id, await readJson(req)))));
  guarded[3]("/api/admin/assessments/:id/presentation", auth(async (req, res, { params }) =>
    sendOk(res, await settingsService.resetAssessmentPresentation(params.id, await readJson(req)))));

  guarded[0]("/api/admin/assessments/:id/instructions", auth(async (_req, res, { params }) =>
    sendOk(res, await assessmentsService.getInstructions(params.id))));
  guarded[2]("/api/admin/assessments/:id/instructions", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.updateInstructions(params.id, await readJson(req)))));

  guarded[2]("/api/admin/assessments/:id/languages", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.updateLanguages(params.id, await readJson(req)))));

  guarded[0]("/api/admin/assessments/:id/useful-data", auth(async (_req, res, { params }) =>
    sendOk(res, await assessmentsService.getUsefulData(params.id))));
  guarded[1]("/api/admin/assessments/:id/useful-data/upload", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.uploadUsefulDataFile(params.id, await readJson(req)))));
  guarded[2]("/api/admin/assessments/:id/useful-data", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.updateUsefulData(params.id, await readJson(req)))));

  guarded[0]("/api/admin/assessments/:id/question-instructions", auth(async (_req, res, { params }) =>
    sendOk(res, await assessmentsService.getQuestionInstructions(params.id))));
  guarded[2]("/api/admin/assessments/:id/question-instructions", auth(async (req, res, { params }) =>
    sendOk(res, await assessmentsService.updateQuestionInstructions(params.id, await readJson(req)))));

  guarded[0]("/api/admin/assessments/:id/paper-preview", auth(async (_req, res, { params }) =>
    sendOk(res, await assessmentsService.getPaperPreview(params.id))));

  guarded[0]("/api/admin/assessments/:id/candidate-groups", auth(async (_req, res, { params }) =>
    sendOk(res, await candidateGroupsService.forAssessment(params.id))));
  guarded[2]("/api/admin/assessments/:id/candidate-groups", auth(async (req, res, { params }) =>
    sendOk(res, await candidateGroupsService.setForAssessment(params.id, await readJson(req)))));

  guarded[0]("/api/admin/questions", auth(async (_req, res, match) => {
    const { page, pageSize, offset } = pageParams(match.url);
    return sendOk(res, await assessmentsService.listQuestions({
      assessmentId: match.url.searchParams.get("assessment") || "",
      sectionId: Number(match.url.searchParams.get("section") || 0),
      langId: Number(match.url.searchParams.get("lang") || 0),
      term: (match.url.searchParams.get("q") || "").trim(),
      page, pageSize, offset,
    }));
  }));
  guarded[0]("/api/admin/questions/:id", auth(async (_req, res, match) =>
    sendOk(res, await assessmentsService.getQuestion(
      Number(match.params.id),
      Number(match.url.searchParams.get("lang") || 0),
    ))));
  guarded[2]("/api/admin/questions/:id", auth(async (req, res, { params }) =>
    sendOk(res, { question: await assessmentsService.updateQuestion(Number(params.id), await readJson(req)) })));
  guarded[1]("/api/admin/questions/reorder", auth(async (req, res) => {
    const body = await readJson(req);
    return sendOk(res, await assessmentsService.reorderQuestions(body.assessmentId, body.ids));
  }));
  guarded[3]("/api/admin/questions/:id", auth(async (_req, res, { params }) =>
    sendOk(res, await assessmentsService.removeQuestion(Number(params.id)))));

  guarded[0]("/api/admin/candidates", auth(async (_req, res, match) => {
    const { page, pageSize, offset } = pageParams(match.url);
    return sendOk(res, await candidatesService.list({ term: (match.url.searchParams.get("q") || "").trim(), page, pageSize, offset }));
  }));
  guarded[1]("/api/admin/candidates", auth(async (req, res) => sendCreated(res, { candidate: await candidatesService.create(await readJson(req)) })));
  guarded[1]("/api/admin/candidates/import", auth(async (req, res) => sendOk(res, await candidatesService.importCsv(await readJson(req)))));
  guarded[0]("/api/admin/candidates/check-login", auth(async (_req, res, match) =>
    sendOk(res, await candidatesService.loginAvailable(
      match.url.searchParams.get("login") || "",
      match.url.searchParams.get("exclude") || "",
    ))));
  guarded[0]("/api/admin/candidates/check-id", auth(async (_req, res, match) =>
    sendOk(res, await candidatesService.candidateIdAvailable(match.url.searchParams.get("id") || ""))));
  guarded[0]("/api/admin/candidates/:id", auth(async (_req, res, { params }) => sendOk(res, await candidatesService.get(params.id))));
  guarded[2]("/api/admin/candidates/:id", auth(async (req, res, { params }) => sendOk(res, { candidate: await candidatesService.update(params.id, await readJson(req)) })));
  guarded[3]("/api/admin/candidates/:id", auth(async (_req, res, { params }) => {
    await candidatesService.remove(params.id);
    return sendOk(res);
  }));
  guarded[1]("/api/admin/candidates/:id/reset-password", auth(async (req, res, { params }) => {
    await candidatesService.resetPassword(params.id, (await readJson(req)).password);
    return sendOk(res);
  }));

  guarded[0]("/api/admin/candidate-groups", auth(async (_req, res) =>
    sendOk(res, await candidateGroupsService.list())));
  guarded[1]("/api/admin/candidate-groups", auth(async (req, res) =>
    sendCreated(res, { group: await candidateGroupsService.create(await readJson(req)) })));
  guarded[0]("/api/admin/candidate-groups/:id", auth(async (_req, res, { params }) =>
    sendOk(res, await candidateGroupsService.getWithMembers(params.id))));
  guarded[2]("/api/admin/candidate-groups/:id", auth(async (req, res, { params }) =>
    sendOk(res, { group: await candidateGroupsService.update(params.id, await readJson(req)) })));
  guarded[3]("/api/admin/candidate-groups/:id", auth(async (_req, res, { params }) => {
    await candidateGroupsService.remove(params.id);
    return sendOk(res);
  }));

  guarded[0]("/api/admin/attempts", auth(async (_req, res, match) => {
    const { page, pageSize, offset } = pageParams(match.url);
    return sendOk(res, await attemptsAdmin.list({
      status: (match.url.searchParams.get("status") || "").trim(),
      assessmentId: (match.url.searchParams.get("assessment") || "").trim(),
      term: (match.url.searchParams.get("q") || "").trim(),
      page, pageSize, offset,
    }));
  }));
  guarded[0]("/api/admin/attempts/:id", auth(async (_req, res, { params }) => sendOk(res, await attemptsAdmin.detail(Number(params.id)))));
  guarded[3]("/api/admin/attempts/:id", auth(async (_req, res, { params }) => {
    await attemptsAdmin.remove(Number(params.id));
    return sendOk(res);
  }));
  guarded[1]("/api/admin/attempts/:id/:action", auth(async (req, res, { params }) => {
    const body = await readJson(req);
    const admin = await adminOf(req);
    return sendOk(res, await attemptsAdmin.act(Number(params.id), params.action, {
      actor: admin.username,
      ip: req.socket?.remoteAddress || req.headers["x-forwarded-for"] || "",
      minutes: body.minutes,
    }));
  }));

  guarded[0]("/api/admin/live", auth(async (_req, res) => sendOk(res, { live: await attemptsAdmin.live(), serverTime: new Date().toISOString() })));
  guarded[0]("/api/admin/results", auth(async (_req, res, match) =>
    sendOk(res, {
      results: await attemptsAdmin.results({
        assessmentId: (match.url.searchParams.get("assessment") || "").trim(),
        status: (match.url.searchParams.get("status") || "submitted").trim(),
      }),
    })));
  guarded[0]("/api/admin/feedback", auth(async (_req, res) =>
    sendOk(res, { feedback: await feedbackService.recent(200), summary: await feedbackService.summary() })));

  guarded[0]("/api/admin/audit", auth(async (_req, res, match) => {
    const attemptId = Number(match.url.searchParams.get("attempt") || 0);
    const { pageSize } = pageParams(match.url);
    const audit = attemptId ? await auditRepo.listForAttempt(attemptId, pageSize) : await auditRepo.listRecent(pageSize);
    return sendOk(res, { audit });
  }));

  guarded[0]("/api/admin/orgs", auth(async (_req, res) => sendOk(res, { orgs: await orgsRepo.list() })));

  guarded[0]("/api/admin/settings", auth(async (_req, res) => sendOk(res, { settings: await settingsService.all() })));
  guarded[2]("/api/admin/settings", auth(async (req, res) => sendOk(res, { settings: await settingsService.update(await readJson(req)) })));

  guarded[0]("/api/admin/settings/instructions", auth(async (_req, res) => sendOk(res, await assessmentsService.getGlobalInstructions())));
  guarded[2]("/api/admin/settings/instructions", auth(async (req, res) => sendOk(res, await assessmentsService.updateGlobalInstructions(await readJson(req)))));

  guarded[0]("/api/admin/export/results.csv", auth(async (_req, res, match) => {
    const assessmentId = (match.url.searchParams.get("assessment") || "").trim();
    const status = (match.url.searchParams.get("status") || "").trim();
    const scope = `${assessmentId || "all"}-${status || "all"}`;
    return sendCsv(res, `results-${scope}.csv`, await reportService.resultsCsv({ assessmentId, status }));
  }));
  guarded[0]("/api/admin/export/attempts.csv", auth(async (_req, res, match) => {
    const assessmentId = (match.url.searchParams.get("assessment") || "").trim();
    const status = (match.url.searchParams.get("status") || "").trim();
    const scope = `${assessmentId || "all"}-${status || "all"}`;
    return sendCsv(res, `attempts-${scope}.csv`, await reportService.resultsCsv({ assessmentId, status }));
  }));
  guarded[0]("/api/admin/export/assessments.csv", auth(async (_req, res) => sendCsv(res, "assessments.csv", await reportService.assessmentsCsv())));
  guarded[0]("/api/admin/export/feedback.csv", auth(async (_req, res) => sendCsv(res, "feedback.csv", await reportService.feedbackCsv())));
  guarded[0]("/api/admin/export/candidates.csv", auth(async (_req, res) => sendCsv(res, "candidates.csv", await reportService.candidatesCsv())));
  guarded[0]("/api/admin/export/audit.csv", auth(async (_req, res) => sendCsv(res, "audit.csv", await reportService.auditCsv())));
  guarded[0]("/api/admin/export/questions.csv", auth(async (_req, res, match) => {
    const assessmentId = (match.url.searchParams.get("assessment") || "").trim();
    return sendCsv(res, `questions-${assessmentId || "all"}.csv`, await reportService.questionsCsv(assessmentId));
  }));

  router.get("/api/admin/health", (_req, res) => sendJson(res, 200, { ok: true, uptime: process.uptime() }));
}

async function adminOf(req) {
  const admin = await authService.adminFromToken(cookies(req)[ADMIN_COOKIE]);
  return admin || { username: "system" };
}
