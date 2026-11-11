// Minimal router: method + pattern table, `:param` captures, no dependencies.
import { notFound } from "../core/errors.mjs";

const PATTERN_CACHE = new Map();

function compile(pattern) {
  let compiled = PATTERN_CACHE.get(pattern);
  if (compiled) return compiled;

  const keys = [];
  const source = pattern
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      keys.push(segment.slice(1));
      return "([^/]+)";
    })
    .join("/");

  compiled = { regex: new RegExp(`^${source}$`), keys };
  PATTERN_CACHE.set(pattern, compiled);
  return compiled;
}

export class Router {
  #routes = [];

  add(method, pattern, handler) {
    this.#routes.push({ method: method.toUpperCase(), pattern, handler, ...compile(pattern) });
    return this;
  }

  get(pattern, handler) { return this.add("GET", pattern, handler); }
  post(pattern, handler) { return this.add("POST", pattern, handler); }
  put(pattern, handler) { return this.add("PUT", pattern, handler); }
  delete(pattern, handler) { return this.add("DELETE", pattern, handler); }

  /** Find a handler for the request. Throws 404 when nothing matches. */
  match(method, pathname) {
    const upper = method.toUpperCase();
    for (const route of this.#routes) {
      if (route.method !== upper) continue;
      const hit = route.regex.exec(pathname);
      if (!hit) continue;
      const params = {};
      route.keys.forEach((key, index) => { params[key] = decodeURIComponent(hit[index + 1]); });
      return { handler: route.handler, params };
    }
    throw notFound(`No route for ${upper} ${pathname}`);
  }

  has(method, pathname) {
    try {
      this.match(method, pathname);
      return true;
    } catch {
      return false;
    }
  }
}

export const createRouter = () => new Router();
