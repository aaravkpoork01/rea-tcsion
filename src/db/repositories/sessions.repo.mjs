import { one, run } from "../connection.mjs";

export const create = async (row) =>
  run("INSERT INTO sessions(token, kind, subject_id, created_at, expires_at) VALUES(?,?,?,?,?)",
    row.token, row.kind, row.subjectId, row.createdAt, row.expiresAt);

export const findByToken = async (token, kind) =>
  one("SELECT * FROM sessions WHERE token = ? AND kind = ?", token, kind);

export const remove = async (token) => run("DELETE FROM sessions WHERE token = ?", token);

export const expireFor = async (kind, subjectId, at) =>
  run("UPDATE sessions SET expires_at = ? WHERE kind = ? AND subject_id = ?", at, kind, subjectId);
