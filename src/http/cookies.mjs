// Cookie read/write helpers.

export function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    try {
      out[name] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      out[name] = part.slice(index + 1).trim();
    }
  }
  return out;
}

export function serialiseCookie(name, value, { maxAge = 43200, httpOnly = false } = {}) {
  const bits = [`${name}=${encodeURIComponent(value ?? "")}`, "Path=/", `Max-Age=${maxAge}`, "SameSite=Lax"];
  if (httpOnly) bits.push("HttpOnly");
  return bits.join("; ");
}

export const clearCookie = (name) => `${name}=; Path=/; Max-Age=0; SameSite=Lax`;

export const cookies = (req) => parseCookies(req);
