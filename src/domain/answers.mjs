// Answer normalisation shared by persistence, scoring and feedback parsing.
const ANS_SEP = "<ANS_SEP>";
const SA_SEP = "<sa_ans_sep>";

/** Normalise whatever the engine stored in quesParam.selectedOptId. */
export function normaliseSelected(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join(",");
  return String(value ?? "").replace(/\s*,\s*/g, ",").trim();
}

export const splitSelected = (value) =>
  String(value ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export const splitCorrect = (value) => String(value ?? "").split(SA_SEP).map((s) => s.trim()).filter(Boolean);

export const normaliseAnswer = (value) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
};

/** Pull the first number out of a feedback answer such as "3-Met expectations". */
export function leadingNumber(value) {
  const match = /^\s*(\d+(?:\.\d+)?)/.exec(Array.isArray(value) ? value.join(",") : String(value ?? ""));
  return match ? Number(match[1]) : null;
}

/** Walk a feedback payload and collect every numeric rating it contains. */
export function collectRatings(payload, out = []) {
  if (!payload || typeof payload !== "object") return out;
  if (Array.isArray(payload)) {
    payload.forEach((entry) => collectRatings(entry, out));
    return out;
  }
  for (const [key, value] of Object.entries(payload)) {
    if (key === "SelectedOptId" || key === "GivenAnswer" || key === "rating") {
      const score = leadingNumber(value);
      if (score !== null) out.push(score);
    } else if (value && typeof value === "object") {
      collectRatings(value, out);
    }
  }
  return out;
}

export const average = (values) =>
  values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null;

export const ANSWER_SEPARATOR = ANS_SEP;
export const SA_SEPARATOR = SA_SEP;
