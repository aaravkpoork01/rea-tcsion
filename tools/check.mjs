// Console sanity check: row counts plus the newest attempts and audit events.
// Usage: npm run check
import { all, one } from "../src/db/connection.mjs";

const count = async (table) => Number((await one(`SELECT COUNT(*) AS n FROM ${table}`))?.n ?? 0);

const [assessments, questions, candidates, attempts, responses, feedback, audit] = await Promise.all([
  count("assessments"),
  count("questions"),
  count("candidates"),
  count("attempts"),
  count("responses"),
  count("feedback"),
  count("audit_log"),
]);

console.log({ assessments, questions, candidates, attempts, responses, feedback, audit });

console.table(
  await all(`SELECT id, candidate_id, assessment_id, status, answered,
    total_questions, score, max_score, percentage
    FROM attempts ORDER BY id DESC LIMIT 5`),
);

console.table(
  await all("SELECT id, attempt_id, event, substr(detail, 1, 60) AS detail FROM audit_log ORDER BY id DESC LIMIT 8"),
);
