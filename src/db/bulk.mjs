// Multi-row INSERT helper.
//
// Paper import used to write every question, option and translation with its
// own statement. Against a remote Postgres/Neon that is one network round-trip
// per row (a 100-question paper is ~1,500 round-trips), which makes uploads
// feel frozen. This helper packs rows into a handful of statements instead.
import { run } from "./connection.mjs";

/** Split `rows` into chunks of at most `size` items. */
function chunks(rows, size) {
  const out = [];
  for (let start = 0; start < rows.length; start += size) {
    out.push(rows.slice(start, start + size));
  }
  return out;
}

/**
 * Insert rows into one table with multi-row VALUES statements.
 *
 * @param {string} table target table
 * @param {string[]} columns column names, in the order values are taken
 * @param {Array<Record<string, unknown>>} rows row objects keyed by column
 * @param {{chunk?:number, suffix?:string}} [options] rows per statement and SQL suffix
 */
export async function insertMany(table, columns, rows, options = {}) {
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if (!list.length) return;

  const chunkSize = Math.max(1, Number(options.chunk) || 300);
  const suffix = options.suffix ? ` ${options.suffix}` : "";
  const columnSql = columns.join(", ");
  const tupleSql = `(${columns.map(() => "?").join(",")})`;

  for (const slice of chunks(list, chunkSize)) {
    const values = [];
    for (const row of slice) {
      for (const column of columns) values.push(row[column]);
    }
    const tuples = new Array(slice.length).fill(tupleSql).join(",");
    await run(`INSERT INTO ${table} (${columnSql}) VALUES ${tuples}${suffix}`, values);
  }
}
