// Application settings (key/value) plus the validated presentation config.
import * as settingsRepo from "../db/repositories/settings.repo.mjs";
import * as assessmentsRepo from "../db/repositories/assessments.repo.mjs";
import { applyPresentationOverrides, buildConfig, presentationFromAdmin, settingsFromAdmin } from "../domain/ui-config.mjs";
import { badRequest, notFound } from "../core/errors.mjs";
import { normalizeInstructionTemplate } from "../domain/paper-instructions.mjs";

const ASSESSMENT_TOPBAR_KEY = (id) => `assessment_topbar:${id}`;
const ASSESSMENT_TOOLS_KEY = (id) => `assessment_tools:${id}`;

let cachedSettings = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60000;

export const clearSettingsCache = () => {
  cachedSettings = null;
  cacheTime = 0;
};

const raw = async () => {
  const now = Date.now();
  if (cachedSettings && (now - cacheTime) < CACHE_TTL_MS) {
    return cachedSettings;
  }
  const rows = await settingsRepo.listSettings();
  cachedSettings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  cacheTime = now;
  return cachedSettings;
};

/** Every stored setting merged with presentation defaults. */
export const all = async () => {
  const stored = await raw();
  const ui = buildConfig(stored);
  return {
    ...stored,
    brand_name: ui.brand.name,
    brand_mark: ui.brand.mark,
    brand_icon: ui.brand.icon,
    brand_admin_title: ui.brand.adminTitle,
    brand_admin_sidebar: ui.brand.adminSidebar,
    brand_version: ui.brand.version,
    exam_topbar: JSON.stringify(ui.topbar),
    exam_tools: JSON.stringify(ui.tools),
    exam_languages: ui.languages.join(","),
  };
};

export const get = async (key, fallback = "") => settingsRepo.getSetting(key, fallback);

const parseObject = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * Persist a validated subset of settings and return the merged result.
 *
 * Controls that were removed from the admin screen (custom top-bar buttons,
 * language list) are not part of the form payload. When a caller omits
 * `custom`, the stored list is merged back so saving the page never silently
 * deletes them.
 */
export async function update(entries) {
  const patch = { ...entries };
  if ("exam_topbar" in patch) {
    const incoming = parseObject(patch.exam_topbar);
    if (!("custom" in incoming)) {
      const stored = parseObject((await raw()).exam_topbar);
      patch.exam_topbar = JSON.stringify({ ...incoming, custom: stored.custom || [] });
    }
  }
  await settingsRepo.setMany(settingsFromAdmin(patch));
  // Saving the global candidate UI is authoritative: every assessment should
  // follow the new values, so drop all per-assessment presentation overrides.
  if ("exam_topbar" in patch || "exam_tools" in patch) {
    await settingsRepo.deleteSettingsByPrefix(ASSESSMENT_TOPBAR_KEY(""));
    await settingsRepo.deleteSettingsByPrefix(ASSESSMENT_TOOLS_KEY(""));
  }
  clearSettingsCache();
  return all();
}

const overrideFor = (stored, key) => {
  if (!stored[key]) return null;
  const parsed = parseObject(stored[key]);
  return Object.keys(parsed).length ? parsed : null;
};

/** Stored per-assessment overrides plus the effective (global-merged) config. */
export async function assessmentPresentation(assessmentId) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");

  const stored = await raw();
  const overrides = {
    topbar: overrideFor(stored, ASSESSMENT_TOPBAR_KEY(assessmentId)),
    tools: overrideFor(stored, ASSESSMENT_TOOLS_KEY(assessmentId)),
  };
  const effective = applyPresentationOverrides(buildConfig(stored), overrides);
  return {
    assessmentId,
    overridden: { topbar: Boolean(overrides.topbar), tools: Boolean(overrides.tools) },
    topbar: effective.topbar,
    tools: effective.tools,
  };
}

/** Save per-assessment presentation values. */
export async function updateAssessmentPresentation(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");

  const rows = presentationFromAdmin(body);
  if (rows.topbar !== undefined) await settingsRepo.setSetting(ASSESSMENT_TOPBAR_KEY(assessmentId), rows.topbar);
  if (rows.tools !== undefined) await settingsRepo.setSetting(ASSESSMENT_TOOLS_KEY(assessmentId), rows.tools);
  clearSettingsCache();
  return assessmentPresentation(assessmentId);
}

/** Drop per-assessment overrides so the assessment follows the global defaults. */
export async function resetAssessmentPresentation(assessmentId, body = {}) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw notFound("Assessment not found.");
  if (body.topbar !== false) await settingsRepo.deleteSetting(ASSESSMENT_TOPBAR_KEY(assessmentId));
  if (body.tools !== false) await settingsRepo.deleteSetting(ASSESSMENT_TOOLS_KEY(assessmentId));
  clearSettingsCache();
  return assessmentPresentation(assessmentId);
}

/** Remove stored overrides when their assessment is deleted. */
export async function clearAssessmentOverrides(assessmentId) {
  await settingsRepo.deleteSetting(ASSESSMENT_TOPBAR_KEY(assessmentId));
  await settingsRepo.deleteSetting(ASSESSMENT_TOOLS_KEY(assessmentId));
  clearSettingsCache();
}

/** Public candidate config: no secrets, only what the console renders. */
export const candidateConfig = async (assessmentId = "") => {
  const stored = await raw();
  const base = buildConfig(stored);
  if (!assessmentId) return base;
  return applyPresentationOverrides(base, {
    topbar: overrideFor(stored, ASSESSMENT_TOPBAR_KEY(assessmentId)),
    tools: overrideFor(stored, ASSESSMENT_TOOLS_KEY(assessmentId)),
  });
};

/** Candidate instruction template: one row per language, stored as JSON. */
export const INSTRUCTION_SETTINGS_KEY = "exam_instructions";

export async function instructionTemplate() {
  const stored = parseObject((await raw())[INSTRUCTION_SETTINGS_KEY]);
  return normalizeInstructionTemplate(stored);
}

export async function saveInstructionTemplate(rows = []) {
  const template = normalizeInstructionTemplate(rows);
  if (!template.length) throw badRequest("At least one language is required.");
  await settingsRepo.setSetting(INSTRUCTION_SETTINGS_KEY, JSON.stringify(template));
  clearSettingsCache();
  return template;
}
