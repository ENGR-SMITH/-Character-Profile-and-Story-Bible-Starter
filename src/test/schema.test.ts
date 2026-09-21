import { describe, expect, it } from "vitest";

import { FIELD_BY_KEY, fieldsForDepth } from "@/lib/fields";
import {
  createCharacter,
  createProject,
  fieldValueToText,
  isFieldValueEmpty,
  makeFieldValue,
  measureFields,
  projectSchema,
  SCHEMA_VERSION,
  type FieldValue,
} from "@/lib/schema";

describe("createProject", () => {
  it("stamps the current schema version so an export is self-describing", () => {
    const project = createProject({
      title: "Test",
      genre: "general",
      storyType: "novel",
    });
    expect(project.schemaVersion).toBe(SCHEMA_VERSION);
    expect(project.id).toMatch(/^project_/);
  });

  it("defaults every collection to an empty array rather than undefined", () => {
    const project = createProject({
      title: "Test",
      genre: "fantasy",
      storyType: "series",
    });

    for (const collection of [
      project.characters,
      project.relationships,
      project.locations,
      project.rules,
      project.factions,
      project.timelineEvents,
      project.glossary,
      project.canonFacts,
      project.customFields,
    ]) {
      expect(Array.isArray(collection)).toBe(true);
      expect(collection).toHaveLength(0);
    }
  });

  it("writes a parseable updatedAt, which the autosave indicator depends on", () => {
    const project = createProject({
      title: "Test",
      genre: "general",
      storyType: "novel",
    });
    expect(Number.isNaN(Date.parse(project.updatedAt))).toBe(false);
  });
});

describe("createCharacter", () => {
  it("trims the name", () => {
    expect(createCharacter({ name: "  Mara Vale  " }).name).toBe("Mara Vale");
  });

  it("defaults to a role and importance that exist in the vocabulary", () => {
    // These defaults were once invalid, and because `parse` accepts `unknown`
    // the compiler could not see it — every add would have thrown at runtime.
    const character = createCharacter({ name: "Mara" });
    expect(character.role).toBe("background");
    expect(character.importance).toBe("supporting");
    expect(character.depth).toBe("quick");
  });

  it("starts with empty field, custom and question maps", () => {
    const character = createCharacter({ name: "Mara" });
    expect(character.fields).toEqual({});
    expect(character.custom).toEqual({});
    expect(character.openQuestions).toEqual([]);
  });

  it("honours the supplied role, importance, depth and colour", () => {
    const character = createCharacter({
      name: "Mara",
      role: "protagonist",
      importance: "pov",
      depth: "deep",
      colorTag: "#b45309",
    });
    expect(character.role).toBe("protagonist");
    expect(character.importance).toBe("pov");
    expect(character.depth).toBe("deep");
    expect(character.colorTag).toBe("#b45309");
  });
});

describe("makeFieldValue", () => {
  it("splits a list field on newlines, trimming and dropping blanks", () => {
    const value = makeFieldValue(
      FIELD_BY_KEY.coreTraits,
      "guarded\n  observant \n\n  loyal  \n",
    );
    expect(value).toEqual({ kind: "list", value: ["guarded", "observant", "loyal"] });
  });

  it("stores a long field as the long kind", () => {
    expect(makeFieldValue(FIELD_BY_KEY.externalGoal, "Find the letter.").kind).toBe("long");
  });

  it("stores text and select fields as plain text", () => {
    expect(makeFieldValue(FIELD_BY_KEY.eyes, "grey").kind).toBe("text");
    expect(makeFieldValue(FIELD_BY_KEY.arcType, "Positive")).toEqual({
      kind: "text",
      value: "Positive",
    });
  });
});

describe("fieldValueToText", () => {
  const cases: Array<[string, FieldValue]> = [
    ["text", { kind: "text", value: "grey eyes" }],
    ["long", { kind: "long", value: "A long answer." }],
    ["list", { kind: "list", value: ["one", "two"] }],
    ["number", { kind: "number", value: 42 }],
    ["ref", { kind: "ref", value: "character_1" }],
    [
      "accepted AI suggestion",
      {
        kind: "ai",
        value: "Suggested text",
        suggestedBy: { provider: "groq" },
        accepted: true,
      },
    ],
  ];

  it.each(cases)("renders a %s value as editable text", (_name, value) => {
    expect(typeof fieldValueToText(value)).toBe("string");
    expect(fieldValueToText(value).length).toBeGreaterThan(0);
  });

  it("joins a list with newlines so it round-trips through the editor", () => {
    expect(fieldValueToText({ kind: "list", value: ["one", "two"] })).toBe("one\ntwo");
  });

  it("returns an empty string for a missing value", () => {
    expect(fieldValueToText(undefined)).toBe("");
  });

  it("round-trips a list field through text and back", () => {
    const field = FIELD_BY_KEY.coreTraits;
    const original = makeFieldValue(field, "guarded\nobservant");
    const roundTripped = makeFieldValue(field, fieldValueToText(original));
    expect(roundTripped).toEqual(original);
  });
});

describe("isFieldValueEmpty", () => {
  it("treats a missing value as empty", () => {
    expect(isFieldValueEmpty(undefined)).toBe(true);
  });

  it("treats blank and whitespace-only text as empty", () => {
    expect(isFieldValueEmpty({ kind: "text", value: "" })).toBe(true);
    expect(isFieldValueEmpty({ kind: "text", value: "   \n " })).toBe(true);
    expect(isFieldValueEmpty({ kind: "long", value: "  " })).toBe(true);
  });

  it("treats a list with no items as empty", () => {
    expect(isFieldValueEmpty({ kind: "list", value: [] })).toBe(true);
  });

  it("treats a real answer as filled", () => {
    expect(isFieldValueEmpty({ kind: "text", value: "grey" })).toBe(false);
    expect(isFieldValueEmpty({ kind: "list", value: ["guarded"] })).toBe(false);
  });

  it("treats zero as a filled number, not a missing one", () => {
    expect(isFieldValueEmpty({ kind: "number", value: 0 })).toBe(false);
  });
});

describe("measureFields", () => {
  const quickFields = fieldsForDepth("quick", []);

  it("reports zero filled for a fresh character", () => {
    const character = createCharacter({ name: "Mara" });
    expect(measureFields(character, quickFields)).toEqual({
      filled: 0,
      total: quickFields.length,
    });
  });

  it("counts only the fields it was given, so the total follows the depth", () => {
    const character = createCharacter({ name: "Mara" });
    expect(measureFields(character, quickFields).total).toBe(13);
    expect(measureFields(character, fieldsForDepth("deep", [])).total).toBe(56);
  });

  it("counts a filled field and ignores a blank one", () => {
    const character = createCharacter({ name: "Mara" });
    character.fields.eyes = makeFieldValue(FIELD_BY_KEY.eyes, "grey");
    character.fields.hair = makeFieldValue(FIELD_BY_KEY.hair, "   ");
    expect(measureFields(character, quickFields).filled).toBe(1);
  });
});

describe("schema validation", () => {
  it("rejects a genre that is not in the vocabulary", () => {
    const result = projectSchema.safeParse({
      id: "project_1",
      meta: { title: "Test", genre: "not-a-genre", storyType: "novel" },
      updatedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown depth on a character", () => {
    const result = projectSchema.safeParse({
      id: "project_1",
      meta: { title: "Test", genre: "general", storyType: "novel" },
      updatedAt: new Date().toISOString(),
      characters: [
        { id: "c1", name: "Mara", depth: "very-deep", role: "protagonist", importance: "pov" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a field value whose kind is unknown", () => {
    const result = projectSchema.safeParse({
      id: "project_1",
      meta: { title: "Test", genre: "general", storyType: "novel" },
      updatedAt: new Date().toISOString(),
      characters: [
        {
          id: "c1",
          name: "Mara",
          depth: "quick",
          role: "protagonist",
          importance: "pov",
          fields: { eyes: { kind: "colour", value: "grey" } },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("keeps unknown field keys, so a newer export is not silently gutted", () => {
    const result = projectSchema.safeParse({
      id: "project_1",
      meta: { title: "Test", genre: "general", storyType: "novel" },
      updatedAt: new Date().toISOString(),
      characters: [
        {
          id: "c1",
          name: "Mara",
          depth: "quick",
          role: "protagonist",
          importance: "pov",
          fields: { aFieldFromTheFuture: { kind: "text", value: "kept" } },
        },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data?.characters[0].fields.aFieldFromTheFuture).toBeDefined();
  });
});
