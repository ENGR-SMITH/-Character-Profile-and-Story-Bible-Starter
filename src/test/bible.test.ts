import { describe, expect, it } from "vitest";

import { bibleToText, compileBible, tableOfContents, type BibleBlock } from "@/lib/bible";
import { FIELD_BY_KEY, fieldsForDepth } from "@/lib/fields";
import { createCharacter, createProject, makeFieldValue } from "@/lib/schema";
import { brokenMessy, cleanMinimal, deepFull, fillVisibleFields } from "@/test/fixtures";

/**
 * The compiled bible is a projection of the project, so these tests are about
 * what the document *says*: the sections it contains, the anchors it links to,
 * and the fact that nothing printed there came from anywhere but the project.
 */

/** Every anchor id the document renders, for checking the contents against. */
function anchorsOf(blocks: readonly BibleBlock[]): string[] {
  return blocks.flatMap((block) =>
    block.kind === "entries" ? block.entries.map((entry) => entry.id) : [],
  );
}

describe("the compiled sections", () => {
  it("follows §5.7.3's order for the sections that have content", () => {
    const bible = compileBible(deepFull());
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
    expect(bible.pending).toEqual([]);
  });

  it("names the sections a thin project has not filled in yet, rather than printing them empty", () => {
    const bible = compileBible(cleanMinimal());
    expect(bible.sections.map((section) => section.id)).toEqual([
      "project-facts",
      "cast",
      "profiles",
      "open-questions",
    ]);
    // §5.7.5's stale-export notice will read this list, so it has to be honest.
    expect(bible.pending).toContain("Relationships");
    expect(bible.pending).toContain("World & locations");
    expect(bible.pending).toContain("Glossary");
  });

  it("keeps §5.7.3's numbers even when a section is left out", () => {
    // A section is omitted for being empty, but its number is not recycled:
    // "Cast overview" is section 3 in every bible, so two collaborators reading
    // two bibles are looking at the same numbering.
    const bible = compileBible(cleanMinimal());
    const numbers = new Map(bible.sections.map((section) => [section.id, section.number]));

    expect(numbers.get("project-facts")).toBe(1);
    expect(numbers.get("protected-canon")).toBeUndefined();
    expect(numbers.get("cast")).toBe(3);
    expect(numbers.get("profiles")).toBe(4);
    expect(numbers.get("open-questions")).toBe(10);
  });

  it("holds every anchor the table of contents links to", () => {
    const bible = compileBible(deepFull());
    const documentIds = new Set([
      ...bible.sections.flatMap((section) => [section.id, ...anchorsOf(section.blocks)]),
    ]);

    const toc = tableOfContents(bible);
    expect(toc).toHaveLength(bible.sections.length);
    for (const entry of toc) {
      expect(documentIds.has(entry.id), `dangling anchor #${entry.id}`).toBe(true);
      for (const child of entry.children) {
        expect(documentIds.has(child.id), `dangling anchor #${child.id}`).toBe(true);
      }
    }
  });

  it("gives every anchor in the document a unique id", () => {
    const bible = compileBible(deepFull());
    const ids = bible.sections.flatMap((section) => [
      section.id,
      ...anchorsOf(section.blocks),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("jumps to a character profile from the contents, one link per character", () => {
    const project = deepFull();
    const bible = compileBible(project);
    const profiles = tableOfContents(bible).find((entry) => entry.id === "profiles");

    expect(profiles?.children.map((child) => child.id)).toEqual(
      project.characters.map((character) => `character-${character.id}`),
    );
    expect(profiles?.children.map((child) => child.label)).toEqual(
      project.characters.map((character) => character.name),
    );
  });
});

describe("what the sections say", () => {
  const project = deepFull();
  const bible = compileBible(project);

  const sectionById = (id: string) => {
    const found = bible.sections.find((section) => section.id === id);
    if (!found) throw new Error(`no section ${id}`);
    return found;
  };

  /** All of a section's text, flattened, for readable assertions. */
  const textOf = (id: string) =>
    JSON.stringify(sectionById(id).blocks);

  it("states the project's own facts and its scope", () => {
    const facts = sectionById("project-facts").blocks[0];
    if (facts?.kind !== "facts") throw new Error("project facts should be a fact list");

    const byLabel = new Map(facts.facts.map((fact) => [fact.label, fact.value]));
    expect(byLabel.get("Genre")).toBe("Fantasy");
    expect(byLabel.get("Story type")).toBe("Series");
    expect(byLabel.get("Audience")).toBe("Adult readers of literary fantasy");
    expect(byLabel.get("Scope")).toContain("3 characters");
  });

  it("lists the protected canon first, as the thing not to change", () => {
    expect(sectionById("protected-canon").title).toContain("do not change");
    expect(textOf("protected-canon")).toContain("not resolved in this book");
    // A fact about one character names them, so a collaborator knows the scope.
    expect(textOf("protected-canon")).toContain("Mara Vale (character)");
  });

  it("prints each protected fact with the scope it reaches", () => {
    const draft = createProject({
      title: "Canon",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Mara" });
    draft.characters.push(character);
    draft.canonFacts.push(
      { id: "canon_p", statement: "Nothing is resolved.", scope: "project" },
      { id: "canon_w", statement: "The road stays closed.", scope: "world" },
      {
        id: "canon_c",
        statement: "Mara never goes back.",
        scope: "character",
        subjectId: character.id,
      },
      // A fact whose character has since been deleted: the wording stays, and
      // it does not pretend to name anybody.
      { id: "canon_gone", statement: "Kes never forgives.", scope: "character" },
    );

    const local = compileBible(draft).sections.find(
      (section) => section.id === "protected-canon",
    );
    const bullets = local?.blocks[0];
    if (bullets?.kind !== "bullets") throw new Error("canon should be bullets");

    expect(bullets.items).toEqual([
      "**Nothing is resolved.** — (project)",
      "**The road stays closed.** — (world)",
      "**Mara never goes back.** — Mara (character)",
      "**Kes never forgives.** — (character)",
    ]);
  });

  it("gives one cast line per character, with their labels rather than raw keys", () => {
    const cast = sectionById("cast").blocks[0];
    if (cast?.kind !== "bullets") throw new Error("cast overview should be bullets");

    expect(cast.items).toHaveLength(3);
    expect(cast.items[0]).toContain("Mara Vale");
    expect(cast.items[0]).toContain("Protagonist");
    expect(cast.items[0]).toContain("POV");
    expect(cast.items[0]).toContain("Deep");
    expect(cast.items[0]).toContain("100% complete");
  });

  it("prints each profile's answers, grouped, and only at the depth the character chose", () => {
    const profiles = sectionById("profiles").blocks[0];
    if (profiles?.kind !== "entries") throw new Error("profiles should be entries");

    const mara = profiles.entries[0];
    expect(mara?.title).toBe("Mara Vale");
    const flat = JSON.stringify(mara?.blocks);
    expect(flat).toContain("Core fear");
    expect(flat).toContain("That the truth will prove she abandoned her brother.");
    // The four fantasy layer fields are part of what a Deep profile asks for.
    expect(flat).toContain("Religion");
    expect(flat).toContain("Personality & motivation");

    const elias = profiles.entries[1];
    expect(elias?.title).toBe("Elias Vale");
    // A Standard character is not asked for a Deep field, so it is not printed
    // as missing either.
    const eliasBlocks = JSON.stringify(elias?.blocks);
    expect(eliasBlocks).not.toContain("Dominant hand");
    expect(eliasBlocks).toContain("Standard");
  });

  it("says so when a lowered depth is hiding answers, instead of dropping them", () => {
    const draft = createProject({
      title: "Lowered",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Mara", depth: "quick" });
    fillVisibleFields(character, "quick", []);
    // A Standard-only answer on a Quick character: exactly the state a writer
    // lands in after lowering a depth.
    character.fields.birthYear = makeFieldValue(FIELD_BY_KEY.birthYear, "1810");
    draft.characters.push(character);

    const local = compileBible(draft).sections.find((section) => section.id === "profiles");
    const entries = local?.blocks[0];
    if (entries?.kind !== "entries") throw new Error("profiles should be entries");

    const flat = JSON.stringify(entries.entries[0]?.blocks);
    expect(flat).toContain("stored above their Quick depth");
    // Hidden, but not printed as an answer and not silently deleted either.
    expect(flat).not.toContain("1810");
  });

  it("prints the relationship map once per stored row, as Markdown", () => {
    const relationships = sectionById("relationships").blocks[0];
    if (relationships?.kind !== "markdown") throw new Error("should be a markdown block");

    expect(relationships.text.match(/^- /gm)).toHaveLength(project.relationships.length);
    expect(relationships.text).toContain("**Mara Vale** ↔ **Elias Vale**");
  });

  it("rules carry their cost and their limit, which is the point of writing them down", () => {
    const rules = sectionById("rules").blocks[0];
    if (rules?.kind !== "entries") throw new Error("rules should be entries");

    const flat = JSON.stringify(rules.entries);
    expect(flat).toContain("What it costs");
    expect(flat).toContain("What it cannot do");
    expect(flat).toContain("cannot be traced back");
  });

  it("puts the timeline in the writer's order, with who was there", () => {
    const timeline = sectionById("timeline").blocks[0];
    if (timeline?.kind !== "bullets") throw new Error("timeline should be bullets");

    expect(timeline.items).toHaveLength(project.timelineEvents.length);
    expect(timeline.items[0]).toContain("1867");
    expect(timeline.items[0]).toContain("The salt road closes");
    expect(timeline.items[0]).toContain("Mara Vale");
  });

  it("lists glossary terms with the other spellings that are correct", () => {
    expect(textOf("glossary")).toContain("the Orchard");
    expect(textOf("glossary")).toContain("Also spelled: Vale orchard");
  });

  it("prints the questions the writer kept, and never ones the tool made up", () => {
    const draft = createProject({
      title: "Kept",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "quick" });
    fillVisibleFields(character, "quick", []);
    character.openQuestions.push("Why has she avoided the orchard for ten years?");
    draft.characters.push(character);

    const local = compileBible(draft).sections.find(
      (section) => section.id === "open-questions",
    );
    const bullets = local?.blocks[0];
    if (bullets?.kind !== "bullets") throw new Error("open questions should be bullets");

    // Generated prompts are recomputed in the Check area, never stored, so the
    // bible carries what the writer decided to ask — and only that.
    expect(bullets.items).toEqual([
      "Ada: Why has she avoided the orchard for ten years?",
    ]);
  });

  it("carries the open questions the checker will not answer for the writer", () => {
    // The fixture's one uneven relationship, plus nothing invented.
    const questions = sectionById("open-questions").blocks[0];
    if (questions?.kind !== "bullets") throw new Error("open questions should be bullets");
    expect(questions.items).toHaveLength(1);
    expect(questions.items[0]).toContain("read this relationship differently");
  });
});

describe("the bible as text", () => {
  it("numbers the sections and keeps them in the document's order", () => {
    const text = bibleToText(compileBible(deepFull()));
    const headings = text.split("\n").filter((line) => line.startsWith("## "));

    expect(headings).toEqual([
      "## 1. Project facts",
      "## 2. Protected canon — do not change",
      "## 3. Cast overview",
      "## 4. Character profiles",
      "## 5. Relationships",
      "## 6. World & locations",
      "## 7. Rules & systems",
      "## 8. Timeline",
      "## 9. Glossary",
      "## 10. Open questions for the collaborator",
    ]);
  });

  it("starts with the title and the line saying what it is", () => {
    const bible = compileBible(deepFull());
    const text = bibleToText(bible);

    expect(text.startsWith("# Orah and the Salt Road — Story Bible")).toBe(true);
    expect(text).toContain(bible.subtitle);
    expect(text).toContain(bible.disclosure);
  });

  it("counts glossary entries, not the spellings an entry is allowed to appear as", () => {
    // `deep-full` has two glossary entries and two aliases; `glossaryTerms`
    // counts all four spellings, which would have the subtitle announce four
    // terms while section 1's Scope fact said two.
    const project = deepFull();
    expect(project.glossary).toHaveLength(2);
    expect(compileBible(project).subtitle).toContain("2 glossary terms");
  });

  it("mentions the sections a thin bible is still missing", () => {
    expect(bibleToText(compileBible(cleanMinimal()))).toContain(
      "_Still to come in this bible:",
    );
  });

  it("never claims to have read anything but the answers entered", () => {
    // §11.1: no sentence anywhere may claim manuscript analysis. The heading
    // and disclosure are the only generated prose at document level.
    const bible = compileBible(deepFull());
    const generated = [bible.subtitle, bible.disclosure, ...bible.pending];

    for (const line of generated) {
      expect(/checks the manuscript|reads your|scanned/i.test(line), line).toBe(false);
    }
    expect(bible.disclosure).toContain("No manuscript was read");
  });
});

describe("a broken bible is still a bible", () => {
  it("compiles the messy fixture without tidying any of it away", () => {
    const text = bibleToText(compileBible(brokenMessy().project));

    // Both identical names appear: the bible reports what the writer has, and
    // the checker is what complains about it. A bible that silently merged them
    // would be hiding the very thing the writer needs to see.
    expect(text.match(/Elias Vale/g)?.length).toBeGreaterThanOrEqual(2);
    // The planted conflicts are all still on the page.
    expect(text).toContain("the Orchardd");
    expect(text).toContain("1890");
  });

  it("shows a Quick character's Quick fields and no more", () => {
    const project = cleanMinimal();
    const bible = compileBible(project);
    const profiles = bible.sections.find((section) => section.id === "profiles");
    const entries = profiles?.blocks[0];
    if (entries?.kind !== "entries") throw new Error("profiles should be entries");
    const entry = entries.entries[0];
    if (!entry) throw new Error("no profile entry");

    const printed = entry.blocks.filter(
      (block) => block.kind === "facts" && block.facts.some((fact) => fact.label === "Core fear"),
    );
    expect(printed).toHaveLength(1);
    // Thirteen Quick fields, and the only fact list at the top is the header.
    const quick = fieldsForDepth("quick", []);
    expect(quick).toHaveLength(13);
    expect(JSON.stringify(entry.blocks)).not.toContain("Dominant hand");
  });
});
