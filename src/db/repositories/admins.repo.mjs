import { all, one, run } from "../connection.mjs";

export const findByUsername = async (username) =>
  one("SELECT * FROM admins WHERE username = ?", username);

export const findById = async (id) => one("SELECT * FROM admins WHERE id = ?", id);

export const any = async () => one("SELECT * FROM admins LIMIT 1");

export const create = async (row) =>
  run("INSERT INTO admins(username, password_hash, name, role, created_at) VALUES(?,?,?,?,?)",
    row.username, row.passwordHash, row.name, row.role, row.createdAt);

export const update = async (id, row) => {
  const fields = [];
  const values = [];
  if (row.username !== undefined) { fields.push("username = ?"); values.push(row.username); }
  if (row.passwordHash !== undefined) { fields.push("password_hash = ?"); values.push(row.passwordHash); }
  if (row.name !== undefined) { fields.push("name = ?"); values.push(row.name); }
  if (row.role !== undefined) { fields.push("role = ?"); values.push(row.role); }
  if (!fields.length) return;
  await run(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`, ...values, id);
};

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM admins");
  return Number(row?.n ?? 0);
};

export const allRows = async () =>
  all("SELECT id, username, name, role, created_at FROM admins ORDER BY id");
