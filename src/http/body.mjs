// Request body reading with a hard size cap.
import { config } from "../../config/index.mjs";
import { AppError } from "../core/errors.mjs";

/** Read the raw body. Throws 413 when the client exceeds the configured limit. */
export async function readRaw(req) {
  // In serverless environments (like Vercel), req.body may already be populated by body parser:
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") return req.body;
    if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
    if (typeof req.body === "object") return JSON.stringify(req.body);
  }

  // Otherwise read stream chunks:
  const chunks = [];
  let size = 0;
  if (typeof req[Symbol.asyncIterator] === "function") {
    for await (const chunk of req) {
      size += chunk.length;
      if (size > config.limits.maxRequestBytes) {
        throw new AppError("Request body too large.", 413, "payload_too_large");
      }
      chunks.push(chunk);
    }
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Read the body as JSON. Empty body yields `{}`; malformed JSON throws 400. */
export async function readJson(req) {
  // If Vercel already parsed the JSON body into an object:
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = await readRaw(req);
  if (!raw || !raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError("Malformed JSON body.", 400, "invalid_json");
  }
}

/** Read the body as form fields or JSON depending on content type. */
export async function readParams(req) {
  const raw = await readRaw(req);
  if (!raw) return {};
  if ((req.headers["content-type"] || "").includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

export const bodyOnce = (req) => (req.method === "POST" || req.method === "PUT" ? readRaw(req) : Promise.resolve(""));
