// Build an iON quiz.xml from a question-bank CSV so the CSV upload path can use
// the same language-merge and paper-import pipeline as uploaded XML files.
import { badRequest } from "../core/errors.mjs";
import { parseCsv } from "../core/csv.mjs";

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

const csvFlag = (value) => /^(1|true|yes|y|on)$/i.test(String(value ?? "").trim());

const roundMarks = (value) => Math.round(value * 100) / 100;

const xmlAttr = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const cdata = (value) => `<![CDATA[${String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const xmlText = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const YES_RE = /^(1|true|yes|y|on)$/i;
const NO_RE = /^(0|false|no|n|off)$/i;
const yesNo = (value) => (YES_RE.test(String(value ?? "").trim()) ? "YES"
  : NO_RE.test(String(value ?? "").trim()) ? "NO" : String(value ?? "").trim());

/** Replace (or append) a simple text tag in confDetails.xml. */
export function setConfTag(xml, tag, value) {
  const replacement = `<${tag}>${xmlText(value)}</${tag}>`;
  const re = new RegExp(`<${tag}\\s*/>|<${tag}>[\\s\\S]*?</${tag}>`);
  if (re.test(xml)) return xml.replace(re, () => replacement);
  return xml.replace(/<\/Details>/i, () => `${replacement}</Details>`);
}

/**
 * Optional paper-level columns in the same CSV. They let one upload also set
 * the values normally kept in confDetails.xml (name, duration, attempt count,
 * visible buttons and so on). Unknown/empty cells leave the conf untouched.
 */
const CONF_FIELDS = [
  ["AssessmentName", ["assessment_name", "assessmentname", "paper_name", "mock_name"], "text"],
  ["AssessmentDescription", ["assessment_description", "description"], "text"],
  ["AssessmentDuration", ["assessment_duration", "duration_minutes", "duration"], "number"],
  ["MaxNoOfAttempt", ["max_attempts", "max_no_of_attempt", "attempts"], "number"],
  ["ShowFeedback", ["show_feedback"], "bool"],
  ["UseDefaultFeedback", ["use_default_feedback"], "bool"],
  ["StoreCandResponse", ["store_cand_response", "store_response"], "bool"],
  ["RequireFullscreen", ["require_fullscreen", "fullscreen"], "bool"],
  ["ShowViewQPButton", ["show_view_qp_button", "show_view_qp"], "bool"],
  ["ShowScoreCard", ["show_scorecard", "show_score_card"], "bool"],
  ["ShowPercentageScore", ["show_percentage_score"], "bool"],
  ["ConsiderMarkForReview", ["consider_mark_for_review"], "bool"],
  ["ISOPTIONALSECTIONSAVAILABLE", ["optional_sections_available", "optional_sections"], "bool"],
  ["UseDefaultSystemInstruction", ["use_default_system_instruction"], "bool"],
  ["UseDefaultExitPage", ["use_default_exit_page"], "bool"],
  ["showOptionInViewQP", ["show_option_in_view_qp"], "bool"],
  ["ShowContactNo", ["show_contact_no", "show_contactno"], "bool"],
  ["SHOWEMAILID", ["show_email_id", "show_emailid"], "bool"],
  ["OptionOrientation", ["option_orientation"], "text"],
  ["TimeFormat", ["time_format"], "text"],
  ["COMPULSORYTIME", ["compulsory_time"], "number"],
  ["UsefulDataFile1", ["useful_data_file_1", "useful_data_file1", "useful_data_file"], "text"],
  ["UsefulDataFile2", ["useful_data_file_2", "useful_data_file2"], "text"],
];

/** Duration from the CSV, or 0 when the CSV does not override it. */
export function csvConfDuration(csv) {
  const record = parseCsv(csv)[0] || {};
  const value = Number(csvValue(record, ["assessment_duration", "duration_minutes", "duration"]));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Apply optional paper-level CSV columns to one confDetails.xml string. */
export function applyCsvConfSettings(confXml, csv) {
  const record = parseCsv(csv)[0] || {};
  let xml = String(confXml || "");
  for (const [tag, names, kind] of CONF_FIELDS) {
    const raw = csvValue(record, names);
    if (!raw) continue;
    let value = raw;
    if (kind === "bool") value = yesNo(raw);
    if (kind === "number") {
      const number = Number(raw);
      if (!Number.isFinite(number)) continue;
      value = String(number);
    }
    xml = setConfTag(xml, tag, value);
  }
  return xml;
}

function optionList(record) {
  const raw = csvValue(record, ["options", "answer_options"]);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((entry, index) => {
        if (entry && typeof entry === "object") {
          return {
            body: String(entry.body ?? entry.text ?? entry.option ?? ""),
            extId: String(entry.id ?? entry.extId ?? entry.option_id ?? ""),
            correct: Boolean(entry.correct),
            seq: index + 1,
          };
        }
        return { body: String(entry ?? ""), extId: "", correct: false, seq: index + 1 };
      }).filter((option) => option.body !== "");
    }
  } catch { /* not JSON, split below */ }

  const parts = raw.includes("\n") || raw.includes("\r") ? raw.split(/\r?\n/) : raw.split("|");
  return parts.map((body, index) => ({ body: body.trim(), extId: "", correct: false, seq: index + 1 }))
    .filter((option) => option.body);
}

function correctTokens(record) {
  const raw = csvValue(record, ["correct_options", "correct_option", "correct", "answer_key", "key"]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((entry) => String(entry).trim()).filter(Boolean);
  } catch { /* split below */ }
  return raw.split(/[,\|;]+/).map((part) => part.trim()).filter(Boolean);
}

/**
 * Convert CSV rows into one language's quiz.xml.
 * @param {{csv:string,name?:string,code?:number,totalTime?:number}} input
 */
export function buildQuizXmlFromCsv({ csv, name = "English", code = 1, totalTime = 0 } = {}) {
  const records = parseCsv(csv);
  if (!records.length) throw badRequest("The CSV paper is empty.");

  const languageName = String(name || "English").trim() || "English";
  const languageCode = Math.max(1, Math.min(99, Number.parseInt(code, 10) || 1));

  const groups = [];
  const groupByName = new Map();
  const usedQuestionIds = new Set();
  let questionSeq = 0;
  let totalMarks = 0;

  for (const record of records) {
    const body = csvValue(record, ["body_html", "body", "question", "question_text", "questionstring"]);
    if (!body) continue;

    const groupName = csvValue(record, ["group", "group_name"]) || "General";
    const groupKey = groupName.toLowerCase();
    let group = groupByName.get(groupKey);
    if (!group) {
      group = {
        name: groupName,
        extId: csvValue(record, ["group_id", "groupid"]),
        instruction: "",
        instructionMinutes: 0,
        maxDurationMinutes: 0,
        sections: [],
        sectionByName: new Map(),
        totalMarks: 0,
      };
      groupByName.set(groupKey, group);
      groups.push(group);
    }
    if (!group.extId) group.extId = csvValue(record, ["group_id", "groupid"]);
    if (!group.instruction) {
      group.instruction = csvValue(record, [
        "group_instruction", "group_instructions", "group_instruction_text",
        "groupinstructions", "groupinst",
      ]);
    }
    if (!group.instructionMinutes) {
      group.instructionMinutes = Math.max(0, csvNumber(csvValue(record, [
        "group_instruction_time", "group_instruction_minutes", "group_instruction_time_minutes",
        "instruction_time", "group_instruction_min",
      ]), 0));
    }
    if (!group.maxDurationMinutes) {
      group.maxDurationMinutes = Math.max(0, csvNumber(csvValue(record, [
        "group_max_duration", "group_max_duration_minutes", "max_duration", "group_duration",
      ]), 0));
    }

    const sectionName = csvValue(record, ["section", "section_name"]) || "General";
    const sectionKey = sectionName.toLowerCase();
    let section = group.sectionByName.get(sectionKey);
    if (!section) {
      section = {
        name: sectionName,
        extId: csvValue(record, ["section_id", "sectionid"]),
        instruction: "",
        sectionType: "ONLINE",
        maxQuestions: 0,
        questions: [],
        totalMarks: 0,
      };
      group.sectionByName.set(sectionKey, section);
      group.sections.push(section);
    }
    if (!section.extId) section.extId = csvValue(record, ["section_id", "sectionid"]);
    if (!section.instruction) {
      section.instruction = csvValue(record, [
        "section_instruction", "section_instructions", "section_instruction_text",
        "sectioninstructions", "sectioninst",
      ]);
    }
    const sectionType = csvValue(record, ["section_type", "sectiontype"]);
    if (sectionType) section.sectionType = sectionType;
    const maxQuestions = Math.max(0, csvNumber(csvValue(record, [
      "section_max_questions", "max_questions", "max_questions_to_be_attempted",
    ]), 0));
    if (maxQuestions) section.maxQuestions = maxQuestions;

    questionSeq += 1;
    const questionNo = csvValue(record, ["question_no", "question_number", "q_no", "qno", "sr_no", "srno"]);
    let questionId = csvValue(record, ["question_id", "questionid", "ext_id"]);
    if (!questionId && questionNo) questionId = /^\d+$/.test(questionNo) ? `Q${questionNo}` : questionNo;
    if (!questionId) questionId = `Q${questionSeq}`;
    if (usedQuestionIds.has(questionId)) {
      const base = questionId;
      let suffix = 2;
      while (usedQuestionIds.has(`${base}-${suffix}`)) suffix += 1;
      questionId = `${base}-${suffix}`;
    }
    usedQuestionIds.add(questionId);

    const type = csvValue(record, ["type", "question_type"]) || "MCQ";
    const marks = Math.max(0, csvNumber(csvValue(record, ["marks", "mark", "allotted_marks"]), 1));
    const negativeMarks = Math.max(0, csvNumber(csvValue(record, ["negative_marks", "negative", "negative_mark"]), 0));
    const mandatory = csvFlag(csvValue(record, ["mandatory", "is_mandatory"]));
    const hint = csvValue(record, ["hint"]);

    const correctIndexes = new Set();
    const correctExtIds = new Set();
    for (const token of correctTokens(record)) {
      const numeric = Number(token);
      if (Number.isInteger(numeric) && numeric > 0) correctIndexes.add(numeric);
      else correctExtIds.add(token);
    }

    const optionsXml = optionList(record).map((option, index) => {
      const seq = option.seq || index + 1;
      const optionId = option.extId || `${questionId}O${seq}`;
      const correct = option.correct || correctIndexes.has(seq) || correctExtIds.has(optionId);
      return `<option optionID="${xmlAttr(optionId)}" sequenceID="${seq}" correct="${correct ? "true" : "false"}"><optionText>${cdata(option.body)}</optionText></option>`;
    });

    section.questions.push(
      `<question id="${xmlAttr(questionId)}" type="${xmlAttr(type)}" allottedMarks="${marks}" negativeMarks="${negativeMarks}" isMandatory="${mandatory ? "true" : "false"}" maxTime="0" numberOfReplays="0">
   <languageSpecificData>
      <lang id="${languageCode}">
         <questionString>${cdata(body)}</questionString>
         <hint>${cdata(hint)}</hint>
         <allOptions>
${optionsXml.join("\n")}
         </allOptions>
      </lang>
   </languageSpecificData>
</question>`,
    );
    section.totalMarks += marks;
    group.totalMarks += marks;
    totalMarks += marks;
  }

  if (!questionSeq) throw badRequest("The CSV paper has no questions.");

  const groupsXml = groups.map((group, groupIndex) => {
    const groupId = group.extId || `G${groupIndex + 1}`;
    const sectionsXml = group.sections.map((section, sectionIndex) => {
      const sectionId = section.extId || `S${groupIndex + 1}-${sectionIndex + 1}`;
      const maxQuestions = section.maxQuestions || section.questions.length;
      return `<section id="${xmlAttr(sectionId)}" sectionType="${xmlAttr(section.sectionType || "ONLINE")}" isOptional="false" totalMarks="${roundMarks(section.totalMarks)}" maxQuestionsToBeAttempted="${maxQuestions}" instructionTime="0" MinInstructionTime="0">
   <sectionDisplayText>${cdata(section.name)}</sectionDisplayText>
   <sectionInstruction>${cdata(section.instruction)}</sectionInstruction>
   <subsections>
      <subsection id="${xmlAttr(sectionId)}-SS1">
         <questions>
${section.questions.join("\n")}
         </questions>
      </subsection>
   </subsections>
</section>`;
    }).join("\n");

    return `<group id="${xmlAttr(groupId)}" totalMarks="${roundMarks(group.totalMarks)}" instructionTime="${roundMarks(group.instructionMinutes)}" maxDuration="${roundMarks(group.maxDurationMinutes)}" minDuration="0">
   <groupDisplayText>${cdata(group.name)}</groupDisplayText>
   <groupInstructions>${cdata(group.instruction)}</groupInstructions>
   <sections>
${sectionsXml}
   </sections>
</group>`;
  }).join("\n");

  const duration = Math.round(Number(totalTime) || 0);
  const timeAttr = duration > 0 ? ` questionPaperTotalTime="${duration}"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<questionPaperXML${timeAttr} totalMarks="${roundMarks(totalMarks)}">
   <languages>
      <language id="${languageCode}" name="${xmlAttr(languageName)}"/>
   </languages>
   <groups>
${groupsXml}
   </groups>
</questionPaperXML>`;
}
