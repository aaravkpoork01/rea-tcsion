// Presentation configuration: candidate top bar, exam tools, branding and
// language list. Pure functions — no storage, no HTTP. The admin surface sends
// a flat settings object; this module turns it into a validated config tree.
import { badRequest } from "../core/errors.mjs";

export const MODES = ["auto", "show", "hide"];

/**
 * Built-in candidate top-bar entries. `key` is what the client maps to its
 * selector table; `label` is the default caption.
 */
export const TOPBAR_DEFAULTS = Object.freeze({
  useful_data: { label: "Useful Data", mode: "auto" },
  instructions: { label: "View Instructions", mode: "auto" },
  group_instructions: { label: "Group Instructions", mode: "auto" },
  section_instructions: { label: "Section Instructions", mode: "auto" },
  question_instructions: { label: "Question Instructions", mode: "auto" },
  question_paper: { label: "Question Paper", mode: "auto" },
});

/** Exam tools the engine can render. */
export const TOOL_DEFAULTS = Object.freeze({
  calculator: "auto",
  ruler: "auto",
  protractor: "auto",
  zoom_in: "auto",
  zoom_out: "auto",
  notepad: "auto",
  scratchpad: "auto",
  highlighter: "auto",
});

export const BRAND_DEFAULTS = Object.freeze({
  name: "TCS iON",
  mark: "iON",
  icon: "",
  adminTitle: "Assessment Admin",
  adminSidebar: "Admin Console",
});

export const DEFAULT_LANGUAGES = Object.freeze(["English", "Hindi", "Gujarati"]);

const MAX_LABEL = 60;
const MAX_CUSTOM = 8;
const MAX_ICON_BYTES = 300 * 1024;
const ICON_DATA_URL = /^data:image\/(png|jpe?g|gif|webp|svg\+xml|x-icon|vnd\.microsoft\.icon);base64,[a-z0-9+/=\s]+$/i;

const text = (value, fallback, limit = MAX_LABEL) => {
  const trimmed = String(value ?? "").trim();
  return (trimmed || fallback).slice(0, limit);
};

/** Parse the stored JSON blob, falling back to defaults on corrupt data. */
function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Build the runtime config from the raw settings map.
 * Safe to call with an empty map (fresh database).
 */
export function buildConfig(settings = {}) {
  const brand = {
    name: text(settings.brand_name, BRAND_DEFAULTS.name, 80),
    mark: text(settings.brand_mark, BRAND_DEFAULTS.mark, 16),
    icon: normaliseIcon(settings.brand_icon) ? settings.brand_icon : "",
    adminTitle: text(settings.brand_admin_title, BRAND_DEFAULTS.adminTitle, 80),
    adminSidebar: text(settings.brand_admin_sidebar, BRAND_DEFAULTS.adminSidebar, 40),
  };

  const storedTopbar = parseJson(settings.exam_topbar, {});
  const items = {};
  for (const [key, defaults] of Object.entries(TOPBAR_DEFAULTS)) {
    const entry = storedTopbar.items?.[key] || {};
    items[key] = {
      label: text(entry.label, defaults.label),
      mode: MODES.includes(entry.mode) ? entry.mode : defaults.mode,
    };
  }

  const custom = normaliseCustom(storedTopbar.custom);

  const storedTools = parseJson(settings.exam_tools, {});
  const tools = {};
  for (const [key, fallback] of Object.entries(TOOL_DEFAULTS)) {
    const mode = storedTools[key];
    tools[key] = MODES.includes(mode) ? mode : fallback;
  }

  return {
    brand,
    topbar: { items, custom },
    tools,
    languages: parseLanguages(settings.exam_languages),
  };
}

/**
 * Apply per-assessment presentation overrides on top of the global config.
 * Overrides are optional; missing or empty objects keep the global values.
 */
export function applyPresentationOverrides(config, overrides = {}) {
  const next = {
    ...config,
    topbar: config.topbar,
    tools: config.tools,
  };
  if (overrides.topbar) next.topbar = validateTopbar(overrides.topbar);
  if (overrides.tools) next.tools = validateTools(overrides.tools);
  return next;
}

/** Validate per-assessment presentation values for persistence. */
export function presentationFromAdmin(body = {}) {
  const rows = {};
  if ("topbar" in body) rows.topbar = JSON.stringify(validateTopbar(body.topbar));
  if ("tools" in body) rows.tools = JSON.stringify(validateTools(body.tools));
  if (!Object.keys(rows).length) throw badRequest("No presentation settings to update.");
  return rows;
}

export function normaliseIcon(value) {
  const icon = String(value ?? "").trim();
  if (!icon) return "";
  if (!ICON_DATA_URL.test(icon)) return "";
  return icon.length > MAX_ICON_BYTES ? "" : icon;
}

export function parseLanguages(value) {
  const list = String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 6);
  return list.length ? list : [...DEFAULT_LANGUAGES];
}

/**
 * Validate an admin payload and return the flat settings rows to persist.
 * Only known keys are accepted so the settings table cannot be used as an
 * arbitrary key/value store.
 */
export function settingsFromAdmin(body = {}) {
  const rows = {};

  if ("site_name" in body) rows.site_name = text(body.site_name, BRAND_DEFAULTS.name, 80);
  if ("org_name" in body) rows.org_name = text(body.org_name, "", 80);
  if ("brand_name" in body) rows.brand_name = text(body.brand_name, BRAND_DEFAULTS.name, 80);
  if ("brand_mark" in body) rows.brand_mark = text(body.brand_mark, BRAND_DEFAULTS.mark, 16);
  if ("brand_admin_title" in body) rows.brand_admin_title = text(body.brand_admin_title, BRAND_DEFAULTS.adminTitle, 80);
  if ("brand_admin_sidebar" in body) rows.brand_admin_sidebar = text(body.brand_admin_sidebar, BRAND_DEFAULTS.adminSidebar, 40);

  if ("brand_icon" in body) {
    const icon = String(body.brand_icon ?? "").trim();
    if (icon && !normaliseIcon(icon)) throw badRequest("Brand icon must be a PNG, JPEG, WEBP, SVG or ICO data URL under 300 KB.");
    rows.brand_icon = icon;
  }

  if ("exam_topbar" in body) rows.exam_topbar = JSON.stringify(validateTopbar(body.exam_topbar));
  if ("exam_tools" in body) rows.exam_tools = JSON.stringify(validateTools(body.exam_tools));
  if ("exam_languages" in body) rows.exam_languages = validateLanguages(body.exam_languages);

  if (!Object.keys(rows).length) throw badRequest("No settings to update.");
  return rows;
}

function validateTopbar(value) {
  const source = parseJsonObject(value);
  const items = {};
  for (const [key, defaults] of Object.entries(TOPBAR_DEFAULTS)) {
    const entry = source.items?.[key] || {};
    items[key] = {
      label: text(entry.label, defaults.label),
      mode: MODES.includes(entry.mode) ? entry.mode : defaults.mode,
    };
  }
  return { items, custom: normaliseCustom(source.custom) };
}

/** Accept both a parsed object and a JSON string from the admin client. */
function parseJsonObject(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normaliseCustom(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list.slice(0, MAX_CUSTOM)) {
    const label = text(raw?.label, "", MAX_LABEL);
    if (!label) continue;
    let href = String(raw?.href ?? "").trim().slice(0, 500);
    if (href && !/^(https?:\/\/|\/)/i.test(href)) href = "";
    let id = String(raw?.id ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!id || seen.has(id)) id = `custom_${out.length + 1}`;
    seen.add(id);
    out.push({
      id,
      label,
      href,
      mode: MODES.includes(raw?.mode) ? raw.mode : "show",
    });
  }
  return out;
}

function validateTools(value) {
  const source = parseJsonObject(value);
  const tools = {};
  for (const [key, fallback] of Object.entries(TOOL_DEFAULTS)) {
    tools[key] = MODES.includes(source[key]) ? source[key] : fallback;
  }
  return tools;
}

function validateLanguages(value) {
  const list = String(Array.isArray(value) ? value.join(",") : value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!list.length) throw badRequest("At least one display language is required.");
  if (list.length > 6) throw badRequest("At most six display languages are supported.");
  for (const name of list) {
    if (name.length < 2 || name.length > 32) throw badRequest(`Invalid language name "${name}".`);
  }
  return list.join(",");
}
