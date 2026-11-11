import { all, one, run } from "../connection.mjs";

export const listGroups = async (assessmentId) =>
  all("SELECT * FROM groups WHERE assessment_id = ? ORDER BY seq", assessmentId);

export const listSections = async (assessmentId) =>
  all(`SELECT s.* FROM sections s JOIN groups g ON g.id = s.group_id
       WHERE g.assessment_id = ? ORDER BY s.seq`, assessmentId);

export const countBySection = async (assessmentId) =>
  all("SELECT section_id, COUNT(*) AS n FROM questions WHERE assessment_id = ? GROUP BY section_id",
    assessmentId);

export const removeForAssessment = async (assessmentId) => {
  await run("DELETE FROM groups WHERE assessment_id = ?", assessmentId);
};

export const createGroup = async (row) =>
  run(`INSERT INTO groups (assessment_id, seq, ext_id, name, instruction, instruction_time_sec, max_duration_sec, total_marks)
       VALUES (?,?,?,?,?,?,?,?)`,
  row.assessmentId, row.seq, row.extId, row.name, row.instruction, row.instructionTimeSec, row.maxDurationSec, row.totalMarks);

export const findGroupById = async (id) => one("SELECT * FROM groups WHERE id = ?", id);

export const findGroupByName = async (assessmentId, name) =>
  one("SELECT * FROM groups WHERE assessment_id = ? AND LOWER(name) = LOWER(?)", assessmentId, name);

export const updateGroup = async (id, fields) =>
  run(`UPDATE groups SET ext_id=?, name=?, instruction=?, instruction_time_sec=?,
        max_duration_sec=?, total_marks=? WHERE id=?`,
  fields.extId, fields.name, fields.instruction, fields.instructionTimeSec,
  fields.maxDurationSec, fields.totalMarks, id);

export const findSectionById = async (id) => one("SELECT * FROM sections WHERE id = ?", id);

export const findSectionByName = async (groupId, name) =>
  one("SELECT * FROM sections WHERE group_id = ? AND LOWER(name) = LOWER(?)", groupId, name);

export const findSectionByExtId = async (groupId, extId) =>
  one("SELECT * FROM sections WHERE group_id = ? AND ext_id = ?", groupId, extId);

export const deleteGroup = async (id) => run("DELETE FROM groups WHERE id = ?", id);

export const deleteSection = async (id) => run("DELETE FROM sections WHERE id = ?", id);

export const countQuestionsInGroup = async (groupId) => {
  const row = await one("SELECT COUNT(*) AS n FROM questions WHERE group_id = ?", groupId);
  return Number(row?.n ?? 0);
};

export const countQuestionsInSection = async (sectionId) => {
  const row = await one("SELECT COUNT(*) AS n FROM questions WHERE section_id = ?", sectionId);
  return Number(row?.n ?? 0);
};

export const updateSection = async (id, fields) =>
  run(`UPDATE sections SET ext_id=?, name=?, instruction=?, section_type=?,
        total_marks=?, max_questions=? WHERE id=?`,
  fields.extId, fields.name, fields.instruction, fields.sectionType,
  fields.totalMarks, fields.maxQuestions, id);

export const createSection = async (row) =>
  run(`INSERT INTO sections (group_id, seq, ext_id, name, instruction, section_type, total_marks, max_questions)
       VALUES (?,?,?,?,?,?,?,?)`,
  row.groupId, row.seq, row.extId, row.name, row.instruction, row.sectionType, row.totalMarks, row.maxQuestions);

export const countQuestions = async (assessmentId) => {
  const row = await one("SELECT COUNT(*) AS n FROM questions WHERE assessment_id = ?", assessmentId);
  return Number(row?.n ?? 0);
};
