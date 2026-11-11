// Per-language paper content: assessment language list plus translated question
// and option text. The primary language also stays on `questions` / `options`
// so existing admin and scoring code keeps working unchanged.
import { all, one, run } from "../connection.mjs";

export const listAssessmentLanguages = async (assessmentId) =>
  all(`SELECT lang_id, name, seq, is_primary FROM assessment_languages
       WHERE assessment_id = ? ORDER BY seq, lang_id`, assessmentId);

/** Replace the language list for one assessment. `languages` must already be ordered. */
export const replaceAssessmentLanguages = async (assessmentId, languages) => {
  await run("DELETE FROM assessment_languages WHERE assessment_id = ?", assessmentId);
  for (const [index, language] of languages.entries()) {
    await run(`INSERT INTO assessment_languages (assessment_id, lang_id, name, seq, is_primary)
               VALUES (?,?,?,?,?)`,
    assessmentId, Number(language.id), String(language.name || ""), index + 1, language.primary ? 1 : 0);
  }
};

export const findQuestionLanguage = async (questionId, langId) =>
  one("SELECT * FROM question_languages WHERE question_id = ? AND lang_id = ?", questionId, langId);

export const upsertQuestionLanguage = async (questionId, langId, { body, hint }) =>
  run(`INSERT INTO question_languages (question_id, lang_id, body, hint)
       VALUES (?,?,?,?)
       ON CONFLICT(question_id, lang_id)
       DO UPDATE SET body = excluded.body, hint = excluded.hint`,
  questionId, langId, body, hint);

export const listOptionsForLang = async (questionId, langId) =>
  all(`SELECT o.*, COALESCE(ol.body, o.body) AS body
       FROM options o
       LEFT JOIN option_languages ol ON ol.option_id = o.id AND ol.lang_id = ?
       WHERE o.question_id = ? ORDER BY o.seq, o.id`, langId, questionId);

export const upsertOptionLanguage = async (optionId, langId, body) =>
  run(`INSERT INTO option_languages (option_id, lang_id, body)
       VALUES (?,?,?)
       ON CONFLICT(option_id, lang_id)
       DO UPDATE SET body = excluded.body`,
  optionId, langId, body);
