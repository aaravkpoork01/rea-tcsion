// Assessment administration and question bank.
import { nowIso } from "../core/time.mjs";
import { badRequest, conflict, notFound } from "../core/errors.mjs";
import { parseCsv } from "../core/csv.mjs";
import { importPaper } from "../domain/paper-import.mjs";
import { mergePapers, extractLanguages } from "../domain/paper-languages.mjs";
import { applyCsvConfSettings, buildQuizXmlFromCsv, csvConfDuration, setConfTag } from "../domain/csv-paper.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import * as candidateGroupsRepo from "../db/repositories/candidate-groups.repo.mjs";
import * as orgsRepo from "../db/repositories/orgs.repo.mjs";
import * as structureRepo from "../db/repositories/structure.repo.mjs";
import * as questionsRepo from "../db/repositories/questions.repo.mjs";
import * as translationsRepo from "../db/repositories/translations.repo.mjs";
import { mirrorPath, normaliseBasePath, paperPath, quizXml } from "./assessments.service.mjs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { mergeInstructionView, parseInstructionFile, writeInstructionFile } from "../domain/paper-instruction-editor.mjs";
import { removeGroupXml, removeSectionXml, updateGroupXml, updateSectionXml } from "../domain/paper-structure-editor.mjs";
import { normaliseInstruction, questionInstructionMap, updateQuestionInstructionXml, updateQuestionXml } from "../domain/paper-question-editor.mjs";
import { clearAssessmentOverrides } from "./settings.service.mjs";

/** Assessments plus the candidate groups each one is restricted to. */
export const list = async () => {
  const rows = await assessmentsRepo.listWithCounts();
  const eligibility = await candidateGroupsRepo.listAllEligibility();
  const byAssessment = new Map();
  for (const row of eligibility) {
    if (!byAssessment.has(row.assessment_id)) byAssessment.set(row.assessment_id, []);
    byAssessment.get(row.assessment_id).push({ id: row.id, name: row.name });
  }
  return rows.map((row) => ({
    ...row,
    openToAll: Number(row.open_to_all ?? 1) === 1,
    candidateGroups: byAssessment.get(row.id) || [],
  }));
};

export const brief = async () => assessmentsRepo.listBrief();

const USEFUL_DATA_MAX = 27;

/** Language rows for an assessment, falling back to its quiz.xml for old imports. */
async function languagesFor(assessment) {
  if (!assessment) return [];
  const rows = await translationsRepo.listAssessmentLanguages(assessment.id);
  if (rows.length) {
    return rows.map((row) => ({
      id: Number(row.lang_id),
      name: row.name,
      primary: Boolean(row.is_primary),
    }));
  }
  return extractLanguages(quizXml(assessment)).map((language) => ({
    id: Number(language.id),
    name: language.name,
    primary: Boolean(language.primary),
  }));
}

function pickLanguage(languages, requested) {
  const wanted = Number.parseInt(requested, 10);
  return languages.find((language) => language.id === wanted)
    || languages.find((language) => language.primary)
    || languages[0]
    || { id: 1, name: "English", primary: true };
}

export async function get(id) {
  const assessment = await assessmentsRepo.findById(id);
  if (!assessment) throw notFound("Assessment not found.");

  const [sectionCounts, sections, groups, languages] = await Promise.all([
    structureRepo.countBySection(id),
    structureRepo.listSections(id),
    structureRepo.listGroups(id),
    languagesFor(assessment),
  ]);

  const counts = Object.fromEntries(sectionCounts.map((row) => [row.section_id, row.n]));

  let softwareLanguages = [];
  try {
    const conf = readFileSync(paperPath(assessment, "confDetails.xml"), "utf8");
    const match = /<SoftwareLanguages>([\s\S]*?)<\/SoftwareLanguages>/.exec(conf);
    softwareLanguages = match ? match[1].split(",").map((name) => name.trim()).filter(Boolean) : [];
  } catch { /* paper not imported yet */ }

  return {
    assessment,
    softwareLanguages,
    languages,
    primaryLangId: pickLanguage(languages).id,
    groups: groups.map((group) => ({
      ...group,
      sections: sections.filter((section) => section.group_id === group.id)
        .map((section) => ({ ...section, questions: counts[section.id] || 0 })),
    })),
  };
}

const readInstructionFile = (file) => {
  try {
    return existsSync(file) ? readFileSync(file, "utf8") : "";
  } catch {
    return "";
  }
};

/** Read the two candidate instruction files with one editable row per language. */
export async function getInstructions(assessmentId) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");

  const folder = dirname(paperPath(assessment, "quiz.xml"));
  const languages = await languagesFor(assessment);
  return {
    assessmentId: assessment.id,
    languages: mergeInstructionView(
      languages,
      parseInstructionFile(readInstructionFile(join(folder, "sysInstructions.xml"))),
      parseInstructionFile(readInstructionFile(join(folder, "custInstructions.xml"))),
    ),
  };
}

/** Save per-language candidate instructions (HTML inside the XML CDATA). */
export async function updateInstructions(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");

  const requested = Array.isArray(body.languages) ? body.languages : [];
  if (!requested.length) throw badRequest("At least one language is required.");

  const languages = await languagesFor(assessment);
  const folder = dirname(paperPath(assessment, "quiz.xml"));
  mkdirSync(folder, { recursive: true });

  const systemRows = [];
  const customRows = [];
  for (const language of languages) {
    const input = requested.find((row) => Number(row?.id) === Number(language.id)) || {};
    if (input.systemInstruction !== undefined) {
      systemRows.push({ id: language.id, name: language.name, values: { instructionText: input.systemInstruction } });
    }
    if (input.customInstruction !== undefined || input.disclaimer !== undefined) {
      customRows.push({
        id: language.id,
        name: language.name,
        values: {
          ...(input.customInstruction !== undefined ? { customInstruction: input.customInstruction } : {}),
          ...(input.disclaimer !== undefined ? { disclaimer: input.disclaimer } : {}),
        },
      });
    }
  }

  writeInstructionFile(join(folder, "sysInstructions.xml"), "SYSTEMINSTRUCTIONS", systemRows, [
    ["INSTRUCTIONTEXT", "instructionText"],
  ]);
  writeInstructionFile(join(folder, "custInstructions.xml"), "CUSTOMINSTRUCTIONS", customRows, [
    ["INSTRUCTIONTEXT", "customInstruction"],
    ["DISCLAIMERTEXT", "disclaimer"],
    ["DISCLAIMERTEXTOA", "disclaimer"],
  ]);

  return getInstructions(assessmentId);
}

// ---------------------------------------------------------------------------
// Useful Data files (confDetails.xml)
// ---------------------------------------------------------------------------

function usefulDataTag(index) {
  return `UsefulDataFile${index}`;
}

function readFileValue(xml, tag) {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>|<${tag}\\b[^>]*/>`, "i").exec(xml);
  if (!match) return "";
  return String(match[1] || "")
    .trim()
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

/** Read the Useful Data files the candidate opens from confDetails.xml. */
export async function getUsefulData(assessmentId) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const file = paperPath(assessment, "confDetails.xml");
  if (!existsSync(file)) return { assessmentId: assessment.id, files: [] };

  const xml = readFileSync(file, "utf8");
  const files = [];
  for (let index = 1; index <= USEFUL_DATA_MAX; index += 1) {
    const path = readFileValue(xml, usefulDataTag(index));
    if (path) files.push({ index, path });
  }
  return { assessmentId: assessment.id, files };
}

/** Replace the Useful Data file list in confDetails.xml. */
export async function updateUsefulData(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const file = paperPath(assessment, "confDetails.xml");
  if (!existsSync(file)) throw badRequest("Upload the assessment paper first.");

  let xml = readFileSync(file, "utf8");
  const rows = Array.isArray(body.files) ? body.files : [];
  const byIndex = new Map();
  for (const row of rows) {
    const index = Number(row?.index);
    if (!Number.isInteger(index) || index < 1 || index > USEFUL_DATA_MAX) continue;
    const path = String(row?.path || "").trim();
    if (path) byIndex.set(index, path);
  }

  if (!rows.length && !/UsefulDataFile\d/i.test(xml)) {
    return { assessmentId: assessment.id, files: [] };
  }

  for (let index = 1; index <= USEFUL_DATA_MAX; index += 1) {
    xml = setConfTag(xml, usefulDataTag(index), byIndex.get(index) || "");
  }
  writeFileSync(file, xml, "utf8");
  return getUsefulData(assessment.id);
}

/** Add a group to an assessment. Names are unique per assessment. */
export async function createAssessmentGroup(assessmentId, body) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const name = String(body?.name || "").trim();
  if (!name) throw badRequest("Group name is required.");
  if (await structureRepo.findGroupByName(assessment.id, name)) {
    throw conflict("A group with this name already exists in this assessment.");
  }

  const groups = await structureRepo.listGroups(assessment.id);
  const seq = groups.reduce((max, group) => Math.max(max, Number(group.seq) || 0), 0) + 1;
  const extId = String(body.extId || "").trim() || `G${seq}`;

  const info = await structureRepo.createGroup({
    assessmentId: assessment.id,
    seq,
    extId,
    name,
    instruction: String(body.instruction || "").trim(),
    instructionTimeSec: Math.max(0, Number(body.instructionTimeSec) || 0),
    maxDurationSec: Math.max(0, Number(body.maxDurationSec) || 0),
    totalMarks: Math.max(0, Number(body.totalMarks) || 0),
  });

  return structureRepo.findGroupById(Number(info.lastInsertRowid));
}

/** Add a section to one group. Names are unique within the group. */
export async function createAssessmentSection(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const group = await structureRepo.findGroupById(Number(body.groupId));
  if (!group || group.assessment_id !== assessment.id) {
    throw notFound("Group not found in this assessment.");
  }

  const name = String(body.name || "").trim();
  if (!name) throw badRequest("Section name is required.");
  if (await structureRepo.findSectionByName(group.id, name)) {
    throw conflict("A section with this name already exists in this group.");
  }

  const sections = (await structureRepo.listSections(assessment.id))
    .filter((section) => Number(section.group_id) === Number(group.id));
  const seq = sections.reduce((max, section) => Math.max(max, Number(section.seq) || 0), 0) + 1;
  const extId = String(body.extId || "").trim() || `S${group.id}-${seq}`;
  if (await structureRepo.findSectionByExtId(group.id, extId)) {
    throw conflict("A section with this ID already exists in this group.");
  }

  const info = await structureRepo.createSection({
    groupId: group.id,
    seq,
    extId,
    name,
    instruction: String(body.instruction || "").trim(),
    sectionType: String(body.sectionType || "ONLINE").trim() || "ONLINE",
    totalMarks: Math.max(0, Number(body.totalMarks) || 0),
    maxQuestions: Math.max(0, Number(body.maxQuestions) || 0),
  });

  const section = await structureRepo.findSectionById(Number(info.lastInsertRowid));
  return { ...section, questions: 0 };
}

/** Delete one group, its sections, questions and saved responses. */
export async function removeAssessmentGroup(id, body = {}) {
  const group = await structureRepo.findGroupById(Number(id));
  if (!group) throw notFound("Group not found.");

  const questions = await structureRepo.countQuestionsInGroup(group.id);
  if (questions > 0 && !body?.force) {
    throw conflict(`This group has ${questions} question(s). Confirm deletion to remove them.`);
  }

  await structureRepo.deleteGroup(group.id);
  const assessment = await assessmentsRepo.findById(group.assessment_id);
  writeQuizXml(assessment, (xml) => removeGroupXml(xml, group.ext_id));
  return { deleted: true, questions };
}

/** Delete one section, its questions and saved responses. */
export async function removeAssessmentSection(id, body = {}) {
  const section = await structureRepo.findSectionById(Number(id));
  if (!section) throw notFound("Section not found.");

  const questions = await structureRepo.countQuestionsInSection(section.id);
  if (questions > 0 && !body?.force) {
    throw conflict(`This section has ${questions} question(s). Confirm deletion to remove them.`);
  }

  const group = await structureRepo.findGroupById(section.group_id);
  await structureRepo.deleteSection(section.id);
  if (group?.ext_id) {
    const assessment = await assessmentsRepo.findById(group.assessment_id);
    writeQuizXml(assessment, (xml) => removeSectionXml(xml, group.ext_id, section.ext_id));
  }
  return { deleted: true, questions };
}

/** Edit an existing group. The name must stay unique within its assessment. */
export async function updateAssessmentGroup(id, body) {
  const group = await structureRepo.findGroupById(Number(id));
  if (!group) throw notFound("Group not found.");

  const name = String(body?.name ?? group.name).trim();
  if (!name) throw badRequest("Group name is required.");
  const duplicate = await structureRepo.findGroupByName(group.assessment_id, name);
  if (duplicate && Number(duplicate.id) !== Number(group.id)) {
    throw conflict("A group with this name already exists in this assessment.");
  }

  const assessment = await assessmentsRepo.findById(group.assessment_id);
  const primary = pickLanguage(await languagesFor(assessment));
  const previousExtId = group.ext_id;
  await structureRepo.updateGroup(group.id, {
    extId: String(body.extId ?? group.ext_id).trim() || group.ext_id || `G${group.seq}`,
    name,
    instruction: normaliseInstruction(String(body.instruction ?? group.instruction), primary.id),
    instructionTimeSec: body.instructionTimeSec === undefined
      ? group.instruction_time_sec
      : Math.max(0, Number(body.instructionTimeSec) || 0),
    maxDurationSec: body.maxDurationSec === undefined
      ? group.max_duration_sec
      : Math.max(0, Number(body.maxDurationSec) || 0),
    totalMarks: body.totalMarks === undefined
      ? group.total_marks
      : Math.max(0, Number(body.totalMarks) || 0),
  });

  const updated = await structureRepo.findGroupById(group.id);
  writeQuizXml(assessment, (xml) => updateGroupXml(xml, updated, previousExtId));
  return updated;
}

/** Edit one section (name, instructions, type, max questions). */
export async function updateAssessmentSection(id, body = {}) {
  const section = await structureRepo.findSectionById(Number(id));
  if (!section) throw notFound("Section not found.");

  const name = String(body.name ?? section.name).trim();
  if (!name) throw badRequest("Section name is required.");

  const group = await structureRepo.findGroupById(section.group_id);
  const assessment = group ? await assessmentsRepo.findById(group.assessment_id) : null;
  const primary = pickLanguage(await languagesFor(assessment));
  const previousExtId = section.ext_id;
  await structureRepo.updateSection(section.id, {
    extId: String(body.extId ?? section.ext_id).trim() || section.ext_id || "",
    name,
    instruction: normaliseInstruction(String(body.instruction ?? section.instruction), primary.id),
    sectionType: String(body.sectionType ?? section.section_type).trim() || section.section_type || "ONLINE",
    totalMarks: body.totalMarks === undefined
      ? section.total_marks
      : Math.max(0, Number(body.totalMarks) || 0),
    maxQuestions: body.maxQuestions === undefined
      ? section.max_questions
      : Math.max(0, Number(body.maxQuestions) || 0),
  });

  const updated = await structureRepo.findSectionById(section.id);
  if (group?.ext_id) {
    writeQuizXml(assessment, (xml) => updateSectionXml(xml, group.ext_id, updated, previousExtId));
  }
  return updated;
}

export async function create(body) {
  const id = String(body.id || "").trim();
  if (!id) throw badRequest("Assessment ID is required.");
  if (await assessmentsRepo.findById(id)) throw conflict("Assessment ID already exists.");

  const orgId = String(body.orgId || "726").trim();
  await orgsRepo.ensure(orgId, String(body.orgName || orgId), nowIso());

  const basePath = normaliseBasePath(body.basePath);

  await assessmentsRepo.create({
    id,
    orgId,
    name: String(body.name || id),
    description: String(body.description || ""),
    type: String(body.type || "mock"),
    basePath,
    durationMin: Number(body.durationMin || 60),
    totalMarks: 0,
    status: String(body.status || "active"),
    showFeedback: body.showFeedback ? 1 : 0,
    useDefaultFeedback: body.useDefaultFeedback === false ? 0 : 1,
    storeResponse: body.storeResponse ? 1 : 0,
    enableFullscreen: body.enableFullscreen ? 1 : 0,
    requireFullscreen: (body.enableFullscreen && body.requireFullscreen) ? 1 : 0,
    trackFullscreen: (body.enableFullscreen && body.trackFullscreen !== false) ? 1 : 0,
    maxAttempts: Number(body.maxAttempts || 1),
    createdAt: nowIso(),
  });

  let warning = null;
  if (basePath && body.importPaper) {
    try {
      await importPaper({ orgId, assessmentId: id, ...paperFiles(basePath), meta: { type: body.type || "mock", basePath } });
    } catch (error) {
      warning = `Assessment created but paper import failed: ${error.message}`;
    }
  }

  return { assessment: await assessmentsRepo.findById(id), warning };
}

export async function update(id, body) {
  const existing = await assessmentsRepo.findById(id);
  if (!existing) throw notFound("Assessment not found.");

  await assessmentsRepo.update(id, {
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    durationMin: Number(body.durationMin ?? existing.duration_min),
    status: body.status ?? existing.status,
    showFeedback: body.showFeedback === undefined ? existing.show_feedback : (body.showFeedback ? 1 : 0),
    useDefaultFeedback: body.useDefaultFeedback === undefined ? existing.use_default_feedback : (body.useDefaultFeedback ? 1 : 0),
    storeResponse: body.storeResponse === undefined ? existing.store_response : (body.storeResponse ? 1 : 0),
    enableFullscreen: body.enableFullscreen === undefined ? (existing.enable_fullscreen ?? (existing.require_fullscreen ? 1 : 0)) : (body.enableFullscreen ? 1 : 0),
    requireFullscreen: body.enableFullscreen === false ? 0 : (body.requireFullscreen === undefined ? existing.require_fullscreen : (body.requireFullscreen ? 1 : 0)),
    trackFullscreen: body.enableFullscreen === false ? 0 : (body.trackFullscreen === undefined ? (existing.track_fullscreen ?? 1) : (body.trackFullscreen ? 1 : 0)),
    maxAttempts: Number(body.maxAttempts ?? existing.max_attempts),
    startAt: body.startAt ?? existing.start_at,
    endAt: body.endAt ?? existing.end_at,
  });

  const updated = await assessmentsRepo.findById(id);
  syncConfFromAssessment(updated);
  return updated;
}

export async function remove(id) {
  if (!await assessmentsRepo.findById(id)) throw notFound("Assessment not found.");
  await clearAssessmentOverrides(id);
  await candidateGroupsRepo.clearForAssessment(id);
  await assessmentsRepo.remove(id);
}

const paperFiles = (basePath) => ({
  quizPath: mirrorPath(...basePath.replace(/^\/|\/$/g, "").split("/"), "quiz.xml"),
  confPath: mirrorPath(...basePath.replace(/^\/|\/$/g, "").split("/"), "confDetails.xml"),
});

/**
 * Assessment edits (name, duration, attempts, feedback, response storage) must
 * also reach confDetails.xml, because the candidate console reads that file
 * directly rather than the database row.
 */
function syncConfFromAssessment(assessment) {
  if (!assessment) return;
  const file = paperPath(assessment, "confDetails.xml");
  if (!existsSync(file)) return;
  let xml = readFileSync(file, "utf8");
  const next = {
    AssessmentName: assessment.name || assessment.id,
    AssessmentDescription: assessment.description || "",
    AssessmentDuration: String(Math.max(1, Number(assessment.duration_min) || 60)),
    MaxNoOfAttempt: String(Math.max(1, Number(assessment.max_attempts) || 1)),
    ShowFeedback: assessment.show_feedback ? "YES" : "NO",
    UseDefaultFeedback: assessment.use_default_feedback ? "YES" : "NO",
    StoreCandResponse: assessment.store_response ? "YES" : "NO",
    RequireFullscreen: assessment.require_fullscreen ? "YES" : "NO",
  };
  for (const [tag, value] of Object.entries(next)) xml = setConfTag(xml, tag, value);
  writeFileSync(file, xml, "utf8");
}

/** Apply a group/section edit to quiz.xml when the paper exists. */
function writeQuizXml(assessment, transform) {
  if (!assessment) return;
  const file = paperPath(assessment, "quiz.xml");
  if (!existsSync(file)) return;
  const xml = readFileSync(file, "utf8");
  const next = transform(xml);
  if (next !== xml) writeFileSync(file, next, "utf8");
}

export async function importFrom(body, id) {
  const assessment = await assessmentsRepo.findById(id);
  if (!assessment) throw notFound("Assessment not found.");

  const basePath = normaliseBasePath(body.basePath || assessment.base_path);
  if (!basePath) throw badRequest("Base path is required.");

  await assessmentsRepo.updateBasePath(id, basePath);
  return importPaper({
    orgId: assessment.org_id,
    assessmentId: id,
    ...paperFiles(basePath),
    meta: { type: assessment.type, basePath },
  });
}

export async function uploadPapers(body, id) {
  const assessment = await assessmentsRepo.findById(id);
  if (!assessment) throw notFound("Assessment not found.");

  const basePath = normaliseBasePath(body.basePath || assessment.base_path);
  if (!basePath) throw badRequest("Base path is required.");

  const csvDuration = (Array.isArray(body.languages) ? body.languages : [])
    .map((entry) => (entry && typeof entry.csv === "string" ? csvConfDuration(entry.csv) : 0))
    .find((value) => value > 0) || 0;

  const entries = (Array.isArray(body.languages) ? body.languages : []).map((entry) => {
    if (entry && typeof entry.csv === "string") {
      return {
        ...entry,
        confXml: applyCsvConfSettings(entry.confXml, entry.csv),
        quizXml: buildQuizXmlFromCsv({
          csv: entry.csv,
          name: entry.name,
          code: entry.code,
          totalTime: csvDuration || assessment.duration_min,
        }),
      };
    }
    return entry;
  });

  const merged = await mergePapers({ basePath, entries });

  await assessmentsRepo.updateBasePath(id, basePath);
  const imported = await importPaper({
    orgId: assessment.org_id,
    assessmentId: id,
    ...paperFiles(basePath),
    meta: { type: assessment.type, basePath },
  });

  // A paper that reached the mirror is playable: make it visible on the
  // candidate site immediately, even when the caller does not PATCH status.
  await assessmentsRepo.updateStatus(id, "active");

  return { ...merged, imported, status: "active" };
}

// ---- question bank ---------------------------------------------------------

export async function listQuestions({ assessmentId, sectionId, term, page, pageSize, offset, langId }) {
  const assessment = assessmentId ? await assessmentsRepo.findById(assessmentId) : null;
  const languages = await languagesFor(assessment);
  const selected = pickLanguage(languages, langId);
  const { total, rows } = await questionsRepo.search({
    assessmentId,
    sectionId,
    term,
    langId: selected.id,
    limit: pageSize,
    offset,
  });
  return {
    total,
    page,
    pageSize,
    questions: rows,
    languages,
    langId: selected.id,
    primaryLangId: (languages.find((language) => language.primary) || selected).id,
  };
}

async function questionContext(question, langId) {
  const assessment = await assessmentsRepo.findById(question.assessment_id);
  const languages = await languagesFor(assessment);
  const selected = pickLanguage(languages, langId);
  return {
    languages,
    selected,
    primary: languages.find((language) => language.primary) || selected,
  };
}

export async function getQuestion(id, langId) {
  const question = await questionsRepo.findById(id);
  if (!question) throw notFound("Question not found.");

  const context = await questionContext(question, langId);
  const translation = await translationsRepo.findQuestionLanguage(id, context.selected.id);
  return {
    question: {
      ...question,
      body: translation?.body ?? question.body,
      hint: translation?.hint ?? question.hint,
    },
    options: await translationsRepo.listOptionsForLang(id, context.selected.id),
    languages: context.languages,
    langId: context.selected.id,
    primaryLangId: context.primary.id,
  };
}

/** Grouped question list with the candidate-visible questionInstruction text. */
export async function getQuestionInstructions(assessmentId) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const [groups, sections, questions, languages] = await Promise.all([
    structureRepo.listGroups(assessment.id),
    structureRepo.listSections(assessment.id),
    questionsRepo.listForExport(assessment.id),
    languagesFor(assessment),
  ]);
  const instructions = questionInstructionMap(quizXml(assessment));
  const bySection = new Map();
  for (const question of questions) {
    if (!bySection.has(Number(question.section_id))) bySection.set(Number(question.section_id), []);
    bySection.get(Number(question.section_id)).push({
      id: question.id,
      extId: question.ext_id,
      type: question.type,
      body: question.body,
      instruction: instructions.get(question.ext_id) || "",
    });
  }

  return {
    assessmentId: assessment.id,
    languages,
    groups: groups.map((group) => ({
      id: group.id,
      extId: group.ext_id,
      name: group.name,
      sections: sections
        .filter((section) => Number(section.group_id) === Number(group.id))
        .map((section) => ({
          id: section.id,
          extId: section.ext_id,
          name: section.name,
          questions: bySection.get(Number(section.id)) || [],
        })),
    })),
  };
}

/** Save question-level instruction text into quiz.xml for one or more questions. */
export async function updateQuestionInstructions(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) throw badRequest("At least one question instruction is required.");

  const questionRows = await questionsRepo.listForExport(assessment.id);
  const byExtId = new Set(questionRows.map((question) => String(question.ext_id)));
  const byRowId = new Map(questionRows.map((question) => [String(question.id), String(question.ext_id)]));
  const primary = pickLanguage(await languagesFor(assessment));
  const file = paperPath(assessment, "quiz.xml");
  const xml = quizXml(assessment);
  if (!xml) throw badRequest("Upload the assessment paper first.");

  let next = xml;
  for (const item of items) {
    const requestedExt = String(item?.extId || "").trim();
    const requestedRow = String(item?.id || "").trim();
    const extId = byExtId.has(requestedExt) ? requestedExt : (byRowId.get(requestedRow) || "");
    if (!extId) continue;
    next = updateQuestionInstructionXml(
      next,
      extId,
      normaliseInstruction(item?.instruction, primary.id),
    );
  }
  if (next !== xml) writeFileSync(file, next, "utf8");
  return getQuestionInstructions(assessment.id);
}

/** Read-only paper preview built from the question bank for the admin panel. */
export async function getPaperPreview(assessmentId) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const [groups, sections, questions, options] = await Promise.all([
    structureRepo.listGroups(assessment.id),
    structureRepo.listSections(assessment.id),
    questionsRepo.listForExport(assessment.id),
    questionsRepo.listOptionsForAssessment(assessment.id),
  ]);
  const optionsByQuestion = new Map();
  for (const option of options) {
    if (!optionsByQuestion.has(Number(option.question_id))) optionsByQuestion.set(Number(option.question_id), []);
    optionsByQuestion.get(Number(option.question_id)).push({
      extId: option.ext_id,
      body: option.body,
      correct: Boolean(option.correct),
    });
  }
  const questionsBySection = new Map();
  for (const question of questions) {
    if (!questionsBySection.has(Number(question.section_id))) questionsBySection.set(Number(question.section_id), []);
    questionsBySection.get(Number(question.section_id)).push({
      id: question.id,
      extId: question.ext_id,
      type: question.type,
      body: question.body,
      marks: question.marks,
      negativeMarks: question.negative_marks,
      mandatory: Boolean(question.mandatory),
      options: optionsByQuestion.get(Number(question.id)) || [],
    });
  }

  return {
    assessment: {
      id: assessment.id,
      name: assessment.name,
      durationMin: assessment.duration_min,
      totalMarks: assessment.total_marks,
    },
    groups: groups.map((group) => ({
      id: group.id,
      extId: group.ext_id,
      name: group.name,
      instruction: group.instruction,
      sections: sections
        .filter((section) => Number(section.group_id) === Number(group.id))
        .map((section) => ({
          id: section.id,
          extId: section.ext_id,
          name: section.name,
          instruction: section.instruction,
          questions: questionsBySection.get(Number(section.id)) || [],
        })),
    })),
  };
}

export async function updateQuestion(id, body) {
  const question = await questionsRepo.findById(id);
  if (!question) throw notFound("Question not found.");

  const context = await questionContext(question, body.langId);
  const translation = await translationsRepo.findQuestionLanguage(id, context.selected.id);
  const nextBody = body.body ?? translation?.body ?? question.body;
  const nextHint = body.hint ?? translation?.hint ?? question.hint;
  const editingPrimary = context.selected.id === context.primary.id;

  await questionsRepo.update(id, {
    body: editingPrimary ? nextBody : question.body,
    hint: editingPrimary ? nextHint : question.hint,
    marks: Number(body.marks ?? question.marks),
    negativeMarks: Number(body.negativeMarks ?? question.negative_marks),
    mandatory: body.mandatory === undefined ? question.mandatory : (body.mandatory ? 1 : 0),
  });
  await translationsRepo.upsertQuestionLanguage(id, context.selected.id, {
    body: nextBody,
    hint: nextHint,
  });

  const currentOptions = await translationsRepo.listOptionsForLang(id, context.selected.id);
  const currentById = new Map(currentOptions.map((option) => [Number(option.id), option]));
  const primaryById = editingPrimary
    ? currentById
    : new Map((await questionsRepo.listOptions(id)).map((option) => [Number(option.id), option]));

  for (const option of Array.isArray(body.options) ? body.options : []) {
    const optionId = Number(option.id);
    const current = currentById.get(optionId);
    if (!current) continue;
    const optionBody = option.body ?? current.body;
    const primaryBody = primaryById.get(optionId)?.body ?? optionBody;
    await questionsRepo.updateOption(id, optionId, {
      correct: option.correct ? 1 : 0,
      body: editingPrimary ? optionBody : primaryBody,
    });
    await translationsRepo.upsertOptionLanguage(optionId, context.selected.id, optionBody);
  }

  // The candidate console renders quiz.xml, not the database. Push the edited
  // language text, marks and answer key into the matching question block.
  const assessment = await assessmentsRepo.findById(question.assessment_id);
  const updated = await questionsRepo.findById(id);
  const editedOptions = await translationsRepo.listOptionsForLang(id, context.selected.id);
  writeQuizXml(assessment, (xml) => updateQuestionXml(xml, {
    extId: question.ext_id,
    marks: updated.marks,
    negativeMarks: updated.negative_marks,
    mandatory: Boolean(updated.mandatory),
    langId: context.selected.id,
    body: nextBody,
    hint: nextHint,
    options: editedOptions.map((option) => ({
      extId: option.ext_id,
      body: option.body,
      correct: Boolean(option.correct),
    })),
  }));

  return updated;
}

/** Remove one question from the bank and keep the assessment totals in sync. */
export async function removeQuestion(id) {
  const question = await questionsRepo.findById(id);
  if (!question) throw notFound("Question not found.");

  await questionsRepo.remove(id);
  await assessmentsRepo.syncTotalMarks(question.assessment_id);

  const remaining = await questionsRepo.listIds(question.assessment_id);
  await Promise.all(remaining.map((row, index) => questionsRepo.setSeq(row.id, index + 1)));

  return { removed: id, questions: remaining.length };
}

/**
 * Reorder a dragged block of questions. The supplied ids keep the positions
 * they currently occupy; only their internal order changes.
 */
export async function reorderQuestions(assessmentId, ids) {
  const id = String(assessmentId || "").trim();
  if (!id) throw badRequest("Assessment is required.");
  const assessment = await assessmentsRepo.findById(id);
  if (!assessment) throw notFound("Assessment not found.");

  const rows = await questionsRepo.listIds(id);
  const current = rows.map((row) => Number(row.id));
  const currentSet = new Set(current);
  const requested = [];
  for (const raw of Array.isArray(ids) ? ids : []) {
    const value = Number(raw);
    if (currentSet.has(value) && !requested.includes(value)) requested.push(value);
  }
  if (requested.length < 2) throw badRequest("Drag at least two questions to change the order.");

  const requestedSet = new Set(requested);
  const positions = [];
  current.forEach((questionId, index) => {
    if (requestedSet.has(questionId)) positions.push(index);
  });

  const next = [...current];
  positions.forEach((position, index) => { next[position] = requested[index]; });

  await Promise.all(next.map((questionId, index) =>
    (current[index] === questionId ? null : questionsRepo.setSeq(questionId, index + 1))));

  return { questions: next.length, order: next };
}

// ---- csv imports -----------------------------------------------------------

/** First non-empty value for any of the supplied normalised CSV column names. */
const csvValue = (record, names) => {
  for (const name of names) {
    const value = record[name];
    if (value !== undefined && String(value).trim() !== "") return String(value).trim();
  }
  return "";
};

const csvNumber = (value, fallback) => {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  const number = Number(text);
  return Number.isFinite(number) ? number : fallback;
};

const csvFlag = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return 0;
  return /^(1|true|yes|y|on)$/i.test(text) ? 1 : 0;
};

const autoBasePath = (orgId, assessmentId) => {
  const org = String(orgId || "726").trim().replace(/[^A-Za-z0-9_-]/g, "") || "726";
  const id = String(assessmentId || "").trim();
  return id && !/[\\/]/.test(id) ? `/per/g03/pub/${org}/ASM/OnlineAssessment/${id}/` : "";
};

/**
 * Create paperless draft assessments from a CSV body. Existing assessment IDs
 * are skipped, so the same file can safely be imported twice.
 */
export async function importAssessmentsCsv(body) {
  const records = parseCsv(body?.csv);
  if (!records.length) throw badRequest("CSV is empty.");

  let created = 0;
  let skipped = 0;
  const ids = [];

  for (const record of records) {
    const id = csvValue(record, ["id", "assessment", "assessment_id"]);
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) { skipped += 1; continue; }
    if (await assessmentsRepo.findById(id)) { skipped += 1; continue; }

    const orgId = csvValue(record, ["organisation_id", "organization_id", "org_id", "org"]) || "726";
    await orgsRepo.ensure(orgId, orgId, nowIso());

    const basePath = normaliseBasePath(csvValue(record, ["base_path", "basepath", "paper_path"]))
      || autoBasePath(orgId, id);
    const feedbackValue = csvValue(record, ["show_feedback", "feedback"]);

    await assessmentsRepo.create({
      id,
      orgId,
      name: csvValue(record, ["name", "assessment_name"]) || id,
      description: csvValue(record, ["description"]),
      type: csvValue(record, ["type"]) || "mock",
      basePath,
      durationMin: Math.max(1, csvNumber(csvValue(record, ["duration_minutes", "duration_min", "duration"]), 60)),
      totalMarks: 0,
      status: "draft",
      showFeedback: feedbackValue === "" ? 1 : csvFlag(feedbackValue),
      useDefaultFeedback: csvValue(record, ["use_default_feedback"]) === "" ? 1 : csvFlag(csvValue(record, ["use_default_feedback"])),
      storeResponse: csvFlag(csvValue(record, ["store_response"])),
      requireFullscreen: csvFlag(csvValue(record, ["require_fullscreen", "fullscreen"])),
      maxAttempts: Math.max(1, csvNumber(csvValue(record, ["max_attempts", "attempts_allowed"]), 1)),
      createdAt: nowIso(),
    });
    created += 1;
    ids.push(id);
  }

  return { created, skipped, ids };
}

const optionList = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => {
        if (entry && typeof entry === "object") {
          return {
            body: String(entry.body ?? entry.text ?? entry.option ?? ""),
            extId: String(entry.id ?? entry.extId ?? entry.option_id ?? ""),
            correct: Boolean(entry.correct),
          };
        }
        return { body: String(entry ?? ""), extId: "", correct: false };
      });
    }
  } catch { /* not JSON, use a delimiter split below */ }

  const parts = text.includes("\n") || text.includes("\r")
    ? text.split(/\r?\n/)
    : text.split("|");
  return parts.map((part) => part.trim()).filter(Boolean)
    .map((optionBody) => ({ body: optionBody, extId: "", correct: false }));
};

const correctList = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((entry) => String(entry).trim()).filter(Boolean);
  } catch { /* not JSON, split below */ }
  return text.split(/[,\|;]+/).map((part) => part.trim()).filter(Boolean);
};

/**
 * Append questions from a CSV body to an assessment. Group and section rows are
 * created on demand; question IDs already present in the assessment are skipped.
 */
export async function importQuestionsCsv(assessmentId, body) {
  const assessment = await assessmentsRepo.findById(String(assessmentId || "").trim());
  if (!assessment) throw notFound("Assessment not found.");

  const records = parseCsv(body?.csv);
  if (!records.length) throw badRequest("CSV is empty.");

  const [groups, sections] = await Promise.all([
    structureRepo.listGroups(assessment.id),
    structureRepo.listSections(assessment.id),
  ]);

  const groupMap = new Map(groups.map((group) => [String(group.name || "").trim().toLowerCase(), group]));
  let groupSeq = groups.reduce((max, group) => Math.max(max, Number(group.seq) || 0), 0);

  const sectionMap = new Map(sections.map((section) =>
    [`${section.group_id}:${String(section.name || "").trim().toLowerCase()}`, section]));
  const sectionSeq = new Map();
  for (const section of sections) {
    sectionSeq.set(section.group_id,
      Math.max(sectionSeq.get(section.group_id) || 0, Number(section.seq) || 0));
  }

  let createdGroups = 0;
  let createdSections = 0;

  const ensureGroup = async (rawName) => {
    const name = String(rawName || "").trim() || "General";
    const key = name.toLowerCase();
    if (groupMap.has(key)) return groupMap.get(key);
    groupSeq += 1;
    const info = await structureRepo.createGroup({
      assessmentId: assessment.id,
      seq: groupSeq,
      extId: `G${groupSeq}`,
      name,
      instruction: "",
      instructionTimeSec: 0,
      maxDurationSec: 0,
      totalMarks: 0,
    });
    const group = { id: Number(info.lastInsertRowid), name, seq: groupSeq };
    groupMap.set(key, group);
    createdGroups += 1;
    return group;
  };

  const ensureSection = async (group, rawName) => {
    const name = String(rawName || "").trim() || "General";
    const key = `${group.id}:${name.toLowerCase()}`;
    if (sectionMap.has(key)) return sectionMap.get(key);
    const seq = (sectionSeq.get(group.id) || 0) + 1;
    sectionSeq.set(group.id, seq);
    const info = await structureRepo.createSection({
      groupId: group.id,
      seq,
      extId: `S${group.id}-${seq}`,
      name,
      instruction: "",
      sectionType: "ONLINE",
      totalMarks: 0,
      maxQuestions: 0,
    });
    const section = { id: Number(info.lastInsertRowid), group_id: group.id, name, seq };
    sectionMap.set(key, section);
    createdSections += 1;
    return section;
  };

  let questionSeq = await questionsRepo.nextSeq(assessment.id);
  let created = 0;
  let createdOptions = 0;
  let skipped = 0;
  const seenIds = new Set();

  for (const record of records) {
    const questionBody = csvValue(record, ["body_html", "body", "question", "question_text", "questionstring"]);
    if (!questionBody) { skipped += 1; continue; }

    let extId = csvValue(record, ["question_id", "questionid", "ext_id", "id"]);
    if (extId && (seenIds.has(extId) || await questionsRepo.findIdByExt(assessment.id, extId))) {
      skipped += 1;
      continue;
    }
    if (!extId) {
      let candidate = `QCSV${questionSeq}`;
      let suffix = 1;
      while (seenIds.has(candidate) || await questionsRepo.findIdByExt(assessment.id, candidate)) {
        suffix += 1;
        candidate = `QCSV${questionSeq}-${suffix}`;
      }
      extId = candidate;
    }
    seenIds.add(extId);

    const group = await ensureGroup(csvValue(record, ["group", "group_name"]));
    const section = await ensureSection(group, csvValue(record, ["section", "section_name"]));

    const questionInfo = await questionsRepo.create({
      assessmentId: assessment.id,
      groupId: group.id,
      sectionId: section.id,
      seq: questionSeq,
      extId,
      type: csvValue(record, ["type", "question_type"]) || "MCQ",
      comprehensionId: "",
      laqId: "",
      body: questionBody,
      hint: csvValue(record, ["hint"]),
      marks: csvNumber(csvValue(record, ["marks", "mark", "allotted_marks"]), 1),
      negativeMarks: csvNumber(csvValue(record, ["negative_marks", "negative", "negative_mark"]), 0),
      mandatory: csvFlag(csvValue(record, ["mandatory", "is_mandatory"])),
      maxTime: 0,
      replays: 0,
      meta: JSON.stringify({ source: "csv" }),
    });
    const questionId = Number(questionInfo.lastInsertRowid);

    const options = optionList(csvValue(record, ["options", "answer_options"]));
    const correctTokens = correctList(csvValue(record, ["correct_options", "correct_option", "correct", "answer_key", "key"]));
    const correctIndexes = new Set();
    const correctExtIds = new Set();
    for (const token of correctTokens) {
      const numeric = Number(token);
      if (Number.isInteger(numeric) && numeric > 0) correctIndexes.add(numeric);
      else correctExtIds.add(token);
    }

    for (let index = 0; index < options.length; index += 1) {
      const option = options[index];
      const seq = index + 1;
      const optionExtId = option.extId || `${extId}O${seq}`;
      const correct = option.correct || correctIndexes.has(seq) || correctExtIds.has(optionExtId) ? 1 : 0;
      await questionsRepo.createOption({
        questionId,
        extId: optionExtId,
        seq,
        body: option.body,
        correct,
      });
      createdOptions += 1;
    }

    questionSeq += 1;
    created += 1;
  }

  if (created) await assessmentsRepo.syncTotalMarks(assessment.id);

  return { created, skipped, options: createdOptions, groups: createdGroups, sections: createdSections };
}
