// Authentication: admin and candidate sessions, password checks.
import { config } from "../../config/index.mjs";
import { hashPassword, newToken, verifyPassword } from "../core/crypto.mjs";
import { nowIso, addSeconds } from "../core/time.mjs";
import { badRequest, conflict, unauthorized, forbidden } from "../core/errors.mjs";
import * as sessionsRepo from "../db/repositories/sessions.repo.mjs";
import * as adminsRepo from "../db/repositories/admins.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";

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
  const token = await openSession("admin", String(admin.id), config.session.adminTtlSec);
  return { token, admin };
}

export async function logoutAdmin(token) {
  if (token) await sessionsRepo.remove(token);
}

const clean = (value) => String(value ?? "").trim();

const validRole = (value) => {
  const role = clean(value).toLowerCase() || "admin";
  if (!/^[a-z][a-z0-9_-]{1,24}$/.test(role)) throw badRequest("Role is invalid.");
  return role;
};

/** Update the signed-in administrator's own profile. */
export async function updateAdminProfile(admin, input = {}) {
  const name = clean(input.name);
  const username = clean(input.username);
  if (!name) throw badRequest("Full name is required.");
  if (!username) throw badRequest("Username is required.");
  if (username.length < 3) throw badRequest("Username must be at least 3 characters.");
  const existing = await adminsRepo.findByUsername(username);
  if (existing && Number(existing.id) !== Number(admin.id)) {
    throw conflict("That username is already in use.");
  }
  const password = String(input.password ?? "");
  if (password && password.length < 6) throw badRequest("Password must be at least 6 characters.");
  await adminsRepo.update(admin.id, {
    name,
    username,
    ...(password ? { passwordHash: hashPassword(password) } : {}),
  });
  return adminsRepo.findById(admin.id);
}

/** Create an additional administrator account. */
export async function createAdmin(input = {}) {
  const name = clean(input.name);
  const username = clean(input.username);
  const password = String(input.password ?? "");
  const role = validRole(input.role);
  if (!name) throw badRequest("Full name is required.");
  if (!username) throw badRequest("Username is required.");
  if (username.length < 3) throw badRequest("Username must be at least 3 characters.");
  if (password.length < 6) throw badRequest("Password must be at least 6 characters.");
  if (await adminsRepo.findByUsername(username)) throw conflict("That username is already in use.");
  await adminsRepo.create({
    username,
    passwordHash: hashPassword(password),
    name,
    role,
    createdAt: nowIso(),
  });
  return adminsRepo.findByUsername(username);
}

export const listAdmins = () => adminsRepo.allRows();

/** @returns {object|null} admin row for a token */
export async function adminFromToken(token) {
  if (!token) return null;
  const row = await sessionsRepo.findByToken(token, "admin");
  if (!row || row.expires_at < nowIso()) return null;
  return adminsRepo.findById(Number(row.subject_id));
}

export async function requireAdmin(token) {
  const admin = await adminFromToken(token);
  if (!admin) throw unauthorized();
  return admin;
}

/** Verify candidate credentials without touching attempts. */
export async function checkCandidateCredentials(login, password) {
  const candidate = await candidatesRepo.findByLogin(String(login || "").trim());
  if (!candidate) throw unauthorized("Invalid Login ID or password.");
  if (candidate.status !== "active") throw forbidden("Your account is not active. Contact the administrator.");
  if (!verifyPassword(password ?? "", candidate.password_hash)) {
    throw unauthorized("Invalid Login ID or password.");
  }
  return candidate;
}

export const publicAdmin = (admin) => ({
  id: admin.id,
  username: admin.username,
  name: admin.name,
  role: admin.role,
});
