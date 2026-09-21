/**
 * Shared test fixtures (DEVELOPMENT.md §11.2).
 *
 * These are the four named fixtures the plan promises. Two of them —
 * `clean-minimal` and `broken-messy` — exist to be fed to the continuity
 * checker, which is a Phase D deliverable, so their *checker* expectations are
 * recorded as `ExpectedFinding` manifests that the Phase D tests will attach
 * to. Everything structural about them is asserted today in
 * `fixtures.test.ts`, which is what keeps the fixtures honest in the meantime.
 *
 * Two spec ambiguities surfaced while building these. Both are recorded at the
 * point they occur, because Phase D has to resolve them:
 *
 *  1. §5.4.5 flags a character with no relationships, but §11.2 says
 *     `clean-minimal` — a single Quick character with no relationships —
 *     expects *zero* findings. The orphan rule therefore has to be
 *     "unlinked while the cast is larger than one", or the two rules
 *     contradict each other.
 *  2. §5.4.1 makes a relationship a single bidirectional row ("it appears on
 *     both automatically"), but §5.4.6 describes a one-sided relationship as
 *     "Mara lists Elias as family; Elias does not list Mara" — which a
 *     single-row model cannot represent. In this model the representable form
 *     is the documented `asymmetryNote` field ("the POV difference", §5.4.2),
 *     so that is what the fixture plants.
 */

import { fieldsForDepth, type FieldDef } from "@/lib/fields";
import {
  createCharacter,
  makeFieldValue,
  createProject,
  type Character,
  type Project,
} from "@/lib/schema";
import { FIELD_BY_KEY } from "@/lib/fields";
import { GENRE_META, type DepthMode, type LayerKey } from "@/lib/taxonomy";

/**
 * Give every field visible at `depth` a value, then apply `overrides` on top.
 *
 * The generated values exist so a "fully populated" fixture stays fully
 * populated as the catalog grows — add a field and the fixture covers it
 * without being edited. Mutates and returns the character for brevity in
 * fixture construction.
 */
export function fillVisibleFields(
  character: Character,
  depth: DepthMode,
  layers: readonly LayerKey[],
  overrides: Record<string, string> = {},
): Character {
  for (const field of fieldsForDepth(depth, layers)) {
    character.fields[field.key] = makeFieldValue(
      field,
      overrides[field.key] ?? placeholderFor(character, field),
    );
  }
  return character;
}

/** Deterministic, obviously-a-fixture text. Selects use their first option. */
function placeholderFor(character: Character, field: FieldDef): string {
  if (field.kind === "select") return field.options?.[0] ?? "";
  return `${character.name} · ${field.label}`;
}

// ---------------------------------------------------------------------------
// clean-minimal — one Quick character, no relationships
// ---------------------------------------------------------------------------

/**
 * Expected checker findings: **none**.
 *
 * Every one of the 13 Quick fields is filled, and the project has no
 * relationships. This is the fixture that pins down the orphan-rule ambiguity
 * noted above: with a cast of one there is nobody to be linked to.
 */
export const CLEAN_MINIMAL_QUICK_FIELD_COUNT = 13;

export function cleanMinimal(): Project {
  const layers = GENRE_META.general.layers;

  const project = createProject({
    title: "Clean Minimal",
    author: "Fixture Author",
    genre: "general",
    storyType: "novella",
  });

  const ada = createCharacter({
    name: "Ada Reyes",
    role: "protagonist",
    importance: "pov",
    depth: "quick",
  });

  fillVisibleFields(ada, "quick", layers, {
    nickname: "Ada",
    pronouns: "she/her",
    gender: "woman",
    age: "thirty-two",
    occupation: "Harbour registrar",
    hair: "black, cropped close",
    eyes: "dark brown",
    coreTraits: "patient\nexact\nquietly stubborn",
    weaknesses: "cannot admit she is wrong",
    externalGoal: "Recover the ledger her father burned.",
    internalNeed: "To be trusted without having to prove anything first.",
    coreFear: "That she is her father's daughter after all.",
    arcType: "Positive",
  });

  project.characters.push(ada);
  return project;
}

// ---------------------------------------------------------------------------
// broken-messy — one planted issue per expected finding
// ---------------------------------------------------------------------------

export type ExpectedFindingKind =
  | "duplicate-name"
  | "orphan-character"
  | "glossary-spelling"
  | "impossible-age"
  | "one-sided-relationship"
  | "missing-core-field";

export interface ExpectedFinding {
  kind: ExpectedFindingKind;
  detail: string;
  characterIds?: string[];
  glossaryEntryId?: string;
  /** How many findings of this kind the checker should report. */
  count: number;
}

export interface BrokenFixture {
  project: Project;
  expected: ExpectedFinding[];
  ids: {
    mara: string;
    eliasOne: string;
    eliasTwo: string;
    imani: string;
    nadia: string;
    glossaryOrchard: string;
    relationshipUneven: string;
    relationshipEven: string;
    timelineSaltRoad: string;
  };
}

/**
 * Five characters and two relationships, with exactly six planted issues.
 *
 * The cast is arranged so exactly one character is unlinked: a single
 * relationship links both of its ends, so characters have to be paired up to
 * leave a designated orphan. `eliasTwo`–`imani` is a balanced friendship, so
 * only one relationship carries an asymmetry note and the reciprocity rule has
 * a single candidate to report.
 */
export function brokenMessy(): BrokenFixture {
  const layers = GENRE_META.general.layers;

  const project = createProject({
    title: "Broken Messy",
    genre: "general",
    storyType: "novel",
  });

  const mara = createCharacter({
    name: "Mara Vale",
    role: "protagonist",
    importance: "pov",
    depth: "quick",
  });
  fillVisibleFields(mara, "quick", layers);
  // Planted issue: the only Quick field left empty on the fixture.
  delete mara.fields.coreFear;
  // Planted issue: an age that the timeline contradicts. `birthYear` is a
  // Standard-tier field, so its presence on a Quick character is deliberate —
  // it is exactly the state a writer lands in after lowering a depth, and the
  // value is still a fact about the character.
  mara.fields.birthYear = makeFieldValue(FIELD_BY_KEY.birthYear, "1810");
  mara.fields.age = makeFieldValue(FIELD_BY_KEY.age, "20");

  const eliasOne = createCharacter({
    name: "Elias Vale",
    role: "family",
    importance: "supporting",
    depth: "quick",
  });
  fillVisibleFields(eliasOne, "quick", layers);

  // Planted issue: shares a name with eliasOne.
  const eliasTwo = createCharacter({
    name: "Elias Vale",
    role: "antagonist",
    importance: "major",
    depth: "quick",
  });
  fillVisibleFields(eliasTwo, "quick", layers);

  const imani = createCharacter({
    name: "Dr. Imani Reed",
    role: "mentor",
    importance: "supporting",
    depth: "quick",
  });
  fillVisibleFields(imani, "quick", layers);

  // Planted issue: deliberately left with no relationships at all.
  const nadia = createCharacter({
    name: "Nadia Okonkwo",
    role: "ally",
    importance: "minor",
    depth: "quick",
  });
  fillVisibleFields(nadia, "quick", layers);

  project.characters.push(mara, eliasOne, eliasTwo, imani, nadia);

  // Planted issue: the two sides feel this differently.
  const relationshipUneven = {
    id: "rel_uneven",
    fromId: mara.id,
    toId: eliasOne.id,
    type: "family" as const,
    nature: "Missing brother",
    tension: "Mara cannot decide whether Elias abandoned her or was taken.",
    asymmetryNote: "Mara believes they were close; Elias kept his plans from her.",
    status: "open" as const,
  };

  // A balanced relationship, so the uneven one is the only candidate.
  const relationshipEven = {
    id: "rel_even",
    fromId: eliasTwo.id,
    toId: imani.id,
    type: "colleague" as const,
    nature: "Former colleagues at the harbour office",
    status: "resolved" as const,
  };

  project.relationships.push(relationshipUneven, relationshipEven);

  // Planted issue: a near-duplicate spelling of an invented term.
  const glossaryOrchard = {
    id: "gloss_orchard",
    term: "the Orchard",
    definition: "The family orchard Mara has avoided for ten years.",
    aliases: ["the Orchardd", "Vale orchard"],
  };
  project.glossary.push(glossaryOrchard);

  // Planted issue: the event that makes Mara's age impossible.
  const timelineSaltRoad = {
    id: "event_salt_road",
    label: "The salt road closes",
    when: "1890",
    order: 0,
    characterIds: [mara.id],
    notes: "Mara was present as a child.",
  };
  project.timelineEvents.push(timelineSaltRoad);

  const expected: ExpectedFinding[] = [
    {
      kind: "duplicate-name",
      detail: "Two characters are both named Elias Vale.",
      characterIds: [eliasOne.id, eliasTwo.id],
      count: 1,
    },
    {
      kind: "orphan-character",
      detail: "Nadia Okonkwo has no relationships while the cast has five.",
      characterIds: [nadia.id],
      count: 1,
    },
    {
      kind: "glossary-spelling",
      detail: 'The alias "the Orchardd" is a near-duplicate of the term "the Orchard".',
      glossaryEntryId: glossaryOrchard.id,
      count: 1,
    },
    {
      kind: "impossible-age",
      detail:
        "Mara is 20 and born in 1810, but was present at an event in 1890.",
      characterIds: [mara.id],
      count: 1,
    },
    {
      kind: "one-sided-relationship",
      detail:
        "Mara and Elias record the relationship as felt differently by each side.",
      characterIds: [mara.id, eliasOne.id],
      count: 1,
    },
    {
      kind: "missing-core-field",
      detail: "Mara has no core fear while every other Quick field is filled.",
      characterIds: [mara.id],
      count: 1,
    },
  ];

  return {
    project,
    expected,
    ids: {
      mara: mara.id,
      eliasOne: eliasOne.id,
      eliasTwo: eliasTwo.id,
      imani: imani.id,
      nadia: nadia.id,
      glossaryOrchard: glossaryOrchard.id,
      relationshipUneven: relationshipUneven.id,
      relationshipEven: relationshipEven.id,
      timelineSaltRoad: timelineSaltRoad.id,
    },
  };
}

// ---------------------------------------------------------------------------
// deep-full — a fully populated fantasy project
// ---------------------------------------------------------------------------

/**
 * Expected export result: a clean export in all six formats (§11.2).
 *
 * Every field visible at Deep depth is filled on the protagonist, including
 * all four genre-layer fields, and every collection in the data contract has
 * at least one entry. The values for the protagonist are the worked example
 * from the plan (§14.1), so this fixture doubles as a readable demo.
 */
export function deepFull(): Project {
  const layers = GENRE_META.fantasy.layers;

  const project = createProject({
    title: "Orah and the Salt Road",
    author: "Fixture Author",
    genre: "fantasy",
    storyType: "series",
    tone: "Quiet, wintry, salt-bitten",
    pov: "Third limited",
    tense: "Past",
    audience: "Adult readers of literary fantasy",
    contentNotes: ["On-page grief", "No graphic violence"],
    themes: ["What we owe the dead", "The cost of a protected story"],
  });

  const mara = createCharacter({
    name: "Mara Vale",
    role: "protagonist",
    importance: "pov",
    depth: "deep",
    colorTag: "#b45309",
  });
  fillVisibleFields(mara, "deep", layers, {
    nickname: "Mara",
    nameReason: "Named for her grandmother, the only ancestor with no grave.",
    pronouns: "she/her",
    gender: "woman",
    age: "thirty-two",
    birthYear: "1858",
    occupation: "Keeper of the salt road ledger",
    externalGoal: "Discover who sent the letter written in her handwriting.",
    internalNeed: "To stop protecting a story she never understood.",
    coreFear: "That the truth will prove she abandoned her brother.",
    misbelief: "Protecting the family story is the same as understanding it.",
    coreTraits: "guarded\nobservant\nloyal past the point of sense",
    weaknesses: "answers silence with a lie\ncannot ask for help",
    arcType: "Positive",
    startingState: "Hides every piece of evidence from everyone, including Imani.",
    turningPoint: "Reads the second letter and recognises her own handwriting.",
    endingState:
      "Tells Imani what she did, and lets the orchard be just an orchard.",
    letGo: "The belief that the family story was hers to keep intact.",
    openThreads: "Why has she avoided the orchard for ten years?",
    species: "Lowland human, with a coastal grandmother",
    religion: "Keeps the salt rites without believing in them",
    politicalAffiliation: "Nominally for the harbour council, actively for nobody",
    witnessedEvents: "The salt road closing, aged nine",
  });

  const elias = createCharacter({
    name: "Elias Vale",
    role: "family",
    importance: "major",
    depth: "standard",
    colorTag: "#0369a1",
  });
  fillVisibleFields(elias, "standard", layers, {
    nickname: "El",
    pronouns: "he/him",
    externalGoal: "Get back to the orchard before the season turns.",
    internalNeed: "To be believed without having to explain where he has been.",
    coreFear: "That Mara has already decided what he did.",
    coreTraits: "restless\ncharming\nunreliable",
    weaknesses: "leaves before he can be left",
    arcType: "Flat",
  });

  const imani = createCharacter({
    name: "Dr. Imani Reed",
    role: "mentor",
    importance: "supporting",
    depth: "standard",
    colorTag: "#0f766e",
  });
  fillVisibleFields(imani, "standard", layers, {
    nickname: "Imani",
    pronouns: "she/her",
    externalGoal: "Finish the survey before the council sits.",
    internalNeed: "To be useful rather than right.",
    coreFear: "Being the person who says the unsayable thing out loud.",
    coreTraits: "direct\ncurious\nunbothered by rank",
    weaknesses: "mistakes bluntness for honesty",
    arcType: "Positive",
  });

  project.characters.push(mara, elias, imani);

  project.relationships.push(
    {
      id: "rel_mara_elias",
      fromId: mara.id,
      toId: elias.id,
      type: "family",
      nature: "Siblings, estranged for ten years",
      tension: "Neither will state what they think the other did.",
      asymmetryNote: "Mara believes they were close; Elias kept his plans from her.",
      status: "open",
    },
    {
      id: "rel_mara_imani",
      fromId: mara.id,
      toId: imani.id,
      type: "friend",
      nature: "Trusted friend who challenges her assumptions",
      status: "open",
    },
    {
      id: "rel_elias_imani",
      fromId: elias.id,
      toId: imani.id,
      type: "ally",
      nature: "Wary allies, working the same road from different ends",
      status: "open",
    },
  );

  project.locations.push(
    {
      id: "loc_orchard",
      name: "The Vale orchard",
      type: "Place",
      description:
        "Twelve rows of apple trees gone half wild, behind a wall the family stopped repairing.",
      significance: "Where the letters were hidden, and where Mara stopped going.",
      whoIsThere: "Nobody, for ten years.",
      sensory: "Windfall apples rotting sweet under a dry wall.",
    },
    {
      id: "loc_registry",
      name: "The harbour registry",
      type: "Building",
      description:
        "A long room of ledgers above the customs house, cold even in summer.",
      significance: "Mara's work, and where the handwriting first appears.",
      whoIsThere: "Mara, and Imani when she wants an argument.",
      sensory: "Salt on every page, and the smell of wet rope.",
    },
    {
      id: "loc_salt_road",
      name: "The salt road",
      type: "Region",
      description:
        "The old trading route, closed for a generation and still visible in the hedgerows.",
      significance: "The route Elias left by, and the reason the town is poor.",
      whoIsThere: "Nobody legally, and the occasional cart in the dark.",
    },
  );

  project.rules.push(
    {
      id: "rule_letters",
      name: "The letters keep their signature",
      does:
        "A letter written under the salt rites is sealed with the writer's own hand.",
      cost: "The rite costs the writer the memory of writing it.",
      cannotDo:
        "It cannot be forged, and it cannot be traced back to who administered the rite.",
      access: "Anyone who can reach the orchard ledger.",
    },
    {
      id: "rule_orchard",
      name: "The orchard is held in common",
      does: "Any surviving family member may take from the orchard.",
      cost: "The one who takes must sleep the season out on the property.",
      cannotDo: "It cannot be sold, divided, or left unvisited for a full year.",
      access: "Mara and Elias, and their descendants.",
    },
  );

  project.factions.push({
    id: "faction_council",
    name: "The harbour council",
    purpose: "Sets the salt tariff and keeps the road officially closed.",
    leader: "Provost Ademola",
    memberIds: [imani.id],
    notes: "Would rather the road stayed closed than admit why it shut.",
  });

  project.timelineEvents.push(
    {
      id: "event_road_closure",
      label: "The salt road closes",
      when: "1867",
      order: 0,
      characterIds: [mara.id],
      notes: "Mara is nine. Her grandmother is alive.",
    },
    {
      id: "event_elias_leaves",
      label: "Elias leaves the valley",
      when: "1876",
      order: 1,
      characterIds: [elias.id, mara.id],
      notes: "No letter for two years, then one from the coast.",
    },
    {
      id: "event_first_letter",
      label: "The first letter arrives in Mara's handwriting",
      when: "1888",
      order: 2,
      characterIds: [mara.id, imani.id],
      notes: "Mara tells nobody. This is where the book opens.",
    },
  );

  project.glossary.push(
    {
      id: "gloss_terms_orchard",
      term: "the Orchard",
      definition: "The Vale orchard, and by extension the family's obligations.",
      aliases: ["Vale orchard"],
    },
    {
      id: "gloss_terms_rites",
      term: "the salt rites",
      definition:
        "Burial customs of the salt road towns, kept now mostly as habit.",
      aliases: ["salt rites"],
    },
  );

  project.canonFacts.push(
    {
      id: "canon_mara_hesitation",
      statement: "Mara's hesitation and guilt are protected.",
      scope: "character",
      subjectId: mara.id,
    },
    {
      id: "canon_no_resolution",
      statement: "The mystery of the handwriting is not resolved in this book.",
      scope: "project",
    },
    {
      id: "canon_orchard_rule",
      statement: "The orchard was never sold, in any era of the story.",
      scope: "world",
    },
  );

  project.customFields.push({
    id: "custom_accent",
    label: "Accent and dialect",
    kind: "text",
  });
  mara.custom.custom_accent = { kind: "text", value: "Lowland coastal, clipped vowels" };

  return project;
}

// ---------------------------------------------------------------------------
// legacy-v0 — an export from before the current schema
// ---------------------------------------------------------------------------

/**
 * A raw payload as it would have been written by schemaVersion 0.
 *
 * Not built through the factories on purpose: the point is to prove that an
 * older export still parses, keeps the version it was written with, and gets
 * defaults for the collections that did not exist yet.
 */
export const legacyV0 = {
  id: "project_legacy",
  schemaVersion: 0,
  updatedAt: "2026-01-01T00:00:00.000Z",
  meta: {
    title: "Legacy Project",
    genre: "general",
    storyType: "novel",
  },
  characters: [
    {
      id: "character_legacy",
      name: "Old Character",
      depth: "quick",
      role: "protagonist",
      importance: "pov",
      fields: {
        nickname: { kind: "text", value: "Old" },
      },
    },
  ],
  // Deliberately absent: relationships, locations, rules, factions,
  // timelineEvents, glossary, canonFacts, customFields.
};

/** Collections that did not exist in the version-0 payload. */
export const LEGACY_V0_MISSING_COLLECTIONS = [
  "relationships",
  "locations",
  "rules",
  "factions",
  "timelineEvents",
  "glossary",
  "canonFacts",
  "customFields",
] as const;
