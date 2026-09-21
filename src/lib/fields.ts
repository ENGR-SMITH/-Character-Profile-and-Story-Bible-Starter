/**
 * The character field catalog (DEVELOPMENT.md §5.3).
 *
 * This is the contract behind the depth modes: `tier` is the *minimum* depth at
 * which a field appears, so Quick ⊂ Standard ⊂ Deep. Raising a character's
 * depth never loses data; lowering it only hides fields.
 *
 * `name`, `role` and `importance` live on the Character itself rather than in
 * its `fields` map, so they are deliberately absent here.
 */

import type { DepthMode, LayerKey } from "./taxonomy";

export const FIELD_GROUPS = [
  "identity",
  "appearance",
  "personality",
  "backstory",
  "arc",
  "voice",
] as const;
export type FieldGroupKey = (typeof FIELD_GROUPS)[number];

export const FIELD_GROUP_META: Record<
  FieldGroupKey,
  { label: string; blurb: string }
> = {
  identity: {
    label: "Identity",
    blurb: "Who they are, and where they sit in the story.",
  },
  appearance: {
    label: "Appearance",
    blurb: "What a reader notices. Where continuity slips first.",
  },
  personality: {
    label: "Personality & motivation",
    blurb: "The engine: want, need, fear, and the lie they act on.",
  },
  backstory: {
    label: "Backstory",
    blurb: "What made them this way.",
  },
  arc: {
    label: "Arc",
    blurb: "How they change — or refuse to.",
  },
  voice: {
    label: "Voice & continuity",
    blurb: "How they sound, and what must not change.",
  },
};

export type FieldKind = "text" | "long" | "list" | "select";

export interface FieldDef {
  key: string;
  label: string;
  group: FieldGroupKey;
  /** The *minimum* depth at which this field is shown. */
  tier: DepthMode;
  kind: FieldKind;
  /** One line explaining what the field is for. Shown under every input. */
  help: string;
  placeholder?: string;
  /** Only for `kind: "select"`. */
  options?: readonly string[];
  /** Only shown when the project's genre preset enables this layer. */
  layer?: LayerKey;
}

export const FIELDS: readonly FieldDef[] = [
  // -- Identity --------------------------------------------------------------
  {
    key: "nickname",
    label: "Nickname or alias",
    group: "identity",
    tier: "quick",
    kind: "text",
    help: "What other characters actually call them. Leave blank if they are only ever called by their full name.",
    placeholder: "Mara, Dr. Vale, the Orchard girl",
  },
  {
    key: "pronouns",
    label: "Pronouns",
    group: "identity",
    tier: "quick",
    kind: "text",
    help: "Free text, so it fits any world — she/her, he/him, they/them, or a system you invented.",
    placeholder: "she/her",
  },
  {
    key: "gender",
    label: "Gender",
    group: "identity",
    tier: "quick",
    kind: "text",
    help: "Only matters as far as the story makes it matter.",
  },
  {
    key: "age",
    label: "Age or age range",
    group: "identity",
    tier: "quick",
    kind: "text",
    help: "An approximate range is fine. An exact age lets the timeline check compare it against events.",
    placeholder: "early thirties",
  },
  {
    key: "occupation",
    label: "Occupation or role in the world",
    group: "identity",
    tier: "quick",
    kind: "text",
    help: "What they do when the plot is not happening.",
    placeholder: "Coroner's clerk",
  },
  {
    key: "nameReason",
    label: "Why this name",
    group: "identity",
    tier: "standard",
    kind: "text",
    help: "Heritage, a naming tradition, or a choice somebody else made. Storing the reason is what turns a fact into a writing tool.",
  },
  {
    key: "birthYear",
    label: "Birth year or story-year",
    group: "identity",
    tier: "standard",
    kind: "text",
    help: "Anchors them in the timeline. Use your world's calendar if it has its own.",
  },
  {
    key: "currentSituation",
    label: "Where they are as the story opens",
    group: "identity",
    tier: "standard",
    kind: "long",
    help: "One or two lines: their circumstances on page one, before anything changes.",
  },
  {
    key: "economicClass",
    label: "Class or standing",
    group: "identity",
    tier: "deep",
    kind: "text",
    help: "Money, status, or whatever substitutes for both in your world.",
  },
  {
    key: "nicknameReason",
    label: "Why that nickname",
    group: "identity",
    tier: "deep",
    kind: "text",
    help: "Who gave it to them — and whether they answer to it.",
  },
  {
    key: "species",
    label: "Species, ancestry or lineage",
    group: "identity",
    tier: "standard",
    kind: "text",
    layer: "speculative",
    help: "Include what it costs them socially, not just the label.",
  },
  {
    key: "politicalAffiliation",
    label: "Political affiliation",
    group: "identity",
    tier: "deep",
    kind: "text",
    layer: "political",
    help: "Faction, party, court, or the side they are quietly on.",
  },
  {
    key: "religion",
    label: "Religion or moral philosophy",
    group: "identity",
    tier: "standard",
    kind: "text",
    layer: "faith",
    help: "What they believe, or what they profess to believe.",
  },

  // -- Appearance ------------------------------------------------------------
  {
    key: "hair",
    label: "Hair",
    group: "appearance",
    tier: "quick",
    kind: "text",
    help: "The detail readers notice and writers forget by chapter twelve.",
  },
  {
    key: "eyes",
    label: "Eyes",
    group: "appearance",
    tier: "quick",
    kind: "text",
    help: "The other classic continuity slip. Colour, and anything unusual about them.",
  },
  {
    key: "build",
    label: "Build and frame",
    group: "appearance",
    tier: "standard",
    kind: "text",
    help: "How they take up space — described as a stranger would see it across a room.",
  },
  {
    key: "skin",
    label: "Skin and complexion",
    group: "appearance",
    tier: "standard",
    kind: "text",
    help: "Worth pinning down for the same reason as hair and eyes: it is a detail a reader notices the moment it drifts.",
  },
  {
    key: "marks",
    label: "Distinguishing marks",
    group: "appearance",
    tier: "standard",
    kind: "long",
    help: "Scars, tattoos, birthmarks — and how they got them. The story behind a mark is usually more useful than the mark.",
  },
  {
    key: "outfit",
    label: "Signature outfit or style",
    group: "appearance",
    tier: "standard",
    kind: "text",
    help: "The thing they reach for, and the one item that matters for a particular scene.",
  },
  {
    key: "voice",
    label: "Voice",
    group: "appearance",
    tier: "standard",
    kind: "text",
    help: "How it sounds out loud, not what it says.",
  },
  {
    key: "height",
    label: "Height",
    group: "appearance",
    tier: "deep",
    kind: "text",
    help: "Only worth an exact number if it matters. Relative height is usually enough for a scene.",
  },
  {
    key: "dominantHand",
    label: "Dominant hand",
    group: "appearance",
    tier: "deep",
    kind: "text",
    help: "Rarely noted, load-bearing in action scenes.",
  },
  {
    key: "defaultExpression",
    label: "Default expression",
    group: "appearance",
    tier: "deep",
    kind: "text",
    help: "Their resting face. Fill in the blank: they have a resting ___ face.",
  },
  {
    key: "speechRegister",
    label: "Speech register and vocabulary",
    group: "appearance",
    tier: "deep",
    kind: "long",
    help: "How they would ask a stranger for a favour, and how that differs from asking a friend.",
  },
  {
    key: "mannerisms",
    label: "Mannerisms and tics",
    group: "appearance",
    tier: "deep",
    kind: "long",
    help: "What their hands do when they are lying. The physical tells a collaborator can actually use.",
  },

  // -- Personality & motivation ---------------------------------------------
  {
    key: "coreTraits",
    label: "Core traits",
    group: "personality",
    tier: "quick",
    kind: "list",
    help: "Three to five. More than five is a description, not a character.",
    placeholder: "guarded\nobservant\nloyal past the point of sense",
  },
  {
    key: "weaknesses",
    label: "Weaknesses and flaws",
    group: "personality",
    tier: "quick",
    kind: "list",
    help: "Flaws are where the arc lives. A character with no flaw has nowhere to go.",
    placeholder: "answers silence with a lie\ncannot ask for help",
  },
  {
    key: "externalGoal",
    label: "External goal — what they want",
    group: "personality",
    tier: "quick",
    kind: "long",
    help: "The thing they are actively chasing. Concrete and pursuable — something a scene could show them doing.",
    placeholder: "Discover who sent the letter written in her handwriting.",
  },
  {
    key: "internalNeed",
    label: "Internal need",
    group: "personality",
    tier: "quick",
    kind: "long",
    help: "What they actually require, which they usually cannot name out loud.",
  },
  {
    key: "coreFear",
    label: "Core fear",
    group: "personality",
    tier: "quick",
    kind: "long",
    help: "What they will arrange their whole life to avoid.",
  },
  {
    key: "strengths",
    label: "Strengths",
    group: "personality",
    tier: "standard",
    kind: "list",
    help: "What they are genuinely good at — and the cost of being good at it.",
  },
  {
    key: "values",
    label: "Values above all else",
    group: "personality",
    tier: "standard",
    kind: "text",
    help: "The one thing they will not trade, even when it would be sensible to.",
  },
  {
    key: "triggers",
    label: "Emotional triggers",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "What makes them react before they think.",
  },
  {
    key: "habits",
    label: "Habits and quirks",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "The small repeated business that makes them feel lived-in on the page.",
  },
  {
    key: "conflictStyle",
    label: "How they handle conflict",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "Fight, placate, deflect, go cold. The default a scene will fall into.",
  },
  {
    key: "misbelief",
    label: "The lie they act on",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "The false thing they believe about themselves or the world. Most templates omit this, and it is the field that makes an arc work.",
    placeholder: "Protecting the family story is the same as understanding it.",
  },
  {
    key: "secret",
    label: "Secret",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "What they are hiding, and from whom.",
  },
  {
    key: "regret",
    label: "Regret",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "The thing they would undo. Distinct from the formative wound: a regret was chosen, a wound was suffered.",
  },
  {
    key: "stakes",
    label: "What they lose if they fail",
    group: "personality",
    tier: "standard",
    kind: "long",
    help: "Name the specific loss, not the abstract one.",
  },
  {
    key: "petPeeves",
    label: "Pet peeves",
    group: "personality",
    tier: "deep",
    kind: "text",
    help: "The small things that make them unreasonable. Cheaper characterisation than a flaw, and often more memorable.",
  },
  {
    key: "loveApproach",
    label: "How they approach love",
    group: "personality",
    tier: "deep",
    kind: "long",
    help: "How they behave when they care about someone — rarely the same as how they say they behave.",
  },
  {
    key: "humor",
    label: "What they find funny",
    group: "personality",
    tier: "deep",
    kind: "long",
    help: "A character with no sense of humour still has one — try writing a joke they would tell.",
  },

  // -- Backstory -------------------------------------------------------------
  {
    key: "hometown",
    label: "Hometown or origin",
    group: "backstory",
    tier: "standard",
    kind: "text",
    help: "Where they are from, and whether they would go back.",
  },
  {
    key: "family",
    label: "Family and upbringing",
    group: "backstory",
    tier: "standard",
    kind: "long",
    help: "Who raised them, and what that household expected of them.",
  },
  {
    key: "formativeWound",
    label: "Formative wound",
    group: "backstory",
    tier: "standard",
    kind: "long",
    help: "The event that taught them the lie they act on.",
  },
  {
    key: "keyEvents",
    label: "Key life events",
    group: "backstory",
    tier: "deep",
    kind: "list",
    help: "One per line. These can be attached to timeline events later.",
  },
  {
    key: "education",
    label: "Education or training",
    group: "backstory",
    tier: "deep",
    kind: "text",
    help: "Formal or otherwise. Include who paid for it, since that is usually the interesting part.",
  },
  {
    key: "heritage",
    label: "Heritage, culture and first language",
    group: "backstory",
    tier: "deep",
    kind: "text",
    help: "Including what they left behind, and what they cannot stop doing.",
  },
  {
    key: "carries",
    label: "What they always carry",
    group: "backstory",
    tier: "deep",
    kind: "text",
    help: "Object, keepsake, weapon, or the thing in their pocket that a scene will eventually need.",
  },
  {
    key: "witnessedEvents",
    label: "Historical events witnessed",
    group: "backstory",
    tier: "deep",
    kind: "list",
    layer: "historical",
    help: "Which of your world's events they lived through, and on which side.",
  },

  // -- Arc -------------------------------------------------------------------
  {
    key: "arcType",
    label: "Arc type",
    group: "arc",
    tier: "quick",
    kind: "select",
    options: ["Positive", "Negative", "Flat"],
    help: "Positive: they change. Negative: they fall. Flat: they hold, and the world changes around them.",
  },
  {
    key: "startingState",
    label: "Starting state",
    group: "arc",
    tier: "standard",
    kind: "long",
    help: "Who they are when the story begins, in one honest sentence.",
  },
  {
    key: "turningPoint",
    label: "Turning point",
    group: "arc",
    tier: "standard",
    kind: "long",
    help: "The moment the change becomes possible — or impossible.",
  },
  {
    key: "endingState",
    label: "Ending state",
    group: "arc",
    tier: "standard",
    kind: "long",
    help: "Who they are at the end. Mirror it against the starting state and the change becomes visible.",
  },
  {
    key: "letGo",
    label: "What they must let go of",
    group: "arc",
    tier: "standard",
    kind: "long",
    help: "The belief, habit or person they have to release before the arc can complete.",
  },
  {
    key: "refusesChange",
    label: "What they refuse to change",
    group: "arc",
    tier: "deep",
    kind: "long",
    help: "The line they will not cross, whatever it costs them.",
  },

  // -- Voice & continuity ----------------------------------------------------
  {
    key: "openThreads",
    label: "Open threads about them",
    group: "voice",
    tier: "standard",
    kind: "list",
    help: "What is still undecided — the questions a collaborator should not answer for you.",
    placeholder: "Why has she avoided the orchard for ten years?",
  },
  {
    key: "catchphrases",
    label: "Speech habits and catchphrases",
    group: "voice",
    tier: "deep",
    kind: "list",
    help: "One per line, including the habits that annoy the other characters.",
  },
  {
    key: "deflection",
    label: "How they lie or deflect",
    group: "voice",
    tier: "deep",
    kind: "long",
    help: "A collaborator can write a character convincingly if they know how the character avoids a question.",
  },
  {
    key: "sampleLines",
    label: "Sample lines",
    group: "voice",
    tier: "deep",
    kind: "list",
    help: "Two or three lines in their voice. Worth more than a paragraph describing it.",
  },
] as const;

export const FIELD_BY_KEY: Record<string, FieldDef> = Object.fromEntries(
  FIELDS.map((field) => [field.key, field]),
);

/**
 * Every field visible at a depth, including any genre-layer fields the active
 * preset has switched on. Layer fields are appended to the non-layer field so
 * callers do not need to know the difference.
 */
export function fieldsForDepth(
  depth: DepthMode,
  layers: readonly LayerKey[],
): FieldDef[] {
  const limit = { quick: 0, standard: 1, deep: 2 }[depth];
  return FIELDS.filter((field) => {
    const rank = { quick: 0, standard: 1, deep: 2 }[field.tier];
    if (rank > limit) return false;
    if (field.layer && !layers.includes(field.layer)) return false;
    return true;
  });
}

export function fieldsInGroup(
  group: FieldGroupKey,
  depth: DepthMode,
  layers: readonly LayerKey[],
): FieldDef[] {
  return fieldsForDepth(depth, layers).filter((field) => field.group === group);
}

/** How many fields a depth asks for. Drives the counts in the depth selector. */
export function countFieldsForDepth(
  depth: DepthMode,
  layers: readonly LayerKey[],
): number {
  return fieldsForDepth(depth, layers).length;
}
