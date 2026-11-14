// Question paper ingestion from the iON XML pair (quiz.xml + confDetails.xml).
import { readFileSync } from "node:fs";
import { dirname } from "node:path";

import { parseXml, child, children, text, attr } from "../core/xml.mjs";
import { nowIso } from "../core/time.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import * as structureRepo from "../db/repositories/structure.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import * as comprehensionsRepo from "../db/repositories/comprehensions.repo.mjs";
import * as translationsRepo from "../db/repositories/translations.repo.mjs";
import * as metaRepo from "../db/repositories/meta.repo.mjs";
import * as settingsRepo from "../db/repositories/settings.repo.mjs";
import { AppError } from "../core/errors.mjs";
import { extractLanguages } from "./paper-languages.mjs";
import { ensureInstructionFiles, normalizeInstructionTemplate } from "./paper-instructions.mjs";

const XML_ANSWERS_DIR = ["comprehensions", "laqs"];

function langText(languageData, tag, lang = 1) {
  if (!languageData) return "";
  const langs = children(languageData, "lang");
  const pick = langs.find((l) => attr(l, "id") === String(lang)) || langs[0];
  if (!pick) return "";
  return (child(pick, tag)?.text || pick.text || "").trim();
}

const yesNo = (value, fallback = "YES") => String(value ?? fallback).toUpperCase() === "YES";

/** Flatten every <question> element in a section, regardless of subsection nesting. */
function sectionQuestions(section) {
  return children(child(section, "subsections"), "subsection")
    .flatMap((sub) => children(sub, "questions"))
    .flatMap((wrap) => children(wrap, "question"));
}

/** First question in document order, used to pick the primary language block. */
function firstQuestionNode(quizXml) {
  for (const group of children(child(quizXml, "groups"), "group")) {
    for (const section of children(child(group, "sections"), "section")) {
      const question = sectionQuestions(section)[0];
      if (question) return question;
    }
  }
  return null;
}

const langNodesOf = (question) =>
  children(child(question, "languageSpecificData"), "lang");

const langIdOf = (node, fallback = 1) => {
  const id = Number.parseInt(attr(node, "id"), 10);
  return Number.isFinite(id) ? id : fallback;
};

/**
 * Import (or re-import) a question paper.
 * @param {{orgId:string,assessmentId:string,quizPath:string,confPath:string,meta?:object,generateInstructions?:boolean}} input
 */
export async function importPaper({ orgId, assessmentId, quizPath, confPath, providedQuizXml, providedConfXml, meta = {}, generateInstructions = true }) {
  let quizSource = providedQuizXml;
  let confSource = providedConfXml;
  if (quizSource === undefined || confSource === undefined) {
    try {
      quizSource = quizSource === undefined ? readFileSync(quizPath, "utf8") : quizSource;
      confSource = confSource === undefined ? readFileSync(confPath, "utf8") : confSource;
    } catch (error) {
      throw new AppError(`Cannot read paper files: ${error.message}`, 400, "paper_unreadable");
    }
  }
  const quizXml = parseXml(quizSource);
  const confXml = parseXml(confSource);

  const existing = await assessmentsRepo.findById(assessmentId);

  // The first <lang> block in the primary question is the paper's primary
  // language; every other block is stored as a translation of that question.
  const declaredLanguages = extractLanguages(quizSource);
  const firstQuestion = firstQuestionNode(quizXml);
  const firstLang = langNodesOf(firstQuestion)[0];
  const primaryLangId = firstLang
    ? langIdOf(firstLang, declaredLanguages[0]?.id || 1)
    : declaredLanguages[0]?.id || 1;
  const languageList = (declaredLanguages.length ? declaredLanguages : [{ id: 1, name: "English" }])
    .map((language) => ({ ...language, primary: Number(language.id) === Number(primaryLangId) }));
  if (!languageList.some((language) => language.primary)) {
    languageList.unshift({ id: primaryLangId, name: `Language ${primaryLangId}`, primary: true });
  }
  languageList.sort((a, b) => (a.primary === b.primary ? a.id - b.id : a.primary ? -1 : 1));
  const languageNames = new Map(languageList.map((language) => [Number(language.id), language.name]));

  // Uploaded papers do not carry instruction files; the instructions page
  // needs both of them before it can start the exam. Legacy papers already
  // ship their own instructions, so discovery imports skip generation.
  if (generateInstructions) {
    try {
      const template = normalizeInstructionTemplate(
        await settingsRepo.getSetting("exam_instructions", ""),
      );
      ensureInstructionFiles(dirname(quizPath), languageList, template);
    } catch (_) {}
  }

  if (existing) {
    await structureRepo.removeForAssessment(assessmentId);
    await questionsRepo.removeForAssessment(assessmentId);
    await comprehensionsRepo.removeForAssessment(assessmentId);
  }

  const totalMarks = Number(attr(quizXml, "totalMarks", "0")) || 0;
  const duration = Number(text(confXml, "AssessmentDuration", "0")) || 0;

  if (!existing) {
    await assessmentsRepo.create({
      id: assessmentId,
      orgId,
      name: text(confXml, "AssessmentName", meta.name || assessmentId),
      description: text(confXml, "AssessmentDescription", ""),
      type: meta.type || "mock",
      basePath: meta.basePath || dirname(quizPath).replace(/\\/g, "/"),
      durationMin: duration || 60,
      totalMarks,
      status: "active",
      showFeedback: yesNo(text(confXml, "ShowFeedback")) ? 1 : 0,
      useDefaultFeedback: yesNo(text(confXml, "UseDefaultFeedback")) ? 1 : 0,
      storeResponse: yesNo(text(confXml, "StoreCandResponse"), "NO") ? 1 : 0,
      requireFullscreen: yesNo(text(confXml, "RequireFullscreen"), "NO") ? 1 : 0,
      maxAttempts: Math.max(1, Number(text(confXml, "MaxNoOfAttempt", "1")) || 1),
      createdAt: nowIso(),
    });
  } else {
    await assessmentsRepo.updateMeta(assessmentId, {
      name: text(confXml, "AssessmentName", assessmentId),
      description: text(confXml, "AssessmentDescription", ""),
      durationMin: duration || 60,
      totalMarks,
      maxAttempts: Math.max(1, Number(text(confXml, "MaxNoOfAttempt", "1")) || 1),
      showFeedback: yesNo(text(confXml, "ShowFeedback")) ? 1 : 0,
      useDefaultFeedback: yesNo(text(confXml, "UseDefaultFeedback")) ? 1 : 0,
      storeResponse: yesNo(text(confXml, "StoreCandResponse"), "NO") ? 1 : 0,
      requireFullscreen: text(confXml, "RequireFullscreen", "") === ""
        ? (existing.require_fullscreen ? 1 : 0)
        : (yesNo(text(confXml, "RequireFullscreen")) ? 1 : 0),
    });
  }

  await translationsRepo.replaceAssessmentLanguages(assessmentId, languageList);

  for (const kind of XML_ANSWERS_DIR) {
    const singular = kind === "laqs" ? "laq" : "comprehension";
    const row = child(quizXml, kind);
    for (const node of children(row, singular)) {
      await comprehensionsRepo.create({
        assessmentId,
        extId: attr(node, "id"),
        kind: singular,
        body: langText(child(node, "languageSpecificData"), "lang", primaryLangId),
        meta: JSON.stringify(node.attrs),
      });
    }
  }

  let groupSeq = 0;
  let questionSeq = 0;

  for (const group of children(child(quizXml, "groups"), "group")) {
    groupSeq += 1;
    const groupInfo = await structureRepo.createGroup({
      assessmentId,
      seq: groupSeq,
      extId: attr(group, "id"),
      name: text(group, "groupDisplayText", `Group ${groupSeq}`),
      instruction: text(group, "groupInstructions", ""),
      instructionTimeSec: Math.round((Number(attr(group, "instructionTime", "0")) || 0) * 60),
      maxDurationSec: Math.round((Number(attr(group, "maxDuration", "0")) || 0) * 60),
      totalMarks: Number(attr(group, "totalMarks", "0")) || 0,
    });
    const groupId = Number(groupInfo.lastInsertRowid);

    let sectionSeq = 0;
    for (const section of children(child(group, "sections"), "section")) {
      sectionSeq += 1;
      const sectionInfo = await structureRepo.createSection({
        groupId,
        seq: sectionSeq,
        extId: attr(section, "id"),
        name: text(section, "sectionDisplayText", `Section ${sectionSeq}`),
        instruction: text(section, "sectionInstruction", ""),
        sectionType: attr(section, "sectionType", "ONLINE"),
        totalMarks: Number(attr(section, "totalMarks", "0")) || 0,
        maxQuestions: Number(attr(section, "maxQuestionsToBeAttempted", "0")) || 0,
      });
      const sectionId = Number(sectionInfo.lastInsertRowid);

      for (const question of sectionQuestions(section)) {
        questionSeq += 1;
        const langNodes = langNodesOf(question);
        const primaryLang = langNodes.find((node) => langIdOf(node, primaryLangId) === Number(primaryLangId))
          || langNodes[0]
          || null;
        const questionInfo = await questionsRepo.create({
          assessmentId,
          groupId,
          sectionId,
          seq: questionSeq,
          extId: attr(question, "id"),
          type: attr(question, "type", "MCQ"),
          comprehensionId: text(question, "comprehensionID", ""),
          laqId: text(question, "laqID", ""),
          body: text(primaryLang, "questionString", ""),
          hint: text(primaryLang, "hint", ""),
          marks: Number(attr(question, "allottedMarks", "1")) || 0,
          negativeMarks: Number(attr(question, "negativeMarks", "0")) || 0,
          mandatory: attr(question, "isMandatory", "false") === "true" ? 1 : 0,
          maxTime: Number(attr(question, "maxTime", "0")) || 0,
          replays: Number(attr(question, "numberOfReplays", "0")) || 0,
          meta: JSON.stringify(question.attrs),
        });
        const questionId = Number(questionInfo.lastInsertRowid);

        for (const node of langNodes) {
          await translationsRepo.upsertQuestionLanguage(questionId, langIdOf(node, primaryLangId), {
            body: text(node, "questionString", ""),
            hint: text(node, "hint", ""),
          });
        }

        const optionIdByExt = new Map();
        const optionIdBySeq = new Map();
        for (const option of children(child(primaryLang, "allOptions"), "option")) {
          const extId = attr(option, "optionID");
          const seq = Number(attr(option, "sequenceID", "0")) || 0;
          const optionInfo = await questionsRepo.createOption({
            questionId,
            extId,
            seq,
            body: text(option, "optionText", ""),
            correct: attr(option, "correct", "false") === "true" ? 1 : 0,
          });
          const optionId = Number(optionInfo.lastInsertRowid);
          if (extId) optionIdByExt.set(extId, optionId);
          optionIdBySeq.set(String(seq), optionId);
        }

        for (const node of langNodes) {
          const langId = langIdOf(node, primaryLangId);
          for (const option of children(child(node, "allOptions"), "option")) {
            const extId = attr(option, "optionID");
            const seq = String(Number(attr(option, "sequenceID", "0")) || 0);
            const optionId = (extId && optionIdByExt.get(extId)) || optionIdBySeq.get(seq);
            if (optionId) {
              await translationsRepo.upsertOptionLanguage(optionId, langId, text(option, "optionText", ""));
            }
          }
        }
      }
    }
  }

  await assessmentsRepo.syncTotalMarks(assessmentId);
  await metaRepo.set("paper_imported_at", nowIso());

  return { assessmentId, groups: groupSeq, questions: questionSeq };
}
