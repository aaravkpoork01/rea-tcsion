// Dashboard statistics.
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import * as feedbackRepo from "../db/repositories/feedback.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";

const RECENT_LIMIT = 8;
const LIVE_LIMIT = 8;

export async function overview() {
  const [attemptCounts, candidates, assessments, feedback, questions, recent, live] = await Promise.all([
    attemptsRepo.overviewCounts(),
    candidatesRepo.count(),
    assessmentsRepo.count(),
    feedbackRepo.count(),
    questionsRepo.count(),
    attemptsRepo.recentWithNames(RECENT_LIMIT),
    attemptsRepo.liveWithNames(LIVE_LIMIT),
  ]);

  return {
    stats: {
      candidates,
      assessments,
      attempts: attemptCounts.attempts,
      inProgress: attemptCounts.inProgress,
      submitted: attemptCounts.submitted,
      feedback,
      questions,
      avgScore: attemptCounts.avgScore,
    },
    recent,
    live,
  };
}
