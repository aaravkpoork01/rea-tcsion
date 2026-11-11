import * as feedbackRepo from "../db/repositories/feedback.repo.mjs";
import { nowIso } from "../core/time.mjs";

export const recent = async (limit) => feedbackRepo.listRecent(limit);

export const summary = async () => feedbackRepo.summaryByAssessment();

export const save = async ({ attemptId, candidateId, payload, rating, ip }) => {
  await feedbackRepo.insert({
    attemptId,
    candidateId,
    payload: typeof payload === "string" ? payload : JSON.stringify(payload),
    rating,
    submittedAt: nowIso(),
  });
  return { rating };
};
