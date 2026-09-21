/**
 * The plain text export (§5.9, "paste-anywhere, minimal").
 *
 * There is no second renderer here either: this walks the same compiled
 * `BibleDocument` the view, the Markdown writer and the Word writer all read, so
 * the .txt file cannot say something the others do not. What it drops is the one
 * thing the format has no room for — Markdown's heading markers and its `**`
 * emphasis — because the destination is a notes app, a wiki box or an email,
 * where markers would have to be cleaned up by hand.
 *
 * Plain text has no headings, so hierarchy is carried by layout instead: a
 * section is `<number>. <title>` on its own line, a subheading is uppercased
 * (every one of them is a tool-authored label, never the writer's own words),
 * facts read as `Label: value`, and bullets keep their `-`.
 */

import { compileBible, type BibleBlock, type BibleDocument } from "../bible";
import type { Project } from "../schema";

/** `**bold**` is the only inline Markdown the document's text carries. */
function unemphasis(text: string): string {
  return text.replaceAll("**", "");
}

function blockLines(blocks: readonly BibleBlock[], lines: string[]): void {
  for (const block of blocks) {
    switch (block.kind) {
      case "paragraph":
        lines.push(unemphasis(block.text), "");
        break;

      case "facts":
        for (const fact of block.facts) lines.push(`${fact.label}: ${fact.value}`);
        lines.push("");
        break;

      case "bullets":
        for (const item of block.items) lines.push(`- ${unemphasis(item)}`);
        lines.push("");
        break;

      case "subheading":
        lines.push(block.text.toUpperCase(), "");
        break;

      case "markdown":
        // The relationship map (§5.4.3) is written as Markdown: its bullets are
        // already plain, and its emphasis is not. Indentation is left alone, so
        // the nested "the two sides read it differently" line still reads as
        // subordinate to the relationship above it.
        lines.push(...block.text.split("\n").map((line) => unemphasis(line).trimEnd()), "");
        break;

      case "entries":
        for (const entry of block.entries) {
          lines.push(entry.title, "");
          blockLines(entry.blocks, lines);
        }
        break;
    }
  }
}

/**
 * The bible as plain text, with the same closing line the Markdown export
 * carries so a file on disk can still be told apart from a newer project
 * (§5.7.5).
 */
export function biblePlainText(project: Project, exportedAt: Date = new Date()): string {
  const bible: BibleDocument = compileBible(project);
  const lines = [bible.title, bible.subtitle, bible.disclosure, ""];

  for (const section of bible.sections) {
    lines.push(`${section.number}. ${section.title}`, "");
    blockLines(section.blocks, lines);
  }

  if (bible.pending.length > 0) {
    lines.push(`Still to come in this bible: ${bible.pending.join(" · ")}.`, "");
  }

  lines.push(
    `Exported from the Character Profile & Story Bible Starter on ${exportedAt.toISOString()}.`,
  );

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trimEnd();
}
