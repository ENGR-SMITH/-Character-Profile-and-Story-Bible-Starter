/**
 * The Word export (§5.9), and the brief's Word file (§8.4).
 *
 * Built from the compiled bible document rather than from its Markdown, so the
 * file has real Word headings, real bullet lists and real paragraph structure —
 * the things that make a .docx a document rather than a text file with the right
 * extension.
 *
 * `docx` is imported inside the functions, so it is fetched when a writer asks
 * for a Word file and never as part of the page.
 */

import type * as Docx from "docx";

import { compileBible, type BibleBlock, type BibleDocument } from "../bible";
import { compileBrief } from "../brief";
import type { Project } from "../schema";
import { inlineRuns } from "./inline";

type DocxModule = typeof Docx;

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function runsFor(text: string, docx: DocxModule): Docx.TextRun[] {
  return inlineRuns(text).map(
    (run) => new docx.TextRun({ text: run.text, bold: run.bold }),
  );
}

/** One paragraph per fact, the label bold — the same shape the view uses. */
function blockParagraphs(
  blocks: readonly BibleBlock[],
  docx: DocxModule,
  level: number,
): Docx.Paragraph[] {
  const paragraphs: Docx.Paragraph[] = [];

  for (const block of blocks) {
    switch (block.kind) {
      case "paragraph":
        paragraphs.push(new docx.Paragraph({ children: runsFor(block.text, docx) }));
        break;

      case "facts":
        for (const fact of block.facts) {
          paragraphs.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: `${fact.label}: `, bold: true }),
                new docx.TextRun({ text: fact.value }),
              ],
            }),
          );
        }
        break;

      case "bullets":
        for (const item of block.items) {
          paragraphs.push(
            new docx.Paragraph({ children: runsFor(item, docx), bullet: { level: 0 } }),
          );
        }
        break;

      case "subheading":
        paragraphs.push(
          new docx.Paragraph({
            text: block.text,
            heading: level >= 2 ? docx.HeadingLevel.HEADING_3 : docx.HeadingLevel.HEADING_2,
          }),
        );
        break;

      case "markdown":
        for (const line of block.text.split("\n")) {
          if (line.trim() === "") continue;
          // A nested bullet in the relationship map is indented by two spaces.
          const indent = line.length - line.trimStart().length;
          const body = line.trim().replace(/^-\s+/, "");
          paragraphs.push(
            new docx.Paragraph({
              children: runsFor(body, docx),
              bullet: { level: indent >= 2 ? 1 : 0 },
            }),
          );
        }
        break;

      case "entries":
        for (const entry of block.entries) {
          paragraphs.push(
            new docx.Paragraph({
              text: entry.title,
              heading:
                level >= 2 ? docx.HeadingLevel.HEADING_3 : docx.HeadingLevel.HEADING_2,
            }),
          );
          paragraphs.push(...blockParagraphs(entry.blocks, docx, level + 1));
        }
        break;
    }
  }

  return paragraphs;
}

/**
 * Everything the Word file contains, in order.
 *
 * Exported separately from the packing so it can be asserted without writing a
 * file, and so the structure of the document is one readable function.
 */
export function bibleDocxChildren(
  bible: BibleDocument,
  docx: DocxModule,
  exportedAt: Date = new Date(),
): Docx.Paragraph[] {
  const paragraphs: Docx.Paragraph[] = [
    new docx.Paragraph({ text: bible.title, heading: docx.HeadingLevel.TITLE }),
    new docx.Paragraph({ children: [new docx.TextRun({ text: bible.subtitle })] }),
    new docx.Paragraph({
      children: [new docx.TextRun({ text: bible.disclosure, italics: true })],
    }),
  ];

  bible.sections.forEach((section) => {
    paragraphs.push(
      new docx.Paragraph({
        text: `${section.number}. ${section.title}`,
        heading: docx.HeadingLevel.HEADING_1,
        // Section 1 opens the document; every other section starts a page of
        // its own, so the do-not-change block and the cast are not split across
        // one. The brief asks for no breaks: §8.1 promises one page.
        pageBreakBefore: bible.pageBreakSections && section.number > 1,
      }),
    );
    paragraphs.push(...blockParagraphs(section.blocks, docx, 0));
  });

  if (bible.pending.length > 0) {
    paragraphs.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Still to come in this bible: ${bible.pending.join(" · ")}.`,
            italics: true,
          }),
        ],
      }),
    );
  }

  paragraphs.push(
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: `Exported on ${exportedAt.toISOString()}.`,
          italics: true,
        }),
      ],
    }),
  );

  return paragraphs;
}

/**
 * Pack a compiled document into a .docx.
 *
 * The bible and the brief share this because §8.2 makes them the same kind of
 * object: only the document handed in differs. The file's own title carries the
 * document's label, so a Word window says which of the two is open.
 */
export async function documentDocxBlob(
  project: Project,
  bible: BibleDocument,
  exportedAt: Date = new Date(),
): Promise<Blob> {
  const docx = await import("docx");

  const document = new docx.Document({
    title: `${bible.title} — ${bible.label}`,
    subject: bible.subtitle,
    description: bible.disclosure,
    creator: project.meta.author?.trim() || "Character Profile & Story Bible Starter",
    sections: [{ children: bibleDocxChildren(bible, docx, exportedAt) }],
  });

  return docx.Packer.toBlob(document);
}

export function bibleDocxBlob(project: Project, exportedAt: Date = new Date()): Promise<Blob> {
  return documentDocxBlob(project, compileBible(project), exportedAt);
}

/** The collaborator brief as a Word file (§8.4). */
export function briefDocxBlob(project: Project, exportedAt: Date = new Date()): Promise<Blob> {
  return documentDocxBlob(project, compileBrief(project), exportedAt);
}
