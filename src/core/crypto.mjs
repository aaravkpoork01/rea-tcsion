// Password hashing (scrypt) with constant-time verification.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;
const PREFIX = "scrypt";

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password), salt, KEY_LEN);
  return `${PREFIX}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, saltHex, hashHex] = String(stored).split("$");
    if (scheme !== PREFIX || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(String(password), Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export const newToken = (bytes = 24) => randomBytes(bytes).toString("hex");

export const newId = (prefix = "C", bytes = 5) =>
  prefix + randomBytes(bytes).toString("hex").toUpperCase();

/** Random code from an unambiguous alphanumeric alphabet (a-z, A-Z, 0-9). */
export const newCode = (length = 10) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
};
