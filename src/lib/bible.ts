/**
 * The compiled Story Bible (DEVELOPMENT.md §5.7).
 *
 * One definition of the document, so the live view, the table of contents, the
 * clipboard copy and — from Phase E — the Markdown, DOCX and PDF exports all
 * render the same thing. The document is *compiled*, never stored: it is a
 * projection of the project, so it is live by construction and there is no
 * second copy to fall out of date.
 *
 * Sections follow §5.7.3's order. A section with nothing in it is left out
 * rather than printed empty; `pending` names what is still missing, which is
 * what §5.7.5's "this export is stale" notice will be built on.
 */

import { runContinuityCheck } from "./checker";
import { FIELD_GROUP_META, fieldsForDepth } from "./fields";
import { relationshipMapText } from "./relationships";
import {
  fieldValueToText,
  isFieldValueEmpty,
  measureCharacter,
  type CanonFact,
  type FieldValue,
  type Project,
} from "./schema";
import {
  CANON_SCOPE_META,
  CHARACTER_ROLE_META,
  DEPTH_META,
  GENRE_META,
  IMPORTANCE_META,
  STORY_TYPE_META,
  type LayerKey,
} from "./taxonomy";
import { percent, pluralise } from "./utils";
import { sortTimeline } from "./world";

export interface BibleFact {
  label: string;
  value: string;
}

export interface BibleEntry {
  /** Anchor id, so the table of contents can jump to it. */
  id: string;
  title: string;
  blocks: BibleBlock[];
}

export type BibleBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "facts"; facts: BibleFact[] }
  | { kind: "bullets"; items: string[] }
  | { kind: "subheading"; text: string }
  /** Text that is already Markdown, such as the relationship map (§5.4.3). */
  | { kind: "markdown"; text: string }
  | { kind: "entries"; entries: BibleEntry[] };

export interface BibleSection {
  id: string;
  /**
   * Its position in §5.7.3 — kept even when a section is left out, so "Cast
   * overview" is section 3 in every bible rather than moving up when the
   * protected canon list is empty.
   */
  number: number;
  title: string;
  blocks: BibleBlock[];
}

export interface BibleDocument {
  title: string;
  /**
   * What the document is — "Story Bible", "Collaborator brief". The brief is
   * deliberately the same shape as the bible (§8.2 makes it the same object the
   * Pitch Board publishes), so every writer works on both.
   */
  label: string;
  subtitle: string;
  disclosure: string;
  /** Sections with content, in §5.7.3's order. */
  sections: BibleSection[];
  /** Section titles this bible will gain as the project is filled in. */
  pending: string[];
  /**
   * Whether each section starts a page of its own when the document is printed
   * or written to Word (§5.7.4). The bible sets it; the brief does not, because
   * §8.1 promises one page and a break per section would be six.
   */
  pageBreakSections: boolean;
}

/**
 * §1.3, rule 2 again: the compiled document says what it is. The bible is the
 * artifact that leaves the building, so this line travels with it.
 */
export const BIBLE_DISCLOSURE =
  "Compiled from the answers entered in this tool, and nothing else. No manuscript was read, and nothing has left your browser.";

/** One field's answer as a single line, whatever kind of value it is. */
function answerText(value: FieldValue | undefined): string {
  return fieldValueToText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("; ");
}

function nameOf(project: Project, id: string): string {
  return project.characters.find((character) => character.id === id)?.name.trim() || "Unnamed";
}

/** Also the brief's do-not-change block (§8.1): one wording, both documents. */
export function canonBullet(project: Project, fact: CanonFact): string {
  // The statement is bold because it is the thing not to change; the scope is
  // how far that reaches. A fact whose character has since been deleted keeps
  // its wording and prints as plainly "(character)" rather than naming nobody.
  const scopeLabel = CANON_SCOPE_META[fact.scope].label.toLowerCase();
  const scope =
    fact.scope === "character" && fact.subjectId
      ? `${nameOf(project, fact.subjectId)} (${scopeLabel})`
      : `(${scopeLabel})`;
  return `**${fact.statement}** — ${scope}`;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export function projectFacts(project: Project): BibleFact[] {
  const facts: BibleFact[] = [
    { label: "Genre", value: GENRE_META[project.meta.genre].label },
    { label: "Story type", value: STORY_TYPE_META[project.meta.storyType].label },
  ];

  const optional: [string, string | undefined][] = [
    ["Author", project.meta.author],
    ["Tone", project.meta.tone],
    ["Point of view", project.meta.pov],
    ["Tense", project.meta.tense],
    ["Audience", project.meta.audience],
    ["Themes", project.meta.themes.join("; ")],
    ["Content notes", project.meta.contentNotes.join("; ")],
  ];
  for (const [label, value] of optional) {
    if (value?.trim()) facts.push({ label, value: value.trim() });
  }

  facts.push({
    label: "Scope",
    value: [
      `${project.characters.length} ${pluralise(project.characters.length, "character")}`,
      `${project.locations.length} ${pluralise(project.locations.length, "location")}`,
      `${project.rules.length} ${pluralise(project.rules.length, "rule")}`,
      `${project.factions.length} ${pluralise(project.factions.length, "faction")}`,
      `${project.timelineEvents.length} ${pluralise(project.timelineEvents.length, "timeline event")}`,
      `${project.glossary.length} glossary ${pluralise(project.glossary.length, "term")}`,
    ].join(" · "),
  });

  return facts;
}

function castBullets(project: Project): string[] {
  return project.characters.map((character) => {
    const { filled, total } = measureCharacter(project, character);
    return [
      character.name.trim() || "Unnamed",
      CHARACTER_ROLE_META[character.role].label,
      IMPORTANCE_META[character.importance].label,
      `${DEPTH_META[character.depth].label} · ${percent(filled, total)}% complete`,
    ].join(" · ");
  });
}

/**
 * One profile per character, grouped by profile section.
 *
 * Only the fields the character's own depth asks for are printed, and answers
 * stored *above* that depth are not silently dropped: a lowered depth hides
 * fields without deleting them (§4.2), so the bible says so rather than
 * pretending the answers do not exist.
 */
function profileEntries(project: Project, layers: readonly LayerKey[]): BibleEntry[] {
  return project.characters.map((character) => {
    const visible = fieldsForDepth(character.depth, layers);
    const visibleKeys = new Set(visible.map((field) => field.key));
    const hidden = Object.entries(character.fields).filter(
      ([key, value]) => !visibleKeys.has(key) && !isFieldValueEmpty(value),
    ).length;

    const { filled, total } = measureCharacter(project, character);
    const blocks: BibleBlock[] = [
      {
        kind: "facts",
        facts: [
          { label: "Role", value: CHARACTER_ROLE_META[character.role].label },
          { label: "Importance", value: IMPORTANCE_META[character.importance].label },
          { label: "Depth", value: DEPTH_META[character.depth].label },
          { label: "Complete", value: `${filled}/${total} fields · ${percent(filled, total)}%` },
        ],
      },
    ];

    for (const group of Object.keys(FIELD_GROUP_META) as (keyof typeof FIELD_GROUP_META)[]) {
      const answers = visible
        .filter((field) => field.group === group && !isFieldValueEmpty(character.fields[field.key]))
        .map((field) => ({ label: field.label, value: answerText(character.fields[field.key]) }));
      if (answers.length === 0) continue;
      blocks.push({ kind: "subheading", text: FIELD_GROUP_META[group].label });
      blocks.push({ kind: "facts", facts: answers });
    }

    const custom = project.customFields
      .filter((def) => !isFieldValueEmpty(character.custom[def.id]))
      .map((def) => ({ label: def.label, value: answerText(character.custom[def.id]) }));
    if (custom.length > 0) {
      blocks.push({ kind: "subheading", text: "Your own fields" });
      blocks.push({ kind: "facts", facts: custom });
    }

    if (hidden > 0) {
      blocks.push({
        kind: "paragraph",
        text: `${hidden} more ${pluralise(hidden, "answer")} ${pluralise(hidden, "is", "are")} stored above their ${DEPTH_META[character.depth].label} depth and not printed here. Raise the depth to bring them back.`,
      });
    }

    const unanswered = visible.filter((field) => isFieldValueEmpty(character.fields[field.key]));
    if (unanswered.length > 0) {
      blocks.push({
        kind: "paragraph",
        text: `${unanswered.length} ${pluralise(unanswered.length, "field")} at this depth ${pluralise(unanswered.length, "is", "are")} still unanswered.`,
      });
    }

    return {
      id: `character-${character.id}`,
      title: character.name.trim() || "Unnamed",
      blocks,
    };
  });
}

function layersOf(project: Project): readonly LayerKey[] {
  return GENRE_META[project.meta.genre].layers;
}

function worldBlocks(project: Project): BibleBlock[] {
  const blocks: BibleBlock[] = [];

  const setting: BibleFact[] = [];
  const world = project.world;
  if (world.setting?.trim()) setting.push({ label: "Where it happens", value: world.setting.trim() });
  if (world.era?.trim()) setting.push({ label: "When", value: world.era.trim() });
  if (world.techLevel?.trim()) setting.push({ label: "Technology", value: world.techLevel.trim() });
  if (world.differs?.trim()) {
    setting.push({ label: "How it differs", value: world.differs.trim() });
  }
  if (setting.length > 0) blocks.push({ kind: "facts", facts: setting });

  if (world.culture?.trim()) {
    blocks.push({ kind: "subheading", text: "Culture & society" });
    blocks.push({ kind: "paragraph", text: world.culture.trim() });
  }

  if (project.locations.length > 0) {
    blocks.push({ kind: "subheading", text: "Locations" });
    blocks.push({
      kind: "entries",
      entries: project.locations.map((location) => ({
        id: `location-${location.id}`,
        title: location.name.trim() || "Unnamed place",
        blocks: [
          {
            kind: "facts",
            facts: factsFrom([
              ["Type", location.type],
              ["Why it matters", location.significance],
              ["Who is usually there", location.whoIsThere],
              ["Sensory detail", location.sensory],
              ["Description", location.description],
            ]),
          },
        ],
      })),
    });
  }

  if (project.factions.length > 0) {
    blocks.push({ kind: "subheading", text: "Factions & institutions" });
    blocks.push({
      kind: "entries",
      entries: project.factions.map((faction) => {
        const members = faction.memberIds
          .map((id) => nameOf(project, id))
          .filter((name) => name !== "Unnamed");
        return {
          id: `faction-${faction.id}`,
          title: faction.name.trim() || "Unnamed faction",
          blocks: [
            {
              kind: "facts",
              facts: factsFrom([
                ["Purpose", faction.purpose],
                ["Leads it", faction.leader],
                ["Characters inside it", members.length > 0 ? members.join(", ") : undefined],
                ["Notes", faction.notes],
              ]),
            },
          ],
        };
      }),
    });
  }

  return blocks;
}

function factsFrom(pairs: [string, string | undefined][]): BibleFact[] {
  return pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1]?.trim()))
    .map(([label, value]) => ({ label, value: value.trim() }));
}

function ruleBlocks(project: Project): BibleBlock[] {
  return [
    {
      kind: "entries",
      entries: project.rules.map((rule) => {
        const blocks: BibleBlock[] = [
          {
            kind: "facts",
            facts: factsFrom([
              ["What it does", rule.does],
              ["What it costs", rule.cost],
              ["What it cannot do", rule.cannotDo],
              ["Who has access", rule.access],
            ]),
          },
        ];

        const missing = [
          rule.cost.trim() === "" ? "a cost" : null,
          rule.cannotDo.trim() === "" ? "a limit" : null,
        ].filter((part): part is string => part !== null);
        if (missing.length > 0) {
          blocks.push({
            kind: "paragraph",
            text: `This rule has no ${missing.join(" and no ")} yet, which is the part a later scene is most likely to break.`,
          });
        }

        return {
          id: `rule-${rule.id}`,
          title: rule.name.trim() || "Unnamed rule",
          blocks,
        };
      }),
    },
  ];
}

function timelineBullets(project: Project): string[] {
  return sortTimeline(project.timelineEvents).map((event) => {
    const present = event.characterIds
      .map((id) => nameOf(project, id))
      .filter((name) => name !== "Unnamed");
    const line = `${event.when?.trim() || "Undated"} — ${event.label.trim() || "Untitled event"}`;
    const withPresent = present.length > 0 ? `${line} · ${present.join(", ")}` : line;
    return event.notes?.trim() ? `${withPresent} · ${event.notes.trim()}` : withPresent;
  });
}

function glossaryBullets(project: Project): string[] {
  return project.glossary.map((entry) => {
    const aliases = entry.aliases.map((alias) => alias.trim()).filter(Boolean);
    const parts = [entry.term.trim() || "Unnamed term"];
    if (entry.definition.trim()) parts.push(entry.definition.trim());
    if (aliases.length > 0) parts.push(`Also spelled: ${aliases.join(", ")}`);
    return parts.join(" — ");
  });
}

/**
 * §5.7.3, section 10. Two sources, both already in the project: the questions
 * the writer wrote down on a profile, and the ones the checker raises rather
 * than answers — an uneven relationship being the commonest (§5.4.6).
 */
export function openQuestionBullets(project: Project): string[] {
  const bullets: string[] = [];

  for (const character of project.characters) {
    for (const question of character.openQuestions) {
      if (question.trim()) bullets.push(`${character.name.trim() || "Unnamed"}: ${question.trim()}`);
    }
  }

  const questions = runContinuityCheck(project).findings.filter(
    (finding) => finding.severity === "question",
  );
  for (const finding of questions) {
    bullets.push(`${finding.title} — ${finding.detail}`);
  }

  return bullets;
}

// ---------------------------------------------------------------------------
// Compiling
// ---------------------------------------------------------------------------

/**
 * §5.7.3's ten sections, in order, with the empty ones left out.
 *
 * The cast, the profiles and the open questions appear as soon as there is a
 * character to write about; the world sections appear once the writer has put
 * something in the world. That keeps a bible from a two-character project
 * readable, and makes `pending` an honest to-do list.
 */
export function compileBible(project: Project): BibleDocument {
  const layers = layersOf(project);
  const canon = project.canonFacts.map((fact) => canonBullet(project, fact));
  const cast = castBullets(project);
  const relationships = relationshipMapText(project);
  const world = worldBlocks(project);
  const timeline = timelineBullets(project);
  const glossary = glossaryBullets(project);
  const openQuestions = openQuestionBullets(project);
  const hasCharacters = project.characters.length > 0;

  // §5.7.3's ten sections, in its order, each with a `filled` flag. Numbering
  // and omission are then two separate decisions.
  const candidates: { section: Omit<BibleSection, "number">; filled: boolean }[] = [
    {
      section: {
        id: "project-facts",
        title: "Project facts",
        blocks: [{ kind: "facts", facts: projectFacts(project) }],
      },
      filled: true,
    },
    {
      section: {
        id: "protected-canon",
        title: "Protected canon — do not change",
        blocks: [{ kind: "bullets", items: canon }],
      },
      filled: canon.length > 0,
    },
    {
      section: {
        id: "cast",
        title: "Cast overview",
        blocks: [{ kind: "bullets", items: cast }],
      },
      filled: hasCharacters,
    },
    {
      section: {
        id: "profiles",
        title: "Character profiles",
        blocks: [{ kind: "entries", entries: profileEntries(project, layers) }],
      },
      filled: hasCharacters,
    },
    {
      section: {
        id: "relationships",
        title: "Relationships",
        blocks: [{ kind: "markdown", text: relationships }],
      },
      filled: relationships !== "",
    },
    {
      section: { id: "world", title: "World & locations", blocks: world },
      filled: world.length > 0,
    },
    {
      section: {
        id: "rules",
        title: "Rules & systems",
        blocks: project.rules.length > 0 ? ruleBlocks(project) : [],
      },
      filled: project.rules.length > 0,
    },
    {
      section: {
        id: "timeline",
        title: "Timeline",
        blocks: [{ kind: "bullets", items: timeline }],
      },
      filled: timeline.length > 0,
    },
    {
      section: {
        id: "glossary",
        title: "Glossary",
        blocks: [{ kind: "bullets", items: glossary }],
      },
      filled: glossary.length > 0,
    },
    {
      section: {
        id: "open-questions",
        title: "Open questions for the collaborator",
        blocks: [{ kind: "bullets", items: openQuestions }],
      },
      filled: openQuestions.length > 0 || hasCharacters,
    },
  ];

  const sections: BibleSection[] = [];
  const pending: string[] = [];
  candidates.forEach(({ section, filled }, index) => {
    if (filled) sections.push({ ...section, number: index + 1 });
    else pending.push(section.title);
  });

  // Counted by entry, not by `glossaryTerms`: that counts every spelling a term
  // is allowed to appear as, aliases included, so a two-term glossary with two
  // aliases would be announced as four terms — and contradicted by the Scope
  // fact of section 1, which counts entries.
  const terms = project.glossary.length;
  const subtitle = [
    `${project.characters.length} ${pluralise(project.characters.length, "character")}`,
    `${project.locations.length} ${pluralise(project.locations.length, "location")}`,
    `${project.rules.length} ${pluralise(project.rules.length, "rule")}`,
    `${terms} glossary ${pluralise(terms, "term")}`,
  ].join(" · ");

  return {
    title: project.meta.title.trim() || "Untitled project",
    label: "Story Bible",
    subtitle,
    disclosure: BIBLE_DISCLOSURE,
    sections,
    pending,
    pageBreakSections: true,
  };
}

// ---------------------------------------------------------------------------
// Table of contents and text
// ---------------------------------------------------------------------------

export interface TocEntry {
  id: string;
  /** §5.7.3's number for the section, which its heading also carries. */
  number: number;
  label: string;
  /** Per-character, per-location and per-rule jump links (§5.7.2). */
  children: { id: string; label: string }[];
}

/** The document's own contents, derived from it so an anchor can never dangle. */
export function tableOfContents(bible: BibleDocument): TocEntry[] {
  return bible.sections.map((section) => ({
    id: section.id,
    number: section.number,
    label: section.title,
    children: section.blocks.flatMap((block) =>
      block.kind === "entries"
        ? block.entries.map((entry) => ({ id: entry.id, label: entry.title }))
        : [],
    ),
  }));
}

export function blocksToMarkdown(
  blocks: readonly BibleBlock[],
  depth: number,
): string[] {
  const lines: string[] = [];

  for (const block of blocks) {
    switch (block.kind) {
      case "paragraph":
        lines.push(block.text, "");
        break;
      case "facts":
        for (const fact of block.facts) lines.push(`- **${fact.label}**: ${fact.value}`);
        lines.push("");
        break;
      case "bullets":
        for (const item of block.items) lines.push(`- ${item}`);
        lines.push("");
        break;
      case "subheading":
        lines.push(`${"#".repeat(depth)} ${block.text}`, "");
        break;
      case "markdown":
        lines.push(block.text, "");
        break;
      case "entries": {
        for (const entry of block.entries) {
          lines.push(`${"#".repeat(depth)} ${entry.title}`, "");
          lines.push(...blocksToMarkdown(entry.blocks, depth + 1));
        }
        break;
      }
    }
  }

  return lines;
}

/**
 * The bible as Markdown: the clipboard copy now, and the base of the Markdown
 * and DOCX serialisers in Phase E. Deterministic, so a test can pin it.
 */
export function bibleToText(bible: BibleDocument): string {
  const lines = [
    `# ${bible.title} — ${bible.label}`,
    "",
    `${bible.subtitle}`,
    "",
    `_${bible.disclosure}_`,
    "",
  ];

  for (const section of bible.sections) {
    lines.push(`## ${section.number}. ${section.title}`, "");
    lines.push(...blocksToMarkdown(section.blocks, 3));
  }

  if (bible.pending.length > 0) {
    lines.push(
      `_Still to come in this bible: ${bible.pending.join(" · ")}._`,
      "",
    );
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}
