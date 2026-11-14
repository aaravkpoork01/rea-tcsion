import { insertMany } from "../bulk.mjs";
import { all, one, run } from "../connection.mjs";

export const create = async (row) =>
  run("INSERT INTO comprehensions(assessment_id, ext_id, kind, body, meta) VALUES(?,?,?,?,?)",
    row.assessmentId, row.extId, row.kind, row.body, row.meta || "{}");

/** Bulk insert comprehension/LAQ answer blocks (paper import). */
export const createMany = async (rows) =>
  insertMany("comprehensions", ["assessment_id", "ext_id", "kind", "body", "meta"],
    (rows || []).map((row) => ({
      assessment_id: row.assessmentId,
      ext_id: row.extId,
      kind: row.kind,
      body: row.body,
      meta: row.meta || "{}",
    })), { chunk: 300 });

export const listForAssessment = async (assessmentId) =>
  all("SELECT * FROM comprehensions WHERE assessment_id = ? ORDER BY id", assessmentId);

export const findByExt = async (assessmentId, extId) =>
  one("SELECT * FROM comprehensions WHERE assessment_id = ? AND ext_id = ?", assessmentId, extId);

export const removeForAssessment = async (assessmentId) =>
  run("DELETE FROM comprehensions WHERE assessment_id = ?", assessmentId);
