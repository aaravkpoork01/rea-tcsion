// Multi-language paper assembly.
//
// iON question papers are a quiz.xml + confDetails.xml pair. Each question,
// comprehension and linked-answer block carries a <languageSpecificData>
// element with one <lang id="N"> block per language. To host a paper in two or
// three languages we merge the uploaded pairs into the primary XML:
//
//   • every element keeps its original bytes (CDATA, attributes, ordering);
//   • language blocks from the other uploads are appended with the language id
//     chosen in the admin UI;
//   • <languages> and <SoftwareLanguages> are rewritten to the merged list.
//
// Uploads are archived under <base>/languages/<code>/ so a merge can always be
// inspected or repeated.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, sep } from "node:path";

import { config } from "../../config/index.mjs";
import { badRequest } from "../core/errors.mjs";

const ELEMENT_RE = /<(question|comprehension|laq)\b([^>]*)>([\s\S]*?)<\/\1>/g;
const LANG_RE = /<lang\b([^>]*)>([\s\S]*?)<\/lang>/g;
const LSD_RE = /<languageSpecificData>([\s\S]*?)<\/languageSpecificData>/;
const LANGS_RE = /<languages>[\s\S]*?<\/languages>/;
const SOFTWARE_LANGS_RE = /<SoftwareLanguages>[\s\S]*?<\/SoftwareLanguages>/;

const attrOf = (attrs, name) => {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(attrs || "");
  return match ? match[1] : "";
};

const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lang";

function assertPaper(kind, xml) {
  const probe = kind === "quiz" ? /<questionPaperXML\b/ : /<Details\b/;
  if (!probe.test(xml) || xml.length < 200) {
    throw badRequest(`${kind === "quiz" ? "quiz.xml" : "confDetails.xml"} is not a valid iON paper file.`);
  }
}

/** Validate the admin payload and return clean entries. */
export function validateUpload(entries) {
  const list = Array.isArray(entries) ? entries : [];
  if (!list.length || list.length > 3) throw badRequest("Upload between one and three language papers.");

  const codes = new Set();
  const names = new Set();
  return list.map((raw, index) => {
    const name = String(raw?.name || "").trim().slice(0, 32);
    const code = Number.parseInt(raw?.code, 10);
    const quizXml = String(raw?.quizXml || "");
    const confXml = String(raw?.confXml || "");

    if (!name) throw badRequest(`Language ${index + 1}: name is required.`);
    if (names.has(name.toLowerCase())) throw badRequest(`Language "${name}" is uploaded twice.`);
    if (!Number.isFinite(code) || code < 1 || code > 99) throw badRequest(`Language "${name}": id must be 1–99.`);
    if (codes.has(code)) throw badRequest(`Language id ${code} is used twice.`);
    assertPaper("quiz", quizXml);
    assertPaper("conf", confXml);

    names.add(name.toLowerCase());
    codes.add(code);
    return { name, code, quizXml, confXml, primary: Boolean(raw?.primary) || index === 0 };
  });
}

export function extractLanguages(xml) {
  const map = languageMap(xml);
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, name], index) => ({ id, name, primary: index === 0 }));
}

function languageMap(xml) {
  const map = new Map();
  const block = LANGS_RE.exec(xml);
  if (!block) return map;
  const re = /<language\b([^>]*)\/>/g;
  let match;
  while ((match = re.exec(block[0]))) {
    const id = Number.parseInt(attrOf(match[1], "id"), 10);
    const name = attrOf(match[1], "name");
    if (Number.isFinite(id) && name) map.set(id, name);
  }
  return map;
}

function langBlocks(body) {
  const out = [];
  let match;
  while ((match = LANG_RE.exec(body))) out.push({ attrs: match[1], body: match[2], id: attrOf(match[1], "id") });
  LANG_RE.lastIndex = 0;
  return out;
}

function secondaryIndex(xml) {
  const index = new Map();
  ELEMENT_RE.lastIndex = 0;
  let match;
  while ((match = ELEMENT_RE.exec(xml))) {
    const [whole, tag, attrs, body] = match;
    const id = attrOf(attrs, "id");
    if (id) index.set(`${tag}:${id}`, { whole, tag, attrs, body, id });
  }
  ELEMENT_RE.lastIndex = 0;
  return index;
}

function pickBlocks(blocks, code) {
  const exact = blocks.find((block) => block.id === String(code));
  return exact || blocks[0] || null;
}

/**
 * Copy one language block from every secondary question/comprehension/laq into
 * the matching primary element. Matching is by element id first; when a
 * language CSV uses different ids it falls back to document order, so both
 * translations still land on the primary question's shared id.
 */
function mergeLanguagesInto(primary, secondary, code) {
  const primaryKeys = new Set();
  ELEMENT_RE.lastIndex = 0;
  let primaryMatch;
  while ((primaryMatch = ELEMENT_RE.exec(primary))) {
    const id = attrOf(primaryMatch[2], "id");
    if (id) primaryKeys.add(`${primaryMatch[1]}:${id}`);
  }
  ELEMENT_RE.lastIndex = 0;

  const index = secondaryIndex(secondary);
  const byTag = new Map();
  const reserved = new Set();
  for (const element of index.values()) {
    if (!byTag.has(element.tag)) byTag.set(element.tag, []);
    byTag.get(element.tag).push(element);
    if (element.id && primaryKeys.has(`${element.tag}:${element.id}`)) reserved.add(element);
  }

  const used = new Set();
  let merged = 0;

  const output = primary.replace(ELEMENT_RE, (whole, tag, attrs, body) => {
    const id = attrOf(attrs, "id");
    let source = id ? index.get(`${tag}:${id}`) : null;
    if (!source) {
      const candidates = byTag.get(tag) || [];
      const free = candidates.filter((element) => !reserved.has(element) && !used.has(element));
      source = free[0] || null;
    }
    if (!source || used.has(source)) return whole;

    const sourceBlocks = langBlocks(source.body);
    const picked = pickBlocks(sourceBlocks, code);
    if (!picked) return whole;

    const container = LSD_RE.exec(body);
    if (!container) return whole;

    const existing = new Set(langBlocks(container[1]).map((block) => block.id));
    if (existing.has(String(code))) {
      used.add(source);
      return whole;
    }

    const addition = `<lang id="${code}">${picked.body}</lang>`;
    const newBody = body.replace(LSD_RE, (match, inner) => `<languageSpecificData>${inner}${addition}</languageSpecificData>`);
    used.add(source);
    merged += 1;
    return `<${tag}${attrs}>${newBody}</${tag}>`;
  });

  ELEMENT_RE.lastIndex = 0;
  return { xml: output, merged };
}

function renderLanguages(map) {
  const rows = [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, name]) => `      <language id="${id}" name="${name.replace(/"/g, "&quot;")}"/>`)
    .join("\n");
  return `<languages>\n${rows}\n   </languages>`;
}

function replaceSoftwareLanguages(confXml, names) {
  const joined = names.join(",");
  if (SOFTWARE_LANGS_RE.test(confXml)) {
    return confXml.replace(SOFTWARE_LANGS_RE, `<SoftwareLanguages>${joined}</SoftwareLanguages>`);
  }
  return confXml.replace(/<\/Details>/, `<SoftwareLanguages>${joined}</SoftwareLanguages></Details>`);
}

/**
 * Rewrite only the declared-language metadata in an existing paper pair.
 *
 * The admin language manager can add or remove languages after a paper was
 * imported. <languages> and <SoftwareLanguages> must match the assessment
 * language rows, and <lang> blocks for removed languages are dropped so a
 * later language with the same id cannot inherit stale translations.
 */
export function rewriteDeclaredLanguages(quizXml, confXml, languages, removedIds = []) {
  const map = new Map();
  for (const language of languages || []) {
    const id = Number.parseInt(language?.id, 10);
    const name = String(language?.name || "").trim();
    if (Number.isFinite(id) && name) map.set(id, name);
  }
  if (!map.size) throw badRequest("At least one language is required.");

  const drop = new Set((removedIds || []).map(Number));
  const dropRe = /<lang\b([^>]*)>([\s\S]*?)<\/lang>/g;
  let nextQuiz = String(quizXml || "").replace(dropRe, (whole, attrs) => {
    const id = Number.parseInt(attrOf(attrs, "id"), 10);
    return drop.has(id) ? "" : whole;
  });
  nextQuiz = LANGS_RE.test(nextQuiz)
    ? nextQuiz.replace(LANGS_RE, renderLanguages(map))
    : nextQuiz.replace(/(<questionPaperXML[^>]*>)/, `$1\n   ${renderLanguages(map)}`);

  const names = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, name]) => name);
  const nextConf = String(confXml || "") ? replaceSoftwareLanguages(String(confXml || ""), names) : "";

  return { quizXml: nextQuiz, confXml: nextConf };
}

const RESPONSE_HANDLER_RE = /<CandidateResponseHandlerURL\b/i;
const RESPONSE_HANDLER = "<CandidateResponseHandlerURL>/IBA/MockCandResponseHandler</CandidateResponseHandlerURL>";

function ensureResponseHandler(confXml) {
  if (RESPONSE_HANDLER_RE.test(confXml)) return confXml;
  return confXml.replace(/(<Details\b[^>]*>)/i, `$1\n${RESPONSE_HANDLER}`);
}

/**
 * Merge uploaded pairs, archive them and return the merged XML strings.
 * @param {{basePath:string, entries:Array<{name:string,code:number,quizXml:string,confXml:string}>}} input
 */
export function mergePapers({ basePath, entries }) {
  const files = validateUpload(entries);
  const primary = files.find((entry) => entry.primary) || files[0];
  if (!primary) throw badRequest("A primary language paper is required.");

  const relative = String(basePath || "").replace(/^\/+|\/+$/g, "");
  if (!relative) throw badRequest("Assessment base path is required.");

  const folder = resolve(config.paths.mirror, relative);
  if (!folder.startsWith(resolve(config.paths.mirror) + sep)) throw badRequest("Base path escapes the paper directory.");

  const languages = files.map((entry) => ({ name: entry.name, code: entry.code }));

  let quizXml = primary.quizXml;
  let confXml = primary.confXml;
  let merged = 0;

  for (const entry of files) {
    if (entry === primary) continue;
    const result = mergeLanguagesInto(quizXml, entry.quizXml, entry.code);
    quizXml = result.xml;
    merged += result.merged;
  }

  const map = languageMap(quizXml);
  for (const entry of files) map.set(entry.code, entry.name);
  quizXml = LANGS_RE.test(quizXml)
    ? quizXml.replace(LANGS_RE, renderLanguages(map))
    : quizXml.replace(/(<questionPaperXML[^>]*>)/, `$1\n   ${renderLanguages(map)}`);

  confXml = replaceSoftwareLanguages(confXml, [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, name]) => name));
  confXml = ensureResponseHandler(confXml);

  try { mkdirSync(folder, { recursive: true }); } catch (_) {}
  try { mkdirSync(join(folder, "languages"), { recursive: true }); } catch (_) {}

  // Keep the pre-merge paper once, for rollback/diffing.
  const original = join(folder, "languages", "original");
  try {
    if (existsSync(join(folder, "quiz.xml")) && !existsSync(join(original, "quiz.xml"))) {
      mkdirSync(original, { recursive: true });
      writeFileSync(join(original, "quiz.xml"), readFileSync(join(folder, "quiz.xml")));
      writeFileSync(join(original, "confDetails.xml"), readFileSync(join(folder, "confDetails.xml")));
    }
  } catch (_) {}

  const archive = files.map((entry) => {
    const dir = join(folder, "languages", `${entry.code}-${slug(entry.name)}`);
    try { mkdirSync(dir, { recursive: true }); } catch (_) {}
    try { writeFileSync(join(dir, "quiz.xml"), entry.quizXml); } catch (_) {}
    try { writeFileSync(join(dir, "confDetails.xml"), entry.confXml); } catch (_) {}
    return { name: entry.name, code: entry.code, path: dir };
  });

  try { writeFileSync(join(folder, "quiz.xml"), quizXml); } catch (_) {}
  try { writeFileSync(join(folder, "confDetails.xml"), confXml); } catch (_) {}

  return {
    basePath: `/${relative}/`,
    languages,
    mergedElements: merged,
    archived: archive,
    quizXml,
    confXml,
  };
}
