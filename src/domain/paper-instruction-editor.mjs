// Read and update the candidate instruction files in a friendly, per-language
// shape. The files are small XML wrappers around CDATA HTML blocks; the admin
// editor only touches INSTRUCTIONTEXT and the disclaimer tags, keeping every
// other byte (custom exit text, styling) intact.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const INSTRUCTION_RE = /<INSTRUCTION\b[^>]*>[\s\S]*?<\/INSTRUCTION>/gi;

const xmlEscape = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const cdata = (value) => `<![CDATA[${String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const tagInner = (block, tag) => {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  return match ? match[1].trim() : "";
};

const tagText = (block, tag) =>
  tagInner(block, tag)
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();

const rootTagOf = (xml, fallback) => {
  const match = /<([A-Z][A-Z0-9_]*)\b/i.exec(String(xml || ""));
  return match ? match[1] : fallback;
};

/** Parse one instruction file into language blocks. */
export function parseInstructionFile(xml) {
  const blocks = [];
  for (const match of String(xml || "").matchAll(INSTRUCTION_RE)) {
    const block = match[0];
    const id = Number.parseInt(tagText(block, "LANGID"), 10);
    if (!Number.isFinite(id)) continue;
    blocks.push({
      id,
      name: tagText(block, "LANGNAME"),
      instructionText: tagText(block, "INSTRUCTIONTEXT"),
      disclaimerText: tagText(block, "DISCLAIMERTEXT"),
      disclaimerTextOA: tagText(block, "DISCLAIMERTEXTOA"),
      exitPageText: tagText(block, "EXITPAGETEXT"),
    });
  }
  return blocks;
}

function replaceTag(block, tag, value) {
  const replacement = `<${tag}>${cdata(value)}</${tag}>`;
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "i");
  if (re.test(block)) return block.replace(re, () => replacement);
  return block.replace(/<\/INSTRUCTION>/i, () => `${replacement}\n</INSTRUCTION>`);
}

function renderBlock(language) {
  return `<INSTRUCTION>
<LANGID>${language.id}</LANGID>
<LANGNAME>${xmlEscape(language.name)}</LANGNAME>
<INSTRUCTIONTEXT>${cdata(language.instructionText || "")}</INSTRUCTIONTEXT>
</INSTRUCTION>`;
}

/**
 * Update (or create) one block per supplied language.
 * @param {string} file absolute instruction file path
 * @param {string} fallbackRoot root tag for a brand-new file
 * @param {Array<{id:number,name:string,values:object}>} languages
 * @param {Array<[string,string]>} fields [xml tag, value key]
 */
export function writeInstructionFile(file, fallbackRoot, languages, fields) {
  const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
  const root = rootTagOf(existing, fallbackRoot);
  let xml = existing || `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n</${root}>\n`;
  const byId = new Map(parseInstructionFile(xml).map((entry) => [entry.id, entry]));
  const seen = new Set();

  for (const language of languages) {
    const id = Number(language?.id);
    if (!Number.isFinite(id) || seen.has(id)) continue;
    seen.add(id);
    const previous = byId.get(id);
    const name = String(language.name || previous?.name || `Language ${id}`).trim() || `Language ${id}`;
    const values = language.values || {};
    const blocks = [];
    const re = /<INSTRUCTION\b[^>]*>[\s\S]*?<\/INSTRUCTION>/gi;
    let match;
    while ((match = re.exec(xml))) blocks.push(match[0]);
    const existingBlock = blocks.find((block) => Number.parseInt(tagText(block, "LANGID"), 10) === id) || null;

    let next = existingBlock || renderBlock({
      id,
      name,
      instructionText: values.instructionText || "",
    });

    // Language name is metadata; keep it aligned with the paper.
    next = next.replace(/(<LANGNAME\b[^>]*>)[\s\S]*?(<\/LANGNAME>)/i, `$1${xmlEscape(name)}$2`);
    if (!/<LANGNAME\b/i.test(next)) {
      next = next.replace(/(<LANGID\b[^>]*>[\s\S]*?<\/LANGID>)/i, `$1\n<LANGNAME>${xmlEscape(name)}</LANGNAME>`);
    }

    for (const [tag, key] of fields) {
      if (!(key in values)) continue;
      next = replaceTag(next, tag, values[key]);
    }

    if (existingBlock) {
      xml = xml.replace(existingBlock, () => next);
    } else {
      xml = xml.replace(new RegExp(`</${root}>\\s*$`, "i"), () => `${next}\n</${root}>\n`);
    }
  }

  writeFileSync(file, xml, "utf8");
  return xml;
}

/** Remove instruction blocks for languages that are no longer part of the paper. */
export function pruneInstructionLanguages(file, removedIds) {
  if (!existsSync(file)) return false;
  const drop = new Set([...(removedIds || [])].map(Number));
  if (!drop.size) return false;
  const xml = readFileSync(file, "utf8");
  const next = xml.replace(INSTRUCTION_RE, (block) => {
    const id = Number.parseInt(tagText(block, "LANGID"), 10);
    return drop.has(id) ? "" : block;
  });
  if (next === xml) return false;
  writeFileSync(file, next, "utf8");
  return true;
}

/** Merge parsed blocks for every language the paper declares. */
export function mergeInstructionView(languages, systemBlocks = [], customBlocks = []) {
  const systemById = new Map(systemBlocks.map((block) => [Number(block.id), block]));
  const customById = new Map(customBlocks.map((block) => [Number(block.id), block]));
  return (languages || []).map((language) => {
    const id = Number(language.id);
    const system = systemById.get(id);
    const custom = customById.get(id);
    return {
      id,
      name: String(language.name || system?.name || custom?.name || `Language ${id}`),
      primary: Boolean(language.primary),
      systemInstruction: system?.instructionText || "",
      customInstruction: custom?.instructionText || "",
      disclaimer: custom?.disclaimerText || custom?.disclaimerTextOA || "",
    };
  });
}
