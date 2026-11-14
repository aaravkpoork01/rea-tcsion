// Keep question-level content in quiz.xml in sync with admin edits.
//
// The candidate console renders the paper XML directly, so edits made in the
// question bank only reach the candidate when the matching question block (and
// its language block) is rewritten. These helpers touch the addressed question
// only and leave every other byte of the paper intact.
const escapeRe = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const xmlAttr = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const cdata = (value) => `<![CDATA[${String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const tagText = (block, tag) => {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  if (!match) return "";
  return match[1]
    .trim()
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
};

function setAttr(openTag, name, value) {
  const text = `${name}="${xmlAttr(value)}"`;
  const re = new RegExp(`\\b${escapeRe(name)}="[^"]*"`);
  if (re.test(openTag)) return openTag.replace(re, () => text);
  return openTag.replace(/\s*>$/, () => ` ${text}>`);
}

function setTag(block, tag, value) {
  const replacement = `<${tag}>${cdata(value)}</${tag}>`;
  const re = new RegExp(`<${tag}\\b[^>]*/>|<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "i");
  if (re.test(block)) return block.replace(re, () => replacement);
  return block;
}

function findQuestion(xml, extId) {
  if (!extId) return null;
  const re = new RegExp(`<question\\b[^>]*\\bid="${escapeRe(extId)}"[^>]*>[\\s\\S]*?</question>`, "i");
  return re.exec(xml)?.[0] || null;
}

/** Plain text becomes the primary language's instruction; separators are kept. */
export function normaliseInstruction(value, primaryLangId = 1) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.includes("<instSep>")) return raw;
  return `${Number(primaryLangId) || 1}<instSep>${raw}`;
}

/** Read every questionInstruction value in one quiz.xml, keyed by question id. */
export function questionInstructionMap(xml) {
  const map = new Map();
  const re = /<question\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/question>/gi;
  let match;
  while ((match = re.exec(String(xml || "")))) {
    const value = tagText(match[2], "questionInstruction");
    if (value) map.set(match[1], value);
  }
  return map;
}

/**
 * Set or clear one question's instruction block.
 *
 * The candidate engine reads the instruction countdown from the `<question>`
 * attributes (`instructionTime` / `minInstructionTime`, in seconds). A question
 * that has instruction text but no attributes renders `0NaN:0NaN` and never
 * offers a proceed action, so add sane defaults when an instruction is written.
 */
export function updateQuestionInstructionXml(xml, extId, instruction, options = {}) {
  const block = findQuestion(xml, extId);
  if (!block) return xml;

  const hasInstruction = Boolean(String(instruction || "").trim());
  const openTag = /^<question\b[^>]*>/i.exec(block)?.[0] || "";
  let next = block;
  if (openTag && hasInstruction) {
    let nextOpen = openTag;
    if (options.instructionTimeSec !== undefined) {
      nextOpen = setAttr(nextOpen, "instructionTime", Math.max(0, Number(options.instructionTimeSec) || 0));
    } else if (!/\binstructionTime="/.test(nextOpen)) {
      nextOpen = setAttr(nextOpen, "instructionTime", 60);
    }
    if (options.minInstructionTimeSec !== undefined) {
      nextOpen = setAttr(nextOpen, "minInstructionTime", Math.max(0, Number(options.minInstructionTimeSec) || 0));
    } else if (!/\bminInstructionTime="/.test(nextOpen)) {
      nextOpen = setAttr(nextOpen, "minInstructionTime", 0);
    }
    next = block.replace(openTag, () => nextOpen);
  }

  const tagRe = /<questionInstruction\b[^>]*\/>|<questionInstruction\b[^>]*>[\s\S]*?<\/questionInstruction>/i;
  if (!hasInstruction) {
    next = next.replace(tagRe, "");
  } else {
    const replacement = `<questionInstruction>${cdata(instruction)}</questionInstruction>`;
    next = tagRe.test(next)
      ? next.replace(tagRe, () => replacement)
      : next.replace(/<\/question>\s*$/i, () => `${replacement}\n</question>`);
  }
  return xml.replace(block, () => next);
}

/**
 * Remove every question block from a paper (delete-all in the question bank).
 * Groups and sections stay in place so the admin can upload a new question set
 * without rebuilding the structure.
 */
export function removeQuestionsXml(xml) {
  let next = String(xml || "").replace(/<question\b[^>]*>[\s\S]*?<\/question>\s*/gi, "");
  next = next.replace(/<questionPaperXML\b[^>]*>/i, (open) => setAttr(open, "totalMarks", 0));
  next = next.replace(/<group\b[^>]*>/gi, (open) => setAttr(open, "totalMarks", 0));
  next = next.replace(/<section\b[^>]*>/gi, (open) => setAttr(open, "totalMarks", 0));
  return next;
}

/**
 * Update one question's language text, hint, marks and options in quiz.xml.
 * `question.langId` selects the <lang> block; missing blocks are left alone.
 */
export function updateQuestionXml(xml, question = {}) {
  const block = findQuestion(xml, question.extId);
  if (!block) return xml;

  const openTag = /^<question\b[^>]*>/i.exec(block)?.[0] || "";
  let nextOpen = openTag;
  if (question.marks !== undefined) nextOpen = setAttr(nextOpen, "allottedMarks", question.marks);
  if (question.negativeMarks !== undefined) nextOpen = setAttr(nextOpen, "negativeMarks", question.negativeMarks);
  if (question.mandatory !== undefined) nextOpen = setAttr(nextOpen, "isMandatory", question.mandatory ? "true" : "false");

  let next = block.replace(openTag, () => nextOpen);
  const langId = Number(question.langId);
  if (!Number.isFinite(langId)) return xml.replace(block, () => next);

  const blockLangRe = new RegExp(`<lang\\b[^>]*\\bid="${langId}"[^>]*>[\\s\\S]*?</lang>`, "i");
  const langBlock = blockLangRe.exec(next)?.[0];
  if (!langBlock) return xml.replace(block, () => next);

  let nextLang = langBlock;
  if (question.body !== undefined) nextLang = setTag(nextLang, "questionString", question.body);
  if (question.hint !== undefined) nextLang = setTag(nextLang, "hint", question.hint);

  for (const option of Array.isArray(question.options) ? question.options : []) {
    const optionId = String(option?.extId || "").trim();
    if (!optionId) continue;
    const optionRe = new RegExp(`<option\\b[^>]*\\boptionID="${escapeRe(optionId)}"[^>]*>[\\s\\S]*?</option>`, "i");
    const optionBlock = optionRe.exec(nextLang)?.[0];
    if (!optionBlock) continue;
    const optionOpen = /^<option\b[^>]*>/i.exec(optionBlock)?.[0] || "";
    let nextOption = optionBlock.replace(optionOpen, () => setAttr(optionOpen, "correct", option.correct ? "true" : "false"));
    if (option.body !== undefined) nextOption = setTag(nextOption, "optionText", option.body);
    nextLang = nextLang.replace(optionBlock, () => nextOption);
  }

  next = next.replace(langBlock, () => nextLang);
  return xml.replace(block, () => next);
}
