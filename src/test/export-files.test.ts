// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { compileBible } from "@/lib/bible";
import { compileBrief } from "@/lib/brief";
import {
  bibleDocxBlob,
  bibleDocxChildren,
  briefDocxBlob,
  DOCX_MIME,
} from "@/lib/export/docx";
import { castCsv } from "@/lib/export/csv";
import { projectJson, readProjectJson } from "@/lib/export/json";
import { bibleMarkdown, briefMarkdown } from "@/lib/export/markdown";
import { biblePdfBlob, biblePdfElement } from "@/lib/export/pdf";
import { biblePlainText } from "@/lib/export/text";
import { projectSchema, type Project } from "@/lib/schema";
import { brokenMessy, cleanMinimal, deepFull, legacyV0 } from "@/test/fixtures";

/**
 * The two formats that need a library.
 *
 * Neither Word nor Acrobat exists here, so these tests check what can honestly
 * be checked: that a real file is produced, that it is the format it claims to
 * be, and that it carries the document's content. §10's exit criterion — "a DOCX
 * bible opens cleanly in Word and Google Docs" — is a person's check, and the
 * README says so rather than implying a test proved it.
 */

const EXPORTED_AT = new Date("2026-09-21T10:00:00.000Z");

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/** Latin-1 view of the bytes, enough to find a zip entry name or an XML tag. */
function asText(bytes: Uint8Array): string {
  return new TextDecoder("latin1").decode(bytes);
}

/**
 * The text a docx document holds, gathered out of its element tree.
 *
 * The tree is a lot of XML-shaped objects; walking it for the strings is how a
 * test reads what Word would show, without Word.
 */
function docxText(value: unknown): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();

  function walk(node: unknown, depth: number) {
    if (depth > 12) return;
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    if (node && typeof node === "object") {
      if (seen.has(node)) return;
      seen.add(node);
      for (const item of Object.values(node)) walk(item, depth + 1);
    }
  }

  walk(value, 0);
  return parts.join("\n");
}

/**
 * How many paragraphs ask Word to start a new page.
 *
 * `pageBreakBefore` becomes a `w:pageBreakBefore` element inside a paragraph's
 * own properties, so the count is the number of those elements anywhere in the
 * tree — which is what Word will act on.
 */
function docxPageBreaks(value: unknown): number {
  let breaks = 0;
  const seen = new Set<unknown>();

  function walk(node: unknown, depth: number) {
    if (depth > 12 || !node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }

    const record = node as Record<string, unknown>;
    if (record.rootKey === "w:pageBreakBefore") breaks += 1;
    for (const item of Object.values(record)) walk(item, depth + 1);
  }

  walk(value, 0);
  return breaks;
}

describe("the Word export", () => {
  it("carries the document's own words", async () => {
    const docx = await import("docx");
    const children = bibleDocxChildren(
      compileBible(deepFull()),
      docx,
      EXPORTED_AT,
    );
    const text = docxText(children);

    expect(children.length).toBeGreaterThan(50);
    for (const expected of [
      "1. Project facts",
      "2. Protected canon — do not change",
      "4. Character profiles",
      "Genre: ",
      "Fantasy",
      "Mara Vale",
      "Core fear: ",
      "That the truth will prove she abandoned her brother.",
      // The relationship map arrives as its own bullets, detail included.
      "Siblings, estranged for ten years",
      "The two sides read it differently",
      EXPORTED_AT.toISOString(),
    ]) {
      expect(text, expected).toContain(expected);
    }
  });

  it("gives a thin bible the sections it does have, and says what is missing", async () => {
    const docx = await import("docx");
    const text = docxText(
      bibleDocxChildren(compileBible(cleanMinimal()), docx, EXPORTED_AT),
    );

    expect(text).toContain("3. Cast overview");
    // The missing sections are named in the closing line, and nowhere else:
    // their headings never appear.
    expect(text).toContain("Still to come in this bible");
    expect(text).not.toContain("7. Rules & systems");
  });

  it("packages a real .docx: a zip whose document part is present", async () => {
    const bytes = await blobBytes(await bibleDocxBlob(deepFull(), EXPORTED_AT));
    const text = asText(bytes);

    // Every OOXML file is a zip, and a zip starts with "PK".
    expect(String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0)).toBe("PK");
    // The parts Word reads, named in the archive's central directory.
    expect(text).toContain("word/document.xml");
    expect(text).toContain("[Content_Types].xml");
    expect(text).toContain("word/styles.xml");
  });

  it("declares the mime type the browser needs for a Word download", () => {
    expect(DOCX_MIME).toContain("wordprocessingml.document");
  });
});

describe("the brief's Word file (§8.4)", () => {
  it("packages a real .docx carrying the brief's own words", async () => {
    const bytes = await blobBytes(await briefDocxBlob(deepFull(), EXPORTED_AT));
    expect(String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0)).toBe("PK");
    expect(asText(bytes)).toContain("word/document.xml");
  });

  it("starts no section on a new page, because §8.1 promises one page", async () => {
    const docx = await import("docx");
    const project = deepFull();

    expect(docxPageBreaks(bibleDocxChildren(compileBible(project), docx, EXPORTED_AT))).toBe(9);
    expect(docxPageBreaks(bibleDocxChildren(compileBrief(project), docx, EXPORTED_AT))).toBe(0);
  });
});

describe("§11.2 — every fixture survives every writer", () => {
  const fixtures: [string, Project][] = [
    ["clean-minimal", cleanMinimal()],
    ["broken-messy", brokenMessy().project],
    ["deep-full", deepFull()],
    // The payload from before the current schema, parsed the way an import does.
    ["legacy-v0", projectSchema.parse(legacyV0)],
  ];

  const libraryFree = [
    ["markdown", bibleMarkdown],
    ["plain text", biblePlainText],
    ["the brief", briefMarkdown],
    ["JSON", projectJson],
    ["CSV", castCsv],
  ] as const;

  it.each(fixtures)("%s — the five writers that need no library", (name, project) => {
    for (const [format, write] of libraryFree) {
      expect(() => write(project), `${name}: ${format}`).not.toThrow();
    }
    // And the round trip §11.1 promises, on a project that has been through
    // every re-parse the tool can do.
    expect(readProjectJson(projectJson(project)).ok, name).toBe(true);
  });

  it.each(fixtures)("%s — Word and PDF", async (name, project) => {
    expect((await bibleDocxBlob(project, EXPORTED_AT)).size, name).toBeGreaterThan(0);
    expect((await biblePdfBlob(project)).size, name).toBeGreaterThan(0);
  });
});

describe("the PDF export", () => {
  it("builds an element from the compiled bible, without a renderer", async () => {
    const element = await biblePdfElement(deepFull());
    const { bible } = element.props;

    expect(bible.title).toBe("Orah and the Salt Road");
    // The fixture mints fresh ids on every build, so the document is compared
    // by its structure rather than by instance.
    expect(bible.sections.map((section) => section.id)).toEqual([
      "project-facts",
      "protected-canon",
      "cast",
      "profiles",
      "relationships",
      "world",
      "rules",
      "timeline",
      "glossary",
      "open-questions",
    ]);
    expect(element.props.author).toBe("Fixture Author");
  });

  it("renders a real PDF, starting with the PDF header", async () => {
    const bytes = await blobBytes(await biblePdfBlob(cleanMinimal()));
    const text = asText(bytes.slice(0, 1024));

    expect(text.startsWith("%PDF-")).toBe(true);
    // A trailer means the document was closed properly rather than truncated.
    expect(asText(bytes)).toContain("%%EOF");
  });
});
