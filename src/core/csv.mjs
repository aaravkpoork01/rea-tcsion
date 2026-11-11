// Minimal CSV parser for admin imports. Handles quoted fields, escaped quotes,
// embedded commas/newlines and a UTF-8 BOM.

export const normaliseCsvHeader = (value) => String(value ?? "")
  .replace(/^\uFEFF/, "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

/** Parse CSV text into row objects keyed by normalised header names. */
export function parseCsv(text) {
  const source = String(text ?? "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  while (rows.length && rows[rows.length - 1].every((cell) => !String(cell).trim())) rows.pop();
  if (!rows.length) return [];

  const headers = rows[0].map(normaliseCsvHeader);
  return rows.slice(1)
    .filter((cells) => cells.some((cell) => String(cell).trim()))
    .map((cells) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) record[header] = String(cells[index] ?? "").trim();
      });
      return record;
    });
}
