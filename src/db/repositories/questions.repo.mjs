import { insertMany } from "../bulk.mjs";
import { all, one, run } from "../connection.mjs";

export const findById = async (id) => one("SELECT * FROM questions WHERE id = ?", id);

export const findIdByExt = async (assessmentId, extId) =>
  one("SELECT id, ext_id FROM questions WHERE assessment_id = ? AND ext_id = ?", assessmentId, extId);

export const listOptions = async (questionId) =>
  all("SELECT * FROM options WHERE question_id = ? ORDER BY seq, id", questionId);

export const correctOptionIds = async (questionId) => {
  const rows = await all("SELECT ext_id FROM options WHERE question_id = ? AND correct = 1", questionId);
  return rows.map((o) => String(o.ext_id));
};

export const search = async ({ assessmentId, sectionId, term, langId = 0, limit, offset }) => {
  const where = ["1=1"];
  const filterArgs = [];
  if (assessmentId) { where.push("q.assessment_id = ?"); filterArgs.push(assessmentId); }
  if (sectionId) { where.push("q.section_id = ?"); filterArgs.push(sectionId); }
  if (term) {
    where.push("(COALESCE(ql.body, q.body) LIKE ? OR COALESCE(ql.hint, q.hint) LIKE ? OR q.ext_id LIKE ?)");
    filterArgs.push(`%${term}%`, `%${term}%`, `%${term}%`);
  }
  const clause = where.join(" AND ");
  const joinArgs = langId ? [langId] : [];
  const join = langId
    ? "LEFT JOIN question_languages ql ON ql.question_id = q.id AND ql.lang_id = ?"
    : "";
  const bodyExpr = langId ? "COALESCE(ql.body, q.body)" : "q.body";
  const hintExpr = langId ? "COALESCE(ql.hint, q.hint)" : "q.hint";

  const totalRow = await one(`SELECT COUNT(*) AS n FROM questions q ${join} WHERE ${clause}`,
    ...joinArgs, ...filterArgs);
  const total = Number(totalRow?.n ?? 0);
  const rows = await all(`SELECT q.id, q.assessment_id, q.group_id, q.section_id, q.seq, q.ext_id,
      q.type, q.comprehension_id, q.laq_id, ${bodyExpr} AS body, ${hintExpr} AS hint,
      q.marks, q.negative_marks, q.mandatory, q.max_time, q.replays, q.meta,
      g.name AS group_name, s.name AS section_name
    FROM questions q
    ${join}
    LEFT JOIN groups g ON g.id = q.group_id
    LEFT JOIN sections s ON s.id = q.section_id
    WHERE ${clause} ORDER BY q.seq LIMIT ? OFFSET ?`,
    ...joinArgs, ...filterArgs, limit, offset);
  return { total, rows };
};

export const update = async (id, fields) =>
  run("UPDATE questions SET body=?, marks=?, negative_marks=?, mandatory=?, hint=? WHERE id=?",
    fields.body, fields.marks, fields.negativeMarks, fields.mandatory, fields.hint, id);

export const remove = async (id) => run("DELETE FROM questions WHERE id = ?", id);

export const listIds = async (assessmentId) =>
  all("SELECT id FROM questions WHERE assessment_id = ? ORDER BY seq, id", assessmentId);

export const setSeq = async (id, seq) =>
  run("UPDATE questions SET seq = ? WHERE id = ?", seq, id);

export const listForExport = async (assessmentId = "") => {
  const where = assessmentId ? "WHERE q.assessment_id = ?" : "";
  const args = assessmentId ? [assessmentId] : [];
  return all(`SELECT q.*, g.name AS group_name, s.name AS section_name
    FROM questions q LEFT JOIN groups g ON g.id = q.group_id LEFT JOIN sections s ON s.id = q.section_id
    ${where} ORDER BY q.assessment_id, q.seq`, ...args);
};

export const listOptionsForExport = async (assessmentId = "") => {
  const where = assessmentId ? "WHERE q.assessment_id = ?" : "";
  const args = assessmentId ? [assessmentId] : [];
  return all(`SELECT o.* FROM options o JOIN questions q ON q.id = o.question_id
    ${where} ORDER BY o.question_id, o.seq`, ...args);
};

export const listOptionsForAssessment = async (assessmentId) =>
  all(`SELECT o.* FROM options o JOIN questions q ON q.id = o.question_id
       WHERE q.assessment_id = ? ORDER BY q.seq, o.seq`, assessmentId);

export const updateOption = async (questionId, optionId, { correct, body }) =>
  run("UPDATE options SET correct = ?, body = ? WHERE id = ? AND question_id = ?",
    correct, body, optionId, questionId);

export const removeForAssessment = async (assessmentId) =>
  run("DELETE FROM questions WHERE assessment_id = ?", assessmentId);

export const findLastId = async (assessmentId) => {
  const row = await one("SELECT id FROM questions WHERE assessment_id = ? ORDER BY id DESC LIMIT 1", assessmentId);
  return Number(row?.id ?? 0);
};

export const findLastOptionId = async (questionId) => {
  const row = await one("SELECT id FROM options WHERE question_id = ? ORDER BY id DESC LIMIT 1", questionId);
  return Number(row?.id ?? 0);
};

export const create = async (row) =>
  run(`INSERT INTO questions
      (assessment_id, group_id, section_id, seq, ext_id, type, comprehension_id, laq_id, body, hint,
       marks, negative_marks, mandatory, max_time, replays, meta)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  row.assessmentId, row.groupId, row.sectionId, row.seq, row.extId, row.type, row.comprehensionId, row.laqId,
  row.body, row.hint, row.marks, row.negativeMarks, row.mandatory, row.maxTime, row.replays, row.meta);

/** Bulk insert questions (paper import). */
export const createMany = async (rows) =>
  insertMany("questions", [
    "assessment_id", "group_id", "section_id", "seq", "ext_id", "type", "comprehension_id", "laq_id",
    "body", "hint", "marks", "negative_marks", "mandatory", "max_time", "replays", "meta",
  ], (rows || []).map((row) => ({
    assessment_id: row.assessmentId,
    group_id: row.groupId,
    section_id: row.sectionId,
    seq: row.seq,
    ext_id: row.extId,
    type: row.type,
    comprehension_id: row.comprehensionId,
    laq_id: row.laqId,
    body: row.body,
    hint: row.hint,
    marks: row.marks,
    negative_marks: row.negativeMarks,
    mandatory: row.mandatory,
    max_time: row.maxTime,
    replays: row.replays,
    meta: row.meta,
  })), { chunk: 300 });

/** Question id per sequence number, for mapping bulk-inserted questions. */
export const listSeqIds = async (assessmentId) =>
  all("SELECT id, seq FROM questions WHERE assessment_id = ? ORDER BY seq, id", assessmentId);

export const nextSeq = async (assessmentId) => {
  const row = await one("SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM questions WHERE assessment_id = ?", assessmentId);
  return Number(row?.n ?? 1);
};

export const createOption = async (row) =>
  run("INSERT INTO options(question_id, ext_id, seq, body, correct) VALUES(?,?,?,?,?)",
    row.questionId, row.extId, row.seq, row.body, row.correct);

/** Bulk insert options (paper import). */
export const createOptionsMany = async (rows) =>
  insertMany("options", ["question_id", "ext_id", "seq", "body", "correct"],
    (rows || []).map((row) => ({
      question_id: row.questionId,
      ext_id: row.extId,
      seq: row.seq,
      body: row.body,
      correct: row.correct,
    })), { chunk: 500 });

/** Option ids keyed by question and sequence, for translation mapping. */
export const listOptionKeys = async (assessmentId) =>
  all(`SELECT o.id, o.question_id, o.ext_id, o.seq
       FROM options o JOIN questions q ON q.id = o.question_id
       WHERE q.assessment_id = ? ORDER BY o.id`, assessmentId);

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM questions");
  return Number(row?.n ?? 0);
};

export const countByAssessment = async (assessmentId) => {
  const row = await one("SELECT COUNT(*) AS n FROM questions WHERE assessment_id = ?", assessmentId);
  return Number(row?.n ?? 0);
};

/** Alias used by the admin delete-all flow. */
export const countForAssessment = countByAssessment;
