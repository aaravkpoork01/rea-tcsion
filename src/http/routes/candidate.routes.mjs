// Candidate-facing routes: the iON-compatible API surface.
import { config } from "../../../config/index.mjs";
import { readJson, readParams, readRaw } from "../body.mjs";
import { cookies, clearCookie, serialiseCookie } from "../cookies.mjs";
import { sendJson, sendOk, sendText } from "../respond.mjs";
import { requireAdmin } from "../../services/auth.service.mjs";
import * as authService from "../../services/auth.service.mjs";
import * as examService from "../../services/exam.service.mjs";
import * as settingsService from "../../services/settings.service.mjs";
import * as candidatesRepo from "../../db/repositories/candidates.repo.mjs";

const CANDIDATE_COOKIE = authService.COOKIE_NAMES.candidate;

const candidateCache = new Map();
const CAND_TTL_MS = 60000;

const getCachedCandidate = async (candidateId) => {
  if (!candidateId) return null;
  const now = Date.now();
  const hit = candidateCache.get(candidateId);
  if (hit && (now - hit.time) < CAND_TTL_MS) return hit.data;
  const cand = await candidatesRepo.findById(candidateId).catch(() => null);
  candidateCache.set(candidateId, { time: now, data: cand });
  return cand;
};

const context = (req) => ({
  ip: req.socket?.remoteAddress || req.headers["x-forwarded-for"] || "",
  userAgent: req.headers["user-agent"] || "",
});

const session = async (req) => authService.candidateFromToken(cookies(req)[CANDIDATE_COOKIE]);

const setCookies = (entries) => ({
  "Set-Cookie": entries.map((entry) => serialiseCookie(entry.name, entry.value, { maxAge: entry.maxAge, httpOnly: entry.httpOnly })),
});

export function registerCandidateRoutes(router) {
  router.post("/IBA/api/login/verify", async (req, res) => {
    const params = await readParams(req);
    return sendOk(res, await examService.verifySignIn({
      orgId: params.orgId,
      assessmentId: params.mockId,
      login: params.login,
      password: params.password,
    }));
  });

  router.post("/IBA/api/login", async (req, res) => {
    const params = await readParams(req);
    const { payload, cookies: issued } = await examService.signIn({
      orgId: params.orgId,
      assessmentId: params.mockId,
      login: params.login,
      password: params.password,
      context: context(req),
    });
    return sendOk(res, payload, setCookies(issued));
  });

  router.get("/IBA/api/logout", async (req, res) => {
    await authService.logoutCandidate(cookies(req)[CANDIDATE_COOKIE]);
    return sendText(res, "ok", 200, { "Set-Cookie": [clearCookie(CANDIDATE_COOKIE)] });
  });

  router.get("/IBA/api/session", async (req, res) => {
    const active = await session(req);
    if (!active) return sendJson(res, 200, { authenticated: false });
    const cand = await getCachedCandidate(active.candidateId);
    return sendJson(res, 200, {
      authenticated: true,
      mockCandId: active.candidateId,
      name: cand?.name || "",
      login: cand?.login || "",
      photo: cand?.photo || "",
      ...active
    });
  });

  router.get("/IBA/api/ping", (_req, res) => sendJson(res, 200, { ok: true, now: Date.now() }));

  // Public presentation config: branding, top-bar/tool visibility, languages.
  // The console passes its assessment id so two papers can use different
  // top-bar buttons and exam tools.
  router.get("/IBA/api/config", async (_req, res, { url } = {}) => {
    const assessmentId = url?.searchParams?.get("assessmentId") || "";
    const conf = await settingsService.candidateConfig(assessmentId);
    return sendJson(res, 200, { ok: true, ...conf });
  });

  router.get("/IBA/api/state", async (req, res) => {
    const active = await session(req);
    if (!active) return sendJson(res, 401, { ok: false, error: "Not signed in.", code: "unauthorized" });
    const state = await examService.currentState({ session: active });
    return sendJson(res, 200, { ok: true, ...state });
  });

  router.post("/IBA/api/finalize", async (req, res) => {
    const body = await readJson(req);
    const active = await session(req);
    const attempt = await examService.finalise({ snapshot: body.mockVar || body, ip: context(req).ip, session: active });
    if (!attempt) return sendText(res, "no-attempt", 404);
    return sendJson(res, 200, { ok: true, attemptId: attempt.id });
  });

  const backupHandler = async (req, res) => {
    const body = await readJson(req);
    const active = await session(req);
    const isFinal = String(body.BackUpParameters || "").includes("@@true@@");
    const payload = await examService.handleBackup({
      snapshot: body.BackUp || {},
      isFinal,
      ip: context(req).ip,
      session: active,
    });
    return sendJson(res, 200, payload);
  };

  router.post("/IBACC/MockCandResponseHandler", backupHandler);
  router.post("/IBA/MockCandResponseHandler", backupHandler);

  const actionHandler = async (req, res, { url }) => {
    const action = url.searchParams.get("action") || "";
    const raw = await readRaw(req);
    const attemptNo = Number(url.searchParams.get("attemptNo") || 0);
    const active = await session(req);

    switch (action) {
      case "getXMLPath": {
        const desc = await examService.xmlPathDescriptor(url.searchParams.get("orgId") || "", url.searchParams.get("mockId") || "");
        return sendJson(res, 200, desc);
      }

      case "getCandidateData": {
        const data = await examService.candidateData({
          orgId: url.searchParams.get("orgId") || "",
          assessmentId: url.searchParams.get("mockId") || "",
          candidateId: url.searchParams.get("candMasterId") || "",
          attemptNo: url.searchParams.get("attemptNo") || "",
          session: active,
        });
        return sendJson(res, 200, data);
      }

      case "CandidateSubmit": {
        if (attemptNo) await examService.finalise({ snapshot: null, ip: context(req).ip, session: active });
        return sendText(res, examService.submitConfirmation());
      }

      case "updateInterruptions": {
        await examService.recordInterruption({
          attemptNo,
          interruptions: url.searchParams.get("noOfInterruptions"),
          status: url.searchParams.get("status"),
          ip: context(req).ip,
        });
        return sendText(res, "");
      }

      case "saveAuditLog":
      case "saveScanAudit": {
        const attempt = attemptNo ? { id: attemptNo } : null;
        await examService.persistAuditPayload(raw, attempt, context(req).ip);
        return sendText(res, "");
      }

      case "savecandfeedback": {
        const params = new URLSearchParams(raw);
        const result = await examService.saveFeedback({
          payload: params.get("candFeedback") || raw,
          attemptId: params.get("attemptNo") || params.get("attemptId"),
          candidateId: params.get("candMasterId"),
          ip: context(req).ip,
          session: active,
        });
        return sendText(res, result.rating === null ? "success" : String(result.rating));
      }

      default:
        return sendJson(res, 200, {});
    }
  };

  router.post("/IBACC/:action", actionHandler);
  router.post("/IBA/:action", actionHandler);
  router.get("/IBACC/:action", actionHandler);
  router.get("/IBA/:action", actionHandler);

  // dev-only harness runner
  router.get("/tools/:file", async (_req, res, { params }) => {
    const { serveStatic } = await import("../static.mjs");
    const name = params.file === "runner.js" ? "runner.inject.js" : params.file;
    return serveStatic(res, `${config.paths.root}/tools`, `/${name}`);
  });
}

export { requireAdmin };
