// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { FIELD_BY_KEY } from "@/lib/fields";
import { fieldValueToText } from "@/lib/schema";

/**
 * The Phase A exit criterion is "a writer can create a project, add five
 * characters at mixed depths, refresh, and lose nothing". `store.test.ts`
 * covers the first half against the live store; this file covers the refresh.
 *
 * It deliberately re-imports the store after `vi.resetModules()` so the second
 * half runs against a brand-new module instance with no in-memory state — a
 * real reload, not a state reset — reading the same jsdom localStorage.
 */
describe("a reload finds the project again", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.resetModules();
  });

  it("restores the project, its characters, their depths and their answers", async () => {
    // ---- first page load ---------------------------------------------------
    const first = await import("@/lib/store");
    const firstStore = first.useProjectStore.getState();

    firstStore.startProject({
      title: "Orah and the Salt Road",
      author: "A Writer",
      genre: "fantasy",
      storyType: "series",
    });

    const maraId = firstStore.addCharacter({
      name: "Mara Vale",
      role: "protagonist",
      importance: "pov",
      depth: "deep",
    });
    if (!maraId) throw new Error("addCharacter returned null");

    for (const [index, depth] of (
      ["quick", "standard", "deep", "quick", "standard"] as const
    ).entries()) {
      first.useProjectStore.getState().addCharacter({
        name: `Character ${index + 2}`,
        depth,
      });
    }

    first.useProjectStore
      .getState()
      .setCharacterField(maraId, FIELD_BY_KEY.coreFear, "Being her father's daughter");
    first.useProjectStore
      .getState()
      .setCharacterField(maraId, FIELD_BY_KEY.coreTraits, "guarded\nobservant");

    // The write is debounced, so let it flush before "closing the tab".
    await new Promise((resolve) => setTimeout(resolve, first.FLUSH_DELAY_MS + 150));

    // ---- second page load: a fresh module, same localStorage --------------
    vi.resetModules();
    const second = await import("@/lib/store");
    await second.useProjectStore.persist.rehydrate();

    const project = second.useProjectStore.getState().project;

    expect(project?.meta.title).toBe("Orah and the Salt Road");
    expect(project?.meta.genre).toBe("fantasy");
    expect(project?.meta.storyType).toBe("series");
    expect(project?.characters).toHaveLength(6);
    expect(project?.characters.map((c) => c.depth)).toEqual([
      "deep",
      "quick",
      "standard",
      "deep",
      "quick",
      "standard",
    ]);

    const mara = project?.characters.at(0);
    expect(mara?.name).toBe("Mara Vale");
    expect(mara?.role).toBe("protagonist");
    expect(fieldValueToText(mara?.fields.coreFear)).toBe("Being her father's daughter");
    // A list value has to survive JSON as a list, not as a joined string.
    expect(mara?.fields.coreTraits).toEqual({
      kind: "list",
      value: ["guarded", "observant"],
    });
  });

  it("fills in the fields the schema gained after an older project was saved", async () => {
    vi.resetModules();
    const first = await import("@/lib/store");
    first.useProjectStore.getState().startProject({
      title: "Older project",
      genre: "general",
      storyType: "novel",
    });
    await new Promise((resolve) => setTimeout(resolve, first.FLUSH_DELAY_MS + 150));

    // Rewrite the stored project the way an older build would have written it:
    // no world section, and none of the collections added since.
    const key = window.localStorage.key(0);
    if (!key) throw new Error("nothing was persisted");
    const saved = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    delete saved.state.project.world;
    delete saved.state.project.locations;
    delete saved.state.project.glossary;
    window.localStorage.setItem(key, JSON.stringify(saved));

    vi.resetModules();
    const second = await import("@/lib/store");
    await second.useProjectStore.persist.rehydrate();

    const restored = second.useProjectStore.getState().project;
    expect(restored?.meta.title).toBe("Older project");
    // Defaulted rather than undefined, which is what keeps an older local
    // project out of the reach of a component that expects these fields.
    expect(restored?.world).toEqual({});
    expect(restored?.locations).toEqual([]);
    expect(restored?.glossary).toEqual([]);
  });

  it("reports nothing to restore on a genuinely empty storage", async () => {
    vi.resetModules();
    const fresh = await import("@/lib/store");
    await fresh.useProjectStore.persist.rehydrate();
    expect(fresh.useProjectStore.getState().project).toBeNull();
  });
});
