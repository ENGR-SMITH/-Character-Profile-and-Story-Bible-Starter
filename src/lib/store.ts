"use client";

/**
 * Local-first project state.
 *
 * The whole tool works with no account: the project lives in `localStorage`
 * and survives a refresh. Hydration is deliberately skipped during the first
 * render and triggered from an effect, so the server-rendered shell and the
 * first client render agree and there is no hydration mismatch.
 */

import { useEffect } from "react";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import type { FieldDef } from "./fields";
import {
  createCharacter,
  createProject,
  makeFieldValue,
  type Character,
  type Project,
  type ProjectMeta,
  SCHEMA_VERSION,
} from "./schema";
import { nowIso } from "./utils";

const STORAGE_KEY = "nexet.character-profile-story-bible-starter";

/**
 * A lightly debounced writer for localStorage.
 *
 * Autosave runs on every keystroke, but the write itself is coalesced so a
 * long typing burst is one write rather than dozens. `flushPendingWrite` also
 * runs on pagehide and when the tab is hidden, so a refresh or a close can
 * never drop the last few characters.
 */
const FLUSH_DELAY_MS = 250;

let pendingWrite: { name: string; value: string } | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushPendingWrite(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!pendingWrite) return;
  try {
    localStorage.setItem(pendingWrite.name, pendingWrite.value);
  } catch {
    // A full or unavailable storage must never break the editor.
  }
  pendingWrite = null;
}

const localStateStorage: StateStorage = {
  getItem: (name) =>
    typeof localStorage === "undefined" ? null : localStorage.getItem(name),
  setItem: (name, value) => {
    if (typeof localStorage === "undefined") return;
    pendingWrite = { name, value };
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushPendingWrite, FLUSH_DELAY_MS);
  },
  removeItem: (name) => {
    if (typeof localStorage === "undefined") return;
    pendingWrite = null;
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    localStorage.removeItem(name);
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushPendingWrite);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPendingWrite();
  });
}

interface ProjectState {
  project: Project | null;
  /** ISO timestamp of the last local write, for the autosave indicator. */
  lastSavedAt: string | null;
  hydrated: boolean;

  markHydrated: () => void;

  // Project -----------------------------------------------------------------
  startProject: (
    meta: Partial<ProjectMeta> & Pick<ProjectMeta, "title" | "genre" | "storyType">,
  ) => void;
  updateMeta: (patch: Partial<ProjectMeta>) => void;
  clearProject: () => void;

  // Cast --------------------------------------------------------------------
  addCharacter: (input: {
    name: string;
    role?: Character["role"];
    importance?: Character["importance"];
    depth?: Character["depth"];
  }) => string | null;
  renameCharacter: (id: string, name: string) => void;
  patchCharacter: (
    id: string,
    patch: Partial<Pick<Character, "role" | "importance" | "colorTag" | "name">>,
  ) => void;
  setCharacterDepth: (id: string, depth: Character["depth"]) => void;
  setCharacterField: (id: string, field: FieldDef, raw: string) => void;
  clearCharacterField: (id: string, key: string) => void;
  duplicateCharacter: (id: string) => string | null;
  removeCharacter: (id: string) => void;
}

function stamp(project: Project): Project {
  return { ...project, updatedAt: nowIso() };
}

function mapCharacter(
  project: Project,
  id: string,
  update: (character: Character) => Character,
): Project {
  return {
    ...project,
    characters: project.characters.map((character) =>
      character.id === id ? update(character) : character,
    ),
  };
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: null,
      lastSavedAt: null,
      hydrated: false,

      markHydrated: () => set({ hydrated: true }),

      startProject: (meta) => {
        const project = createProject(meta);
        set({ project, lastSavedAt: nowIso() });
      },

      updateMeta: (patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({ ...project, meta: { ...project.meta, ...patch } }),
          lastSavedAt: nowIso(),
        });
      },

      clearProject: () => set({ project: null, lastSavedAt: null }),

      addCharacter: (input) => {
        const project = get().project;
        if (!project) return null;

        const character = createCharacter(input);
        set({
          project: stamp({
            ...project,
            characters: [...project.characters, character],
          }),
          lastSavedAt: nowIso(),
        });
        return character.id;
      },

      renameCharacter: (id, name) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(mapCharacter(project, id, (c) => ({ ...c, name }))),
          lastSavedAt: nowIso(),
        });
      },

      patchCharacter: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) => ({ ...character, ...patch })),
          ),
          lastSavedAt: nowIso(),
        });
      },

      setCharacterDepth: (id, depth) => {
        const project = get().project;
        if (!project) return;
        // Raising depth never loses data. Lowering it only hides fields: the
        // values stay in `fields`, so raising it again brings them back.
        set({
          project: stamp(mapCharacter(project, id, (c) => ({ ...c, depth }))),
          lastSavedAt: nowIso(),
        });
      },

      setCharacterField: (id, field, raw) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) => ({
              ...character,
              fields: {
                ...character.fields,
                [field.key]: makeFieldValue(field, raw),
              },
            })),
          ),
          lastSavedAt: nowIso(),
        });
      },

      clearCharacterField: (id, key) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) => {
              const fields = { ...character.fields };
              delete fields[key];
              return { ...character, fields };
            }),
          ),
          lastSavedAt: nowIso(),
        });
      },

      duplicateCharacter: (id) => {
        const project = get().project;
        if (!project) return null;

        const source = project.characters.find((character) => character.id === id);
        if (!source) return null;

        const copy = createCharacter({
          name: `${source.name} (copy)`,
          role: source.role,
          importance: source.importance,
          depth: source.depth,
          colorTag: source.colorTag,
        });

        // Deep-copy the field map so the two characters never share a value.
        copy.fields = structuredClone(source.fields);

        set({
          project: stamp({
            ...project,
            characters: [...project.characters, copy],
          }),
          lastSavedAt: nowIso(),
        });
        return copy.id;
      },

      removeCharacter: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            characters: project.characters.filter((character) => character.id !== id),
            relationships: project.relationships.filter(
              (relationship) =>
                relationship.fromId !== id && relationship.toId !== id,
            ),
          }),
          lastSavedAt: nowIso(),
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStateStorage),
      // Only the project is persisted; `hydrated` is per-session UI state.
      partialize: (state) => ({
        project: state.project,
        lastSavedAt: state.lastSavedAt,
      }),
      skipHydration: true,
    },
  ),
);

/**
 * Rehydrate once on mount and report when it is safe to render persisted data.
 * Using `onFinishHydration` rather than assuming `rehydrate()` is synchronous
 * keeps this correct if the storage is ever swapped for an async one.
 */
export function useHydration(): boolean {
  const hydrated = useProjectStore((state) => state.hydrated);

  useEffect(() => {
    const unsubscribe = useProjectStore.persist.onFinishHydration(() => {
      useProjectStore.getState().markHydrated();
    });

    void useProjectStore.persist.rehydrate();

    if (useProjectStore.persist.hasHydrated()) {
      useProjectStore.getState().markHydrated();
    }

    return unsubscribe;
  }, []);

  return hydrated;
}

export const useProject = (): Project | null =>
  useProjectStore((state) => state.project);

export const useProjectMeta = (): ProjectMeta | null =>
  useProjectStore((state) => state.project?.meta ?? null);

/** Stable empty array: returning a fresh `[]` from a selector would make the
 * snapshot look changed on every render. */
const NO_CHARACTERS: Character[] = [];

export const useCharacters = (): Character[] =>
  useProjectStore((state) => state.project?.characters ?? NO_CHARACTERS);

export const useLastSavedAt = (): string | null =>
  useProjectStore((state) => state.lastSavedAt);
