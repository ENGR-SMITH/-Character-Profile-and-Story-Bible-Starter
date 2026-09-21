import { describe, expect, it } from "vitest";

import { FIELD_BY_KEY, fieldsForDepth } from "@/lib/fields";
import {
  characterMatchesQuery,
  createCharacter,
  createProject,
  fieldValueToText,
  isFieldValueEmpty,
  makeCustomFieldValue,
  makeFieldValue,
  measureCharacter,
  measureFields,
  projectSchema,
  SCHEMA_VERSION,
  type CustomFieldDef,
  type FieldValue,
} from "@/lib/schema";
import type { Genre } from "@/lib/taxonomy";

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

describe("makeCustomFieldValue", () => {
  const def = (kind: CustomFieldDef["kind"]): CustomFieldDef => ({
    id: `custom_${kind}`,
    label: kind,
    kind,
  });

  it("stores text and long fields with their own kinds", () => {
    expect(makeCustomFieldValue(def("text"), "Lowland" )).toEqual({
      kind: "text",
      value: "Lowland",
    });
    expect(makeCustomFieldValue(def("long"), "A long note").kind).toBe("long");
  });

  it("splits a list custom field on newlines like a catalog list field", () => {
    expect(makeCustomFieldValue(def("list"), "a\n b \n\n")).toEqual({
      kind: "list",
      value: ["a", "b"],
    });
  });

  it("parses a number custom field", () => {
    expect(makeCustomFieldValue(def("number"), "42")).toEqual({
      kind: "number",
      value: 42,
    });
  });

  it("falls back to text for a blank or non-numeric number, never NaN", () => {
    // A number value is never "empty" to the measurer, so storing NaN here
    // would report an unanswered field as complete.
    expect(makeCustomFieldValue(def("number"), "  ")).toEqual({
      kind: "text",
      value: "",
    });
    expect(makeCustomFieldValue(def("number"), "nineteen")).toEqual({
      kind: "text",
      value: "nineteen",
    });
  });
});

describe("characterMatchesQuery", () => {
  const character = createCharacter({ name: "Mara Vale", role: "protagonist", importance: "pov" });
  character.fields.eyes = makeFieldValue(FIELD_BY_KEY.eyes, "grey");
  character.custom.custom_accent = { kind: "text", value: "Lowland coastal" };

  it("matches everything when the query is blank", () => {
    expect(characterMatchesQuery(character, "   ")).toBe(true);
  });

  it("matches the name, case-insensitively", () => {
    expect(characterMatchesQuery(character, "mara")).toBe(true);
  });

  it("matches a stored answer", () => {
    expect(characterMatchesQuery(character, "grey")).toBe(true);
  });

  it("matches a custom field answer, which is where a writer's own words live", () => {
    expect(characterMatchesQuery(character, "lowland")).toBe(true);
  });

  it("matches the role and importance taxonomies", () => {
    expect(characterMatchesQuery(character, "protagonist")).toBe(true);
    expect(characterMatchesQuery(character, "pov")).toBe(true);
  });

  it("rejects a query that appears nowhere", () => {
    expect(characterMatchesQuery(character, "orchard")).toBe(false);
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

  it("adds custom fields to both the filled and the total", () => {
    const custom: CustomFieldDef[] = [
      { id: "custom_accent", label: "Accent", kind: "text" },
      { id: "custom_height", label: "Height", kind: "text" },
    ];
    const character = createCharacter({ name: "Mara" });
    character.custom.custom_accent = { kind: "text", value: "Lowland" };

    expect(measureFields(character, quickFields, custom)).toEqual({
      filled: 1,
      total: quickFields.length + 2,
    });
  });
});

describe("measureCharacter", () => {
  function projectWith(character: ReturnType<typeof createCharacter>, genre: Genre = "general") {
    const project = createProject({ title: "Test", genre, storyType: "novel" });
    return { ...project, characters: [character] };
  }

  it("follows the character's own depth, like the editor does", () => {
    const quick = projectWith(createCharacter({ name: "Mara", depth: "quick" }));
    const deep = projectWith(createCharacter({ name: "Mara", depth: "deep" }));

    expect(measureCharacter(quick, quick.characters[0]).total).toBe(13);
    expect(measureCharacter(deep, deep.characters[0]).total).toBe(56);
  });

  it("counts the project's genre layers, not just the base catalog", () => {
    const fantasy = projectWith(createCharacter({ name: "Mara", depth: "deep" }), "fantasy");
    // Fantasy switches on all four layers, which the deep total must reflect.
    expect(measureCharacter(fantasy, fantasy.characters[0]).total).toBe(60);
  });

  it("counts the project's custom fields, which is what the cast list shows", () => {
    const character = createCharacter({ name: "Mara" });
    character.fields.eyes = makeFieldValue(FIELD_BY_KEY.eyes, "grey");
    character.custom.custom_accent = { kind: "text", value: "Lowland" };

    const project = {
      ...projectWith(character),
      customFields: [{ id: "custom_accent", label: "Accent", kind: "text" as const }],
    };

    expect(measureCharacter(project, character)).toEqual({
      filled: 2,
      total: 14,
    });
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
