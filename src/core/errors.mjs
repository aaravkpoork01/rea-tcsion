// Typed application errors. Services throw these; the HTTP layer maps them to
// status codes so handlers stay free of response plumbing.
export class AppError extends Error {
  constructor(message, status = 500, code = "internal_error", details = null) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = status < 500;
  }
}

export const badRequest = (message, details) => new AppError(message, 400, "bad_request", details);
export const unauthorized = (message = "Not signed in.") => new AppError(message, 401, "unauthorized");
export const forbidden = (message = "Not allowed.") => new AppError(message, 403, "forbidden");
export const notFound = (message = "Not found.") => new AppError(message, 404, "not_found");
export const conflict = (message, details) => new AppError(message, 409, "conflict", details);

export const isAppError = (error) => error instanceof AppError;

export function toHttpError(error) {
  if (isAppError(error)) {
    return {
      status: error.status,
      body: { ok: false, error: error.expose ? error.message : "Internal server error.", code: error.code },
    };
  }
  return {
    status: 500,
    body: { ok: false, error: "Internal server error.", code: "internal_error" },
  };
}
