// Reset one attempt back to a blank in-progress state.
// Usage: node tools/reset-attempt.mjs [attemptId=1] [--purge]
import { one, run, all } from "../src/db/connection.mjs";
import { nowIso } from "../src/core/time.mjs";

const attemptId = Number(process.argv[2] || 1);
const purgeCandidate = process.argv.includes("--purge");

const attempt = await one("SELECT * FROM attempts WHERE id = ?", attemptId);
if (!attempt) {
  console.error(`no attempt ${attemptId}`);
  process.exit(1);
}

await run(
  `UPDATE attempts SET status='in_progress', score=0, max_score=0, percentage=0,
     answered=0, state_json=NULL, submitted_at=NULL, client_score=NULL,
     last_seen_at=?, current_group=0, current_section=0, current_question=0
   WHERE id=?`,
  nowIso(),
  attemptId,
);
await run("DELETE FROM responses WHERE attempt_id = ?", attemptId);
await run("DELETE FROM feedback WHERE attempt_id = ?", attemptId);
await run("DELETE FROM audit_log WHERE attempt_id = ?", attemptId);

if (purgeCandidate) {
  await run("UPDATE assessments SET max_attempts = 0 WHERE id = ?", attempt.assessment_id);
}

console.log(`reset attempt ${attemptId} (assessment ${attempt.assessment_id})`);
console.table(await all("SELECT id, status, score, length(state_json) AS state_bytes FROM attempts ORDER BY id"));
