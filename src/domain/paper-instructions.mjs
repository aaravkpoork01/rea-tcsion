// Default candidate instruction files for imported papers.
//
// The instructions page always fetches <paper>/sysInstructions.xml and
// <paper>/custInstructions.xml. A paper uploaded through the admin panel only
// contains quiz.xml + confDetails.xml, so without these two files the page
// fails to error.html?E404. Generate sensible defaults, keeping any existing
// instruction blocks that match an uploaded language.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const INSTRUCTION_RE = /<INSTRUCTION\b[^>]*>[\s\S]*?<\/INSTRUCTION>/gi;

const xmlEscape = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const tagInner = (block, tag) => {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return match ? match[1].trim() : "";
};

const tagText = (block, tag) =>
  tagInner(block, tag)
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();

const cdata = (value) => `<![CDATA[${String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const SYSTEM_TEXT = `<div style="padding:10px">
<h3>General Instructions</h3>
<ol>
<li>Total duration of the examination is <span class="completeDuration"></span> minutes.</li>
<li>The countdown timer at the top right shows the time remaining. The examination ends automatically when the timer reaches zero.</li>
<li>Use the question palette on the right to move between questions.</li>
<li>Click <strong>Save &amp; Next</strong> to save your answer and move to the next question.</li>
<li>Do not close, refresh or navigate away from the examination window.</li>
</ol>
</div>`;

const DISCLAIMER_TEXT =
  "I have read and understood the instructions. I agree to abide by the examination rules and confirm that the computer allotted to me is working properly.";

const normalizeLanguages = (languages) => {
  const seen = new Set();
  const list = [];
  for (const language of Array.isArray(languages) ? languages : []) {
    const id = Number(language?.id ?? language?.code);
    const name = String(language?.name ?? "").trim();
    if (!Number.isFinite(id) || id < 1 || !name || seen.has(id)) continue;
    seen.add(id);
    list.push({ id, name });
  }
  return list;
};

const MAX_TEMPLATE_TEXT = 500 * 1024;
const templateText = (value) => String(value ?? "").slice(0, MAX_TEMPLATE_TEXT);

/**
 * Normalise the globally stored instruction template. The settings table keeps
 * it as JSON, so accept the parsed value as well as a JSON string and the
 * `{ languages: [...] }` wrapper used by the admin API.
 */
export function normalizeInstructionTemplate(value) {
  let source = value;
  if (typeof source === "string") {
    try { source = JSON.parse(source); } catch { source = null; }
  }
  const rows = Array.isArray(source)
    ? source
    : Array.isArray(source?.languages) ? source.languages : [];
  const seen = new Set();
  const list = [];
  for (const row of rows) {
    const id = Number.parseInt(row?.id, 10);
    const name = String(row?.name ?? "").trim().slice(0, 32);
    if (!Number.isInteger(id) || id < 1 || id > 99 || !name || seen.has(id)) continue;
    seen.add(id);
    list.push({
      id,
      name,
      systemInstruction: templateText(row.systemInstruction),
      customInstruction: templateText(row.customInstruction),
      disclaimer: templateText(row.disclaimer),
    });
  }
  return list.sort((a, b) => a.id - b.id);
}

/** Find the global template row for one paper language (id first, then name). */
export function instructionTemplateRow(template, language) {
  const list = Array.isArray(template) ? template : [];
  if (!list.length) return null;
  const id = Number(language?.id);
  const name = String(language?.name ?? "").trim().toLowerCase();
  return list.find((row) => Number(row.id) === id && row.name.toLowerCase() === name)
    || list.find((row) => row.name.toLowerCase() === name)
    || null;
}

function renderBlock(language, fields) {
  const body = fields.map(([tag, text]) => `<${tag}>${cdata(text)}</${tag}>`).join("\n");
  return `<INSTRUCTION>
<LANGID>${language.id}</LANGID>
<LANGNAME>${xmlEscape(language.name)}</LANGNAME>
${body}
</INSTRUCTION>`;
}

/**
 * `top.js` reads DISCLAIMERTEXTOA when responses are stored and
 * DISCLAIMERTEXT otherwise, so a kept block must carry both.
 */
function normaliseDisclaimerBlock(block) {
  const rawDisclaimer = tagInner(block, "DISCLAIMERTEXT");
  const rawOa = tagInner(block, "DISCLAIMERTEXTOA");
  const source = rawOa || rawDisclaimer;
  let next = block;
  if (!tagText(next, "DISCLAIMERTEXT")) {
    next = next.replace(/<\/INSTRUCTION>/i, `<DISCLAIMERTEXT>${source}</DISCLAIMERTEXT>\n</INSTRUCTION>`);
  }
  if (!tagText(next, "DISCLAIMERTEXTOA")) {
    next = next.replace(/<\/INSTRUCTION>/i, `<DISCLAIMERTEXTOA>${source}</DISCLAIMERTEXTOA>\n</INSTRUCTION>`);
  }
  return next;
}

/**
 * Keep matching blocks from an existing file (a hand-edited translation should
 * survive a re-import) and add a default block for every uploaded language.
 * Blocks for languages no longer on the paper are dropped so the instructions
 * language picker matches the paper language picker.
 */
function ensureFile(file, rootTag, languages, fields, template = []) {
  const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
  const byLanguage = new Map();

  for (const match of existing.matchAll(INSTRUCTION_RE)) {
    const block = match[0];
    const id = Number.parseInt(tagText(block, "LANGID"), 10);
    const name = tagText(block, "LANGNAME").toLowerCase();
    const hasText = fields.some(({ tag }) => tagText(block, tag) !== "");
    if (!Number.isFinite(id) || !name || !hasText) continue;
    byLanguage.set(`${id}:${name}`, block);
  }

  const blocks = languages.map((language) => {
    const kept = byLanguage.get(`${language.id}:${language.name.toLowerCase()}`);
    if (kept) {
      return fields.some(({ tag }) => tag === "DISCLAIMERTEXTOA")
        ? normaliseDisclaimerBlock(kept)
        : kept;
    }
    const row = instructionTemplateRow(template, language);
    return renderBlock(language, fields.map(({ tag, key, fallback }) => [
      tag,
      row ? row[key] ?? "" : fallback,
    ]));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${blocks.join("\n")}\n</${rootTag}>\n`;
  if (xml !== existing) writeFileSync(file, xml, "utf8");
}

/**
 * Ensure both instruction files exist and cover every paper language.
 * @param {string} folder paper folder that holds quiz.xml
 * @param {Array<{id:number,name:string}>} languages merged language list
 * @param {Array<object>} template globally stored instruction rows
 */
export function ensureInstructionFiles(folder, languages, template = []) {
  const list = normalizeLanguages(languages);
  if (!folder || !list.length) return;

  ensureFile(join(folder, "sysInstructions.xml"), "SYSTEMINSTRUCTIONS", list, [
    { tag: "INSTRUCTIONTEXT", key: "systemInstruction", fallback: SYSTEM_TEXT },
  ], template);
  ensureFile(join(folder, "custInstructions.xml"), "CUSTOMINSTRUCTIONS", list, [
    { tag: "INSTRUCTIONTEXT", key: "customInstruction", fallback: "" },
    { tag: "DISCLAIMERTEXT", key: "disclaimer", fallback: DISCLAIMER_TEXT },
    { tag: "DISCLAIMERTEXTOA", key: "disclaimer", fallback: DISCLAIMER_TEXT },
  ], template);
}
