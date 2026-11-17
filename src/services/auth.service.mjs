// Authentication: admin and candidate sessions, password checks.
import { config } from "../../config/index.mjs";
import { hashPassword, newToken, verifyPassword } from "../core/crypto.mjs";
import { nowIso, addSeconds } from "../core/time.mjs";
import { badRequest, conflict, unauthorized, forbidden } from "../core/errors.mjs";
import * as sessionsRepo from "../db/repositories/sessions.repo.mjs";
import * as adminsRepo from "../db/repositories/admins.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import { PENDING_LOGIN_MESSAGE, REJECTED_LOGIN_MESSAGE } from "./registration.service.mjs";
import { adminName, adminUsername, clean } from "../domain/admin-account.mjs";
import { requireAdminPassword } from "../domain/admin-password.mjs";
import { effectivePermissions, hasAnyPermission, isSuperAdmin, roleLabel } from "../domain/rbac.mjs";

const CANDIDATE_COOKIE = "ion_cand";
const ADMIN_COOKIE = "ion_admin";

export const COOKIE_NAMES = { candidate: CANDIDATE_COOKIE, admin: ADMIN_COOKIE };

async function openSession(kind, subjectId, ttlSec) {
  const token = newToken(24);
  await sessionsRepo.create({
    token,
    kind,
    subjectId,
    createdAt: nowIso(),
    expiresAt: addSeconds(ttlSec),
  });
  return token;
}

/** @returns {{candidateId:string,attemptId:number}|null} */
export async function candidateFromToken(token) {
  if (!token) return null;
  const row = await sessionsRepo.findByToken(token, "candidate");
  if (!row || row.expires_at < nowIso()) return null;
  const [candidateId, attemptId] = row.subject_id.split("|");
  return { candidateId, attemptId: Number(attemptId) };
}

export const loginCandidate = (candidateId, attemptId) =>
  openSession("candidate", `${candidateId}|${attemptId}`, config.session.candidateTtlSec);

export async function logoutCandidate(token) {
  if (token) await sessionsRepo.remove(token);
}

export async function loginAdmin({ username, password }) {
  const admin = await adminsRepo.findByUsername(String(username || ""));
  if (!admin || !verifyPassword(password || "", admin.password_hash)) {
    throw unauthorized("Invalid username or password.");
  }
  if (String(admin.status || "active") !== "active") {
    throw forbidden("This account is disabled. Contact the super administrator.");
  }
  const at = nowIso();
  await adminsRepo.update(admin.id, { lastLoginAt: at, updatedAt: at });
  admin.last_login_at = at;
  const token = await openSession("admin", String(admin.id), config.session.adminTtlSec);
  return { token, admin };
}

export async function logoutAdmin(token) {
  if (token) await sessionsRepo.remove(token);
}

/** Update the signed-in administrator's own profile. Role cannot be changed here. */
export async function updateAdminProfile(admin, input = {}) {
  const name = adminName(input.name);
  const username = clean(input.username);
  if (!username) throw badRequest("Username is required.");
  if (username !== String(admin.username || "")) adminUsername(username);
  const existing = await adminsRepo.findByUsername(username);
  if (existing && Number(existing.id) !== Number(admin.id)) {
    throw conflict("That username is already in use.");
  }
  const password = String(input.password ?? "");
  if (password) requireAdminPassword(password);
  await adminsRepo.update(admin.id, {
    name,
    username,
    ...(password ? { passwordHash: hashPassword(password) } : {}),
    updatedAt: nowIso(),
  });
  return adminsRepo.findById(admin.id);
}

/** @returns {object|null} admin row for a token */
export async function adminFromToken(token) {
  if (!token) return null;
  const row = await sessionsRepo.findByToken(token, "admin");
  if (!row || row.expires_at < nowIso()) return null;
  const admin = await adminsRepo.findById(Number(row.subject_id));
  if (!admin || String(admin.status || "active") !== "active") return null;
  return admin;
}

export async function requireAdmin(token) {
  const admin = await adminFromToken(token);
  if (!admin) throw unauthorized("Your session is no longer valid.");
  return admin;
}

/** Throw a 403 unless the admin has at least one of the given permissions. */
export function requirePermission(admin, permissions) {
  const list = Array.isArray(permissions) ? permissions : [permissions];
  if (!hasAnyPermission(admin, list)) {
    throw forbidden("Your role does not allow this action.");
  }
}

/** Verify candidate credentials without touching attempts. */
export async function checkCandidateCredentials(login, password) {
  const candidate = await candidatesRepo.findByLogin(String(login || "").trim());
  if (!candidate || !verifyPassword(password ?? "", candidate.password_hash)) {
    throw unauthorized("Invalid Login ID or password.");
  }
  if (candidate.status === "pending") throw forbidden(PENDING_LOGIN_MESSAGE);
  if (candidate.status === "rejected") {
    const reason = String(candidate.rejection_reason || "").trim().replace(/[.!?]+$/, "");
    throw forbidden(reason
      ? `Your registration was not approved. Reason: ${reason}. Contact the administrator.`
      : REJECTED_LOGIN_MESSAGE);
  }
  if (candidate.status !== "active") throw forbidden("Your account is not active. Contact the administrator.");
  return candidate;
}

/** Safe administrator payload for the browser. Never includes a password hash. */
export const publicAdmin = (admin) => ({
  id: admin.id,
  username: admin.username,
  name: admin.name,
  role: admin.role,
  roleLabel: roleLabel(admin.role),
  status: admin.status || "active",
  superAdmin: isSuperAdmin(admin),
  permissions: effectivePermissions(admin),
  lastLoginAt: admin.last_login_at || "",
});
