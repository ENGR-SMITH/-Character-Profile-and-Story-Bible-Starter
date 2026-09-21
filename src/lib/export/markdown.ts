/**
 * The Markdown exports (§5.9 and §8.4).
 *
 * There is no second renderer: a compiled document already *is* Markdown, which
 * is why `bibleToText` exists. This adds the one thing a file needs that a view
 * does not — when it was exported, so a writer can see whether the file in front
 * of them is older than the project (§5.7.5).
 *
 * The brief is written by the same function, because §8.2 makes it the same kind
 * of object as the bible — "deliberately the same object the Pitch Board
 * publishes". Its own label sits in the first line of the document, so a file on
 * disk still says which of the two it is.
 */

import { bibleToText, compileBible } from "../bible";
import { compileBrief } from "../brief";
import type { Project } from "../schema";

function withExportStamp(text: string, exportedAt: Date): string {
  return `${text}\n\n---\n\n_Exported from the Character Profile & Story Bible Starter on ${exportedAt.toISOString()}._\n`;
}

export function bibleMarkdown(project: Project, exportedAt: Date = new Date()): string {
  return withExportStamp(bibleToText(compileBible(project)), exportedAt);
}

export function briefMarkdown(project: Project, exportedAt: Date = new Date()): string {
  return withExportStamp(bibleToText(compileBrief(project)), exportedAt);
}
