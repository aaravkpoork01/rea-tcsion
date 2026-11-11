import { all, one, run } from "../connection.mjs";

export const upsert = async (row) =>
  run(`INSERT INTO responses(attempt_id, question_id, ext_id, status, selected, answer, time_spent, updated_at)
       VALUES(?,?,?,?,?,?,?,?)
       ON CONFLICT(attempt_id, question_id) DO UPDATE SET
         status = EXCLUDED.status, selected = EXCLUDED.selected, answer = EXCLUDED.answer,
         time_spent = EXCLUDED.time_spent, updated_at = EXCLUDED.updated_at`,
  row.attemptId, row.questionId, row.extId, row.status, row.selected, row.answer, row.timeSpent, row.updatedAt);

export const listForScoring = async (attemptId) =>
  all(`SELECT r.*, q.marks, q.negative_marks, q.type, q.section_id, q.group_id
       FROM responses r JOIN questions q ON q.id = r.question_id WHERE r.attempt_id = ?`, attemptId);

export const listWithQuestion = async (attemptId) =>
  all(`SELECT r.*, q.body AS question, q.type, q.marks, q.ext_id,
      g.name AS group_name, s.name AS section_name
    FROM responses r JOIN questions q ON q.id = r.question_id
    LEFT JOIN groups g ON g.id = q.group_id LEFT JOIN sections s ON s.id = q.section_id
    WHERE r.attempt_id = ? ORDER BY q.seq`, attemptId);

export const countFor = async (attemptId) => {
  const row = await one("SELECT COUNT(*) AS n FROM responses WHERE attempt_id = ?", attemptId);
  return Number(row?.n ?? 0);
};
