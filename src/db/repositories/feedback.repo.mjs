import { all, one, run } from "../connection.mjs";

export const insert = async (row) =>
  run("INSERT INTO feedback(attempt_id, candidate_id, payload, rating, submitted_at) VALUES(?,?,?,?,?)",
    row.attemptId ?? null, row.candidateId ?? null, row.payload, row.rating ?? null, row.submittedAt);

export const listForAttempt = async (attemptId) =>
  all("SELECT * FROM feedback WHERE attempt_id = ? ORDER BY id DESC", attemptId);

export const listRecent = async (limit = 200) =>
  all(`SELECT f.id, f.attempt_id, f.rating, f.submitted_at, f.payload,
      c.name AS candidate, c.login, s.name AS assessment
    FROM feedback f LEFT JOIN attempts a ON a.id = f.attempt_id
    LEFT JOIN candidates c ON c.id = a.candidate_id LEFT JOIN assessments s ON s.id = a.assessment_id
    ORDER BY f.id DESC LIMIT ?`, limit);

export const summaryByAssessment = async () =>
  all(`SELECT s.name AS assessment, COUNT(*) AS n, ROUND(AVG(f.rating)::numeric, 2) AS avg_rating
    FROM feedback f JOIN attempts a ON a.id = f.attempt_id JOIN assessments s ON s.id = a.assessment_id
    GROUP BY s.id, s.name`);

export const listForExport = async () =>
  all(`SELECT f.id, c.name AS candidate, s.name AS assessment, f.rating, f.submitted_at, f.payload
    FROM feedback f LEFT JOIN attempts a ON a.id = f.attempt_id
    LEFT JOIN candidates c ON c.id = a.candidate_id LEFT JOIN assessments s ON s.id = a.assessment_id
    ORDER BY f.id`);

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM feedback");
  return Number(row?.n ?? 0);
};
