import { all, one, run } from "../connection.mjs";

export const create = async (row) =>
  run("INSERT INTO comprehensions(assessment_id, ext_id, kind, body, meta) VALUES(?,?,?,?,?)",
    row.assessmentId, row.extId, row.kind, row.body, row.meta || "{}");

export const listForAssessment = async (assessmentId) =>
  all("SELECT * FROM comprehensions WHERE assessment_id = ? ORDER BY id", assessmentId);

export const findByExt = async (assessmentId, extId) =>
  one("SELECT * FROM comprehensions WHERE assessment_id = ? AND ext_id = ?", assessmentId, extId);

export const removeForAssessment = async (assessmentId) =>
  run("DELETE FROM comprehensions WHERE assessment_id = ?", assessmentId);
