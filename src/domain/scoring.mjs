// Scoring rules. Pure calculation over persisted responses — no HTTP, no writes.
import * as responsesRepo from "../db/repositories/responses.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import { splitSelected } from "./answers.mjs";

// Only MCQ/MSQ can be graded from option keys. Everything else (SA, FIB,
// subjective, typing, programming, …) is reviewed manually and must not be
// counted as a wrong answer.
const OBJECTIVE_TYPES = new Set(["MCQ", "MSQ"]);
export const isObjectiveType = (type) => OBJECTIVE_TYPES.has(String(type || "").trim().toUpperCase());

/**
 * Score an attempt.
 * @returns {{score:number,maxScore:number,percentage:number,pending:number,correct:number,wrong:number,answered:number,total:number}}
 */
export async function scoreAttempt(attemptId) {
  const rows = await responsesRepo.listForScoring(attemptId);
  const correctByQuestion = await questionsRepo.correctOptionIdsFor(rows.map((row) => row.question_id));

  let score = 0;
  let maxScore = 0;
  let pending = 0;
  let correct = 0;
  let wrong = 0;
  let answered = 0;

  for (const row of rows) {
    maxScore += Number(row.marks) || 0;
    const selected = splitSelected(row.selected);
    const hasText = String(row.answer || "").trim().length > 0;
    if (selected.length === 0 && !hasText) continue;
    answered += 1;

    if (!isObjectiveType(row.type)) {
      pending += 1;
      continue;
    }

    const correctIds = correctByQuestion.get(Number(row.question_id)) || [];
    const isCorrect = correctIds.length > 0
      && selected.length === correctIds.length
      && selected.every((id) => correctIds.includes(id));

    if (isCorrect && row.status !== "marked") {
      score += Number(row.marks) || 0;
      correct += 1;
    } else if (selected.length > 0) {
      score -= Number(row.negative_marks) || 0;
      wrong += 1;
    }
  }

  const rounded = Math.round(score * 100) / 100;
  const max = Math.round(maxScore * 100) / 100;
  const percentage = max > 0 ? Math.max(0, Math.round((rounded / max) * 10000) / 100) : 0;

  return { score: rounded, maxScore: max, percentage, pending, correct, wrong, answered, total: rows.length };
}
