// Candidate administration.
import { hashPassword, newCode } from "../core/crypto.mjs";
import { nowIso } from "../core/time.mjs";
import { badRequest, conflict, notFound } from "../core/errors.mjs";
import { parseCsv } from "../core/csv.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as candidateGroupsService from "./candidate-groups.service.mjs";

const publicView = (candidate) => {
  const { password_hash: _hash, ...rest } = candidate;
  return rest;
};

const MAX_PHOTO_CHARS = 2_000_000;

/** Accept an uploaded data URL, an http(s) URL or a local image path. */
function photoValue(value) {
  const photo = String(value || "").trim();
  if (!photo) return "";
  if (photo.length > MAX_PHOTO_CHARS) throw badRequest("Photo is too large.");
  const allowed = /^data:image\//i.test(photo)
    || /^https?:\/\//i.test(photo)
    || /^\//.test(photo)
    || /^\.{0,2}\//.test(photo)
    || /^images\//i.test(photo);
  if (!allowed) throw badRequest("Photo must be an uploaded image or an image URL.");
  return photo;
}

const systemNameValue = (value) => String(value ?? "").trim();

const groupIdList = (value) => {
  if (Array.isArray(value)) return value.flatMap(groupIdList);
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text.split(/[;,]/).map((part) => part.trim()).filter(Boolean);
};

/** Validate admin-supplied candidate group ids. Duplicates are dropped. */
async function candidateGroupIds(value) {
  const ids = [...new Set(groupIdList(value))];
  if (ids.length > 100) throw badRequest("A candidate can belong to at most 100 groups.");
  for (const id of ids) await candidateGroupsService.get(id);
  return ids;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\d{10}$/;
const CONTACT_ERROR = "Enter a 10-digit phone number or a valid email address.";
const LOGIN_PATTERN = /^[0-9]{10}$/;
const CANDIDATE_ID_PATTERN = /^[A-Za-z0-9]{10}$/;
const LOGIN_ERROR = "Login ID must be exactly 10 digits (numbers only).";
const CANDIDATE_ID_ERROR = "Candidate ID must be exactly 10 letters or numbers.";

/**
 * Admin candidates have one contact field. A value containing "@" or ending
 * in ".com" is treated as an email; everything else must be a 10-digit phone.
 */
function parseContact(value) {
  const contact = String(value ?? "").trim();
  if (!contact) return { email: "", phone: "" };
  if (contact.includes("@") || /\.com$/i.test(contact)) {
    if (!EMAIL_PATTERN.test(contact)) throw badRequest(CONTACT_ERROR);
    return { email: contact, phone: "" };
  }
  if (!PHONE_PATTERN.test(contact)) throw badRequest(CONTACT_ERROR);
  return { email: "", phone: contact };
}

/** Accept the merged `contact` field, with legacy email/phone fallbacks. */
function contactFromBody(body, fallback = { email: "", phone: "" }) {
  if (body.contact !== undefined) return parseContact(body.contact);
  const email = body.email === undefined ? String(fallback.email || "") : String(body.email || "").trim();
  const phone = body.phone === undefined ? String(fallback.phone || "") : String(body.phone || "").trim();
  if (email && !EMAIL_PATTERN.test(email)) throw badRequest(CONTACT_ERROR);
  if (phone && !PHONE_PATTERN.test(phone)) throw badRequest(CONTACT_ERROR);
  return { email, phone };
}

export async function list({ term, page, pageSize, offset }) {
  const { total, rows } = await candidatesRepo.search({ term, limit: pageSize, offset });
  return { total, page, pageSize, candidates: rows };
}

export async function get(id) {
  const candidate = await candidatesRepo.findById(id);
  if (!candidate) throw notFound("Candidate not found.");
  const groups = await candidateGroupsService.groupsForCandidate(id);
  return {
    candidate: { ...publicView(candidate), groups, groupIds: groups.map((group) => group.id) },
    attempts: await attemptsRepo.listForCandidate(id),
  };
}

/** Check whether a 10-digit numeric Login ID is still available. */
export async function loginAvailable(value, excludeId = "") {
  const login = String(value || "").trim();
  const valid = LOGIN_PATTERN.test(login);
  const existing = valid ? await candidatesRepo.findByLogin(login) : null;
  const ownedByExcluded = Boolean(existing && excludeId && existing.id === excludeId);
  return {
    login,
    valid,
    available: valid && (!existing || ownedByExcluded),
  };
}

/** Check whether a generated Candidate ID is still available. */
export async function candidateIdAvailable(value) {
  const id = String(value || "").trim();
  const valid = CANDIDATE_ID_PATTERN.test(id);
  return {
    id,
    valid,
    available: valid && !(await candidatesRepo.findById(id)),
  };
}

export async function create(body) {
  const login = String(body.login || "").trim();
  if (!login) throw badRequest("Login ID is required.");
  if (!LOGIN_PATTERN.test(login)) throw badRequest(LOGIN_ERROR);
  if (await candidatesRepo.findByLogin(login)) throw conflict("This Login ID is already taken.");

  const password = String(body.password ?? "");
  if (!password.trim()) throw badRequest("Password is required.");
  if (password.length < 3) throw badRequest("Password must be at least 3 characters.");

  const requestedId = String(body.id || "").trim();
  if (requestedId && !CANDIDATE_ID_PATTERN.test(requestedId)) throw badRequest(CANDIDATE_ID_ERROR);
  const id = requestedId || newCode(10);
  if (await candidatesRepo.findById(id)) throw conflict("This Candidate ID is already taken.");

  const contact = contactFromBody(body);
  const groupIds = await candidateGroupIds(body.groupIds !== undefined ? body.groupIds : body.groupId);
  await candidatesRepo.create({
    id,
    orgId: String(body.orgId || "726"),
    login,
    passwordHash: hashPassword(password),
    name: String(body.name || "").trim() || "Your Name",
    systemName: systemNameValue(body.systemName ?? body.system_name),
    groupId: groupIds[0] || "",
    email: contact.email,
    phone: contact.phone,
    photo: photoValue(body.photo),
    status: String(body.status || "active"),
    createdAt: nowIso(),
  });
  await candidateGroupsService.setForCandidate(id, groupIds);

  const created = await candidatesRepo.findById(id);
  return { ...publicView(created), groups: await candidateGroupsService.groupsForCandidate(id), groupIds };
}

export async function update(id, body) {
  const candidate = await candidatesRepo.findById(id);
  if (!candidate) throw notFound("Candidate not found.");
  const login = body.login === undefined ? candidate.login : String(body.login || "").trim();
  if (login !== candidate.login) {
    if (!LOGIN_PATTERN.test(login)) throw badRequest(LOGIN_ERROR);
    const existing = await candidatesRepo.findByLogin(login);
    if (existing && existing.id !== id) throw conflict("This Login ID is already taken.");
  }
  const name = body.name === undefined
    ? candidate.name
    : String(body.name).trim() || "Your Name";
  const contact = contactFromBody(body, { email: candidate.email, phone: candidate.phone });

  const hasGroups = body.groupIds !== undefined || body.groupId !== undefined;
  const groupIds = hasGroups
    ? await candidateGroupIds(body.groupIds !== undefined ? body.groupIds : body.groupId)
    : null;

  await candidatesRepo.update(id, {
    login,
    name,
    systemName: body.systemName === undefined && body.system_name === undefined
      ? candidate.system_name
      : systemNameValue(body.systemName ?? body.system_name),
    groupId: groupIds === null ? candidate.group_id : (groupIds[0] || ""),
    email: contact.email,
    phone: contact.phone,
    photo: body.photo === undefined ? candidate.photo : photoValue(body.photo),
    status: body.status ?? candidate.status,
  });
  if (groupIds !== null) await candidateGroupsService.setForCandidate(id, groupIds);

  const updated = await candidatesRepo.findById(id);
  const groups = await candidateGroupsService.groupsForCandidate(id);
  return { ...publicView(updated), groups, groupIds: groups.map((group) => group.id) };
}

export async function remove(id) {
  if (!await candidatesRepo.findById(id)) throw notFound("Candidate not found.");
  await candidateGroupsService.clearForCandidate(id);
  await candidatesRepo.remove(id);
}

export async function resetPassword(id, password) {
  if (!await candidatesRepo.findById(id)) throw notFound("Candidate not found.");
  const next = String(password || "").trim();
  if (next.length < 3) throw badRequest("Password must be at least 3 characters.");
  await candidatesRepo.setPasswordHash(id, hashPassword(next));
}

/** Bulk import from a CSV body with a `login` column. */
export async function importCsv({ csv, orgId = "726" }) {
  const records = parseCsv(csv);
  if (!records.length) throw badRequest("CSV is empty.");

  const value = (record, names) => {
    for (const name of names) {
      if (record[name] !== undefined && String(record[name]).trim() !== "") return String(record[name]).trim();
    }
    return "";
  };

  let created = 0;
  let skipped = 0;

  for (const record of records) {
    const login = value(record, ["login", "login_id", "username"]) || Object.values(record)[0] || "";
    if (!login) { skipped += 1; continue; }
    if (await candidatesRepo.findByLogin(login)) { skipped += 1; continue; }

    let contact;
    try {
      contact = parseContact(value(record, ["contact", "email_phone", "email", "phone"]));
    } catch (error) {
      skipped += 1;
      continue;
    }

    // The group column accepts several names separated by a semicolon.
    const groupNames = value(record, ["group", "groups", "candidate_group", "candidate groups", "candidate group", "batch"])
      .split(";").map((name) => name.trim()).filter(Boolean);
    const groupIds = [];
    const seen = new Set();
    for (const groupName of groupNames) {
      const key = groupName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const group = await candidateGroupsService.ensureByName(groupName);
      if (group) groupIds.push(group.id);
    }

    const id = newCode(10);
    await candidatesRepo.create({
      id,
      orgId,
      login,
      passwordHash: hashPassword(value(record, ["password"]) || "Guest"),
      name: value(record, ["name"]) || "Your Name",
      systemName: value(record, ["system_name", "systemname"]),
      groupId: groupIds[0] || "",
      email: contact.email,
      phone: contact.phone,
      photo: "",
      status: "active",
      createdAt: nowIso(),
    });
    await candidateGroupsService.setForCandidate(id, groupIds);
    created += 1;
  }

  return { created, skipped };
}

export const listAll = async () => candidatesRepo.listAll();
