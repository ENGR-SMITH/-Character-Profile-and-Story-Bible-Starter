// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FIELD_BY_KEY, fieldsForDepth } from "@/lib/fields";
import { fieldValueToText, type Relationship } from "@/lib/schema";
import { FLUSH_DELAY_MS, useProjectStore } from "@/lib/store";
import { GENRE_META, type DepthMode } from "@/lib/taxonomy";

const LAYERS = GENRE_META.general.layers;

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
    title: "Test Project",
    genre: "general",
    storyType: "novel",
  });
}

function add(name: string, depth: DepthMode = "quick"): string {
  const id = store().addCharacter({ name, depth });
  if (!id) throw new Error("addCharacter returned null");
  return id;
}

/**
 * Read what is actually in localStorage, without needing the storage key.
 * `beforeEach` clears storage, so the single key present is the tool's own.
 */
function persisted(): string | null {
  const key = window.localStorage.key(0);
  return key === null ? null : window.localStorage.getItem(key);
}

/** Read a character straight from the store, failing loudly if it is gone. */
function character(id: string) {
  const found = store().project?.characters.find((c) => c.id === id);
  if (!found) throw new Error(`No character ${id}`);
  return found;
}

function text(id: string, key: string): string {
  return fieldValueToText(character(id).fields[key]);
}

function seedRelationship(fromId: string, toId: string) {
  const relationship: Relationship = {
    id: `rel_${fromId}_${toId}`,
    fromId,
    toId,
    type: "family",
  };
  useProjectStore.setState((state) =>
    state.project
      ? {
          project: {
            ...state.project,
            relationships: [...state.project.relationships, relationship],
          },
        }
      : {},
  );
}

describe("project lifecycle", () => {
  it("starts with no project, which is what puts the setup screen on screen", () => {
    expect(store().project).toBeNull();
  });

  it("creates a project from the supplied meta", () => {
    store().startProject({
      title: "Orah and the Salt Road",
      author: "A Writer",
      genre: "fantasy",
      storyType: "series",
    });
    expect(store().project?.meta.title).toBe("Orah and the Salt Road");
    expect(store().project?.meta.genre).toBe("fantasy");
    expect(store().project?.meta.storyType).toBe("series");
    expect(store().project?.characters).toEqual([]);
  });

  it("patches project meta without touching anything else", () => {
    startProject();
    add("Mara");
    store().updateMeta({ title: "Renamed", genre: "literary" });
    expect(store().project?.meta.title).toBe("Renamed");
    expect(store().project?.meta.genre).toBe("literary");
    expect(store().project?.characters).toHaveLength(1);
  });

  it("clears the project", () => {
    startProject();
    add("Mara");
    store().clearProject();
    expect(store().project).toBeNull();
    expect(store().lastSavedAt).toBeNull();
  });
});

describe("cast CRUD", () => {
  it("refuses to add a character before the project exists", () => {
    expect(store().addCharacter({ name: "Mara" })).toBeNull();
    expect(store().project).toBeNull();
  });

  it("appends a character and returns its id", () => {
    startProject();
    const id = add("Mara Vale");
    expect(character(id).name).toBe("Mara Vale");
    expect(store().project?.characters).toHaveLength(1);
  });

  it("keeps five characters at mixed depths — the Phase A exit criterion", () => {
    startProject();
    const depths: DepthMode[] = ["quick", "standard", "deep", "quick", "standard"];
    depths.forEach((depth, index) => add(`Character ${index + 1}`, depth));

    expect(store().project?.characters).toHaveLength(5);
    expect(store().project?.characters.map((c) => c.depth)).toEqual(depths);
  });

  it("preserves insertion order across edits", () => {
    startProject();
    const a = add("Ada");
    const b = add("Bo");
    const c = add("Cy");
    store().renameCharacter(b, "Bo Renamed");
    expect(store().project?.characters.map((x) => x.id)).toEqual([a, b, c]);
  });

  it("renames a character", () => {
    startProject();
    const id = add("Mara");
    store().renameCharacter(id, "Mara Vale");
    expect(character(id).name).toBe("Mara Vale");
  });

  it("patches role, importance and colour tag", () => {
    startProject();
    const id = add("Mara");
    store().patchCharacter(id, {
      role: "protagonist",
      importance: "pov",
      colorTag: "#b45309",
    });
    expect(character(id).role).toBe("protagonist");
    expect(character(id).importance).toBe("pov");
    expect(character(id).colorTag).toBe("#b45309");
  });

  it("removes a character", () => {
    startProject();
    const id = add("Mara");
    add("Elias");
    store().removeCharacter(id);
    expect(store().project?.characters.map((c) => c.name)).toEqual(["Elias"]);
  });

  it("drops relationships that reference a removed character", () => {
    startProject();
    const a = add("Mara");
    const b = add("Elias");
    seedRelationship(a, b);
    expect(store().project?.relationships).toHaveLength(1);

    store().removeCharacter(a);
    expect(store().project?.relationships).toHaveLength(0);
    expect(store().project?.characters.map((c) => c.name)).toEqual(["Elias"]);
  });

  it("leaves relationships between other characters alone", () => {
    startProject();
    const a = add("Mara");
    const b = add("Elias");
    const c = add("Imani");
    seedRelationship(a, b);
    seedRelationship(b, c);

    store().removeCharacter(a);
    expect(store().project?.relationships).toHaveLength(1);
    expect(store().project?.relationships[0].fromId).toBe(b);
  });
});

describe("duplicate", () => {
  it("returns null for an unknown character", () => {
    startProject();
    expect(store().duplicateCharacter("character_nope")).toBeNull();
  });

  it("copies the profile and marks the name", () => {
    startProject();
    const id = add("Mara");
    store().setCharacterField(id, FIELD_BY_KEY.coreFear, "Being her father's daughter");
    store().patchCharacter(id, { role: "protagonist", importance: "pov", colorTag: "#b45309" });

    const copyId = store().duplicateCharacter(id);
    if (!copyId) throw new Error("duplicate returned null");

    expect(character(copyId).name).toBe("Mara (copy)");
    expect(text(copyId, "coreFear")).toBe("Being her father's daughter");
    expect(character(copyId).role).toBe("protagonist");
    expect(character(copyId).colorTag).toBe("#b45309");
    expect(store().project?.characters).toHaveLength(2);
  });

  it("does not share field objects with the copy", () => {
    startProject();
    const id = add("Mara");
    store().setCharacterField(id, FIELD_BY_KEY.coreFear, "Original fear");

    const copyId = store().duplicateCharacter(id);
    if (!copyId) throw new Error("duplicate returned null");

    // A shared reference here would make editing one character silently edit
    // the other, which is the classic deep-copy bug in a feature like this.
    store().setCharacterField(copyId, FIELD_BY_KEY.coreFear, "Different fear");
    expect(text(id, "coreFear")).toBe("Original fear");
    expect(text(copyId, "coreFear")).toBe("Different fear");
  });
});

describe("fields", () => {
  it("stores a value with the kind its field declares", () => {
    startProject();
    const id = add("Mara");
    store().setCharacterField(id, FIELD_BY_KEY.coreTraits, "guarded\nobservant");
    expect(character(id).fields.coreTraits).toEqual({
      kind: "list",
      value: ["guarded", "observant"],
    });
  });

  it("replaces an existing value", () => {
    startProject();
    const id = add("Mara");
    store().setCharacterField(id, FIELD_BY_KEY.eyes, "grey");
    store().setCharacterField(id, FIELD_BY_KEY.eyes, "green");
    expect(text(id, "eyes")).toBe("green");
  });

  it("clears a value and removes the key entirely", () => {
    startProject();
    const id = add("Mara");
    store().setCharacterField(id, FIELD_BY_KEY.eyes, "grey");
    store().clearCharacterField(id, "eyes");
    expect(character(id).fields).not.toHaveProperty("eyes");
  });
});

describe("depth changes", () => {
  it("keeps an answer a lower depth hides, and shows it again when raised", () => {
    startProject();
    const id = add("Mara", "deep");

    store().setCharacterField(id, FIELD_BY_KEY.petPeeves, "People who hum");
    expect(fieldsForDepth("deep", LAYERS).some((f) => f.key === "petPeeves")).toBe(true);

    store().setCharacterDepth(id, "quick");
    expect(character(id).depth).toBe("quick");
    // The answer survives the change; only the view changes.
    expect(text(id, "petPeeves")).toBe("People who hum");
    expect(fieldsForDepth("quick", LAYERS).some((f) => f.key === "petPeeves")).toBe(false);

    store().setCharacterDepth(id, "deep");
    expect(fieldsForDepth("deep", LAYERS).some((f) => f.key === "petPeeves")).toBe(true);
  });

  it("does not touch another character's depth", () => {
    startProject();
    const a = add("Mara", "deep");
    const b = add("Elias", "quick");
    store().setCharacterDepth(a, "standard");
    expect(character(a).depth).toBe("standard");
    expect(character(b).depth).toBe("quick");
  });
});

describe("local autosave", () => {
  it("defers the write during a burst, then makes the whole project durable in one go", () => {
    vi.useFakeTimers();
    try {
      startProject();
      vi.advanceTimersByTime(FLUSH_DELAY_MS + 50); // flush the project write
      const afterStart = persisted();
      expect(afterStart).not.toBeNull();

      const id = add("Mara");
      store().setCharacterField(id, FIELD_BY_KEY.coreFear, "a");
      store().setCharacterField(id, FIELD_BY_KEY.coreFear, "ab");
      store().setCharacterField(id, FIELD_BY_KEY.coreFear, "abc");

      // Three edits, and storage is untouched: that is the coalescing, and it
      // is why the writes are debounced rather than made per keystroke.
      expect(persisted()).toBe(afterStart);

      vi.advanceTimersByTime(FLUSH_DELAY_MS + 50);

      const flushed = persisted();
      expect(flushed).not.toBe(afterStart);
      expect(flushed).toContain("Mara");
      // Only the last value survived the burst, not the intermediate ones.
      expect(flushed).toContain("abc");
      expect(flushed).not.toContain('"value":"ab"');
    } finally {
      vi.useRealTimers();
    }
  });

  it("records when it last saved, for the autosave indicator", () => {
    expect(store().lastSavedAt).toBeNull();
    startProject();
    expect(store().lastSavedAt).not.toBeNull();
    expect(Number.isNaN(Date.parse(store().lastSavedAt ?? ""))).toBe(false);
  });

  it("bumps updatedAt on every mutation, so a stale export is detectable", () => {
    startProject();
    const before = store().project?.updatedAt;

    // `nowIso` has millisecond resolution, so step time on explicitly rather
    // than relying on the two calls landing in different milliseconds.
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(Date.now() + 5_000));
      add("Mara");
    } finally {
      vi.useRealTimers();
    }

    expect(store().project?.updatedAt).not.toBe(before);
  });
});
