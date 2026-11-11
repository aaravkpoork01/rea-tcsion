// Tiny leveled logger. Keeps console formatting in one place.
import { config } from "../../config/index.mjs";

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const threshold = LEVELS[config.logLevel] ?? LEVELS.info;

function emit(level, scope, message, extra) {
  if ((LEVELS[level] ?? LEVELS.info) > threshold) return;
  const stamp = new Date().toISOString();
  const prefix = `[${stamp}] ${level.toUpperCase()} ${scope ? `(${scope}) ` : ""}`;
  if (extra === undefined) {
    console[level === "debug" ? "log" : level](prefix + message);
  } else {
    console[level === "debug" ? "log" : level](prefix + message, extra);
  }
}

export function createLogger(scope = "") {
  return {
    info: (message, extra) => emit("info", scope, message, extra),
    warn: (message, extra) => emit("warn", scope, message, extra),
    error: (message, extra) => emit("error", scope, message, extra),
    debug: (message, extra) => emit("debug", scope, message, extra),
  };
}

export const logger = createLogger("app");
