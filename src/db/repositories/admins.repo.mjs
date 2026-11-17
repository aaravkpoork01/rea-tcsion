import { all, one, run } from "../connection.mjs";

export const findByUsername = async (username) =>
  one("SELECT * FROM admins WHERE username = ?", username);

export const findById = async (id) => one("SELECT * FROM admins WHERE id = ?", id);

export const any = async () => one("SELECT * FROM admins LIMIT 1");

export const create = async (row) =>
  run(`INSERT INTO admins(
      username, password_hash, name, role, status, permissions,
      created_by, last_login_at, updated_at, created_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
    row.username, row.passwordHash, row.name, row.role,
    row.status ?? "active", row.permissions ?? null,
    row.createdBy ?? null, row.lastLoginAt ?? "",
    row.updatedAt ?? row.createdAt, row.createdAt);

export const update = async (id, row) => {
  const fields = [];
  const values = [];
  if (row.username !== undefined) { fields.push("username = ?"); values.push(row.username); }
  if (row.passwordHash !== undefined) { fields.push("password_hash = ?"); values.push(row.passwordHash); }
  if (row.name !== undefined) { fields.push("name = ?"); values.push(row.name); }
  if (row.role !== undefined) { fields.push("role = ?"); values.push(row.role); }
  if (row.status !== undefined) { fields.push("status = ?"); values.push(row.status); }
  if (row.permissions !== undefined) { fields.push("permissions = ?"); values.push(row.permissions); }
  if (row.createdBy !== undefined) { fields.push("created_by = ?"); values.push(row.createdBy); }
  if (row.lastLoginAt !== undefined) { fields.push("last_login_at = ?"); values.push(row.lastLoginAt); }
  if (row.updatedAt !== undefined) { fields.push("updated_at = ?"); values.push(row.updatedAt); }
  if (!fields.length) return;
  await run(`UPDATE admins SET ${fields.join(", ")} WHERE id = ?`, ...values, id);
};

export const count = async () => {
  const row = await one("SELECT COUNT(*) AS n FROM admins");
  return Number(row?.n ?? 0);
};

export const countActiveSuperAdmins = async () => {
  const row = await one(
    "SELECT COUNT(*) AS n FROM admins WHERE role = 'super_admin' AND status = 'active'",
  );
  return Number(row?.n ?? 0);
};

export const allRows = async () =>
  all(`SELECT id, username, name, role, status, permissions, created_by,
      last_login_at, updated_at, created_at
    FROM admins ORDER BY id`);
