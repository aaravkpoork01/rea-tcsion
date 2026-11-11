import { all, one, run } from "../connection.mjs";

export const getSetting = async (key, fallback = "") => {
  const row = await one("SELECT value FROM settings WHERE key = ?", key);
  return row ? row.value : fallback;
};

export const setSetting = async (key, value) =>
  run("INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value",
    key, String(value));

export const deleteSetting = async (key) =>
  run("DELETE FROM settings WHERE key = ?", key);

export const listSettings = async () => all("SELECT key, value FROM settings");

export const setMany = async (entries) => {
  for (const [key, value] of Object.entries(entries)) await setSetting(key, value);
};
