/**
 * Saving a generated file, and naming it.
 *
 * Everything here runs in the browser: an export is built in the tab and handed
 * straight to the writer's disk. Nothing is uploaded, which is the promise the
 * whole tool rests on.
 */

import type { Project } from "../schema";

/** A filename-safe version of the project title. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The name an export is saved under, e.g. `orah-and-the-salt-road-story-bible.md`.
 *
 * A title of punctuation alone would slugify to nothing, so the project gets a
 * usable name rather than an extension with no name in front of it.
 */
export function exportFilename(
  project: Project,
  part: string | null,
  extension: string,
): string {
  const stem = slugify(project.meta.title) || "story-bible";
  return [stem, part, extension].filter(Boolean).join(".");
}

/**
 * Hand a blob to the browser as a download.
 *
 * The object URL is revoked a tick later rather than immediately: Safari has
 * been known to cancel a download whose URL disappeared before the click it was
 * attached to had been handled.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(text: string, filename: string, type: string): void {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);
}

/** Read a file the writer picked, as text. */
export function readFileAsText(file: File): Promise<string> {
  return file.text();
}
