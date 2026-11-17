// Self-registration for candidates plus the admin approval queue.
import { randomInt } from "node:crypto";

import { config } from "../../config/index.mjs";
import { badRequest, conflict, notFound } from "../core/errors.mjs";
import { hashPassword, newCode } from "../core/crypto.mjs";
import { addSeconds, nowIso } from "../core/time.mjs";
import { normalisePhoto } from "../domain/candidate-photo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";

export const APPROVAL_WINDOW_SECONDS = 24 * 60 * 60;
export const APPROVAL_WINDOW_MS = APPROVAL_WINDOW_SECONDS * 1000;
export const PENDING_MESSAGE = "Registration submitted for administrator approval. Approval can take up to 24 hours.";
export const PENDING_LOGIN_MESSAGE = "Your registration is awaiting administrator approval. Approval can take up to 24 hours; after that, contact the administrator.";
export const REJECTED_LOGIN_MESSAGE = "Your registration was not approved. Contact the administrator for details.";

const LOGIN_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const LOGIN_ERROR = "Login ID must be exactly 10 digits (numbers only).";
const REVIEW_STATUSES = new Set(["pending", "rejected"]);

const publicView = (candidate) => {
  if (!candidate) return null;
  const { password_hash: _hash, ...rest } = candidate;
  return rest;
};

const clean = (value) => String(value ?? "").trim();

/** Generate a 10-digit Login ID that is not already in use. */
export async function generateLoginId() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let login = String(randomInt(1, 10));
    while (login.length < 10) login += String(randomInt(0, 10));
    if (!await candidatesRepo.findByLogin(login)) return login;
  }
  throw new Error("Could not allocate a Login ID. Please try again.");
}

/** Check whether a 10-digit Login ID is still available for registration. */
export async function loginAvailable(value) {
  const login = clean(value);
  const valid = LOGIN_PATTERN.test(login);
  return {
    login,
    valid,
    available: valid && !(await candidatesRepo.findByLogin(login)),
  };
}

function normalisePhone(value) {
  let digits = clean(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function nameValue(value) {
  const name = clean(value).replace(/\s+/g, " ");
  if (name.length < 2) throw badRequest("Enter the candidate's full name.");
  if (name.length > 80) throw badRequest("Name must be 80 characters or fewer.");
  return name;
}

function passwordValue(value) {
  const password = String(value ?? "");
  if (!password.trim()) throw badRequest("Password is required.");
  if (password.length < 6) throw badRequest("Password must be at least 6 characters.");
  if (password.length > 128) throw badRequest("Password must be 128 characters or fewer.");
  return password;
}

function contactValue(body) {
  const email = clean(body.email);
  const phone = normalisePhone(body.phone);
  if (email && !EMAIL_PATTERN.test(email)) throw badRequest("Enter a valid email address.");
  if (body.phone !== undefined && clean(body.phone) && !/^[0-9]{10}$/.test(phone)) {
    throw badRequest("Enter a 10-digit phone number.");
  }
  if (!email && !phone) throw badRequest("Enter an email address or a 10-digit phone number.");
  return { email, phone };
}

/** Public registration: create a pending account that an admin must approve. */
export async function register(body = {}, context = {}) {
  const name = nameValue(body.name);
  const { email, phone } = contactValue(body);
  const password = passwordValue(body.password);

  let login = clean(body.login);
  if (!login) {
    login = await generateLoginId();
  } else {
    if (!LOGIN_PATTERN.test(login)) throw badRequest(LOGIN_ERROR);
    if (await candidatesRepo.findByLogin(login)) throw conflict("This Login ID is already taken.");
  }

  const photo = normalisePhoto(body.photo);
  if (!photo) throw badRequest("Please upload a candidate photo.");

  const existingContact = await candidatesRepo.findLiveByContact({ email, phone });
  if (existingContact) {
    throw conflict("This email or phone is already registered. Sign in instead or contact the administrator.");
  }

  let id = newCode(10);
  for (let attempt = 0; attempt < 6 && await candidatesRepo.findById(id); attempt += 1) {
    id = newCode(10);
  }

  const createdAt = nowIso();
  const orgId = clean(body.orgId).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20) || config.seed.orgId || "726";
  try {
    await candidatesRepo.create({
      id,
      orgId,
      login,
      passwordHash: hashPassword(password),
      name,
      systemName: "",
      groupId: "",
      email,
      phone,
      photo,
      status: "pending",
      registrationSource: "self",
      createdAt,
    });
  } catch (error) {
    // The unique Login ID index is the final guard against two simultaneous
    // applications choosing the same number.
    if (/unique|duplicate/i.test(String(error?.message || error))) {
      throw conflict("This Login ID was just taken. Please refresh the Login ID and try again.");
    }
    throw error;
  }

  await auditRepo.insert({
    candidateId: id,
    event: "registration_submitted",
    detail: `login ${login}`,
    ip: context.ip || "",
    at: createdAt,
  }).catch(() => {});

  return {
    candidate: {
      id,
      login,
      name,
      status: "pending",
      submittedAt: createdAt,
      approvalDeadline: addSeconds(APPROVAL_WINDOW_SECONDS),
    },
    message: PENDING_MESSAGE,
  };
}

export async function counts() {
  const [pending, rejected] = await Promise.all([
    candidatesRepo.countByStatus("pending"),
    candidatesRepo.countByStatus("rejected"),
  ]);
  return { pending, rejected };
}

export async function queue({ status = "pending", term = "" } = {}) {
  const wanted = REVIEW_STATUSES.has(status) ? status : "pending";
  const search = clean(term).slice(0, 80);
  const [approvals, totals] = await Promise.all([
    candidatesRepo.listApprovals({ status: wanted, term: search }),
    counts(),
  ]);
  return { status: wanted, approvals, counts: totals };
}

function rejectionReasonValue(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

async function review(id, status, { actor = "", reason = "", ip = "" } = {}) {
  const candidate = await candidatesRepo.findById(id);
  if (!candidate) throw notFound("Candidate not found.");

  if (status === "active" && !REVIEW_STATUSES.has(candidate.status)) {
    throw badRequest("Only pending or rejected registrations can be approved.");
  }
  if (status === "rejected" && candidate.status !== "pending") {
    throw badRequest("Only pending registrations can be rejected.");
  }

  const at = nowIso();
  const rejectionReason = status === "rejected" ? rejectionReasonValue(reason) : "";
  await candidatesRepo.updateReview(id, {
    status,
    reviewedAt: at,
    reviewedBy: String(actor || "admin").slice(0, 80),
    rejectionReason,
  });

  await auditRepo.insert({
    candidateId: id,
    event: status === "active" ? "registration_approved" : "registration_rejected",
    detail: status === "active" ? "Account activated" : (rejectionReason || "No reason recorded"),
    ip: ip || "",
    at,
  }).catch(() => {});

  return publicView(await candidatesRepo.findById(id));
}

export const approve = (id, context = {}) => review(id, "active", context);

export const reject = (id, { reason = "", ...context } = {}) => review(id, "rejected", { reason, ...context });
