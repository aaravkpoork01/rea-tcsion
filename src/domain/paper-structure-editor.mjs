// Keep quiz.xml group and section metadata in sync with admin edits.
//
// The candidate console renders the paper XML directly, not the database, so
// renaming a group or editing section instructions from the back office would
// otherwise never reach the candidate. These helpers rewrite only the matching
// group/section block and leave every other byte of the paper intact.
const escapeRe = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const xmlAttr = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const cdata = (value) => `<![CDATA[${String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const minutes = (seconds) => String(Math.round((Number(seconds) || 0) / 60 * 100) / 100);

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

function replaceBlock(xml, block, next) {
  return xml.replace(block, () => next);
}

function findGroup(xml, groupId) {
  if (!groupId) return null;
  const re = new RegExp(`<group\\b[^>]*\\bid="${escapeRe(groupId)}"[^>]*>[\\s\\S]*?</group>`, "i");
  return re.exec(xml)?.[0] || null;
}

function findSection(groupBlock, sectionId) {
  if (!sectionId) return null;
  const re = new RegExp(`<section\\b[^>]*\\bid="${escapeRe(sectionId)}"[^>]*>[\\s\\S]*?</section>`, "i");
  return re.exec(groupBlock)?.[0] || null;
}

/** Update a group's display text, instructions, timings and marks in quiz.xml. */
export function updateGroupXml(xml, group, previousExtId = group?.ext_id) {
  const block = findGroup(xml, previousExtId);
  if (!block) return xml;

  let openTag = /^<group\b[^>]*>/i.exec(block)?.[0] || "";
  let nextOpen = openTag;
  if (group.ext_id) nextOpen = setAttr(nextOpen, "id", group.ext_id);
  nextOpen = setAttr(nextOpen, "instructionTime", minutes(group.instruction_time_sec));
  nextOpen = setAttr(nextOpen, "maxDuration", minutes(group.max_duration_sec));
  nextOpen = setAttr(nextOpen, "totalMarks", group.total_marks);

  let next = block.replace(openTag, () => nextOpen);
  next = setTag(next, "groupDisplayText", group.name);
  next = setTag(next, "groupInstructions", group.instruction);
  return replaceBlock(xml, block, next);
}

/** Remove a group and everything inside it from quiz.xml. */
export function removeGroupXml(xml, groupId) {
  const block = findGroup(xml, groupId);
  if (!block) return xml;
  return replaceBlock(xml, block, "");
}

/** Remove one section from its group in quiz.xml. */
export function removeSectionXml(xml, groupId, sectionId) {
  const groupBlock = findGroup(xml, groupId);
  if (!groupBlock) return xml;
  const block = findSection(groupBlock, sectionId);
  if (!block) return xml;
  const nextGroup = replaceBlock(groupBlock, block, "");
  return replaceBlock(xml, groupBlock, nextGroup);
}

/** Update one section (inside its group) in quiz.xml. */
export function updateSectionXml(xml, groupId, section, previousExtId = section?.ext_id) {
  const groupBlock = findGroup(xml, groupId);
  if (!groupBlock) return xml;
  const block = findSection(groupBlock, previousExtId);
  if (!block) return xml;

  let openTag = /^<section\b[^>]*>/i.exec(block)?.[0] || "";
  let nextOpen = openTag;
  if (section.ext_id) nextOpen = setAttr(nextOpen, "id", section.ext_id);
  nextOpen = setAttr(nextOpen, "sectionType", section.section_type || "ONLINE");
  nextOpen = setAttr(nextOpen, "totalMarks", section.total_marks);
  nextOpen = setAttr(nextOpen, "maxQuestionsToBeAttempted", section.max_questions);

  let next = block.replace(openTag, () => nextOpen);
  next = setTag(next, "sectionDisplayText", section.name);
  next = setTag(next, "sectionInstruction", section.instruction);
  if (section.ext_id && previousExtId && section.ext_id !== previousExtId) {
    next = next.replace(new RegExp(`id="${escapeRe(previousExtId)}(-[^"]*)"`, "g"),
      (_match, suffix) => `id="${xmlAttr(section.ext_id)}${suffix}"`);
  }

  const nextGroup = replaceBlock(groupBlock, block, next);
  return replaceBlock(xml, groupBlock, nextGroup);
}
