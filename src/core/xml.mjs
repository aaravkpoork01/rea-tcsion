// Minimal dependency-free XML parser good enough for the iON question paper
// and config files: elements, attributes, CDATA, comments, entities.

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[body] ?? m;
  });
}

export function parseXml(source) {
  const xml = String(source);
  const root = { name: "#document", attrs: {}, children: [], text: "" };
  const stack = [root];
  let i = 0;

  const pushText = (raw) => {
    if (!raw) return;
    const value = decodeEntities(raw);
    if (!value.trim()) return;
    const parent = stack[stack.length - 1];
    parent.text = (parent.text || "") + value;
  };

  while (i < xml.length) {
    const lt = xml.indexOf("<", i);
    if (lt === -1) {
      pushText(xml.slice(i));
      break;
    }
    if (lt > i) pushText(xml.slice(i, lt));

    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt + 4);
      i = end === -1 ? xml.length : end + 3;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt)) {
      const end = xml.indexOf("]]>", lt + 9);
      const cdata = xml.slice(lt + 9, end === -1 ? xml.length : end);
      const parent = stack[stack.length - 1];
      parent.text = (parent.text || "") + cdata;
      i = end === -1 ? xml.length : end + 3;
      continue;
    }
    if (xml.startsWith("<?", lt) || xml.startsWith("<!", lt)) {
      const end = xml.indexOf(">", lt);
      i = end === -1 ? xml.length : end + 1;
      continue;
    }
    if (xml[lt + 1] === "/") {
      const end = xml.indexOf(">", lt);
      const name = xml.slice(lt + 2, end).trim();
      for (let s = stack.length - 1; s > 0; s--) {
        if (stack[s].name === name) {
          stack.length = s;
          break;
        }
      }
      i = end === -1 ? xml.length : end + 1;
      continue;
    }

    // opening tag: scan to the closing '>' that is not inside an attribute value
    let j = lt + 1;
    let quote = null;
    while (j < xml.length) {
      const ch = xml[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === ">") {
        break;
      }
      j++;
    }
    const rawTag = xml.slice(lt + 1, j);
    const selfClosing = rawTag.endsWith("/");
    const body = selfClosing ? rawTag.slice(0, -1) : rawTag;
    const nameMatch = /^([^\s/>]+)/.exec(body);
    if (!nameMatch) {
      i = j + 1;
      continue;
    }
    const name = nameMatch[1];
    const attrs = {};
    const attrRe = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = attrRe.exec(body.slice(name.length)))) {
      attrs[m[1]] = decodeEntities(m[3] ?? m[4] ?? "");
    }
    const node = { name, attrs, children: [], text: "" };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
    i = j + 1;
  }

  return root.children[0] || root;
}

export function child(node, name) {
  return node?.children.find((c) => c.name === name) || null;
}

export function children(node, name) {
  return node?.children.filter((c) => c.name === name) || [];
}

export function descendants(node, name, out = []) {
  if (!node) return out;
  for (const c of node.children) {
    if (c.name === name) out.push(c);
    descendants(c, name, out);
  }
  return out;
}

export function text(node, name, fallback = "") {
  const found = name ? child(node, name) : node;
  if (!found) return fallback;
  return (found.text || "").trim();
}

export function attr(node, name, fallback = "") {
  if (!node?.attrs) return fallback;
  return node.attrs[name] ?? fallback;
}
