import { all, one, run } from "../connection.mjs";

export const findById = async (id) => one("SELECT * FROM orgs WHERE id = ?", id);

export const list = async () => all("SELECT * FROM orgs ORDER BY id");

export const create = async (id, name, createdAt) =>
  run("INSERT INTO orgs(id, name, created_at) VALUES(?,?,?)", id, name, createdAt);

export const ensure = async (id, name, createdAt) => {
  const existing = await findById(id);
  return existing ? null : create(id, name, createdAt);
};
