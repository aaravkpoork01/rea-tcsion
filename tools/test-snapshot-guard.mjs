// Regression test for the stale-tab snapshot guard.
// Run: node tools/test-snapshot-guard.mjs
import assert from "node:assert/strict";

import { canonicalAssessmentId, snapshotMatchesAttempt } from "../src/domain/snapshot-guard.mjs";

const attempt = {
  id: 1,
  assessment_id: "M62",
  candidate_id: "C11111",
};

// The signed-in snapshot matches its own attempt.
assert.equal(snapshotMatchesAttempt({ mockId: "M62", candMasterId: "C11111" }, attempt), true);

// The M62 attempt 1 corruption: a stale (deleted) M9001 tab must be rejected.
assert.equal(snapshotMatchesAttempt({ mockId: "M9001", candMasterId: "C11111" }, attempt), false);
assert.equal(snapshotMatchesAttempt({ mockId: "9001", candMasterId: "C11111" }, attempt), false);

// Legacy id forms identify the same paper.
assert.equal(snapshotMatchesAttempt({ mockId: "m62" }, attempt), true);
assert.equal(snapshotMatchesAttempt({ mockId: "62" }, attempt), true);
assert.equal(canonicalAssessmentId("M62"), canonicalAssessmentId("62"));

// A snapshot from another candidate cannot land on this attempt.
assert.equal(snapshotMatchesAttempt({ mockId: "M62", candMasterId: "C22222" }, attempt), false);

// Older clients may omit the identifiers; the session still fixes the attempt.
assert.equal(snapshotMatchesAttempt({}, attempt), true);
assert.equal(snapshotMatchesAttempt({ mockId: "", candMasterId: "" }, attempt), true);

// Defensive edges.
assert.equal(snapshotMatchesAttempt(null, attempt), false);
assert.equal(snapshotMatchesAttempt({ mockId: "M62" }, null), false);

console.log("snapshot guard: all assertions passed");