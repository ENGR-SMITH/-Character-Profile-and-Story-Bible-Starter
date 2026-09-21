/**
 * The data contract for the tool (DEVELOPMENT.md §6.3).
 *
 * Everything reads from this shape: the editor state, the local persistence
 * layer, the exports added in a later phase, and the eventual Authors Den
 * import. `schemaVersion` exists from day one so that import stays possible.
 */

import { z } from "zod";

import { fieldsForDepth, type FieldDef } from "./fields";
import {
  AI_PROVIDERS,
  CANON_SCOPES,
  CHARACTER_ROLES,
  DEPTH_MODES,
  GENRE_META,
  GENRES,
  IMPORTANCE_LEVELS,
  RELATIONSHIP_STATUSES,
  RELATIONSHIP_TYPES,
  STORY_TYPES,
} from "./taxonomy";

export const SCHEMA_VERSION = 1;

/** Where a field value came from, when it did not come from the writer. */
export const providerRefSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  model: z.string().optional(),
  /** Set when the request failed over to this provider from another one. */
  failedOverFrom: z.enum(AI_PROVIDERS).optional(),
});
export type ProviderRef = z.infer<typeof providerRefSchema>;

export const fieldValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), value: z.string() }),
  z.object({ kind: z.literal("long"), value: z.string() }),
  z.object({ kind: z.literal("list"), value: z.array(z.string()) }),
  z.object({ kind: z.literal("number"), value: z.number() }),
  z.object({ kind: z.literal("ref"), value: z.string() }),
  z.object({
    kind: z.literal("ai"),
    value: z.string(),
    suggestedBy: providerRefSchema,
    accepted: z.boolean(),
  }),
]);
export type FieldValue = z.infer<typeof fieldValueSchema>;

export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  depth: z.enum(DEPTH_MODES),
  role: z.enum(CHARACTER_ROLES),
  importance: z.enum(IMPORTANCE_LEVELS),
  colorTag: z.string().optional(),
  fields: z.record(z.string(), fieldValueSchema).default({}),
  /** Values for writer-defined custom fields, keyed by CustomFieldDef id. */
  custom: z.record(z.string(), fieldValueSchema).default({}),
  openQuestions: z.array(z.string()).default([]),
});
export type Character = z.infer<typeof characterSchema>;

export const relationshipSchema = z.object({
  id: z.string(),
  fromId: z.string(),
  toId: z.string(),
  type: z.enum(RELATIONSHIP_TYPES),
  nature: z.string().optional(),
  tension: z.string().optional(),
  secret: z.string().optional(),
  status: z.enum(RELATIONSHIP_STATUSES).optional(),
  asymmetryNote: z.string().optional(),
});
export type Relationship = z.infer<typeof relationshipSchema>;

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  significance: z.string().optional(),
  whoIsThere: z.string().optional(),
  sensory: z.string().optional(),
});
export type Location = z.infer<typeof locationSchema>;

export const ruleSchema = z.object({
  id: z.string(),
  name: z.string(),
  does: z.string().default(""),
  /** Required by the schema: the limit is what stops a rule bending later. */
  cost: z.string().default(""),
  cannotDo: z.string().default(""),
  access: z.string().optional(),
});
export type Rule = z.infer<typeof ruleSchema>;

export const factionSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string().optional(),
  leader: z.string().optional(),
  memberIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
});
export type Faction = z.infer<typeof factionSchema>;

export const timelineEventSchema = z.object({
  id: z.string(),
  label: z.string(),
  when: z.string().optional(),
  order: z.number(),
  characterIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
});
export type TimelineEvent = z.infer<typeof timelineEventSchema>;

export const glossaryEntrySchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string().default(""),
  aliases: z.array(z.string()).default([]),
});
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

export const canonFactSchema = z.object({
  id: z.string(),
  statement: z.string(),
  scope: z.enum(CANON_SCOPES),
  subjectId: z.string().optional(),
});
export type CanonFact = z.infer<typeof canonFactSchema>;

export const customFieldDefSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["text", "long", "list", "number"]),
});
export type CustomFieldDef = z.infer<typeof customFieldDefSchema>;

export const worldSchema = z.object({
  /** Setting & era (§5.5.1), all optional: a writer may know the place first. */
  setting: z.string().optional(),
  era: z.string().optional(),
  techLevel: z.string().optional(),
  differs: z.string().optional(),
  /** Culture & society (§5.5.4): norms, traditions, language, government, taboos. */
  culture: z.string().optional(),
});
export type World = z.infer<typeof worldSchema>;

export const projectMetaSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  genre: z.enum(GENRES),
  storyType: z.enum(STORY_TYPES),
  tone: z.string().optional(),
  pov: z.string().optional(),
  tense: z.string().optional(),
  audience: z.string().optional(),
  contentNotes: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
});
export type ProjectMeta = z.infer<typeof projectMetaSchema>;

export const projectSchema = z.object({
  id: z.string(),
  meta: projectMetaSchema,
  world: worldSchema.default({}),
  characters: z.array(characterSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  locations: z.array(locationSchema).default([]),
  rules: z.array(ruleSchema).default([]),
  factions: z.array(factionSchema).default([]),
  timelineEvents: z.array(timelineEventSchema).default([]),
  glossary: z.array(glossaryEntrySchema).default([]),
  canonFacts: z.array(canonFactSchema).default([]),
  customFields: z.array(customFieldDefSchema).default([]),
  updatedAt: z.string(),
  schemaVersion: z.number().default(SCHEMA_VERSION),
});
export type Project = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${uuid}`;
}

export function createProject(
  meta: Partial<ProjectMeta> & Pick<ProjectMeta, "title" | "genre" | "storyType">,
): Project {
  // Typed as the schema's *input* so the literal below is checked against it.
  // `parse` accepts `unknown`, so an unchecked literal could carry an invalid
  // value and only fail at runtime.
  const draft: z.input<typeof projectSchema> = {
    id: newId("project"),
    meta,
    updatedAt: new Date().toISOString(),
  };
  return projectSchema.parse(draft);
}

// ---------------------------------------------------------------------------
// World factories (§5.5)
// ---------------------------------------------------------------------------

export function createLocation(input: {
  name: string;
  type?: Location["type"];
}): Location {
  return locationSchema.parse({
    id: newId("location"),
    name: input.name.trim(),
    type: input.type,
  });
}

/**
 * `cost` and `cannotDo` are required by the model (§5.5.3) but may be written
 * empty, so a rule can be captured the moment it is named and its limits
 * filled in later. `rulesWithGaps` reports the ones still missing them.
 */
export function createRule(input: { name: string }): Rule {
  return ruleSchema.parse({ id: newId("rule"), name: input.name.trim() });
}

export function createFaction(input: { name: string }): Faction {
  return factionSchema.parse({ id: newId("faction"), name: input.name.trim() });
}

export function createTimelineEvent(input: {
  label: string;
  when?: string;
  order: number;
}): TimelineEvent {
  return timelineEventSchema.parse({
    id: newId("event"),
    label: input.label.trim(),
    when: input.when,
    order: input.order,
  });
}

export function createGlossaryEntry(input: {
  term: string;
  definition?: string;
  aliases?: string[];
}): GlossaryEntry {
  return glossaryEntrySchema.parse({
    id: newId("gloss"),
    term: input.term.trim(),
    definition: input.definition ?? "",
    aliases: input.aliases ?? [],
  });
}

export function createCharacter(input: {
  name: string;
  role?: Character["role"];
  importance?: Character["importance"];
  depth?: Character["depth"];
  colorTag?: string;
}): Character {
  const draft: z.input<typeof characterSchema> = {
    id: newId("character"),
    name: input.name.trim(),
    role: input.role ?? "background",
    importance: input.importance ?? "supporting",
    depth: input.depth ?? "quick",
    colorTag: input.colorTag,
    fields: {},
    custom: {},
    openQuestions: [],
  };
  return characterSchema.parse(draft);
}

// ---------------------------------------------------------------------------
// Field value helpers
// ---------------------------------------------------------------------------

export function makeFieldValue(field: FieldDef, raw: string): FieldValue {
  switch (field.kind) {
    case "long":
      return { kind: "long", value: raw };
    case "list":
      return { kind: "list", value: toList(raw) };
    default:
      // `text` and `select` both store a plain string.
      return { kind: "text", value: raw };
  }
}

/** Newline-separated editor input to a list value. */
function toList(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The value a writer-defined custom field stores.
 *
 * `number` falls back to text for blank or non-numeric input rather than
 * storing `NaN`: `isFieldValueEmpty` treats every number as filled, so an
 * unparseable number would otherwise read as a completed answer.
 */
export function makeCustomFieldValue(def: CustomFieldDef, raw: string): FieldValue {
  switch (def.kind) {
    case "long":
      return { kind: "long", value: raw };
    case "list":
      return { kind: "list", value: toList(raw) };
    case "number": {
      const trimmed = raw.trim();
      if (trimmed === "") return { kind: "text", value: "" };
      const value = Number(trimmed);
      return Number.isNaN(value) ? { kind: "text", value: raw } : { kind: "number", value };
    }
    default:
      return { kind: "text", value: raw };
  }
}

/** A field value rendered as editable text, whatever its kind. */
export function fieldValueToText(value: FieldValue | undefined): string {
  if (!value) return "";
  switch (value.kind) {
    case "text":
    case "long":
    case "ai":
      return value.value;
    case "list":
      return value.value.join("\n");
    case "number":
      return String(value.value);
    case "ref":
      return value.value;
  }
}

/**
 * Free-text search across a character: their name, their taxonomies and every
 * answer they carry, including writer-defined custom fields. Kept as a pure
 * function over the data contract so the cast list and the cast table can share
 * one definition of "matches".
 */
export function characterMatchesQuery(character: Character, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [character.name, character.role, character.importance];
  for (const value of Object.values(character.fields)) {
    haystack.push(fieldValueToText(value));
  }
  for (const value of Object.values(character.custom)) {
    haystack.push(fieldValueToText(value));
  }

  return haystack.some((text) => text.toLowerCase().includes(needle));
}

export function isFieldValueEmpty(value: FieldValue | undefined): boolean {
  if (!value) return true;
  switch (value.kind) {
    case "list":
      return value.value.length === 0;
    case "number":
      return false;
    default:
      return value.value.trim().length === 0;
  }
}

/**
 * Progress across a set of visible fields, for the editor and cast meters.
 *
 * Custom fields are passed separately because their definitions and their
 * values live in different places on the project (§5.2 2.6): the definition is
 * project-wide, the answer is per character.
 */
export function measureFields(
  character: Character,
  fields: readonly FieldDef[],
  customFields: readonly CustomFieldDef[] = [],
): { filled: number; total: number } {
  let filled = 0;
  for (const field of fields) {
    if (!isFieldValueEmpty(character.fields[field.key])) filled += 1;
  }
  for (const def of customFields) {
    if (!isFieldValueEmpty(character.custom[def.id])) filled += 1;
  }
  return { filled, total: fields.length + customFields.length };
}

/**
 * Completion for a character as the tool actually displays it: the fields their
 * depth and the project's genre layers ask for, plus the project's custom
 * fields. The cast list, the cast table and the relationship graph must all
 * answer "how complete is this character?" the same way.
 */
export function measureCharacter(
  project: Project,
  character: Character,
): { filled: number; total: number } {
  const layers = GENRE_META[project.meta.genre].layers;
  return measureFields(character, fieldsForDepth(character.depth, layers), project.customFields);
}
