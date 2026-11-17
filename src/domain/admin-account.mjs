// Validation shared by self-service profile updates and team management.
import { badRequest } from "../core/errors.mjs";

export const clean = (value) => String(value ?? "").trim();

export function adminName(value) {
  const name = clean(value).replace(/\s+/g, " ");
  if (name.length < 2) throw badRequest("Full name is required.");
  if (name.length > 80) throw badRequest("Name must be 80 characters or fewer.");
  return name;
}

const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,39}$/;

export function adminUsername(value) {
  const username = clean(value);
  if (username.length < 3) throw badRequest("Username must be at least 3 characters.");
  if (username.length > 40) throw badRequest("Username must be 40 characters or fewer.");
  if (!USERNAME_PATTERN.test(username)) {
    throw badRequest("Username may only contain letters, numbers, dots, hyphens and underscores.");
  }
  return username;
}
