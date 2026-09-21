/**
 * The collaborator context brief (DEVELOPMENT.md §5.8).
 *
 * The one output whose whole job is to make the second person possible: a
 * one-page handoff of the ground a collaborator works from — project facts, the
 * protected canon, one line per character, the rules that cannot be broken and
 * the questions still open.
 *
 * It compiles into the *same document shape* as the bible (§8.2 calls the brief
 * "deliberately the same object the Pitch Board publishes"), so the Markdown,
 * DOCX and on-screen renderers work on both and there is no second format to
 * drift. Its sections are numbered straight through rather than by §5.7.3's
 * fixed bible numbers, because nothing is ever left out of a brief.
 */

import {
  bibleToText,
  canonBullet,
  openQuestionBullets,
  projectFacts,
  type BibleBlock,
  type BibleDocument,
  type BibleSection,
} from "./bible";
import { CHARACTER_ROLE_META, BRIEF_ROLE_META, IMPORTANCE_META, type BriefRole } from "./taxonomy";
import { fieldValueToText, measureCharacter, type Character, type Project } from "./schema";
import { percent, pluralise } from "./utils";

/**
 * §8.5, in the plan's own spirit: share the context, not the manuscript. The
 * line names what is *not* here, because the fear a writer has about sharing
 * work is never about the context.
 */
export const BRIEF_DISCLOSURE =
  "This is the context, not the manuscript. It was compiled from the answers in a Story Bible and contains no prose — no scene, no draft, no chapter. Nothing left the writer's browser to make it.";

/** §8.2's framing, in the vocabulary of the Authors Den. */
export const BRIEF_FRAMING =
  "A frozen brief: the ground is set before a word is written. Read it, work from it, and answer it — anything not decided here is yours to decide.";

/**
 * A brief is one page, so each list is clipped with an honest count of what is
 * missing rather than quietly showing the first few. The full bible has all of
 * it; a brief that said nothing about the rest would be a different document
 * pretending to be this one.
 */
const MAX_CAST_LINES = 8;
const MAX_RULE_LINES = 6;
const MAX_QUESTION_LINES = 5;

/** A one-liner stays a one-liner. Long answers are clipped, not reformatted. */
const MAX_LINE = 190;

function clip(text: string): string {
  return text.length <= MAX_LINE ? text : `${text.slice(0, MAX_LINE - 1).trimEnd()}…`;
}

/** One field's answer as a single line, or "" when it was never answered. */
function answer(character: Character, key: string): string {
  return fieldValueToText(character.fields[key])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("; ");
}

function displayName(character: Character): string {
  return character.name.trim() || "Unnamed";
}

/**
 * §8.1's "cast one-liners": the single most useful thing about a character to
 * someone about to write them — what they want, or failing that what is going on
 * with them, or failing that what they are like. A profile with none of those
 * says so rather than printing a bare name and looking complete.
 */
export function castOneLiner(character: Character): string {
  const name = displayName(character);
  // Both labels as the tool writes them everywhere else — the cast table and
  // the cast bullets — rather than lowercased into prose: "pov" reads as a
  // typo in a line a collaborator is meant to trust.
  const role = `${CHARACTER_ROLE_META[character.role].label}, ${
    IMPORTANCE_META[character.importance].label
  }`;

  const about =
    answer(character, "externalGoal") ||
    answer(character, "currentSituation") ||
    answer(character, "coreTraits");

  return about
    ? `${name} (${role}) — ${clip(about)}`
    : `${name} (${role}) — nothing written down yet; ask before you decide it.`;
}

function castBullets(project: Project): string[] {
  const all = project.characters.map(castOneLiner);
  if (all.length <= MAX_CAST_LINES) return all;
  return [
    ...all.slice(0, MAX_CAST_LINES),
    `+ ${all.length - MAX_CAST_LINES} more ${pluralise(
      all.length - MAX_CAST_LINES,
      "character",
    )} in the full bible.`,
  ];
}

/**
 * §8.1's "rules that cannot be broken", with §5.5.3's two load-bearing fields
 * named as such. A rule missing its cost or its limit is flagged here too: a
 * collaborator who assumes a limit exists is how the world breaks later.
 */
function ruleBullets(project: Project): string[] {
  const all = project.rules.map((rule) => {
    const parts: string[] = [];
    if (rule.does.trim()) parts.push(`what it does: ${rule.does.trim()}`);
    if (rule.cost.trim()) parts.push(`what it costs: ${rule.cost.trim()}`);
    if (rule.cannotDo.trim()) parts.push(`what it cannot do: ${rule.cannotDo.trim()}`);
    // `access` is the one optional half of a rule, so it is the one line that
    // may simply not be there rather than reading as an empty answer.
    if (rule.access?.trim()) parts.push(`who has access: ${rule.access.trim()}`);

    const missing = [
      rule.cost.trim() === "" ? "no cost" : null,
      rule.cannotDo.trim() === "" ? "no limit" : null,
    ].filter((part): part is string => part !== null);
    if (missing.length > 0) parts.push(`not written down yet: ${missing.join(", ")}`);

    return `${rule.name.trim() || "Unnamed rule"} — ${parts.join(" · ")}`;
  });

  if (all.length <= MAX_RULE_LINES) return all;
  return [
    ...all.slice(0, MAX_RULE_LINES),
    `+ ${all.length - MAX_RULE_LINES} more ${
      all.length - MAX_RULE_LINES === 1 ? "rule" : "rules"
    } in the full bible.`,
  ];
}

/** The world in one line, so the rules have a place to be rules of. */
function settingLine(project: Project): string | undefined {
  const { setting, era, techLevel, differs } = project.world;
  const parts = [setting?.trim() ?? "", era?.trim() ?? "", techLevel?.trim() ?? ""].filter(
    Boolean,
  );
  const how = differs?.trim();
  if (how) parts.push(`differs from the reader's world in that ${how}`);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

// ---------------------------------------------------------------------------
// §8.3 — the suggested role
// ---------------------------------------------------------------------------

export interface RoleSuggestion {
  role: BriefRole;
  /** What in *this* brief led to it, so it reads as a suggestion, not a verdict. */
  why: string;
}

/**
 * §8.3: from the brief, suggest the likely open role.
 *
 * The rule is the state of the ground rather than anything about the writer:
 * an unbuilt cast needs someone building it, open decisions need someone to
 * weigh them, settled ground with a canon list needs someone reading against
 * it, and a finished answer set needs someone keeping the details straight.
 */
export function suggestRole(project: Project): RoleSuggestion {
  const characters = project.characters.length;
  const measured = project.characters.reduce(
    (sum, character) => {
      const { filled, total } = measureCharacter(project, character);
      return { filled: sum.filled + filled, total: sum.total + total };
    },
    { filled: 0, total: 0 },
  );
  const coverage = percent(measured.filled, measured.total);

  const questions = openQuestionBullets(project).length;
  const ground = project.canonFacts.length + project.rules.length;

  if (characters === 0) {
    return {
      role: "co-writer",
      why: "there is no cast yet, so the work is building the story rather than reviewing it",
    };
  }

  if (coverage < 60) {
    return {
      role: "co-writer",
      why: "the profiles are still thin, so the work is building the story rather than reviewing it",
    };
  }

  if (questions > 0) {
    return {
      role: "editor",
      why: `${questions} ${pluralise(questions, "question")} ${
        questions === 1 ? "is" : "are"
      } still open, and they are decisions to weigh rather than a blank page`,
    };
  }

  if (ground > 0) {
    return {
      role: "beta-reader",
      why: `the ground is settled — ${ground} protected ${pluralise(
        ground,
        "fact",
      )} — so the work is reading against it`,
    };
  }

  return {
    role: "proofreader",
    // Not a restatement of the role's own hint: the reason is the state of the
    // ground, which is the only thing a suggestion about a person can honestly
    // be read off.
    why: "everything the tool asked has been answered, so nothing is left to build or decide",
  };
}

// ---------------------------------------------------------------------------
// Compiling
// ---------------------------------------------------------------------------

function withRemainder(items: string[], shown: number, noun: string): string[] {
  if (items.length <= shown) return items;
  const rest = items.length - shown;
  return [...items.slice(0, shown), `+ ${rest} more ${pluralise(rest, noun)} in the full bible.`];
}

/**
 * §8.1's five things, in the order a respondent needs them: the ground, what
 * must not change, who is in it, what the world forbids, who you are, and what
 * is still unanswered.
 */
export function compileBrief(project: Project): BibleDocument {
  const canon = project.canonFacts.map((fact) => canonBullet(project, fact));
  const cast = castBullets(project);
  const questions = openQuestionBullets(project);
  const setting = settingLine(project);
  const rules = ruleBullets(project);
  const suggestion = suggestRole(project);
  const roleMeta = BRIEF_ROLE_META[suggestion.role];

  const sections: BibleSection[] = [];

  sections.push({
    id: "the-brief",
    number: sections.length + 1,
    title: "The brief",
    blocks: [
      { kind: "paragraph", text: BRIEF_FRAMING },
      { kind: "subheading", text: "Project facts" },
      { kind: "facts", facts: projectFacts(project) },
    ],
  });

  sections.push({
    id: "do-not-change",
    number: sections.length + 1,
    title: "What must not change",
    blocks: [
      canon.length > 0
        ? { kind: "bullets", items: canon }
        : {
            kind: "paragraph",
            text: "Nothing is marked as protected yet. Treat every settled fact as fixed until the writer says otherwise.",
          },
    ],
  });

  sections.push({
    id: "cast",
    number: sections.length + 1,
    title: "The cast, one line each",
    blocks: [
      project.characters.length > 0
        ? { kind: "bullets", items: cast }
        : { kind: "paragraph", text: "There is no cast in this brief yet." },
    ],
  });

  if (rules.length > 0 || setting) {
    const blocks: BibleBlock[] = [];
    if (setting) blocks.push({ kind: "paragraph", text: setting });
    if (rules.length > 0) blocks.push({ kind: "bullets", items: rules });
    sections.push({
      id: "rules",
      number: sections.length + 1,
      title: "The rules that cannot be broken",
      blocks,
    });
  }

  sections.push({
    id: "where-you-come-in",
    number: sections.length + 1,
    title: "Where you come in",
    blocks: [
      {
        kind: "paragraph",
        text: `Suggested role: ${roleMeta.label} — ${roleMeta.hint.toLowerCase()}. This brief points that way because ${suggestion.why}. It is a suggestion: the writer decides who they are asking.`,
      },
    ],
  });

  sections.push({
    id: "open-questions",
    number: sections.length + 1,
    title: "Open questions for the collaborator",
    blocks: [
      questions.length > 0
        ? {
            kind: "bullets",
            items: withRemainder(questions, MAX_QUESTION_LINES, "question"),
          }
        : {
            kind: "paragraph",
            text: "Nothing is outstanding — every question this brief would ask has an answer in the project.",
          },
    ],
  });

  const terms = project.glossary.length;
  const subtitle = [
    "Frozen brief",
    `${project.characters.length} ${pluralise(project.characters.length, "character")}`,
    `${project.rules.length} ${pluralise(project.rules.length, "rule")}`,
    `${terms} glossary ${pluralise(terms, "term")}`,
  ].join(" · ");

  return {
    title: project.meta.title.trim() || "Untitled project",
    label: "Collaborator brief",
    subtitle,
    disclosure: BRIEF_DISCLOSURE,
    sections,
    pending: [],
    // §8.1: a brief is one page, so its sections run on rather than each
    // starting a page of its own the way the bible's do.
    pageBreakSections: false,
  };
}

/**
 * The brief as Markdown.
 *
 * The compiled document already is Markdown, so this is the bible renderer by
 * another name — deliberately, since §8.2 makes the brief the same kind of
 * object. There is no second formatter to disagree with the first.
 */
export function briefToText(brief: BibleDocument): string {
  return bibleToText(brief);
}

/** Convenience for callers that only have the project. */
export function projectBriefText(project: Project): string {
  return briefToText(compileBrief(project));
}
