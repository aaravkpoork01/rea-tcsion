// Static file serving with traversal protection and mime mapping.
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".xml": "text/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".cur": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

const contentType = (file) => MIME[extname(file).toLowerCase()] || "application/octet-stream";

/** Resolve `relative` inside `root`, refusing escapes. */
export function resolveWithin(root, relative) {
  const base = normalize(root);
  const clean = normalize(relative).replace(/^([/\\])+/, "");
  const target = join(base, clean);
  return target.startsWith(base + sep) || target === base ? target : base;
}

export async function sendFile(res, filePath, urlPath) {
  const info = await stat(filePath).catch(() => null);
  if (!info || info.isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(`not found: ${urlPath}`);
    return false;
  }

  const body = await readFile(filePath);
  res.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": "no-cache" });
  res.end(body);
  return true;
}

/** Serve `urlPath` from `root`; checks multiple candidate fallback locations. */
export async function serveStatic(res, root, urlPath) {
  const relative = urlPath.endsWith("/") ? `${urlPath}index.html` : urlPath;
  const primaryPath = resolveWithin(root, relative);
  const primaryExists = await stat(primaryPath).then(s => s.isFile()).catch(() => false);
  if (primaryExists) {
    return sendFile(res, primaryPath, urlPath);
  }

  // Fallbacks for serverless environments where cwd / root may vary or mirror is in raw/
  const clean = relative.replace(/^([/\\])+/, "");
  const fallbackRoots = [
    root,
    join(root, "..", "public"),
    join(root, "..", "raw"),
    join(process.cwd(), "public"),
    join(process.cwd(), "raw"),
    join("/var/task", "public"),
    join("/var/task", "raw")
  ];

  for (const altRoot of fallbackRoots) {
    const candidate = resolveWithin(altRoot, clean);
    const candidateExists = await stat(candidate).then(s => s.isFile()).catch(() => false);
    if (candidateExists) {
      return sendFile(res, candidate, urlPath);
    }
  }

  return sendFile(res, primaryPath, urlPath);
}
