import { one, run } from "../connection.mjs";

export const get = async (key, fallback = null) => {
  const row = await one("SELECT value FROM meta WHERE key = ?", key);
  return row ? row.value : fallback;
};

export const set = async (key, value) =>
  run("INSERT INTO meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value",
    key, String(value));
