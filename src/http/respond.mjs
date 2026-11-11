// Response helpers. Every handler answers through these so headers stay uniform.
import { toHttpError } from "../core/errors.mjs";
import { logger } from "../core/logger.mjs";

const NO_STORE = { "Cache-Control": "no-cache" };

export function sendJson(res, status, payload, headers = {}) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...NO_STORE, ...headers });
  res.end(body);
}

export const sendOk = (res, data = {}, headers = {}) => sendJson(res, 200, { ok: true, ...data }, headers);

export const sendCreated = (res, data = {}) => sendJson(res, 201, { ok: true, ...data });

export const sendError = (res, status, error, headers = {}) =>
  sendJson(res, status, { ok: false, error }, headers);

export function sendText(res, body = "", status = 200, headers = {}) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", ...NO_STORE, ...headers });
  res.end(String(body));
}

export function sendCsv(res, filename, csv) {
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
    ...NO_STORE,
  });
  res.end(csv);
}

/** Turn a thrown error into a response. */
export function sendFromError(res, error, scope = "http") {
  const { status, body } = toHttpError(error);
  if (status >= 500) {
    logger.error(`${scope}: ${error?.stack || error?.message}`, { status });
    // In serverless debug: include error details in response
    body.details = String(error?.stack || error?.message || "");
  } else {
    logger.debug(`${scope}: ${error?.message}`, { status });
  }
  if (!res.headersSent) sendJson(res, status, body);
  else res.end();
}
