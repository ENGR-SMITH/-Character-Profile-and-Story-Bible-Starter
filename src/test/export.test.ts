import { describe, expect, it } from "vitest";

import { bibleToText, compileBible } from "@/lib/bible";
import { castCsv, csvValue } from "@/lib/export/csv";
import { exportFilename, slugify } from "@/lib/export/download";
import { projectJson, readProjectJson } from "@/lib/export/json";
import { bibleMarkdown } from "@/lib/export/markdown";
import { biblePlainText } from "@/lib/export/text";
import { FIELDS } from "@/lib/fields";
import { createProject } from "@/lib/schema";
import { brokenMessy, cleanMinimal, deepFull, legacyV0 } from "@/test/fixtures";

/**
 * The formats that need no library: Markdown, the cast table and JSON.
 *
 * JSON is the one that matters most, because §11.1 makes the round trip a
 * promise: "The JSON export re-imports to an identical project."
 */

const EXPORTED_AT = new Date("2026-09-21T10:00:00.000Z");

describe("naming the file", () => {
  it("slugs a title into something a filesystem will accept", () => {
    expect(slugify("Orah and the Salt Road")).toBe("orah-and-the-salt-road");
    expect(slugify("  Mara's Almanac — Vol. 2!  ")).toBe("mara-s-almanac-vol-2");
    // Accents fold rather than vanish into a gap.
    expect(slugify("Café des Étoiles")).toBe("cafe-des-etoiles");
  });

  it("names each format after the project", () => {
    const project = deepFull();
    expect(exportFilename(project, "story-bible", "md")).toBe(
      "orah-and-the-salt-road.story-bible.md",
    );
    expect(exportFilename(project, "cast", "csv")).toBe(
      "orah-and-the-salt-road.cast.csv",
    );
    expect(exportFilename(project, null, "json")).toBe("orah-and-the-salt-road.json");
  });

  it("falls back to a usable name when the title slugs away to nothing", () => {
    const project = createProject({ title: "???", genre: "general", storyType: "novel" });
    expect(exportFilename(project, null, "json")).toBe("story-bible.json");
  });
});

describe("the Markdown export", () => {
  it("is the compiled bible, so the file and the view cannot disagree", () => {
    const project = deepFull();
    const markdown = bibleMarkdown(project, EXPORTED_AT);

    expect(markdown.startsWith(bibleToText(compileBible(project)))).toBe(true);
  });

  it("says when it was exported, so a stale file is detectable", () => {
    expect(bibleMarkdown(deepFull(), EXPORTED_AT)).toContain(
      "Exported from the Character Profile & Story Bible Starter on 2026-09-21T10:00:00.000Z.",
    );
  });

  it("carries the do-not-change block before the cast", () => {
    const markdown = bibleMarkdown(deepFull(), EXPORTED_AT);
    expect(markdown.indexOf("Protected canon")).toBeLessThan(
      markdown.indexOf("Cast overview"),
    );
  });
});

describe("the plain text export", () => {
  const project = deepFull();
  const text = biblePlainText(project, EXPORTED_AT);

  it("is the compiled bible with the Markdown taken out", () => {
    // The destination is a notes app: nothing should have to be unescaped by
    // hand, and a `#` in front of a title is the one thing that always does.
    expect(text).not.toContain("**");
    expect(text.split("\n").some((line) => line.startsWith("#"))).toBe(false);
    expect(text).not.toContain("_");
  });

  it("keeps every section's number, so the file still pages like the bible", () => {
    expect(text).toContain("\n3. Cast overview\n");
    expect(text.indexOf("2. Protected canon")).toBeLessThan(
      text.indexOf("3. Cast overview"),
    );
  });

  it("reads a fact as a label rather than as bulleted emphasis", () => {
    expect(text).toMatch(/^Genre: .+$/m);
    expect(text).not.toContain("Genre\*\*");
  });

  it("keeps the profiles and their entries", () => {
    expect(text).toContain("Mara Vale");
    expect(text).toContain("Discover who sent the letter written in her handwriting.");
  });

  it("says when it was exported, so a stale file is still detectable", () => {
    expect(
      text.endsWith(
        "Exported from the Character Profile & Story Bible Starter on 2026-09-21T10:00:00.000Z.",
      ),
    ).toBe(true);
  });
});

/**
 * A minimal RFC 4180 reader, so these tests check the *table* rather than
 * counting commas and hoping.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const body = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (quoted) {
      if (char === '"') {
        if (body[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\r") {
      // Ignored: \n ends the row, per RFC 4180's CRLF.
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

describe("the cast table", () => {
  const project = deepFull();
  const table = parseCsv(castCsv(project));
  const header = table[0] ?? [];

  it("opens with a byte order mark, so a spreadsheet reads it as UTF-8", () => {
    // Excel reads a BOM-less UTF-8 file as the local codepage and mangles names.
    expect(castCsv(project).startsWith("\uFEFF")).toBe(true);
  });

  it("has a header, one column per field of the catalog, and one row per character", () => {
    expect(header.slice(0, 5)).toEqual([
      "Name",
      "Role",
      "Importance",
      "Depth",
      "Complete %",
    ]);
    expect(header).toHaveLength(5 + FIELDS.length + project.customFields.length);
    expect(table).toHaveLength(project.characters.length + 1);
  });

  it("uses the catalog's own labels as columns, custom fields included", () => {
    expect(header).toContain("Core fear");
    expect(header).toContain("Dominant hand");
    expect(header).toContain("Accent and dialect");
  });

  it("keeps every cell under its own column", () => {
    for (const row of table) {
      expect(row).toHaveLength(header.length);
    }
    // The protagonist's name sits under Name, and their want under its column.
    const mara = table[1] ?? [];
    expect(mara[0]).toBe("Mara Vale");
    expect(mara[header.indexOf("External goal — what they want")]).toBe(
      "Discover who sent the letter written in her handwriting.",
    );
  });

  it("keeps a list answer on one line", () => {
    const mara = table[1] ?? [];
    expect(mara[header.indexOf("Core traits")]).toBe(
      "guarded; observant; loyal past the point of sense",
    );
  });

  it("quotes exactly what RFC 4180 says to quote", () => {
    expect(csvValue("plain")).toBe("plain");
    expect(csvValue("has, comma")).toBe('"has, comma"');
    expect(csvValue('say "this"')).toBe('"say ""this"""');
    expect(csvValue("two\nlines")).toBe('"two\nlines"');
  });

  it("survives a value full of commas, quotes and newlines", () => {
    const messy = cleanMinimal();
    const character = messy.characters[0];
    if (!character) throw new Error("fixture has no character");
    character.fields.coreFear = {
      kind: "long",
      value: 'He said "run", and she did —\ntwice, loudly.',
    };

    const parsed = parseCsv(castCsv(messy));
    const localHeader = parsed[0] ?? [];
    const row = parsed[1] ?? [];

    expect(row).toHaveLength(localHeader.length);
    // The newline is flattened on the way out, so the row stays a row.
    expect(row[localHeader.indexOf("Core fear")]).toBe(
      'He said "run", and she did —; twice, loudly.',
    );
  });
});

describe("the JSON export", () => {
  it("round-trips every fixture unchanged", () => {
    // §11.1: the export re-imports to an identical project.
    for (const project of [cleanMinimal(), brokenMessy().project, deepFull()]) {
      const result = readProjectJson(projectJson(project));
      if (!result.ok) throw new Error(result.error);
      expect(result.project).toEqual(project);
    }
  });

  it("writes the schema's defaults out explicitly, so the file is the contract", () => {
    const project = createProject({ title: "Thin", genre: "general", storyType: "novel" });
    const written = JSON.parse(projectJson(project)) as Record<string, unknown>;

    for (const key of [
      "characters",
      "relationships",
      "locations",
      "rules",
      "factions",
      "timelineEvents",
      "glossary",
      "canonFacts",
      "customFields",
    ]) {
      expect(written[key], key).toEqual([]);
    }
  });

  it("keeps the version an older payload was written with", () => {
    const result = readProjectJson(JSON.stringify(legacyV0));
    if (!result.ok) throw new Error(result.error);

    expect(result.writtenBy).toBe(0);
    expect(result.project.schemaVersion).toBe(0);
    // Defaulted rather than rejected: what the tool has gained since is filled in.
    expect(result.project.world).toEqual({});
    expect(result.project.characters).toHaveLength(1);
  });

  it("refuses something that is not a project, and says why", () => {
    const notJson = readProjectJson("this is not json");
    expect(notJson.ok).toBe(false);
    if (!notJson.ok) expect(notJson.error).toContain("not JSON");

    const wrongShape = readProjectJson(JSON.stringify({ hello: "world" }));
    expect(wrongShape.ok).toBe(false);
    if (!wrongShape.ok) expect(wrongShape.error).toContain("not a Story Bible export");
  });

  it("round-trips a project with every collection populated", () => {
    const project = deepFull();
    const result = readProjectJson(projectJson(project));
    if (!result.ok) throw new Error(result.error);

    expect(result.project.canonFacts).toHaveLength(project.canonFacts.length);
    expect(result.project.timelineEvents).toEqual(project.timelineEvents);
    expect(result.project.meta.themes).toEqual(project.meta.themes);
  });
});
