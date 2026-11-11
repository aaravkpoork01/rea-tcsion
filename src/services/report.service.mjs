// CSV report generation.
import * as attemptsRepo from "../db/repositories/attempts.repo.mjs";
import * as auditRepo from "../db/repositories/audit.repo.mjs";
import * as feedbackRepo from "../db/repositories/feedback.repo.mjs";
import * as candidatesRepo from "../db/repositories/candidates.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";

const fullscreenTime = (seconds) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s` : `${m}m ${String(s).padStart(2, "0")}s`;
};
const fullscreenToggles = (seconds) => Math.max(0, Math.round(Number(seconds) || 0));

const escapeCell = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(typeof column.value === "function" ? column.value(row) : row[column.key])).join(","));
  return [header, ...body].join("\r\n");
}

export const resultsCsv = async () => toCsv(await attemptsRepo.listForExport(), [
  { key: "id", label: "Attempt ID" },
  { key: "candidate", label: "Candidate" },
  { key: "login", label: "Login" },
  { key: "assessment", label: "Assessment" },
  { key: "attempt_no", label: "Attempt" },
  { key: "status", label: "Status" },
  { key: "score", label: "Score" },
  { key: "max_score", label: "Max score" },
  { key: "percentage", label: "Percentage" },
  { label: "Fullscreen time", value: (row) => fullscreenTime(row.fullscreen_seconds) },
  { label: "Fullscreen toggles", value: (row) => fullscreenToggles(row.fullscreen_toggle_count) },
  { key: "started_at", label: "Started" },
  { key: "submitted_at", label: "Submitted" },
]);

export const feedbackCsv = async () => toCsv(await feedbackRepo.listForExport(), [
  { key: "id", label: "ID" },
  { key: "candidate", label: "Candidate" },
  { key: "assessment", label: "Assessment" },
  { key: "rating", label: "Rating" },
  { key: "submitted_at", label: "Submitted" },
  { key: "payload", label: "Payload" },
]);

export const candidatesCsv = async () => toCsv(await candidatesRepo.listAll(), [
  { key: "id", label: "ID" },
  { key: "login", label: "Login" },
  { key: "name", label: "Name" },
  { label: "Groups", value: (row) => (row.groups || []).map((group) => group.name).join("; ") },
  { label: "Email / Phone", value: (row) => row.email || row.phone || "" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created" },
  { key: "last_login_at", label: "Last login" },
]);

export const auditCsv = async (limit = 1000) => toCsv(await auditRepo.listRecent(limit), [
  { key: "id", label: "ID" },
  { key: "attempt_id", label: "Attempt ID" },
  { key: "candidate_id", label: "Candidate ID" },
  { key: "event", label: "Event" },
  { key: "detail", label: "Detail" },
  { key: "ip", label: "IP" },
  { key: "at", label: "At" },
]);

export const assessmentsCsv = async () => toCsv(await assessmentsRepo.listWithCounts(), [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "org_id", label: "Organisation ID" },
  { key: "description", label: "Description" },
  { key: "type", label: "Type" },
  { key: "base_path", label: "Base path" },
  { key: "duration_min", label: "Duration (minutes)" },
  { key: "max_attempts", label: "Max attempts" },
  { label: "Show feedback", value: (row) => (row.show_feedback ? "Yes" : "No") },
  { label: "Require fullscreen", value: (row) => (row.require_fullscreen ? "Yes" : "No") },
  { key: "status", label: "Status" },
  { key: "total_marks", label: "Total marks" },
  { key: "questions", label: "Questions" },
  { key: "attempts", label: "Attempts" },
  { key: "created_at", label: "Created" },
]);

export const questionsCsv = async (assessmentId = "") => {
  const [rows, options] = await Promise.all([
    questionsRepo.listForExport(assessmentId),
    questionsRepo.listOptionsForExport(assessmentId),
  ]);
  const byQuestion = new Map();
  for (const option of options) {
    if (!byQuestion.has(option.question_id)) byQuestion.set(option.question_id, []);
    byQuestion.get(option.question_id).push(option);
  }
  return toCsv(rows, [
    { key: "assessment_id", label: "Assessment" },
    { key: "seq", label: "#" },
    { key: "type", label: "Type" },
    { key: "group_name", label: "Group" },
    { key: "section_name", label: "Section" },
    { key: "ext_id", label: "Question ID" },
    { label: "Question", value: (row) => String(row.body || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
    { label: "Body HTML", value: (row) => row.body || "" },
    { label: "Options", value: (row) => (byQuestion.get(row.id) || []).map((option) => option.body).join("\n") },
    { label: "Correct options", value: (row) => (byQuestion.get(row.id) || [])
      .map((option, index) => (option.correct ? index + 1 : null))
      .filter((value) => value != null)
      .join(",") },
    { key: "marks", label: "Marks" },
    { key: "negative_marks", label: "Negative marks" },
    { label: "Mandatory", value: (row) => (row.mandatory ? "Yes" : "No") },
  ]);
};
