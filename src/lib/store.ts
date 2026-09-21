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
  createFaction,
  createGlossaryEntry,
  createLocation,
  createProject,
  createRule,
  createTimelineEvent,
  makeCustomFieldValue,
  makeFieldValue,
  newId,
  projectSchema,
  type CanonFact,
  type Character,
  type CustomFieldDef,
  type Faction,
  type GlossaryEntry,
  type Location,
  type Project,
  type ProjectMeta,
  type Relationship,
  type Rule,
  type TimelineEvent,
  type World,
  SCHEMA_VERSION,
} from "./schema";
import type { CanonScope } from "./taxonomy";
import { nowIso } from "./utils";
import { nextTimelineOrder, reorderedTimeline } from "./world";

const STORAGE_KEY = "nexet.character-profile-story-bible-starter";

/**
 * A lightly debounced writer for localStorage.
 *
 * Autosave runs on every keystroke, but the write itself is coalesced so a
 * long typing burst is one write rather than dozens. `flushPendingWrite` also
 * runs on pagehide and when the tab is hidden, so a refresh or a close can
 * never drop the last few characters.
 */
export const FLUSH_DELAY_MS = 250;

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
  /** Replace the project with one read back from a JSON export (§5.9). */
  importProject: (project: Project) => void;

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

  // Open questions (§6.3) ----------------------------------------------------
  addOpenQuestion: (id: string, question: string) => void;
  removeOpenQuestion: (id: string, question: string) => void;

  // Protected canon (§5.6.7) ------------------------------------------------
  addCanonFact: (input: {
    statement: string;
    scope: CanonScope;
    subjectId?: string;
  }) => string | null;
  updateCanonFact: (
    id: string,
    patch: Partial<Pick<CanonFact, "statement" | "scope" | "subjectId">>,
  ) => void;
  removeCanonFact: (id: string) => void;

  // Custom fields -----------------------------------------------------------
  addCustomField: (input: {
    label: string;
    kind: CustomFieldDef["kind"];
  }) => string | null;
  updateCustomField: (
    id: string,
    patch: Partial<Pick<CustomFieldDef, "label" | "kind">>,
  ) => void;
  removeCustomField: (id: string) => void;
  setCharacterCustomField: (id: string, def: CustomFieldDef, raw: string) => void;
  clearCharacterCustomField: (id: string, defId: string) => void;

  // Relationships -----------------------------------------------------------
  addRelationship: (input: {
    fromId: string;
    toId: string;
    type: Relationship["type"];
    nature?: string;
    tension?: string;
    secret?: string;
    status?: Relationship["status"];
    asymmetryNote?: string;
  }) => string | null;
  updateRelationship: (
    id: string,
    patch: Partial<
      Pick<
        Relationship,
        "type" | "nature" | "tension" | "secret" | "status" | "asymmetryNote"
      >
    >,
  ) => void;
  removeRelationship: (id: string) => void;

  // World -------------------------------------------------------------------
  updateWorld: (patch: Partial<World>) => void;

  addLocation: (input: { name: string; type?: Location["type"] }) => string | null;
  updateLocation: (
    id: string,
    patch: Partial<
      Pick<
        Location,
        "name" | "type" | "description" | "significance" | "whoIsThere" | "sensory"
      >
    >,
  ) => void;
  removeLocation: (id: string) => void;

  addRule: (input: { name: string }) => string | null;
  updateRule: (
    id: string,
    patch: Partial<Pick<Rule, "name" | "does" | "cost" | "cannotDo" | "access">>,
  ) => void;
  removeRule: (id: string) => void;

  addFaction: (input: { name: string }) => string | null;
  updateFaction: (
    id: string,
    patch: Partial<Pick<Faction, "name" | "purpose" | "leader" | "notes">>,
  ) => void;
  toggleFactionMember: (factionId: string, characterId: string) => void;
  removeFaction: (id: string) => void;

  addTimelineEvent: (input: { label: string; when?: string }) => string | null;
  updateTimelineEvent: (
    id: string,
    patch: Partial<Pick<TimelineEvent, "label" | "when" | "notes">>,
  ) => void;
  toggleTimelineCharacter: (eventId: string, characterId: string) => void;
  moveTimelineEvent: (id: string, direction: -1 | 1) => void;
  removeTimelineEvent: (id: string) => void;

  addGlossaryEntry: (input: { term: string }) => string | null;
  updateGlossaryEntry: (
    id: string,
    patch: Partial<Pick<GlossaryEntry, "term" | "definition" | "aliases">>,
  ) => void;
  removeGlossaryEntry: (id: string) => void;
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

function hasCharacter(project: Project, id: string | undefined): boolean {
  return Boolean(id) && project.characters.some((character) => character.id === id);
}

/** Keep optional free text out of the stored project when it is only whitespace. */
function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * The optional-text half of an update patch.
 *
 * A key the caller did not send is left alone, while a key sent as blank clears
 * the stored value — which is what an editor that sends its whole text field on
 * every keystroke needs.
 */
function optionalTextPatch<K extends string>(
  patch: Partial<Record<K, string>>,
): Partial<Record<K, string | undefined>> {
  const result: Partial<Record<K, string | undefined>> = {};
  for (const [key, value] of Object.entries(patch) as [K, string | undefined][]) {
    if (value === undefined) continue;
    result[key] = optionalText(value);
  }
  return result;
}

/** Replace one entry of a collection by id, leaving the rest untouched. */
function replaceById<T extends { id: string }>(
  items: T[],
  id: string,
  update: (item: T) => T,
): T[] {
  return items.map((item) => (item.id === id ? update(item) : item));
}

/** Add or remove one value from an id list, preserving the existing order. */
function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
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

      importProject: (project) => {
        // Importing is a change to *this* browser's project, so it is stamped
        // like any other edit — the file's own `updatedAt` stays what it was.
        set({ project: stamp(project), lastSavedAt: nowIso() });
      },

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

        // Deep-copy both value maps so the two characters never share a value.
        copy.fields = structuredClone(source.fields);
        copy.custom = structuredClone(source.custom);

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
            // Membership is a reference to a character, so a deleted character
            // is detached from the world rather than left named in it.
            factions: project.factions.map((faction) =>
              faction.memberIds.includes(id)
                ? { ...faction, memberIds: faction.memberIds.filter((m) => m !== id) }
                : faction,
            ),
            timelineEvents: project.timelineEvents.map((event) =>
              event.characterIds.includes(id)
                ? {
                    ...event,
                    characterIds: event.characterIds.filter((c) => c !== id),
                  }
                : event,
            ),
            // A protected fact is the writer's own editorial decision, so it is
            // kept rather than deleted with the character — only the reference
            // to them goes, leaving the statement intact.
            canonFacts: project.canonFacts.map((fact) =>
              fact.subjectId === id ? { ...fact, subjectId: undefined } : fact,
            ),
          }),
          lastSavedAt: nowIso(),
        });
      },

      addOpenQuestion: (id, question) => {
        const project = get().project;
        const trimmed = question.trim();
        if (!project || !trimmed) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) =>
              // Generated questions are derived, so keeping one is a deliberate
              // act — and keeping it twice would say nothing more.
              character.openQuestions.includes(trimmed)
                ? character
                : { ...character, openQuestions: [...character.openQuestions, trimmed] },
            ),
          ),
          lastSavedAt: nowIso(),
        });
      },

      removeOpenQuestion: (id, question) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) => ({
              ...character,
              openQuestions: character.openQuestions.filter(
                (existing) => existing !== question,
              ),
            })),
          ),
          lastSavedAt: nowIso(),
        });
      },

      addCanonFact: ({ statement, scope, subjectId }) => {
        const project = get().project;
        const trimmed = statement.trim();
        if (!project || !trimmed) return null;
        // A fact about one character has to name one: a character-scoped fact
        // with no subject would print as "(character)" and mean nothing.
        if (scope === "character" && !hasCharacter(project, subjectId)) return null;

        const fact: CanonFact = {
          id: newId("canon"),
          statement: trimmed,
          scope,
          subjectId: scope === "character" ? subjectId : undefined,
        };
        set({
          project: stamp({ ...project, canonFacts: [...project.canonFacts, fact] }),
          lastSavedAt: nowIso(),
        });
        return fact.id;
      },

      updateCanonFact: (id, patch) => {
        const project = get().project;
        if (!project) return;

        const existing = project.canonFacts.find((fact) => fact.id === id);
        if (!existing) return;

        const next: CanonFact = { ...existing, ...patch };
        // Rescoping to a character without naming one would leave the same
        // meaningless fact the guard above refuses to create.
        if (next.scope === "character" && !hasCharacter(project, next.subjectId)) return;

        const cleaned: CanonFact = {
          id: next.id,
          statement: next.statement,
          scope: next.scope,
          subjectId: next.scope === "character" ? next.subjectId : undefined,
        };
        set({
          project: stamp({
            ...project,
            canonFacts: replaceById(project.canonFacts, id, () => cleaned),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeCanonFact: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            canonFacts: project.canonFacts.filter((fact) => fact.id !== id),
          }),
          lastSavedAt: nowIso(),
        });
      },

      addCustomField: ({ label, kind }) => {
        const project = get().project;
        const trimmed = label.trim();
        if (!project || !trimmed) return null;

        const def: CustomFieldDef = { id: newId("custom"), label: trimmed, kind };
        set({
          project: stamp({
            ...project,
            customFields: [...project.customFields, def],
          }),
          lastSavedAt: nowIso(),
        });
        return def.id;
      },

      updateCustomField: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            customFields: project.customFields.map((def) =>
              def.id === id ? { ...def, ...patch } : def,
            ),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeCustomField: (id) => {
        const project = get().project;
        if (!project) return;
        // Removing the definition takes its answers with it. Leaving them
        // behind would keep unreachable values in the project and, later, in
        // the export — a definition is what makes a value mean anything.
        set({
          project: stamp({
            ...project,
            customFields: project.customFields.filter((def) => def.id !== id),
            characters: project.characters.map((character) => {
              if (!(id in character.custom)) return character;
              const custom = { ...character.custom };
              delete custom[id];
              return { ...character, custom };
            }),
          }),
          lastSavedAt: nowIso(),
        });
      },

      setCharacterCustomField: (id, def, raw) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) => ({
              ...character,
              custom: {
                ...character.custom,
                [def.id]: makeCustomFieldValue(def, raw),
              },
            })),
          ),
          lastSavedAt: nowIso(),
        });
      },

      clearCharacterCustomField: (id, defId) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp(
            mapCharacter(project, id, (character) => {
              const custom = { ...character.custom };
              delete custom[defId];
              return { ...character, custom };
            }),
          ),
          lastSavedAt: nowIso(),
        });
      },

      addRelationship: (input) => {
        const project = get().project;
        if (!project) return null;
        // A relationship is a row between two different, existing characters.
        if (input.fromId === input.toId) return null;
        const ids = new Set(project.characters.map((character) => character.id));
        if (!ids.has(input.fromId) || !ids.has(input.toId)) return null;

        const relationship: Relationship = {
          id: newId("relationship"),
          fromId: input.fromId,
          toId: input.toId,
          type: input.type,
          nature: optionalText(input.nature),
          tension: optionalText(input.tension),
          secret: optionalText(input.secret),
          status: input.status,
          asymmetryNote: optionalText(input.asymmetryNote),
        };

        set({
          project: stamp({
            ...project,
            relationships: [...project.relationships, relationship],
          }),
          lastSavedAt: nowIso(),
        });
        return relationship.id;
      },

      updateRelationship: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            relationships: project.relationships.map((relationship) =>
              relationship.id === id ? { ...relationship, ...patch } : relationship,
            ),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeRelationship: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            relationships: project.relationships.filter(
              (relationship) => relationship.id !== id,
            ),
          }),
          lastSavedAt: nowIso(),
        });
      },

      updateWorld: (patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({ ...project, world: { ...project.world, ...patch } }),
          lastSavedAt: nowIso(),
        });
      },

      addLocation: ({ name, type }) => {
        const project = get().project;
        if (!project || !name.trim()) return null;

        const location = createLocation({ name, type });
        set({
          project: stamp({
            ...project,
            locations: [...project.locations, location],
          }),
          lastSavedAt: nowIso(),
        });
        return location.id;
      },

      updateLocation: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            locations: replaceById(project.locations, id, (location) => ({
              ...location,
              ...patch,
              ...optionalTextPatch({
                description: patch.description,
                significance: patch.significance,
                whoIsThere: patch.whoIsThere,
                sensory: patch.sensory,
              }),
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeLocation: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            locations: project.locations.filter((location) => location.id !== id),
          }),
          lastSavedAt: nowIso(),
        });
      },

      addRule: ({ name }) => {
        const project = get().project;
        if (!project || !name.trim()) return null;

        const rule = createRule({ name });
        set({
          project: stamp({ ...project, rules: [...project.rules, rule] }),
          lastSavedAt: nowIso(),
        });
        return rule.id;
      },

      updateRule: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            rules: replaceById(project.rules, id, (rule) => ({
              ...rule,
              ...patch,
              ...optionalTextPatch({ access: patch.access }),
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeRule: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            rules: project.rules.filter((rule) => rule.id !== id),
          }),
          lastSavedAt: nowIso(),
        });
      },

      addFaction: ({ name }) => {
        const project = get().project;
        if (!project || !name.trim()) return null;

        const faction = createFaction({ name });
        set({
          project: stamp({ ...project, factions: [...project.factions, faction] }),
          lastSavedAt: nowIso(),
        });
        return faction.id;
      },

      updateFaction: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            factions: replaceById(project.factions, id, (faction) => ({
              ...faction,
              ...patch,
              ...optionalTextPatch({
                purpose: patch.purpose,
                leader: patch.leader,
                notes: patch.notes,
              }),
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      toggleFactionMember: (factionId, characterId) => {
        const project = get().project;
        if (!project) return;
        // Only a character who exists can be a member, whatever the UI offers.
        if (!project.characters.some((character) => character.id === characterId)) return;

        set({
          project: stamp({
            ...project,
            factions: replaceById(project.factions, factionId, (faction) => ({
              ...faction,
              memberIds: toggleId(faction.memberIds, characterId),
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeFaction: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            factions: project.factions.filter((faction) => faction.id !== id),
          }),
          lastSavedAt: nowIso(),
        });
      },

      addTimelineEvent: ({ label, when }) => {
        const project = get().project;
        if (!project || !label.trim()) return null;

        // New events land at the end of the chronology; the writer moves them.
        const event = createTimelineEvent({
          label,
          when: optionalText(when),
          order: nextTimelineOrder(project.timelineEvents),
        });
        set({
          project: stamp({
            ...project,
            timelineEvents: [...project.timelineEvents, event],
          }),
          lastSavedAt: nowIso(),
        });
        return event.id;
      },

      updateTimelineEvent: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            timelineEvents: replaceById(project.timelineEvents, id, (event) => ({
              ...event,
              ...patch,
              ...optionalTextPatch({ when: patch.when, notes: patch.notes }),
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      toggleTimelineCharacter: (eventId, characterId) => {
        const project = get().project;
        if (!project) return;
        if (!project.characters.some((character) => character.id === characterId)) return;

        set({
          project: stamp({
            ...project,
            timelineEvents: replaceById(project.timelineEvents, eventId, (event) => ({
              ...event,
              characterIds: toggleId(event.characterIds, characterId),
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      moveTimelineEvent: (id, direction) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            timelineEvents: reorderedTimeline(project.timelineEvents, id, direction),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeTimelineEvent: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            timelineEvents: project.timelineEvents.filter((event) => event.id !== id),
          }),
          lastSavedAt: nowIso(),
        });
      },

      addGlossaryEntry: ({ term }) => {
        const project = get().project;
        if (!project || !term.trim()) return null;

        const entry = createGlossaryEntry({ term });
        set({
          project: stamp({ ...project, glossary: [...project.glossary, entry] }),
          lastSavedAt: nowIso(),
        });
        return entry.id;
      },

      updateGlossaryEntry: (id, patch) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            glossary: replaceById(project.glossary, id, (entry) => ({
              ...entry,
              ...patch,
            })),
          }),
          lastSavedAt: nowIso(),
        });
      },

      removeGlossaryEntry: (id) => {
        const project = get().project;
        if (!project) return;
        set({
          project: stamp({
            ...project,
            glossary: project.glossary.filter((entry) => entry.id !== id),
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
      // A project written by an earlier build is missing whatever the schema has
      // gained since. Re-parsing it through the schema fills the defaults, so a
      // project saved before the world section existed still opens instead of
      // reaching a component that expects a field it has never heard of.
      merge: (persisted, current) => {
        const state = persisted as
          | { project?: unknown; lastSavedAt?: string | null }
          | undefined;
        const parsed = state?.project ? projectSchema.safeParse(state.project) : null;
        return {
          ...current,
          lastSavedAt: state?.lastSavedAt ?? null,
          project: parsed?.success
            ? parsed.data
            : ((state?.project as Project | null | undefined) ?? null),
        };
      },
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
