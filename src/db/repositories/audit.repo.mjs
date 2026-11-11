import { all, one, run } from "../connection.mjs";

export const insert = async (row) =>
  run("INSERT INTO audit_log(attempt_id, candidate_id, event, detail, ip, at) VALUES(?,?,?,?,?,?)",
    row.attemptId ?? null, row.candidateId ?? null, row.event,
    String(row.detail ?? "").slice(0, 4000), row.ip ?? "", row.at);

export const listForAttempt = async (attemptId, limit = 100) =>
  all("SELECT * FROM audit_log WHERE attempt_id = ? ORDER BY id DESC LIMIT ?", attemptId, limit);

export const listRecent = async (limit) =>
  all(`SELECT l.*, c.name AS candidate FROM audit_log l
       LEFT JOIN candidates c ON c.id = l.candidate_id ORDER BY l.id DESC LIMIT ?`, limit);

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM audit_log");
  return Number(row?.n ?? 0);
};
