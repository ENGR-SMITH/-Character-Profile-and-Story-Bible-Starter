import { describe, expect, it } from "vitest";

import {
  CHECKER_DISCLOSURE,
  editDistance,
  isNearDuplicate,
  measureCoverage,
  normaliseTerm,
  reportText,
  runContinuityCheck,
  type Finding,
} from "@/lib/checker";
import { FIELD_BY_KEY, fieldsForDepth } from "@/lib/fields";
import {
  createCharacter,
  createGlossaryEntry,
  createProject,
  makeFieldValue,
  type Character,
  type Project,
} from "@/lib/schema";
import { deepFull, fillVisibleFields } from "@/test/fixtures";

/**
 * The checker's rules, one at a time.
 *
 * The fixtures' own reports are asserted in `fixtures.test.ts`, where the
 * expected-finding manifests live. This file pins down the individual rules,
 * including the cases a fixture cannot hold: the ones that must stay silent.
 */

function project(genre: Project["meta"]["genre"] = "general"): Project {
  return createProject({ title: "Checker Test", genre, storyType: "novel" });
}

function addCharacter(draft: Project, override: Partial<Character> = {}): Character {
  const character = createCharacter({ name: "Mara Vale", ...override });
  draft.characters.push(character);
  return character;
}

/** Answer every field a character's depth and layers ask for. */
function fill(draft: Project, character: Character): Character {
  const layers = draft.meta.genre === "fantasy" ? (["speculative", "political", "faith", "historical"] as const) : [];
  return fillVisibleFields(character, character.depth, layers);
}

function kindsOf(findings: Finding[]): string[] {
  return findings.map((finding) => finding.kind);
}

/**
 * Connect two characters, so a test about naming is not also a test about
 * unlinked characters. The orphan rule is asserted on its own below.
 */
function link(draft: Project, from: Character, to: Character): void {
  draft.relationships.push({
    id: `rel_${from.id}_${to.id}`,
    fromId: from.id,
    toId: to.id,
    type: "family",
  });
}

describe("the missing-field report", () => {
  it("calls an unanswered Quick field a gap", () => {
    const draft = project();
    const mara = addCharacter(draft);
    fill(draft, mara);
    delete mara.fields.coreFear;

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.kind).toBe("missing-field");
    expect(findings[0]?.severity).toBe("gap");
    expect(findings[0]?.characterIds).toEqual([mara.id]);
    // With one field missing, the field's own help is the useful part.
    expect(findings[0]?.detail).toContain("Core fear");
    expect(findings[0]?.detail).toContain(FIELD_BY_KEY.coreFear.help);
  });

  it("calls a Standard or Deep field an opportunity, not a gap", () => {
    const draft = project();
    const mara = addCharacter(draft, { depth: "standard" });
    fillVisibleFields(mara, "quick", []); // Quick done, Standard untouched

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe("opportunity");
    expect(findings[0]?.title).toContain("could answer");
  });

  it("never asks for a field the character's own depth does not show", () => {
    // A Quick character is not nagged about the 43 questions they did not choose.
    const draft = project();
    const mara = addCharacter(draft, { depth: "quick" });
    fillVisibleFields(mara, "quick", []);

    expect(runContinuityCheck(draft).findings).toEqual([]);
  });

  it("counts the genre layer fields when the project's genre switches them on", () => {
    const draft = project("fantasy");
    const deepCharacter = addCharacter(draft, { depth: "deep" });
    fillVisibleFields(deepCharacter, "quick", []);

    // 60 is the Deep count in a fantasy project: the four layer fields of
    // §5.3 H are part of what this character is asked for.
    const deep = fieldsForDepth("deep", ["speculative", "political", "faith", "historical"]);
    const quick = fieldsForDepth("quick", []);
    expect(deep).toHaveLength(60);

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe("opportunity");
    expect(findings[0]?.title).toContain(`${deep.length - quick.length} more fields`);
  });

  it("groups a character's gaps by profile section rather than listing them flat", () => {
    const draft = project();
    // Nothing filled at all: thirteen Quick fields across several sections.
    addCharacter(draft);
    const findings = runContinuityCheck(draft).findings.filter(
      (finding) => finding.severity === "gap",
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.detail).toContain("Personality & motivation:");
    expect(findings[0]?.detail).toContain("Identity:");
  });
});

describe("duplicate names", () => {
  it("reports two characters sharing a name once, with both of them attached", () => {
    const draft = project();
    const one = addCharacter(draft, { name: "Elias Vale" });
    const two = addCharacter(draft, { name: "Elias Vale" });
    fill(draft, one);
    fill(draft, two);
    link(draft, one, two);

    const findings = runContinuityCheck(draft).findings;
    expect(kindsOf(findings)).toEqual(["duplicate-name"]);
    expect(findings[0]?.severity).toBe("gap");
    expect(findings[0]?.characterIds).toEqual([one.id, two.id]);
    expect(findings[0]?.title).toContain("Elias Vale");
  });

  it("catches a name that differs only by capitalisation or spacing", () => {
    const draft = project();
    const one = addCharacter(draft, { name: "Elias Vale" });
    const two = addCharacter(draft, { name: "  elias  vale " });
    fill(draft, one);
    fill(draft, two);
    link(draft, one, two);

    const finding = runContinuityCheck(draft).findings[0];
    expect(finding?.kind).toBe("duplicate-name");
    expect(finding?.detail).toContain("capitalisation");
  });

  it("warns about a shared first name as a question, and not as a second finding for the same pair", () => {
    const draft = project();
    const one = addCharacter(draft, { name: "Elias Vale" });
    const two = addCharacter(draft, { name: "Elias Okonkwo" });
    fill(draft, one);
    fill(draft, two);
    link(draft, one, two);

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe("question");
    expect(findings[0]?.title).toContain("Elias");
  });

  it("does not report the same pair twice when both the full name and the first name match", () => {
    const draft = project();
    const one = addCharacter(draft, { name: "Elias Vale" });
    const two = addCharacter(draft, { name: "Elias Vale" });
    fill(draft, one);
    fill(draft, two);
    link(draft, one, two);

    const duplicateNames = runContinuityCheck(draft).findings.filter(
      (finding) => finding.kind === "duplicate-name",
    );
    expect(duplicateNames).toHaveLength(1);
  });

  it("says nothing about characters with no name yet", () => {
    const draft = project();
    fill(draft, addCharacter(draft, { name: "" }));
    fill(draft, addCharacter(draft, { name: "   " }));
    // They are linked, filled and nameless: a blank name is a different
    // conversation from a duplicated one.
    draft.relationships.push({
      id: "rel",
      fromId: draft.characters[0]?.id ?? "",
      toId: draft.characters[1]?.id ?? "",
      type: "family",
    });

    expect(runContinuityCheck(draft).findings).toEqual([]);
  });
});

describe("unlinked characters", () => {
  it("says nothing when the cast is one, because there is nobody to link to", () => {
    const draft = project();
    const mara = addCharacter(draft);
    fill(draft, mara);
    expect(runContinuityCheck(draft).findings).toEqual([]);
  });

  it("flags each character with no relationships once the cast is larger", () => {
    const draft = project();
    const mara = addCharacter(draft, { name: "Mara" });
    const elias = addCharacter(draft, { name: "Elias" });
    fill(draft, mara);
    fill(draft, elias);

    // Two findings, because neither of them is connected to anybody.
    const findings = runContinuityCheck(draft).findings;
    expect(kindsOf(findings)).toEqual(["orphan-character", "orphan-character"]);

    draft.relationships.push({
      id: "rel",
      fromId: mara.id,
      toId: elias.id,
      type: "family",
    });
    expect(runContinuityCheck(draft).findings).toEqual([]);
  });
});

describe("glossary spellings", () => {
  it("flags an alias one letter from its own term as a likely typo", () => {
    const draft = project();
    draft.glossary.push(
      createGlossaryEntry({ term: "the Orchard", aliases: ["the Orchardd"] }),
    );

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.kind).toBe("glossary-spelling");
    expect(findings[0]?.glossaryEntryId).toBe(draft.glossary[0]?.id);
    expect(findings[0]?.title).toContain("one letter away");
  });

  it("accepts a genuinely different declared spelling", () => {
    const draft = project();
    draft.glossary.push(
      createGlossaryEntry({ term: "the Orchard", aliases: ["Vale orchard"] }),
    );
    expect(runContinuityCheck(draft).findings).toEqual([]);
  });

  it("flags a second spelling already used elsewhere in the bible", () => {
    const draft = project();
    draft.glossary.push(createGlossaryEntry({ term: "the Orchard" }));
    const mara = addCharacter(draft);
    fill(draft, mara);
    mara.fields.coreFear = makeFieldValue(FIELD_BY_KEY.coreFear, "That the Orchardd decides who she is.");

    const findings = runContinuityCheck(draft).findings.filter(
      (finding) => finding.kind === "glossary-spelling",
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.title).toContain("More than one spelling");
  });

  it("stays quiet when the prose uses exactly the declared spellings", () => {
    const draft = project();
    draft.glossary.push(
      createGlossaryEntry({ term: "the Orchard", aliases: ["Vale orchard"] }),
    );
    const mara = addCharacter(draft);
    fill(draft, mara);
    mara.fields.coreFear = makeFieldValue(
      FIELD_BY_KEY.coreFear,
      "That the Orchard is all that is left of the Vale orchard.",
    );

    expect(runContinuityCheck(draft).findings).toEqual([]);
  });
});

describe("ages and the timeline", () => {
  function agedProject(): { draft: Project; mara: Character } {
    const draft = project();
    const mara = addCharacter(draft, { name: "Mara" });
    fill(draft, mara);
    mara.fields.age = makeFieldValue(FIELD_BY_KEY.age, "20");
    mara.fields.birthYear = makeFieldValue(FIELD_BY_KEY.birthYear, "1810");
    return { draft, mara };
  }

  it("flags an event that would happen long after the stated age", () => {
    const { draft, mara } = agedProject();
    draft.timelineEvents.push({
      id: "event",
      label: "The salt road closes",
      when: "1890",
      order: 0,
      characterIds: [mara.id],
    });

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.kind).toBe("impossible-age");
    expect(findings[0]?.characterIds).toEqual([mara.id]);
    expect(findings[0]?.detail).toContain("1810");
    expect(findings[0]?.detail).toContain("1890");
  });

  it("flags an event dated before the character was born", () => {
    const { draft, mara } = agedProject();
    draft.timelineEvents.push({
      id: "event",
      label: "The road opens",
      when: "1790",
      order: 0,
      characterIds: [mara.id],
    });

    expect(runContinuityCheck(draft).findings[0]?.kind).toBe("impossible-age");
  });

  it("allows a couple of years of slack, because ages get rounded", () => {
    const { draft, mara } = agedProject();
    draft.timelineEvents.push({
      id: "event",
      label: "The road closes",
      when: "1832",
      order: 0,
      characterIds: [mara.id],
    });

    expect(runContinuityCheck(draft).findings).toEqual([]);
  });

  it("ignores events the character was not present at", () => {
    const { draft } = agedProject();
    draft.timelineEvents.push({
      id: "event",
      label: "The road closes",
      when: "1890",
      order: 0,
      characterIds: [],
    });

    expect(runContinuityCheck(draft).findings).toEqual([]);
  });

  it("does not guess at an age written in words", () => {
    const { draft, mara } = agedProject();
    mara.fields.age = makeFieldValue(FIELD_BY_KEY.age, "thirty-two");
    draft.timelineEvents.push({
      id: "event",
      label: "The road closes",
      when: "1890",
      order: 0,
      characterIds: [mara.id],
    });

    expect(runContinuityCheck(draft).findings).toEqual([]);
  });
});

describe("rules and uneven relationships", () => {
  it("flags a rule with no cost and one with no limit", () => {
    const draft = project();
    draft.rules.push(
      { id: "rule_a", name: "Salt is currency", does: "", cost: "", cannotDo: "It cannot be minted." },
      { id: "rule_b", name: "Letters keep their signature", does: "", cost: "A memory.", cannotDo: "" },
    );

    const findings = runContinuityCheck(draft).findings;
    expect(kindsOf(findings)).toEqual(["rule-without-limit", "rule-without-limit"]);
    expect(findings[0]?.title).toBe('The rule "Salt is currency" has no cost');
    expect(findings[1]?.title).toBe('The rule "Letters keep their signature" has no limit');
  });

  it("reports an uneven relationship as a question, not an error", () => {
    const draft = project();
    const mara = addCharacter(draft, { name: "Mara" });
    const elias = addCharacter(draft, { name: "Elias" });
    fill(draft, mara);
    fill(draft, elias);
    draft.relationships.push({
      id: "rel",
      fromId: mara.id,
      toId: elias.id,
      type: "family",
      asymmetryNote: "Mara believes they were close; Elias kept his plans from her.",
    });

    const findings = runContinuityCheck(draft).findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe("question");
    expect(findings[0]?.detail).toContain("Elias kept his plans from her");
  });
});

describe("the report as a whole", () => {
  it("orders gaps before questions before opportunities", () => {
    const draft = project();
    const mara = addCharacter(draft, { name: "Mara", depth: "standard" });
    const elias = addCharacter(draft, { name: "Elias", depth: "standard" });
    fillVisibleFields(mara, "quick", []);
    fillVisibleFields(elias, "quick", []);
    // An opportunity (Standard fields), a gap (a missing Quick field) and a
    // question (an uneven relationship) all in one report.
    delete mara.fields.coreFear;
    draft.relationships.push({
      id: "rel",
      fromId: mara.id,
      toId: elias.id,
      type: "family",
      asymmetryNote: "She thinks they are friends; he is using her.",
    });

    const severities = runContinuityCheck(draft).findings.map((f) => f.severity);
    expect(severities).toEqual([...severities].sort(
      (a, b) =>
        ["gap", "question", "opportunity"].indexOf(a) -
        ["gap", "question", "opportunity"].indexOf(b),
    ));
    expect(new Set(severities)).toEqual(new Set(["gap", "question", "opportunity"]));
  });

  it("gives the same report for the same project, run twice", () => {
    const draft = deepFull();
    const first = runContinuityCheck(draft);
    const second = runContinuityCheck(draft);

    expect(first.findings).toEqual(second.findings);
  });

  it("counts every finding in byKind and nowhere else", () => {
    const report = runContinuityCheck(deepFull());
    const total = Object.values(report.byKind).reduce((sum, count) => sum + count, 0);
    expect(total).toBe(report.findings.length);
  });

  it("measures coverage from what each character's own depth asks for", () => {
    const draft = project();
    const mara = addCharacter(draft, { name: "Mara", depth: "quick" });
    const elias = addCharacter(draft, { name: "Elias", depth: "quick" });
    fillVisibleFields(mara, "quick", []);
    fillVisibleFields(elias, "quick", []);
    delete elias.fields.coreFear;

    const coverage = measureCoverage(draft);
    expect(coverage.totalCharacters).toBe(2);
    expect(coverage.completeCharacters).toBe(1);
    expect(coverage.fieldsAsked).toBe(fieldsForDepth("quick", []).length * 2);
    expect(coverage.fieldsFilled).toBe(coverage.fieldsAsked - 1);
  });

  it("reads the fully populated fantasy fixture as clean but for its uneven relationship", () => {
    const report = runContinuityCheck(deepFull());
    // The asymmetry note is deliberate in the fixture, and §5.4.6 says to ask
    // about it rather than treat it as a mistake.
    expect(kindsOf(report.findings)).toEqual(["one-sided-relationship"]);
    expect(report.coverage.completeCharacters).toBe(report.coverage.totalCharacters);
  });
});

describe("the copy", () => {
  const CLAIMS = /manuscript|your draft|chapter \d|page \d|your novel|the text you/i;

  it("never claims to have read anything the writer did not enter", () => {
    // §11.1: checker copy never claims manuscript analysis. The disclosure is
    // the one place the word may appear, and only to deny it.
    for (const finding of runContinuityCheck(deepFull()).findings) {
      expect(CLAIMS.test(finding.title), finding.title).toBe(false);
      expect(CLAIMS.test(finding.detail), finding.detail).toBe(false);
    }
    expect(CHECKER_DISCLOSURE).toContain("does not read your manuscript");
  });

  it("renders the report as text, one bullet per finding, grouped by severity", () => {
    const report = runContinuityCheck(deepFull());
    const text = reportText(report);

    expect(text).toContain("**Questions**");
    expect(text.match(/^- \*\*/gm)).toHaveLength(report.findings.length);
    for (const finding of report.findings) {
      expect(text).toContain(finding.title);
    }
  });

  it("renders nothing at all when there is nothing to report", () => {
    const draft = project();
    const mara = addCharacter(draft);
    fill(draft, mara);
    expect(reportText(runContinuityCheck(draft))).toBe("");
  });
});

describe("the spelling comparison", () => {
  it("measures edit distance", () => {
    expect(editDistance("orchard", "orchard")).toBe(0);
    expect(editDistance("orchard", "orchardd")).toBe(1);
    expect(editDistance("kitten", "sitting")).toBe(3);
  });

  it("treats one letter apart as a likely duplicate, and short words as nothing", () => {
    expect(isNearDuplicate("the Orchardd", "the Orchard")).toBe(true);
    expect(isNearDuplicate("Vale orchard", "the Orchard")).toBe(false);
    // Below the length floor, everything looks like everything else.
    expect(isNearDuplicate("the", "then")).toBe(false);
  });

  it("normalises case and spacing before comparing", () => {
    expect(normaliseTerm("  The   ORCHARD ")).toBe("the orchard");
  });
});
