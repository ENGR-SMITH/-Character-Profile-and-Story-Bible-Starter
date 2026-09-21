import { describe, expect, it } from "vitest";

import { runContinuityCheck, type FindingKind } from "@/lib/checker";
import { countFieldsForDepth, fieldsForDepth } from "@/lib/fields";
import {
  fieldValueToText,
  isFieldValueEmpty,
  measureFields,
  projectSchema,
  SCHEMA_VERSION,
} from "@/lib/schema";
import { nameOf, relationshipMapText } from "@/lib/relationships";
import { GENRE_META } from "@/lib/taxonomy";
import { rulesWithGaps } from "@/lib/world";
import {
  brokenMessy,
  cleanMinimal,
  CLEAN_MINIMAL_QUICK_FIELD_COUNT,
  deepFull,
  LEGACY_V0_MISSING_COLLECTIONS,
  legacyV0,
  type ExpectedFindingKind,
} from "@/test/fixtures";

/**
 * The one place the fixture's vocabulary meets the checker's.
 *
 * A fixture name says what was planted ("missing core field"); a finding kind
 * says which rule caught it ("missing-field"). A core field is a Quick field,
 * so the planted issue is the `gap` severity of the missing-field report.
 */
const CHECKER_KIND: Record<ExpectedFindingKind, FindingKind> = {
  "duplicate-name": "duplicate-name",
  "orphan-character": "orphan-character",
  "glossary-spelling": "glossary-spelling",
  "impossible-age": "impossible-age",
  "one-sided-relationship": "one-sided-relationship",
  "missing-core-field": "missing-field",
};

function normalise(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Levenshtein distance — the similarity measure the Phase D checker will need. */
function editDistance(a: string, b: string): number {
  const width = b.length + 1;
  let previous = Array.from({ length: width }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = new Array<number>(width).fill(0);
    current[0] = i;
    for (let j = 1; j < width; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, substitution);
    }
    previous = current;
  }

  return previous[width - 1];
}

describe("clean-minimal", () => {
  const project = cleanMinimal();
  const quickFields = fieldsForDepth("quick", GENRE_META.general.layers);

  it("parses against the schema", () => {
    expect(() => projectSchema.parse(project)).not.toThrow();
  });

  it("is one Quick character and no relationships", () => {
    expect(project.characters).toHaveLength(1);
    expect(project.relationships).toHaveLength(0);
    expect(project.characters[0]?.depth).toBe("quick");
  });

  it("fills every Quick field, so no gap can be reported at that depth", () => {
    const character = project.characters[0];
    if (!character) throw new Error("fixture has no character");
    expect(measureFields(character, quickFields)).toEqual({
      filled: CLEAN_MINIMAL_QUICK_FIELD_COUNT,
      total: CLEAN_MINIMAL_QUICK_FIELD_COUNT,
    });
    expect(quickFields).toHaveLength(CLEAN_MINIMAL_QUICK_FIELD_COUNT);
  });

  it("leaves nothing else in the project for the checker to trip over", () => {
    expect(project.glossary).toEqual([]);
    expect(project.timelineEvents).toEqual([]);
    expect(project.canonFacts).toEqual([]);
  });

  // Note the ambiguity this fixture creates and that the checker resolves:
  // §5.4.5 flags a character with no relationships, but with a cast of one
  // there is nobody to be linked to and this fixture expects zero findings.
  // The orphan rule is therefore "unlinked while the cast is > 1".
  it("reports zero findings", () => {
    const report = runContinuityCheck(project);
    expect(report.findings).toEqual([]);
    expect(report.coverage).toEqual({
      completeCharacters: 1,
      totalCharacters: 1,
      fieldsFilled: CLEAN_MINIMAL_QUICK_FIELD_COUNT,
      fieldsAsked: CLEAN_MINIMAL_QUICK_FIELD_COUNT,
    });
  });
});

describe("broken-messy", () => {
  const { project, expected, ids } = brokenMessy();
  const quickFields = fieldsForDepth("quick", GENRE_META.general.layers);

  it("parses against the schema", () => {
    expect(() => projectSchema.parse(project)).not.toThrow();
  });

  it("declares one expected finding per planted issue", () => {
    expect(expected).toHaveLength(6);
    expect(expected.every((finding) => finding.count === 1)).toBe(true);
    expect(new Set(expected.map((finding) => finding.kind)).size).toBe(6);
    for (const finding of expected) {
      expect(finding.detail.trim().length).toBeGreaterThan(10);
    }
  });

  it("plants exactly one duplicated name", () => {
    const counts = new Map<string, number>();
    for (const character of project.characters) {
      counts.set(character.name, (counts.get(character.name) ?? 0) + 1);
    }
    const duplicated = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);

    expect(duplicated).toEqual(["Elias Vale"]);
    expect(project.characters.filter((c) => c.name === "Elias Vale")).toHaveLength(2);
  });

  it("plants exactly one unlinked character, in a cast big enough for it to mean something", () => {
    expect(project.characters.length).toBeGreaterThan(1);

    const linked = new Set(
      project.relationships.flatMap((relationship) => [
        relationship.fromId,
        relationship.toId,
      ]),
    );
    const unlinked = project.characters.filter(
      (character) => !linked.has(character.id),
    );

    expect(unlinked.map((character) => character.name)).toEqual(["Nadia Okonkwo"]);
  });

  it("plants a glossary alias exactly one edit away from its term", () => {
    const entry = project.glossary.find((item) => item.id === ids.glossaryOrchard);
    if (!entry) throw new Error("fixture has no glossary entry");

    const nearDuplicates = entry.aliases.filter(
      (alias) => editDistance(normalise(alias), normalise(entry.term)) === 1,
    );
    expect(nearDuplicates).toEqual(["the Orchardd"]);
  });

  it("plants a missing Quick field on exactly one character", () => {
    for (const character of project.characters) {
      const { filled } = measureFields(character, quickFields);
      const expectedFilled =
        character.id === ids.mara ? quickFields.length - 1 : quickFields.length;
      expect(filled, `${character.name} filled fields`).toBe(expectedFilled);
    }

    const mara = project.characters.find((c) => c.id === ids.mara);
    expect(mara?.fields.coreFear).toBeUndefined();
  });

  it("plants an age the timeline contradicts", () => {
    const mara = project.characters.find((c) => c.id === ids.mara);
    const event = project.timelineEvents.find((e) => e.id === ids.timelineSaltRoad);
    if (!mara || !event) throw new Error("fixture is missing a planted issue");

    const birthYear = Number(fieldValueToText(mara.fields.birthYear));
    const statedAge = Number(fieldValueToText(mara.fields.age));
    const ageAtEvent = Number(event.when) - birthYear;

    expect(birthYear).toBe(1810);
    expect(statedAge).toBe(20);
    expect(ageAtEvent).toBe(80);
    // The two cannot both be true, which is the whole plant.
    expect(ageAtEvent).not.toBe(statedAge);
    expect(event.characterIds).toContain(mara.id);
  });

  it("plants exactly one relationship whose two sides feel it differently", () => {
    const uneven = project.relationships.filter(
      (relationship) => relationship.asymmetryNote,
    );
    expect(uneven.map((relationship) => relationship.id)).toEqual([
      ids.relationshipUneven,
    ]);
    // The other relationship is balanced, so the rule has one candidate.
    expect(project.relationships).toHaveLength(2);
  });

  it("reports exactly one finding per planted issue, and nothing besides", () => {
    const report = runContinuityCheck(project);

    // One finding per plant and no false positives: the exit criterion in §10.
    expect(report.findings).toHaveLength(expected.length);

    for (const planted of expected) {
      const kind = CHECKER_KIND[planted.kind];
      const found = report.findings.filter((finding) => finding.kind === kind);

      expect(found, `${planted.kind} should be reported as ${kind}`).toHaveLength(
        planted.count,
      );
      const [finding] = found;
      if (!finding) throw new Error(`no finding for ${planted.kind}`);
      expect(finding.detail.trim().length).toBeGreaterThan(10);

      for (const id of planted.characterIds ?? []) {
        expect(finding.characterIds, `${planted.kind} characters`).toContain(id);
      }
      if (planted.glossaryEntryId) {
        expect(finding.glossaryEntryId).toBe(planted.glossaryEntryId);
      }
    }

    // And every finding the checker produced was one of the planted issues.
    const plantedKinds = new Set(expected.map((planted) => CHECKER_KIND[planted.kind]));
    for (const finding of report.findings) {
      expect(plantedKinds.has(finding.kind), `unexpected ${finding.kind}: ${finding.title}`).toBe(
        true,
      );
    }
  });
});

describe("deep-full", () => {
  const project = deepFull();
  const layers = GENRE_META.fantasy.layers;
  const deepFields = fieldsForDepth("deep", layers);

  it("parses against the schema", () => {
    expect(() => projectSchema.parse(project)).not.toThrow();
  });

  it("is a fantasy project, so all four layers are switched on", () => {
    expect(project.meta.genre).toBe("fantasy");
    expect(layers).toHaveLength(4);
    expect(deepFields).toHaveLength(60);
    expect(countFieldsForDepth("deep", layers)).toBe(60);
  });

  it("fills every Deep field on the protagonist, layer fields included", () => {
    const mara = project.characters.find((c) => c.role === "protagonist");
    if (!mara) throw new Error("fixture has no protagonist");
    expect(mara.depth).toBe("deep");

    const empty = deepFields.filter((field) =>
      isFieldValueEmpty(mara.fields[field.key]),
    );
    expect(empty.map((field) => field.key)).toEqual([]);
    expect(measureFields(mara, deepFields)).toEqual({ filled: 60, total: 60 });
  });

  it("populates every collection in the data contract", () => {
    expect(project.characters.length).toBeGreaterThan(1);
    expect(project.relationships.length).toBeGreaterThan(1);
    expect(project.locations.length).toBeGreaterThan(1);
    expect(project.rules.length).toBeGreaterThan(1);
    expect(project.factions.length).toBeGreaterThan(0);
    expect(project.timelineEvents.length).toBeGreaterThan(1);
    expect(project.glossary.length).toBeGreaterThan(0);
    expect(project.canonFacts.length).toBeGreaterThan(1);
    expect(project.customFields.length).toBeGreaterThan(0);
  });

  it("gives every rule a cost and a limit, which is what stops it bending later", () => {
    for (const rule of project.rules) {
      expect(rule.cost.trim(), `${rule.name} cost`).not.toBe("");
      expect(rule.cannotDo.trim(), `${rule.name} limit`).not.toBe("");
    }
  });

  it("reports no rule gaps to the world editor", () => {
    // The same function the editor's badge reads, so a rule that leaves a limit
    // blank would be caught here rather than only in the UI.
    expect(rulesWithGaps(project).map((rule) => rule.name)).toEqual([]);
  });

  it("keeps custom field values matching a declared custom field", () => {
    const declared = new Set(project.customFields.map((field) => field.id));
    for (const character of project.characters) {
      for (const key of Object.keys(character.custom)) {
        expect(declared.has(key), `undeclared custom field ${key}`).toBe(true);
      }
    }
  });

  it("renders its relationship map once per stored row, grouped by type", () => {
    const text = relationshipMapText(project);
    expect(text).not.toBe("");
    // One bullet per relationship, no matter how many characters point at it.
    expect(text.match(/^- /gm)).toHaveLength(project.relationships.length);
    for (const relationship of project.relationships) {
      expect(text).toContain(
        `**${nameOf(project, relationship.fromId)}** ↔ **${nameOf(
          project,
          relationship.toId,
        )}**`,
      );
    }
  });

  it("carries the worked example from the plan", () => {
    const mara = project.characters.find((c) => c.role === "protagonist");
    expect(fieldValueToText(mara?.fields.coreFear)).toBe(
      "That the truth will prove she abandoned her brother.",
    );
    expect(fieldValueToText(mara?.fields.externalGoal)).toBe(
      "Discover who sent the letter written in her handwriting.",
    );
    expect(project.canonFacts.map((fact) => fact.statement)).toContain(
      "The mystery of the handwriting is not resolved in this book.",
    );
  });

  // Phase E's serialisers all exist now, so the manifest's export half is
  // asserted across every fixture in `export-files.test.ts`, which is where the
  // two formats that need a library are available.
});

describe("legacy-v0", () => {
  const parsed = projectSchema.parse(legacyV0);

  it("parses even though it predates the current schema", () => {
    expect(parsed).toBeDefined();
  });

  it("keeps the version it was written with, rather than pretending it is current", () => {
    expect(parsed.schemaVersion).toBe(0);
    expect(parsed.schemaVersion).toBeLessThan(SCHEMA_VERSION);
  });

  it("defaults every collection that did not exist yet", () => {
    for (const key of LEGACY_V0_MISSING_COLLECTIONS) {
      expect(parsed[key], `${key} should default`).toEqual([]);
    }
  });

  it("keeps the character and its field value", () => {
    expect(parsed.characters).toHaveLength(1);
    expect(parsed.characters[0]?.name).toBe("Old Character");
    expect(fieldValueToText(parsed.characters[0]?.fields.nickname)).toBe("Old");
  });

  it("gains the world section it predates", () => {
    // §5.5's setting fields did not exist in version 0, so the schema supplies
    // the empty section instead of the payload having to carry it.
    expect(parsed.world).toEqual({});
  });
});
