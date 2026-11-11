// Candidate groups ("batches"), their candidate members and the assessments
// each group may take.
import { all, one, run } from "../connection.mjs";

export const list = async () =>
  all(`SELECT g.*,
        (SELECT COUNT(*) FROM candidate_group_members m WHERE m.group_id = g.id) AS candidates
      FROM candidate_groups g ORDER BY g.name`);

export const findById = async (id) =>
  one("SELECT * FROM candidate_groups WHERE id = ?", id);

export const findByName = async (name) =>
  one("SELECT * FROM candidate_groups WHERE LOWER(name) = LOWER(?)", String(name || "").trim());

export const create = async (row) =>
  run("INSERT INTO candidate_groups(id, name, description, created_at) VALUES (?,?,?,?)",
    row.id, row.name, row.description || "", row.createdAt);

export const update = async (id, fields) =>
  run("UPDATE candidate_groups SET name = ?, description = ? WHERE id = ?",
    fields.name, fields.description || "", id);

export const remove = async (id) =>
  run("DELETE FROM candidate_groups WHERE id = ?", id);

/** Every group one candidate belongs to. */
export const listForCandidate = async (candidateId) =>
  all(`SELECT g.* FROM candidate_groups g
      JOIN candidate_group_members m ON m.group_id = g.id
      WHERE m.candidate_id = ? ORDER BY g.name`, candidateId);

export const listIdsForCandidate = async (candidateId) => {
  const rows = await all("SELECT group_id FROM candidate_group_members WHERE candidate_id = ?", candidateId);
  return rows.map((row) => row.group_id);
};

/** Candidate ids currently assigned to one group. */
export const listIdsForGroup = async (groupId) => {
  const rows = await all(
    "SELECT candidate_id FROM candidate_group_members WHERE group_id = ? ORDER BY candidate_id",
    groupId,
  );
  return rows.map((row) => row.candidate_id);
};

export const addMember = async (candidateId, groupId) =>
  run("INSERT INTO candidate_group_members(candidate_id, group_id) VALUES (?,?)", candidateId, groupId);

export const removeMembershipsForCandidate = async (candidateId) =>
  run("DELETE FROM candidate_group_members WHERE candidate_id = ?", candidateId);

export const removeMembershipsForGroup = async (groupId) =>
  run("DELETE FROM candidate_group_members WHERE group_id = ?", groupId);

/** Keep the legacy single-group column on the first remaining group. */
export const repointLegacyGroup = async (groupId) =>
  run(`UPDATE candidates SET group_id = COALESCE((
        SELECT m.group_id FROM candidate_group_members m
        JOIN candidate_groups g ON g.id = m.group_id
        WHERE m.candidate_id = candidates.id
        ORDER BY g.name LIMIT 1
      ), '')
      WHERE group_id = ?`, groupId);

/** Recompute the legacy column for a set of candidates after a group change. */
export const repointLegacyForCandidates = async (candidateIds) => {
  const ids = [...new Set((candidateIds || []).map((id) => String(id || "")).filter(Boolean))];
  if (!ids.length) return;
  const placeholders = ids.map(() => "?").join(",");
  await run(`UPDATE candidates SET group_id = COALESCE((
        SELECT m.group_id FROM candidate_group_members m
        JOIN candidate_groups g ON g.id = m.group_id
        WHERE m.candidate_id = candidates.id
        ORDER BY g.name LIMIT 1
      ), '')
      WHERE id IN (${placeholders})`, ...ids);
};

/** Membership rows for a page of candidates, used to join group names in JS. */
export const listMembersForCandidates = async (candidateIds) => {
  const ids = [...new Set((candidateIds || []).map((id) => String(id || "")).filter(Boolean))];
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  return all(`SELECT m.candidate_id, g.id, g.name
      FROM candidate_group_members m
      JOIN candidate_groups g ON g.id = m.group_id
      WHERE m.candidate_id IN (${placeholders})
      ORDER BY g.name`, ...ids);
};

/** Every group an assessment is restricted to. */
export const listForAssessment = async (assessmentId) =>
  all(`SELECT g.* FROM candidate_groups g
      JOIN assessment_candidate_groups acg ON acg.group_id = g.id
      WHERE acg.assessment_id = ? ORDER BY g.name`, assessmentId);

/** Eligibility rows for every assessment, used by the assessments table. */
export const listAllEligibility = async () =>
  all(`SELECT acg.assessment_id, g.id, g.name
      FROM assessment_candidate_groups acg
      JOIN candidate_groups g ON g.id = acg.group_id
      ORDER BY g.name`);

export const clearForAssessment = async (assessmentId) =>
  run("DELETE FROM assessment_candidate_groups WHERE assessment_id = ?", assessmentId);

export const addForAssessment = async (assessmentId, groupId) =>
  run("INSERT INTO assessment_candidate_groups(assessment_id, group_id) VALUES (?,?)", assessmentId, groupId);

export const removeGroupEverywhere = async (groupId) =>
  run("DELETE FROM assessment_candidate_groups WHERE group_id = ?", groupId);
