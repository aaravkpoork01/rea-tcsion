import { all, one, run } from "../connection.mjs";

export const findById = async (id) => one("SELECT * FROM attempts WHERE id = ?", id);

export const findByIdForCandidate = async (id, candidateId, assessmentId) =>
  one("SELECT * FROM attempts WHERE id = ? AND candidate_id = ? AND assessment_id = ?",
    id, candidateId, assessmentId);

export const findInProgress = async (candidateId, assessmentId) =>
  one(`SELECT * FROM attempts WHERE candidate_id = ? AND assessment_id = ?
       AND status = 'in_progress' ORDER BY id DESC LIMIT 1`, candidateId, assessmentId);

export const findLatest = async (candidateId, assessmentId) =>
  one("SELECT * FROM attempts WHERE candidate_id = ? AND assessment_id = ? ORDER BY id DESC LIMIT 1",
    candidateId, assessmentId);

export const findLatestForCandidate = async (candidateId) =>
  one(`SELECT * FROM attempts WHERE candidate_id = ?
       ORDER BY (CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) DESC, id DESC LIMIT 1`,
    candidateId);

export const countFor = async (candidateId, assessmentId) => {
  const row = await one("SELECT COUNT(*) AS n FROM attempts WHERE candidate_id = ? AND assessment_id = ?",
    candidateId, assessmentId);
  return Number(row?.n ?? 0);
};

export const create = async (row) =>
  run(`INSERT INTO attempts
      (assessment_id, candidate_id, attempt_no, status, started_at, last_seen_at, total_questions, ip, user_agent)
      VALUES (?,?,?,?,?,?,?,?,?)`,
  row.assessmentId, row.candidateId, row.attemptNo, row.status, row.startedAt, row.lastSeenAt,
  row.totalQuestions, row.ip, row.userAgent);

export const touch = async (id, at) =>
  run("UPDATE attempts SET last_seen_at = ? WHERE id = ?", at, id);

export const saveState = async (id, state) =>
  run(`UPDATE attempts SET state_json = ?, last_seen_at = ?, current_group = ?, current_section = ?,
        current_question = ?, answered = ?, client_score = COALESCE(?, client_score),
        fullscreen_seconds = COALESCE(?, fullscreen_seconds),
        fullscreen_toggle_count = COALESCE(?, fullscreen_toggle_count) WHERE id = ?`,
  state.stateJson, state.at, state.currentGroup, state.currentSection, state.currentQuestion,
  state.answered, state.clientScore, state.fullscreenSeconds, state.fullscreenToggleCount, id);

export const markSubmitted = async (id, score) =>
  run(`UPDATE attempts SET status = 'submitted', submitted_at = ?, last_seen_at = ?,
        score = ?, max_score = ?, percentage = ?, client_score = COALESCE(?, client_score) WHERE id = ?`,
  score.at, score.at, score.score, score.maxScore, score.percentage, score.clientScore, id);

export const setStatus = async (id, status, extra = {}) =>
  run("UPDATE attempts SET status = ?, submitted_at = ? WHERE id = ?",
    status, extra.submittedAt ?? null, id);

export const remove = async (id) => run("DELETE FROM attempts WHERE id = ?", id);

export const search = async ({ status, assessmentId, term, limit, offset }) => {
  const where = ["1=1"];
  const args = [];
  if (status) { where.push("a.status = ?"); args.push(status); }
  if (assessmentId) { where.push("a.assessment_id = ?"); args.push(assessmentId); }
  if (term) { where.push("(c.name LIKE ? OR c.login LIKE ?)"); args.push(`%${term}%`, `%${term}%`); }
  const clause = where.join(" AND ");
  const totalRow = await one(
    `SELECT COUNT(*) AS n FROM attempts a JOIN candidates c ON c.id = a.candidate_id WHERE ${clause}`,
    ...args);
  const total = Number(totalRow?.n ?? 0);
  const rows = await all(
    `SELECT a.*, c.name AS candidate, c.login, s.name AS assessment
    FROM attempts a JOIN candidates c ON c.id = a.candidate_id JOIN assessments s ON s.id = a.assessment_id
    WHERE ${clause} ORDER BY a.id DESC LIMIT ? OFFSET ?`,
    ...args, limit, offset);
  return { total, rows };
};

export const listForCandidate = async (candidateId) =>
  all(`SELECT a.*, s.name AS assessment FROM attempts a
       JOIN assessments s ON s.id = a.assessment_id WHERE a.candidate_id = ? ORDER BY a.id DESC`,
    candidateId);

export const listLive = async () =>
  all(`SELECT a.id, a.attempt_no, a.status, a.started_at, a.last_seen_at,
      a.answered, a.total_questions, a.current_group, a.current_section, a.current_question,
      c.name AS candidate, c.login, s.name AS assessment,
      CASE WHEN a.state_json IS NULL THEN 0 ELSE 1 END AS has_state
    FROM attempts a JOIN candidates c ON c.id = a.candidate_id JOIN assessments s ON s.id = a.assessment_id
    WHERE a.status = 'in_progress' ORDER BY a.last_seen_at DESC`);

export const listResults = async (assessmentId) => {
  const where = ["a.status = 'submitted'"];
  const args = [];
  if (assessmentId) { where.push("a.assessment_id = ?"); args.push(assessmentId); }
  return all(
    `SELECT a.id, a.attempt_no, a.score, a.max_score, a.percentage, a.client_score,
      a.fullscreen_seconds, a.fullscreen_toggle_count, a.started_at, a.submitted_at, c.name AS candidate, c.login,
      s.name AS assessment
    FROM attempts a JOIN candidates c ON c.id = a.candidate_id JOIN assessments s ON s.id = a.assessment_id
    WHERE ${where.join(" AND ")} ORDER BY a.percentage DESC, a.submitted_at DESC`,
    ...args);
};

export const listForExport = async () =>
  all(`SELECT a.id, c.name AS candidate, c.login, s.name AS assessment,
      a.attempt_no, a.status, a.score, a.max_score, a.percentage, a.fullscreen_seconds,
      a.fullscreen_toggle_count, a.started_at, a.submitted_at
    FROM attempts a JOIN candidates c ON c.id = a.candidate_id JOIN assessments s ON s.id = a.assessment_id
    ORDER BY a.id`);

export const overviewCounts = async () => {
  const [att, inProg, sub, avg] = await Promise.all([
    one("SELECT COUNT(*) AS n FROM attempts"),
    one("SELECT COUNT(*) AS n FROM attempts WHERE status='in_progress'"),
    one("SELECT COUNT(*) AS n FROM attempts WHERE status='submitted'"),
    one("SELECT ROUND(AVG(percentage)::numeric, 2) AS v FROM attempts WHERE status='submitted'"),
  ]);
  return {
    attempts: Number(att?.n ?? 0),
    inProgress: Number(inProg?.n ?? 0),
    submitted: Number(sub?.n ?? 0),
    avgScore: Number(avg?.v ?? 0),
  };
};

export const recentWithNames = async (limit) =>
  all(`SELECT a.id, a.status, a.score, a.max_score, a.percentage, a.fullscreen_seconds,
      a.fullscreen_toggle_count, a.started_at, a.submitted_at, c.name AS candidate, c.login, s.name AS assessment
    FROM attempts a JOIN candidates c ON c.id = a.candidate_id JOIN assessments s ON s.id = a.assessment_id
    ORDER BY a.id DESC LIMIT ?`, limit);

export const liveWithNames = async (limit) =>
  all(`SELECT a.id, a.last_seen_at, a.answered, a.total_questions, a.current_group,
      c.name AS candidate, c.login, s.name AS assessment
    FROM attempts a JOIN candidates c ON c.id = a.candidate_id JOIN assessments s ON s.id = a.assessment_id
    WHERE a.status='in_progress' ORDER BY a.last_seen_at DESC LIMIT ?`, limit);
