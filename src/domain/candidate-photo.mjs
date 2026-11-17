// Candidate photo values: uploaded data URLs, remote URLs or local image paths.
import { badRequest } from "../core/errors.mjs";

const MAX_PHOTO_CHARS = 2_000_000;

/** Accept an uploaded data URL, an http(s) URL or a local image path. */
export function normalisePhoto(value) {
  const photo = String(value || "").trim();
  if (!photo) return "";
  if (photo.length > MAX_PHOTO_CHARS) throw badRequest("Photo is too large.");
  const allowed = /^data:image\//i.test(photo)
    || /^https?:\/\//i.test(photo)
    || /^\//.test(photo)
    || /^\.{0,2}\//.test(photo)
    || /^images\//i.test(photo);
  if (!allowed) throw badRequest("Photo must be an uploaded image or an image URL.");
  return photo;
}
