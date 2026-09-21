// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectStore } from "@/lib/store";
import type { DepthMode } from "@/lib/taxonomy";

/**
 * Store CRUD for the world collections (Phase C step 9).
 *
 * Kept apart from `store.test.ts` so that file stays about the cast and this one
 * about the world, and both stay readable. The interesting cases here are the
 * patch semantics: an editor sends one field at a time, so an update must touch
 * only what it was given — and must still be able to clear a field on purpose.
 */

const store = () => useProjectStore.getState();

function resetStore() {
  useProjectStore.setState({ project: null, lastSavedAt: null, hydrated: false });
  window.localStorage.clear();
}

beforeEach(() => {
  vi.useRealTimers();
  resetStore();
});

function startProject() {
  store().startProject({
    title: "World Store Test",
    genre: "general",
    storyType: "novel",
  });
}

function add(name: string, depth: DepthMode = "quick"): string {
  const id = store().addCharacter({ name, depth });
  if (!id) throw new Error("addCharacter returned null");
  return id;
}

function location(id: string) {
  const found = store().project?.locations.find((entry) => entry.id === id);
  if (!found) throw new Error(`No location ${id}`);
  return found;
}

function rule(id: string) {
  const found = store().project?.rules.find((entry) => entry.id === id);
  if (!found) throw new Error(`No rule ${id}`);
  return found;
}

function faction(id: string) {
  const found = store().project?.factions.find((entry) => entry.id === id);
  if (!found) throw new Error(`No faction ${id}`);
  return found;
}

function event(id: string) {
  const found = store().project?.timelineEvents.find((entry) => entry.id === id);
  if (!found) throw new Error(`No timeline event ${id}`);
  return found;
}

function entry(id: string) {
  const found = store().project?.glossary.find((item) => item.id === id);
  if (!found) throw new Error(`No glossary entry ${id}`);
  return found;
}

describe("setting & era", () => {
  it("starts as an empty section and gains fields one patch at a time", () => {
    startProject();
    expect(store().project?.world).toEqual({});

    store().updateWorld({ setting: "The salt road" });
    store().updateWorld({ era: "A late century" });

    // A patch is a patch: sending one field never clears another.
    expect(store().project?.world.setting).toBe("The salt road");
    expect(store().project?.world.era).toBe("A late century");
  });
});

describe("locations", () => {
  it("adds one with a type, trimming the name", () => {
    startProject();
    const id = store().addLocation({ name: "  the Orchard  ", type: "region" });
    if (!id) throw new Error("addLocation returned null");

    expect(location(id).name).toBe("the Orchard");
    expect(location(id).type).toBe("region");
    expect(store().project?.locations).toHaveLength(1);
  });

  it("refuses a location with no name", () => {
    startProject();
    expect(store().addLocation({ name: "   " })).toBeNull();
    expect(store().project?.locations).toHaveLength(0);
  });

  it("updates only the fields it was given", () => {
    startProject();
    const id = store().addLocation({ name: "the Orchard" });
    if (!id) throw new Error("addLocation returned null");

    store().updateLocation(id, { significance: "Held in common" });
    store().updateLocation(id, { sensory: "Wet grass, wasps" });

    expect(location(id).significance).toBe("Held in common");
    expect(location(id).sensory).toBe("Wet grass, wasps");
  });

  it("clears an optional field when the writer blanks it", () => {
    startProject();
    const id = store().addLocation({ name: "the Orchard" });
    if (!id) throw new Error("addLocation returned null");

    store().updateLocation(id, { description: "Somewhere to stand" });
    expect(location(id).description).toBe("Somewhere to stand");

    store().updateLocation(id, { description: "   " });
    expect(location(id).description).toBeUndefined();
  });

  it("removes one without touching the rest of the world", () => {
    startProject();
    const first = store().addLocation({ name: "the Orchard" });
    store().addLocation({ name: "the harbour" });
    if (!first) throw new Error("addLocation returned null");

    store().removeLocation(first);
    expect(store().project?.locations.map((item) => item.name)).toEqual([
      "the harbour",
    ]);
  });
});

describe("rules", () => {
  it("adds one with empty cost and limit, which is what the gap badge reads", () => {
    startProject();
    const id = store().addRule({ name: "Salt is currency" });
    if (!id) throw new Error("addRule returned null");

    expect(rule(id).does).toBe("");
    expect(rule(id).cost).toBe("");
    expect(rule(id).cannotDo).toBe("");
    expect(store().addRule({ name: "  " })).toBeNull();
  });

  it("keeps cost and limit exactly as written, blanks included", () => {
    startProject();
    const id = store().addRule({ name: "Letters keep their signature" });
    if (!id) throw new Error("addRule returned null");

    store().updateRule(id, { cost: "The memory of writing it." });
    store().updateRule(id, { cannotDo: "It cannot be forged." });

    expect(rule(id).cost).toBe("The memory of writing it.");
    expect(rule(id).cannotDo).toBe("It cannot be forged.");

    // These two are non-optional in the model, so an emptied field stays a
    // string: the checker reports it later rather than the value disappearing.
    store().updateRule(id, { cost: "" });
    expect(rule(id).cost).toBe("");
  });

  it("drops a whitespace-only access line rather than storing it", () => {
    startProject();
    const id = store().addRule({ name: "Salt is currency" });
    if (!id) throw new Error("addRule returned null");

    store().updateRule(id, { access: "  " });
    expect(rule(id).access).toBeUndefined();

    store().updateRule(id, { access: " Anyone with a boat " });
    expect(rule(id).access).toBe("Anyone with a boat");
  });

  it("removes one", () => {
    startProject();
    const id = store().addRule({ name: "Salt is currency" });
    if (!id) throw new Error("addRule returned null");

    store().removeRule(id);
    expect(store().project?.rules).toHaveLength(0);
  });
});

describe("factions", () => {
  it("adds one and toggles its members on and off", () => {
    startProject();
    const mara = add("Mara");
    const factionId = store().addFaction({ name: "The harbour council" });
    if (!factionId) throw new Error("addFaction returned null");

    store().toggleFactionMember(factionId, mara);
    expect(faction(factionId).memberIds).toEqual([mara]);

    store().toggleFactionMember(factionId, mara);
    expect(faction(factionId).memberIds).toEqual([]);
  });

  it("refuses to name a character who is not in the cast", () => {
    startProject();
    const factionId = store().addFaction({ name: "The harbour council" });
    if (!factionId) throw new Error("addFaction returned null");

    store().toggleFactionMember(factionId, "character_gone");
    expect(faction(factionId).memberIds).toEqual([]);
  });

  it("detaches a deleted character from every faction", () => {
    startProject();
    const mara = add("Mara");
    const imani = add("Imani");
    const factionId = store().addFaction({ name: "The harbour council" });
    if (!factionId) throw new Error("addFaction returned null");

    store().toggleFactionMember(factionId, mara);
    store().toggleFactionMember(factionId, imani);
    store().removeCharacter(mara);

    expect(faction(factionId).memberIds).toEqual([imani]);
  });

  it("removes one, leaving its members in the cast", () => {
    startProject();
    const mara = add("Mara");
    const factionId = store().addFaction({ name: "The harbour council" });
    if (!factionId) throw new Error("addFaction returned null");
    store().toggleFactionMember(factionId, mara);

    store().removeFaction(factionId);
    expect(store().project?.factions).toHaveLength(0);
    expect(store().project?.characters).toHaveLength(1);
  });
});

describe("timeline", () => {
  it("appends events in the order they were added", () => {
    startProject();
    const first = store().addTimelineEvent({ label: "The road closes", when: "1867" });
    const second = store().addTimelineEvent({ label: "Elias leaves" });
    if (!first || !second) throw new Error("addTimelineEvent returned null");

    expect(event(first).order).toBeLessThan(event(second).order);
    expect(store().addTimelineEvent({ label: "   " })).toBeNull();
  });

  it("moves an event up and down the chronology, renumbering as it goes", () => {
    startProject();
    const first = store().addTimelineEvent({ label: "First" });
    const second = store().addTimelineEvent({ label: "Second" });
    if (!first || !second) throw new Error("addTimelineEvent returned null");

    store().moveTimelineEvent(second, -1);
    expect(event(second).order).toBeLessThan(event(first).order);

    store().moveTimelineEvent(second, 1);
    expect(event(second).order).toBeGreaterThan(event(first).order);
  });

  it("attaches and detaches the characters present", () => {
    startProject();
    const mara = add("Mara");
    const id = store().addTimelineEvent({ label: "The road closes" });
    if (!id) throw new Error("addTimelineEvent returned null");

    store().toggleTimelineCharacter(id, mara);
    expect(event(id).characterIds).toEqual([mara]);

    store().toggleTimelineCharacter(id, mara);
    expect(event(id).characterIds).toEqual([]);
  });

  it("detaches a deleted character from every event", () => {
    startProject();
    const mara = add("Mara");
    const elias = add("Elias");
    const id = store().addTimelineEvent({ label: "The road closes" });
    if (!id) throw new Error("addTimelineEvent returned null");

    store().toggleTimelineCharacter(id, mara);
    store().toggleTimelineCharacter(id, elias);
    store().removeCharacter(mara);

    expect(event(id).characterIds).toEqual([elias]);
  });

  it("removes an event", () => {
    startProject();
    const id = store().addTimelineEvent({ label: "The road closes" });
    if (!id) throw new Error("addTimelineEvent returned null");

    store().removeTimelineEvent(id);
    expect(store().project?.timelineEvents).toHaveLength(0);
  });
});

describe("glossary", () => {
  it("adds a term with an empty definition and no aliases", () => {
    startProject();
    const id = store().addGlossaryEntry({ term: "  the Orchard " });
    if (!id) throw new Error("addGlossaryEntry returned null");

    expect(entry(id).term).toBe("the Orchard");
    expect(entry(id).definition).toBe("");
    expect(entry(id).aliases).toEqual([]);
    expect(store().addGlossaryEntry({ term: "" })).toBeNull();
  });

  it("stores aliases and a definition as the writer edits", () => {
    startProject();
    const id = store().addGlossaryEntry({ term: "the Orchard" });
    if (!id) throw new Error("addGlossaryEntry returned null");

    store().updateGlossaryEntry(id, { aliases: ["Vale orchard"] });
    store().updateGlossaryEntry(id, { definition: "The family's obligations." });

    expect(entry(id).aliases).toEqual(["Vale orchard"]);
    expect(entry(id).definition).toBe("The family's obligations.");
    // Changing the aliases did not disturb the term itself.
    expect(entry(id).term).toBe("the Orchard");
  });

  it("removes a term", () => {
    startProject();
    const id = store().addGlossaryEntry({ term: "the Orchard" });
    if (!id) throw new Error("addGlossaryEntry returned null");

    store().removeGlossaryEntry(id);
    expect(store().project?.glossary).toHaveLength(0);
  });
});
