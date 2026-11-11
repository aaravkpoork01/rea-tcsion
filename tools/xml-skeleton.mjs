import { readFileSync } from "node:fs";

const path = process.argv[2];
const xml = readFileSync(path, "utf8");

// tiny tag scanner (no deps): builds a skeleton tree
const tagRe = /<([A-Za-z_][\w:.-]*)((?:\s+[A-Za-z_][\w:.-]*\s*=\s*"[^"]*")*)\s*(\/?)>|<\/([A-Za-z_][\w:.-]*)>/g;
const attrRe = /([A-Za-z_][\w:.-]*)\s*=\s*"([^"]*)"/g;

const root = { name: "#root", attrs: {}, children: [], count: 1 };
const stack = [root];
let m;
while ((m = tagRe.exec(xml))) {
  if (m[4]) {
    // close
    for (let i = stack.length - 1; i > 0; i--) {
      if (stack[i].name === m[4]) { stack.length = i; break; }
    }
    continue;
  }
  const attrs = {};
  let a;
  attrRe.lastIndex = 0;
  while ((a = attrRe.exec(m[2] || ""))) attrs[a[1]] = a[2];
  const node = { name: m[1], attrs, children: [], count: 0 };
  const parent = stack[stack.length - 1];
  // collapse repeats of same-name siblings into one template node
  const existing = parent.children.find((c) => c.name === node.name);
  if (existing) { existing.count++; } else { node.count = 1; parent.children.push(node); }
  if (!m[3]) stack.push(node);
}

function print(node, depth, maxDepth) {
  if (depth > maxDepth) return;
  const target = node.children.find((c) => c.name === node.name) || node;
  const pad = "  ".repeat(depth);
  const attrs = Object.entries(node.attrs).map(([k, v]) => `${k}="${v.length > 60 ? v.slice(0, 60) + "…" : v}"`).join(" ");
  console.log(`${pad}${node.name}${node.count > 1 ? ` ×${node.count}` : ""}${attrs ? " " + attrs : ""}`);
  for (const c of node.children) print(c, depth + 1, maxDepth);
}

print(root, 0, Number(process.argv[3] || 4));
