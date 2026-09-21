/**
 * Vocabularies for the tool.
 *
 * Value tuples are the source of truth for both the UI and the Zod schema in
 * `./schema.ts`, so a value can never drift between the two. Each tuple has a
 * matching `*_META` record carrying the human-facing label and hint.
 */

// ---------------------------------------------------------------------------
// Character role and importance
// ---------------------------------------------------------------------------

export const CHARACTER_ROLES = [
  "protagonist",
  "antagonist",
  "deuteragonist",
  "love-interest",
  "mentor",
  "foil",
  "ally",
  "rival",
  "family",
  "background",
] as const;
export type CharacterRole = (typeof CHARACTER_ROLES)[number];

export const CHARACTER_ROLE_META: Record<
  CharacterRole,
  { label: string; hint: string }
> = {
  protagonist: { label: "Protagonist", hint: "Carries the story's main want" },
  antagonist: { label: "Antagonist", hint: "Stands against that want" },
  deuteragonist: { label: "Deuteragonist", hint: "A second lead, not a sidekick" },
  "love-interest": { label: "Love interest", hint: "The romantic thread" },
  mentor: { label: "Mentor", hint: "Teaches, or refuses to" },
  foil: { label: "Foil", hint: "Defined by contrast with someone else" },
  ally: { label: "Ally", hint: "On their side" },
  rival: { label: "Rival", hint: "Competes without necessarily opposing" },
  family: { label: "Family", hint: "Related by blood, marriage or choice" },
  background: { label: "Background", hint: "Named, but rarely on the page" },
};

export const IMPORTANCE_LEVELS = [
  "pov",
  "major",
  "supporting",
  "minor",
  "named-only",
] as const;
export type Importance = (typeof IMPORTANCE_LEVELS)[number];

export const IMPORTANCE_META: Record<
  Importance,
  { label: string; hint: string }
> = {
  pov: { label: "POV", hint: "Sees the story from the inside" },
  major: { label: "Major", hint: "Drives or blocks the plot" },
  supporting: { label: "Supporting", hint: "Recurs and matters" },
  minor: { label: "Minor", hint: "Appears, briefly" },
  "named-only": {
    label: "Named only",
    hint: "Needs a consistent name and little else",
  },
};

// ---------------------------------------------------------------------------
// Depth modes
// ---------------------------------------------------------------------------

export const DEPTH_MODES = ["quick", "standard", "deep"] as const;
export type DepthMode = (typeof DEPTH_MODES)[number];

/** Quick < Standard < Deep. Used to decide what a depth change hides. */
export const DEPTH_ORDER: Record<DepthMode, number> = {
  quick: 0,
  standard: 1,
  deep: 2,
};

export const DEPTH_META: Record<
  DepthMode,
  { label: string; hint: string; minutes: string }
> = {
  quick: {
    label: "Quick",
    hint: "The essentials — for a wide cast",
    minutes: "5–10 min",
  },
  standard: {
    label: "Standard",
    hint: "Enough for someone else to write them correctly",
    minutes: "20–30 min",
  },
  deep: {
    label: "Deep",
    hint: "Every question you have not asked yet",
    minutes: "45–90 min",
  },
};

// ---------------------------------------------------------------------------
// Genre presets and their extra field layers
// ---------------------------------------------------------------------------

export const LAYERS = ["speculative", "political", "faith", "historical"] as const;
export type LayerKey = (typeof LAYERS)[number];

export const LAYER_META: Record<LayerKey, { label: string }> = {
  speculative: { label: "Speculative" },
  political: { label: "Political" },
  faith: { label: "Faith & philosophy" },
  // "World history" rather than "Historical": the field it switches on is
  // `witnessedEvents`, which matters to any world with a war in its past, not
  // only to historical fiction.
  historical: { label: "World history" },
};

export const GENRES = [
  "general",
  "fantasy",
  "science-fiction",
  "romance",
  "thriller-crime",
  "mystery",
  "literary",
  "historical",
  "young-adult",
  "horror",
  "screenplay",
] as const;
export type Genre = (typeof GENRES)[number];

export const GENRE_META: Record<Genre, { label: string; layers: LayerKey[] }> = {
  general: { label: "General", layers: [] },
  fantasy: {
    label: "Fantasy",
    layers: ["speculative", "political", "faith", "historical"],
  },
  "science-fiction": {
    label: "Science fiction",
    layers: ["speculative", "political", "historical"],
  },
  romance: { label: "Romance", layers: [] },
  "thriller-crime": { label: "Thriller & crime", layers: [] },
  mystery: { label: "Mystery", layers: [] },
  literary: { label: "Literary", layers: ["political", "faith"] },
  historical: {
    label: "Historical",
    layers: ["historical", "political", "faith"],
  },
  "young-adult": { label: "Young adult", layers: [] },
  horror: { label: "Horror", layers: [] },
  screenplay: { label: "Screenplay", layers: ["political", "faith"] },
};

export const STORY_TYPES = [
  "novel",
  "series",
  "novella",
  "screenplay",
  "other",
] as const;
export type StoryType = (typeof STORY_TYPES)[number];

export const STORY_TYPE_META: Record<StoryType, { label: string }> = {
  novel: { label: "Standalone novel" },
  series: { label: "Series" },
  novella: { label: "Novella" },
  screenplay: { label: "Screenplay" },
  other: { label: "Something else" },
};

// ---------------------------------------------------------------------------
// Relationships — used by the schema now, by the editor in a later phase
// ---------------------------------------------------------------------------

export const RELATIONSHIP_TYPES = [
  "family",
  "chosen-family",
  "romantic",
  "friend",
  "ally",
  "rival",
  "enemy",
  "mentor",
  "student",
  "authority",
  "colleague",
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_TYPE_META: Record<RelationshipType, { label: string }> = {
  family: { label: "Family" },
  "chosen-family": { label: "Chosen family" },
  romantic: { label: "Romantic" },
  friend: { label: "Friend" },
  ally: { label: "Ally" },
  rival: { label: "Rival" },
  enemy: { label: "Enemy" },
  mentor: { label: "Mentor" },
  student: { label: "Student" },
  authority: { label: "Authority" },
  colleague: { label: "Colleague" },
};

export const RELATIONSHIP_STATUSES = ["open", "resolved", "broken"] as const;
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];

export const RELATIONSHIP_STATUS_META: Record<
  RelationshipStatus,
  { label: string }
> = {
  open: { label: "Open" },
  resolved: { label: "Resolved" },
  broken: { label: "Broken" },
};

// ---------------------------------------------------------------------------
// Colour tags
// ---------------------------------------------------------------------------

export const CHARACTER_COLORS = [
  { name: "Slate", value: "#64748b" },
  { name: "Amber", value: "#b45309" },
  { name: "Ember", value: "#dc2626" },
  { name: "Rose", value: "#be123c" },
  { name: "Violet", value: "#6d28d9" },
  { name: "Sky", value: "#0369a1" },
  { name: "Teal", value: "#0f766e" },
  { name: "Moss", value: "#15803d" },
] as const;

// ---------------------------------------------------------------------------
// AI providers — recorded on accepted suggestions, per the Story Oracle model
// ---------------------------------------------------------------------------

export const AI_PROVIDERS = [
  "groq",
  "openrouter",
  "ollama",
  "lm-studio",
  "freebuff",
] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const CANON_SCOPES = ["project", "character", "world"] as const;
export type CanonScope = (typeof CANON_SCOPES)[number];
