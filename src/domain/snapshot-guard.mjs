// A snapshot may only be persisted onto the attempt it actually belongs to.
// Legacy tabs keep posting after an assessment is deleted; without this guard
// such a stale snapshot can resolve to another paper's attempt and overwrite
// its answers (see M62 attempt 1 / deleted M9001 incident).

/** `M62`, `m62` and `62` all identify the same legacy assessment. */
export function canonicalAssessmentId(value) {
  return String(value ?? "").trim().toUpperCase().replace(/^M(?=\d)/, "");
}

/**
 * True when the snapshot's own identifiers do not contradict the attempt row.
 * Missing identifiers are allowed: older clients did not always send them, and
 * the signed-in session already fixes the attempt.
 */
export function snapshotMatchesAttempt(snapshot, attempt) {
  if (!snapshot || !attempt) return false;

  const snapshotAssessmentId = snapshot.mockId ?? snapshot.assessmentId ?? "";
  if (snapshotAssessmentId
    && canonicalAssessmentId(snapshotAssessmentId) !== canonicalAssessmentId(attempt.assessment_id)) {
    return false;
  }

  const snapshotCandidateId = snapshot.candMasterId ?? snapshot.candidateId ?? "";
  if (snapshotCandidateId
    && String(snapshotCandidateId).trim() !== String(attempt.candidate_id ?? "").trim()) {
    return false;
  }

  return true;
}