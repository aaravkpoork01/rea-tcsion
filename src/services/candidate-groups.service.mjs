// Candidate groups: candidate membership and per-assessment exam access.
import { newId } from "../core/crypto.mjs";
import { nowIso } from "../core/time.mjs";
import { badRequest, conflict, forbidden, notFound } from "../core/errors.mjs";
import { transaction } from "../db/connection.mjs";
import * as groupsRepo from "../db/repositories/candidate-groups.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";

const nameValue = (value) => String(value ?? "").trim();

function descriptionValue(value) {
  return String(value ?? "").trim().slice(0, 200);
}

const uniqueIds = (value) => {
  const list = Array.isArray(value) ? value : (value === undefined || value === null ? [] : [value]);
  return [...new Set(list.map((id) => String(id ?? "").trim()).filter(Boolean))];
};

export async function list() {
  return { groups: await groupsRepo.list() };
}

export async function get(id) {
  const group = await groupsRepo.findById(id);
  if (!group) throw notFound("Candidate group not found.");
  return group;
}

/** Group plus every candidate currently assigned to it. */
export async function getWithMembers(id) {
  const group = await get(id);
  const candidateIds = await groupsRepo.listIdsForGroup(id);
  return {
    group,
    candidateIds,
    members: await candidatesRepo.listBriefByIds(candidateIds),
  };
}

/** Replace one group's membership and keep the legacy candidates.group_id in sync. */
async function replaceGroupMembers(groupId, candidateIds) {
  const ids = uniqueIds(candidateIds);
  if (ids.length) {
    const known = new Set(await candidatesRepo.listExistingIds(ids));
    for (const id of ids) {
      if (!known.has(id)) throw badRequest("One of the selected candidates no longer exists.");
    }
  }

  const previous = await groupsRepo.listIdsForGroup(groupId);
  await groupsRepo.removeMembershipsForGroup(groupId);
  for (const id of ids) await groupsRepo.addMember(id, groupId);
  await groupsRepo.repointLegacyForCandidates([...previous, ...ids]);
}

export async function create(body = {}) {
  const name = nameValue(body.name);
  if (!name) throw badRequest("Group name is required.");
  if (name.length > 80) throw badRequest("Group name must be 80 characters or fewer.");
  if (await groupsRepo.findByName(name)) throw conflict("A candidate group with that name already exists.");

  const row = {
    id: newId("CG"),
    name,
    description: descriptionValue(body.description),
    createdAt: nowIso(),
  };
  await transaction(async () => {
    await groupsRepo.create(row);
    if (body.candidateIds !== undefined) await replaceGroupMembers(row.id, body.candidateIds);
  });
  return get(row.id);
}

export async function update(id, body = {}) {
  const existing = await get(id);
  const name = body.name === undefined ? existing.name : nameValue(body.name);
  if (!name) throw badRequest("Group name is required.");
  if (name.length > 80) throw badRequest("Group name must be 80 characters or fewer.");
  const duplicate = await groupsRepo.findByName(name);
  if (duplicate && duplicate.id !== id) throw conflict("A candidate group with that name already exists.");

  await transaction(async () => {
    await groupsRepo.update(id, {
      name,
      description: body.description === undefined ? existing.description : descriptionValue(body.description),
    });
    if (body.candidateIds !== undefined) await replaceGroupMembers(id, body.candidateIds);
  });
  return get(id);
}

export async function remove(id) {
  await get(id);
  await transaction(async () => {
    await groupsRepo.removeMembershipsForGroup(id);
    await groupsRepo.repointLegacyGroup(id);
    await groupsRepo.removeGroupEverywhere(id);
    await groupsRepo.remove(id);
  });
  return { ok: true };
}

// ---- candidate membership --------------------------------------------------

/** Every group a candidate belongs to. */
export async function groupsForCandidate(candidateId) {
  return groupsRepo.listForCandidate(candidateId);
}

/** Replace a candidate's group membership. An empty list removes them from every group. */
export async function setForCandidate(candidateId, groupIds) {
  const ids = uniqueIds(groupIds);
  const groups = await groupsRepo.list();
  const known = new Set(groups.map((group) => group.id));
  for (const id of ids) {
    if (!known.has(id)) throw badRequest("One of the selected candidate groups no longer exists.");
  }

  await transaction(async () => {
    await groupsRepo.removeMembershipsForCandidate(candidateId);
    for (const id of ids) await groupsRepo.addMember(candidateId, id);
  });
}

export async function clearForCandidate(candidateId) {
  await groupsRepo.removeMembershipsForCandidate(candidateId);
}

// ---- assessment exam access ------------------------------------------------

/** All groups plus the assessment's current access policy. */
export async function forAssessment(assessmentId) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");
  const [groups, allowed] = await Promise.all([
    groupsRepo.list(),
    groupsRepo.listForAssessment(assessmentId),
  ]);
  return {
    groups,
    allowed: allowed.map((group) => group.id),
    openToAll: Number(assessment.open_to_all ?? 1) === 1,
  };
}

/**
 * Replace the assessment's exam access. `openToAll` permits every candidate;
 * otherwise at least one group must be selected. An empty selection is never
 * saved, so an assessment cannot silently become inactive for everyone.
 */
export async function setForAssessment(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");

  const openToAll = body.openToAll === true || body.open_to_all === true || Number(body.open_to_all) === 1;
  const requested = Array.isArray(body.allowed) ? body.allowed.map((id) => String(id)) : [];
  const unique = [...new Set(requested.filter(Boolean))];

  if (!openToAll && !unique.length) {
    throw badRequest("Select All candidates or at least one candidate group for exam access.");
  }

  const groups = await groupsRepo.list();
  const known = new Set(groups.map((group) => group.id));
  for (const id of unique) {
    if (!known.has(id)) throw badRequest("One of the selected candidate groups no longer exists.");
  }

  await transaction(async () => {
    await assessmentsRepo.updateOpenToAll(assessmentId, openToAll ? 1 : 0);
    await groupsRepo.clearForAssessment(assessmentId);
    if (!openToAll) {
      for (const id of unique) await groupsRepo.addForAssessment(assessmentId, id);
    }
  });
  return forAssessment(assessmentId);
}

/**
 * Login gate. `open_to_all` admits every candidate. Otherwise the candidate
 * must belong to at least one selected group. No selection and no open flag
 * means nobody is admitted.
 */
export async function assertEligible(assessmentOrId, candidate) {
  const assessment = typeof assessmentOrId === "string"
    ? await assessmentsRepo.findById(assessmentOrId)
    : assessmentOrId;
  if (!assessment) return;
  if (Number(assessment.open_to_all ?? 1) === 1) return;

  const allowed = await groupsRepo.listForAssessment(assessment.id);
  if (!allowed.length) {
    throw forbidden("This assessment is not open to your candidate groups. Contact the administrator.");
  }

  const allowedIds = new Set(allowed.map((group) => group.id));
  const memberOf = await groupsRepo.listIdsForCandidate(candidate?.id);
  if (memberOf.some((groupId) => allowedIds.has(groupId))) return;
  throw forbidden("This assessment is not open to your candidate groups. Contact the administrator.");
}

/** Used by the CSV importer: find a group by name, creating it when missing. */
export async function ensureByName(name) {
  const clean = nameValue(name);
  if (!clean) return null;
  const existing = await groupsRepo.findByName(clean);
  if (existing) return existing;
  const row = {
    id: newId("CG"),
    name: clean.slice(0, 80),
    description: "Created during candidate import",
    createdAt: nowIso(),
  };
  await groupsRepo.create(row);
  return groupsRepo.findById(row.id);
}
