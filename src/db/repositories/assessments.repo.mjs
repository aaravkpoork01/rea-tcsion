import { all, one, run } from "../connection.mjs";

export const findById = async (id) => one("SELECT * FROM assessments WHERE id = ?", id);

export const findFirstForOrg = async (orgId) =>
  one("SELECT * FROM assessments WHERE org_id = ? ORDER BY created_at LIMIT 1", orgId);

export const listWithCounts = async () =>
  all(`SELECT s.*,
        (SELECT COUNT(*) FROM questions q WHERE q.assessment_id = s.id) AS questions,
        (SELECT COUNT(*) FROM attempts a WHERE a.assessment_id = s.id) AS attempts,
        (SELECT COUNT(*) FROM groups g WHERE g.assessment_id = s.id) AS groups
      FROM assessments s ORDER BY s.created_at DESC`);

export const listBrief = async () =>
  all("SELECT id, org_id, name, base_path, total_marks, duration_min, status FROM assessments ORDER BY created_at");

export const create = async (row) =>
  run(`INSERT INTO assessments
      (id, org_id, name, description, type, base_path, duration_min, total_marks, status,
       show_feedback, use_default_feedback, store_response, enable_fullscreen, require_fullscreen, track_fullscreen, max_attempts, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  row.id, row.orgId, row.name, row.description, row.type, row.basePath, row.durationMin, row.totalMarks,
  row.status, row.showFeedback, row.useDefaultFeedback, row.storeResponse,
  row.enableFullscreen ? 1 : 0, row.requireFullscreen ? 1 : 0, row.trackFullscreen ? 1 : 0, row.maxAttempts, row.createdAt);

export const update = async (id, fields) =>
  run(`UPDATE assessments SET name=?, description=?, duration_min=?, status=?, show_feedback=?,
        use_default_feedback=?, store_response=?, enable_fullscreen=?, require_fullscreen=?, track_fullscreen=?, max_attempts=?, start_at=?, end_at=? WHERE id=?`,
  fields.name, fields.description, fields.durationMin, fields.status, fields.showFeedback,
  fields.useDefaultFeedback, fields.storeResponse, fields.enableFullscreen ? 1 : 0, fields.requireFullscreen ? 1 : 0, fields.trackFullscreen ? 1 : 0, fields.maxAttempts,
  fields.startAt, fields.endAt, id);

export const updateMeta = async (id, fields) =>
  run(`UPDATE assessments SET name=?, description=?, duration_min=?, total_marks=?,
        max_attempts=COALESCE(?, max_attempts), show_feedback=COALESCE(?, show_feedback),
        use_default_feedback=COALESCE(?, use_default_feedback), store_response=COALESCE(?, store_response),
        enable_fullscreen=COALESCE(?, enable_fullscreen), require_fullscreen=COALESCE(?, require_fullscreen),
        track_fullscreen=COALESCE(?, track_fullscreen)
        WHERE id=?`,
  fields.name, fields.description, fields.durationMin, fields.totalMarks,
  fields.maxAttempts ?? null, fields.showFeedback ?? null,
  fields.useDefaultFeedback ?? null, fields.storeResponse ?? null,
  fields.enableFullscreen ?? null, fields.requireFullscreen ?? null, fields.trackFullscreen ?? null, id);

export const updateStatus = async (id, status) =>
  run("UPDATE assessments SET status = ? WHERE id = ?", status, id);

export const updateOpenToAll = async (id, openToAll) =>
  run("UPDATE assessments SET open_to_all = ? WHERE id = ?", openToAll ? 1 : 0, id);

export const updateBasePath = async (id, basePath) =>
  run("UPDATE assessments SET base_path = ? WHERE id = ?", basePath, id);

export const syncTotalMarks = async (id) =>
  run("UPDATE assessments SET total_marks = (SELECT COALESCE(SUM(marks),0) FROM questions WHERE assessment_id = ?) WHERE id = ?", id, id);

export const remove = async (id) => run("DELETE FROM assessments WHERE id = ?", id);

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM assessments");
  return Number(row?.n ?? 0);
};
