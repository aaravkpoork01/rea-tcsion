import { all, one, run } from "../connection.mjs";
import * as groupRepo from "./candidate-groups.repo.mjs";

const withGroups = async (rows) => {
  if (!rows.length) return rows;
  const memberships = await groupRepo.listMembersForCandidates(rows.map((row) => row.id));
  const byCandidate = new Map();
  for (const row of memberships) {
    if (!byCandidate.has(row.candidate_id)) byCandidate.set(row.candidate_id, []);
    byCandidate.get(row.candidate_id).push({ id: row.id, name: row.name });
  }
  return rows.map((row) => {
    const groups = byCandidate.get(row.id) || [];
    return {
      ...row,
      groups,
      group_ids: groups.map((group) => group.id),
      group_names: groups.map((group) => group.name).join(", "),
    };
  });
};

export const findById = async (id) => one("SELECT * FROM candidates WHERE id = ?", id);

export const findByLogin = async (login) => one("SELECT * FROM candidates WHERE login = ?", login);

export const listBrief = async (id) =>
  one("SELECT id, name, login, email FROM candidates WHERE id = ?", id);

/** Compact candidate rows for a set of ids, used by group membership editors. */
export const listBriefByIds = async (ids) => {
  const clean = [...new Set((ids || []).map((id) => String(id || "")).filter(Boolean))];
  if (!clean.length) return [];
  const placeholders = clean.map(() => "?").join(",");
  return all(`SELECT id, name, login, system_name, status
      FROM candidates WHERE id IN (${placeholders})
      ORDER BY name, login`, ...clean);
};

/** Subset of the supplied ids that still exist. */
export const listExistingIds = async (ids) => {
  const clean = [...new Set((ids || []).map((id) => String(id || "")).filter(Boolean))];
  if (!clean.length) return [];
  const placeholders = clean.map(() => "?").join(",");
  const rows = await all(`SELECT id FROM candidates WHERE id IN (${placeholders})`, ...clean);
  return rows.map((row) => row.id);
};

export const create = async (row) =>
  run(`INSERT INTO candidates(id, org_id, login, password_hash, name, system_name, group_id, email, phone, photo, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  row.id, row.orgId, row.login, row.passwordHash, row.name, row.systemName || "",
  row.groupId || "", row.email, row.phone, row.photo || "", row.status, row.createdAt);

export const update = async (id, fields) =>
  run("UPDATE candidates SET login=?, name=?, system_name=?, group_id=?, email=?, phone=?, photo=?, status=? WHERE id=?",
    fields.login, fields.name, fields.systemName || "", fields.groupId || "", fields.email, fields.phone, fields.photo || "", fields.status, id);

export const setPasswordHash = async (id, hash) =>
  run("UPDATE candidates SET password_hash = ? WHERE id = ?", hash, id);

export const touchLogin = async (id, at) =>
  run("UPDATE candidates SET last_login_at = ? WHERE id = ?", at, id);

export const remove = async (id) => run("DELETE FROM candidates WHERE id = ?", id);

export const search = async ({ term, limit, offset }) => {
  const clause = term
    ? `WHERE c.id LIKE ? OR c.name LIKE ? OR c.system_name LIKE ? OR c.login LIKE ? OR c.email LIKE ? OR c.phone LIKE ?
        OR EXISTS (
          SELECT 1 FROM candidate_group_members m
          JOIN candidate_groups g ON g.id = m.group_id
          WHERE m.candidate_id = c.id AND g.name LIKE ?
        )`
    : "";
  const args = term
    ? Array(7).fill(`%${term}%`)
    : [];
  const totalRow = await one(`SELECT COUNT(*) AS n FROM candidates c ${clause}`, ...args);
  const total = Number(totalRow?.n ?? 0);
  const rows = await all(`SELECT c.id, c.login, c.name, c.system_name, c.group_id, c.email, c.phone, c.status, c.org_id,
      c.created_at, c.last_login_at,
      (SELECT COUNT(*) FROM attempts a WHERE a.candidate_id = c.id) AS attempts,
      (SELECT MAX(percentage) FROM attempts a WHERE a.candidate_id = c.id AND a.status='submitted') AS best_score
    FROM candidates c
    ${clause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`, ...args, limit, offset);
  return { total, rows: await withGroups(rows) };
};

export const listAll = async () => {
  const rows = await all(`SELECT c.id, c.login, c.name, c.email, c.phone, c.status, c.group_id,
      c.created_at, c.last_login_at
    FROM candidates c
    ORDER BY c.created_at`);
  return withGroups(rows);
};

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM candidates");
  return Number(row?.n ?? 0);
};
