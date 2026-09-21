import { describe, expect, it } from "vitest";

import {
  createCharacter,
  createFaction,
  createGlossaryEntry,
  createLocation,
  createProject,
  createRule,
  type Project,
  type TimelineEvent,
} from "@/lib/schema";
import {
  charactersAtEvent,
  charactersInFaction,
  glossaryTerms,
  nextTimelineOrder,
  parseAliasList,
  reorderedTimeline,
  rulesWithGaps,
  sortTimeline,
  timelineInOrder,
  worldCounts,
  worldIsEmpty,
} from "@/lib/world";

function project(): Project {
  return createProject({
    title: "World Test",
    genre: "fantasy",
    storyType: "novel",
  });
}

function event(id: string, order: number, characterIds: string[] = []): TimelineEvent {
  return { id, label: id, order, characterIds };
}

describe("timeline ordering", () => {
  it("sorts by the stored order, however it was written", () => {
    const events = [event("c", 2), event("a", 0), event("b", 1)];
    expect(sortTimeline(events).map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("leaves events that share an order in storage order, so nothing flickers", () => {
    const events = [event("first", 1), event("second", 1), event("third", 0)];
    expect(sortTimeline(events).map((e) => e.id)).toEqual([
      "third",
      "first",
      "second",
    ]);
  });

  it("reads them off the project for the editor", () => {
    const draft = project();
    draft.timelineEvents.push(event("late", 5), event("early", 1));
    expect(timelineInOrder(draft).map((e) => e.id)).toEqual(["early", "late"]);
  });

  it("appends a new event after every existing one, gaps included", () => {
    expect(nextTimelineOrder([])).toBe(0);
    expect(nextTimelineOrder([event("a", 0), event("b", 1)])).toBe(2);
    // A hand-edited import may leave gaps or duplicates; a new event still
    // lands last rather than colliding with what is already there.
    expect(nextTimelineOrder([event("a", 7), event("b", 7)])).toBe(8);
  });
});

describe("moving an event", () => {
  const events = [event("a", 0), event("b", 1), event("c", 2)];

  it("moves one step later and renumbers the whole timeline", () => {
    const moved = reorderedTimeline(events, "a", 1);
    expect(moved.map((e) => e.id)).toEqual(["b", "a", "c"]);
    expect(moved.map((e) => e.order)).toEqual([0, 1, 2]);
  });

  it("moves one step earlier", () => {
    expect(reorderedTimeline(events, "c", -1).map((e) => e.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("does nothing at either end, and does not invent an order", () => {
    expect(reorderedTimeline(events, "a", -1).map((e) => e.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(reorderedTimeline(events, "c", 1).map((e) => e.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("ignores an event that is not there", () => {
    expect(reorderedTimeline(events, "missing", 1).map((e) => e.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("heals duplicate order values the first time the writer touches it", () => {
    const messy = [event("a", 3), event("b", 3), event("c", 9)];
    const moved = reorderedTimeline(messy, "c", -1);
    expect(moved.map((e) => e.id)).toEqual(["a", "c", "b"]);
    expect(moved.map((e) => e.order)).toEqual([0, 1, 2]);
  });
});

describe("rules with gaps", () => {
  it("reports a rule missing its cost, its limit, or both", () => {
    const draft = project();
    const complete = createRule({ name: "Salt is currency" });
    complete.cost = "Weight, and the walk to carry it.";
    complete.cannotDo = "It cannot be minted, only traded.";

    const noLimit = createRule({ name: "Letters keep their signature" });
    noLimit.cost = "The memory of writing it.";

    const bare = createRule({ name: "The orchard is held in common" });

    draft.rules.push(complete, noLimit, bare);
    expect(rulesWithGaps(draft).map((rule) => rule.name)).toEqual([
      "Letters keep their signature",
      "The orchard is held in common",
    ]);
  });

  it("treats whitespace as a gap, not as an answer", () => {
    const draft = project();
    const rule = createRule({ name: "Spaced" });
    rule.cost = "   ";
    rule.cannotDo = "\n";
    draft.rules.push(rule);
    expect(rulesWithGaps(draft)).toHaveLength(1);
  });
});

describe("characters attached to the world", () => {
  it("resolves faction members in cast order and skips dangling ids", () => {
    const draft = project();
    const mara = createCharacter({ name: "Mara" });
    const elias = createCharacter({ name: "Elias" });
    draft.characters.push(mara, elias);

    const faction = createFaction({ name: "The harbour council" });
    // Stored in the other order, and naming someone who no longer exists.
    faction.memberIds = [elias.id, "character_deleted", mara.id];
    draft.factions.push(faction);

    expect(charactersInFaction(draft, faction).map((c) => c.name)).toEqual([
      "Mara",
      "Elias",
    ]);
  });

  it("resolves the cast present at an event, and copes with nobody", () => {
    const draft = project();
    const imani = createCharacter({ name: "Imani" });
    draft.characters.push(imani);

    expect(
      charactersAtEvent(draft, event("e", 0, [imani.id, "character_gone"])).map(
        (c) => c.name,
      ),
    ).toEqual(["Imani"]);
    expect(charactersAtEvent(draft, event("e", 0, []))).toEqual([]);
  });
});

describe("glossary terms", () => {
  it("lists the term and every alias, because both are correct spellings", () => {
    const draft = project();
    draft.glossary.push(
      createGlossaryEntry({
        term: "the Orchard",
        aliases: ["Vale orchard"],
      }),
    );
    expect(glossaryTerms(draft).map((entry) => entry.term)).toEqual([
      "the Orchard",
      "Vale orchard",
    ]);
  });

  it("drops blanks and repeats that differ only in case", () => {
    const draft = project();
    draft.glossary.push(
      createGlossaryEntry({ term: "the salt rites", aliases: ["  ", "the Orchard"] }),
      createGlossaryEntry({ term: "The Orchard", aliases: ["THE ORCHARD"] }),
    );
    expect(glossaryTerms(draft).map((entry) => entry.term)).toEqual([
      "the salt rites",
      "the Orchard",
    ]);
  });

  it("parses alias input split on commas or lines, keeping one of each", () => {
    expect(parseAliasList("Vale orchard, the orchard\nsalt rites, Vale Orchard")).toEqual(
      ["Vale orchard", "the orchard", "salt rites"],
    );
    expect(parseAliasList("   ")).toEqual([]);
  });
});

describe("world counts", () => {
  it("counts each collection and the rules still missing a limit", () => {
    const draft = project();
    draft.locations.push(createLocation({ name: "The orchard", type: "region" }));
    draft.rules.push(createRule({ name: "Salt is currency" }));
    draft.factions.push(createFaction({ name: "The council" }));
    draft.timelineEvents.push(event("road", 0));
    draft.glossary.push(createGlossaryEntry({ term: "the Orchard" }));

    expect(worldCounts(draft)).toEqual({
      locations: 1,
      rules: 1,
      factions: 1,
      timelineEvents: 1,
      glossary: 1,
      rulesWithGaps: 1,
    });
  });

  it("knows the difference between an empty world and one with a single fact", () => {
    const draft = project();
    expect(worldIsEmpty(draft)).toBe(true);

    // One line of setting is enough to stop being empty: the writer has begun.
    draft.world.setting = "The salt road";
    expect(worldIsEmpty(draft)).toBe(false);

    const other = project();
    other.locations.push(createLocation({ name: "The orchard" }));
    expect(worldIsEmpty(other)).toBe(false);
  });
});
