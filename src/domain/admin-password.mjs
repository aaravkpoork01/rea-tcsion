// Password policy for administrator and staff accounts.
import { badRequest } from "../core/errors.mjs";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

/** @returns {string} an empty string when the password is acceptable. */
export function passwordProblem(value) {
  const password = String(value ?? "");
  if (password.length < MIN_LENGTH) return `Password must be at least ${MIN_LENGTH} characters.`;
  if (password.length > MAX_LENGTH) return `Password must be ${MAX_LENGTH} characters or fewer.`;
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return "";
}

/** Throw a 400 unless the password meets the admin policy. */
export function requireAdminPassword(value) {
  const problem = passwordProblem(value);
  if (problem) throw badRequest(problem);
  return String(value);
}
