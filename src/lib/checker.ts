/**
 * The continuity checker (DEVELOPMENT.md §5.6).
 *
 * It is deterministic and honest, and both halves of that matter:
 *
 *  - **Deterministic**: it reads only the stored project and applies fixed
 *    rules. No AI, no network, no heuristics that change their mind.
 *  - **Honest**: it reports what is missing or structurally inconsistent in the
 *    answers the writer *entered*. It never claims to have read the manuscript
 *    — see `CHECKER_DISCLOSURE` and the copy test in `src/test/checker.test.ts`.
 *
 * Findings carry a `severity`, because §5.6.1 distinguishes a **gap** (a field
 * the character's own depth asks for, unanswered) from an **opportunity** (a
 * deeper field they could still answer). §5.4.6 makes an uneven relationship a
 * **question** rather than an error.
 */

import {
  FIELD_GROUP_META,
  FIELD_GROUPS,
  fieldsForDepth,
  type FieldDef,
  type FieldGroupKey,
} from "./fields";
import { relationshipsFor } from "./relationships";
import {
  fieldValueToText,
  isFieldValueEmpty,
  type Character,
  type Project,
} from "./schema";
import { GENRE_META } from "./taxonomy";
import { pluralise } from "./utils";
import { rulesWithGaps } from "./world";

export const FINDING_KINDS = [
  "missing-field",
  "duplicate-name",
  "orphan-character",
  "glossary-spelling",
  "impossible-age",
  "rule-without-limit",
  "one-sided-relationship",
] as const;
export type FindingKind = (typeof FINDING_KINDS)[number];

/** Presentation order: what to fix, then what to decide, then what to add. */
export const FINDING_SEVERITIES = ["gap", "question", "opportunity"] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const SEVERITY_META: Record<
  FindingSeverity,
  { label: string; blurb: string }
> = {
  gap: {
    label: "Gaps",
    blurb: "Something the bible still owes the story before someone else reads it.",
  },
  question: {
    label: "Questions",
    blurb: "Decisions only the writer can make. Listed, not held against you.",
  },
  opportunity: {
    label: "Opportunities",
    blurb: "Depth these characters have room for, at the depth you chose.",
  },
};

export interface Finding {
  id: string;
  kind: FindingKind;
  severity: FindingSeverity;
  /** What is wrong, in the writer's own terms. */
  title: string;
  /** The evidence: the values, names and dates the finding was read from. */
  detail: string;
  /** Characters the finding is about, so the report can link back to them. */
  characterIds: string[];
  /** Set on glossary findings, for the same reason. */
  glossaryEntryId?: string;
}

export interface Coverage {
  /** Characters that answer every field their own depth asks for. */
  completeCharacters: number;
  totalCharacters: number;
  fieldsFilled: number;
  fieldsAsked: number;
}

export interface ContinuityReport {
  findings: Finding[];
  coverage: Coverage;
  /** Findings per kind, for the measurement plan (§9.1). */
  byKind: Record<FindingKind, number>;
}

/**
 * §1.3, rule 2: the checker is honest about what it read. Kept here rather than
 * in the component so a test can hold the copy to it.
 */
export const CHECKER_DISCLOSURE =
  "This reads the answers in this bible and nothing else. It does not read your manuscript, and it cannot tell you whether the story works.";

/**
 * Years of slack before an event's date is held against a stated age: a writer
 * may round an age, and a story may run over a year or two.
 */
export const AGE_TOLERANCE_YEARS = 2;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export function normaliseTerm(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, " ");
}

function tokens(text: string): string[] {
  return normaliseTerm(text).split(/[^\p{L}\p{N}']+/u).filter(Boolean);
}

/** Levenshtein distance. Small strings only — this is a bible, not a corpus. */
export function editDistance(a: string, b: string): number {
  const width = b.length + 1;
  let previous = Array.from({ length: width }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = new Array<number>(width).fill(0);
    current[0] = i;
    for (let j = 1; j < width; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, substitution);
    }
    previous = current;
  }

  return previous[width - 1];
}

/**
 * Two spellings one character apart, and long enough for that to mean
 * something. Short words differ by one letter all the time — "the" and "then"
 * are not a spelling conflict.
 */
export function isNearDuplicate(a: string, b: string): boolean {
  const left = normaliseTerm(a);
  const right = normaliseTerm(b);
  if (left === right) return false;
  if (Math.min(left.length, right.length) < 5) return false;
  if (Math.abs(left.length - right.length) > 1) return false;
  return editDistance(left, right) <= 1;
}

/** A whole number out of a free-text field, or null if there is not one. */
function parseCount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

/** The first year-like number in a date field ("1890", "Winter 1890"). */
function parseYear(value: string | undefined): number | null {
  if (!value) return null;
  const match = /\d{3,4}/.exec(value);
  return match ? Number(match[0]) : null;
}

/** Group missing fields by the section of the profile they belong to. */
function groupBySection(fields: readonly FieldDef[]): Map<FieldGroupKey, FieldDef[]> {
  const grouped = new Map<FieldGroupKey, FieldDef[]>();
  for (const group of FIELD_GROUPS) {
    const inGroup = fields.filter((field) => field.group === group);
    if (inGroup.length > 0) grouped.set(group, inGroup);
  }
  return grouped;
}

function describeSections(fields: readonly FieldDef[]): string {
  return [...groupBySection(fields).entries()]
    .map(
      ([group, inGroup]) =>
        `${FIELD_GROUP_META[group].label}: ${inGroup.map((f) => f.label).join(", ")}`,
    )
    .join("\n");
}

function nameOfCharacter(character: Character): string {
  return character.name.trim() || "This character";
}

/** Every piece of writer-entered text, for the glossary's usage scan. */
function proseOf(project: Project): string[] {
  const parts: string[] = [];

  for (const character of project.characters) {
    parts.push(character.name);
    for (const value of Object.values(character.fields)) {
      parts.push(fieldValueToText(value));
    }
    for (const value of Object.values(character.custom)) {
      parts.push(fieldValueToText(value));
    }
    parts.push(...character.openQuestions);
  }

  for (const relationship of project.relationships) {
    parts.push(relationship.nature ?? "", relationship.tension ?? "", relationship.secret ?? "");
  }

  for (const location of project.locations) {
    parts.push(
      location.name,
      location.description ?? "",
      location.significance ?? "",
      location.whoIsThere ?? "",
      location.sensory ?? "",
    );
  }

  for (const rule of project.rules) {
    parts.push(rule.name, rule.does, rule.cost, rule.cannotDo, rule.access ?? "");
  }

  for (const faction of project.factions) {
    parts.push(faction.name, faction.purpose ?? "", faction.leader ?? "", faction.notes ?? "");
  }

  for (const event of project.timelineEvents) {
    parts.push(event.label, event.when ?? "", event.notes ?? "");
  }

  for (const entry of project.glossary) {
    parts.push(entry.definition);
  }

  for (const fact of project.canonFacts) {
    parts.push(fact.statement);
  }

  parts.push(...Object.values(project.world).filter((value): value is string => Boolean(value)));

  return parts;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/**
 * §5.6.1 — the missing-field report, depth-aware.
 *
 * Only the fields the character's own depth asks for are considered: a Quick
 * character is not nagged about a Deep field they have not chosen. Among those,
 * an unanswered Quick field is a gap and an unanswered Standard or Deep field
 * is an opportunity. One finding per character per severity, so a thin
 * character is one line in the report rather than thirty.
 */
function missingFieldFindings(project: Project): Finding[] {
  const layers = GENRE_META[project.meta.genre].layers;
  const findings: Finding[] = [];

  for (const character of project.characters) {
    const visible = fieldsForDepth(character.depth, layers);
    const missing = visible.filter((field) => isFieldValueEmpty(character.fields[field.key]));

    const core = missing.filter((field) => field.tier === "quick");
    const deeper = missing.filter((field) => field.tier !== "quick");

    if (core.length > 0) {
      findings.push({
        id: `missing-field:core:${character.id}`,
        kind: "missing-field",
        severity: "gap",
        title: `${nameOfCharacter(character)} has ${core.length} unanswered Quick ${pluralise(core.length, "field")}`,
        detail: singleHelp(core, describeSections(core)),
        characterIds: [character.id],
      });
    }

    if (deeper.length > 0) {
      findings.push({
        id: `missing-field:deeper:${character.id}`,
        kind: "missing-field",
        severity: "opportunity",
        title: `${nameOfCharacter(character)} could answer ${deeper.length} more ${pluralise(deeper.length, "field")}`,
        detail: describeSections(deeper),
        characterIds: [character.id],
      });
    }
  }

  return findings;
}

/** With one field missing, the field's own help line is the most useful thing to print. */
function singleHelp(fields: readonly FieldDef[], detail: string): string {
  const only = fields.length === 1 ? fields[0] : undefined;
  return only ? `${detail}\n${only.label} — ${only.help}` : detail;
}

/**
 * §5.6.3 — duplicate and near-duplicate names.
 *
 * One finding per group of characters sharing a name, and one per group
 * sharing only a first name. A pair caught by the first is not reported twice
 * by the second: the exact collision is the finding, and saying it twice would
 * be noise.
 */
function duplicateNameFindings(project: Project): Finding[] {
  const named = project.characters.filter((character) => character.name.trim() !== "");
  const findings: Finding[] = [];
  const inFullDuplicate = new Set<string>();

  const byFullName = new Map<string, Character[]>();
  for (const character of named) {
    const key = normaliseTerm(character.name);
    byFullName.set(key, [...(byFullName.get(key) ?? []), character]);
  }

  for (const group of byFullName.values()) {
    if (group.length < 2) continue;
    group.forEach((character) => inFullDuplicate.add(character.id));

    const spelled = new Set(group.map((character) => character.name.trim()));
    const shown = group[0] ? nameOfCharacter(group[0]) : "This name";
    findings.push({
      id: `duplicate-name:${group.map((character) => character.id).join("+")}`,
      kind: "duplicate-name",
      severity: "gap",
      title: `${group.length} characters share the name "${shown}"`,
      detail:
        spelled.size > 1
          ? `Stored as ${[...spelled].map((name) => `"${name}"`).join(" and ")} — the same name with the capitalisation or spacing changed. Give them a way to be told apart.`
          : "Two people with one name is a scene a reader cannot follow. Give them a way to be told apart.",
      characterIds: group.map((character) => character.id),
    });
  }

  const byFirstName = new Map<string, Character[]>();
  for (const character of named) {
    if (inFullDuplicate.has(character.id)) continue;
    const first = tokens(character.name)[0];
    if (!first) continue;
    byFirstName.set(first, [...(byFirstName.get(first) ?? []), character]);
  }

  for (const [first, group] of byFirstName) {
    if (group.length < 2) continue;

    // The first name as the writer typed it, not as it was normalised.
    const spelled = group[0]?.name.trim().split(/\s+/)[0] || first;
    findings.push({
      id: `duplicate-name:first:${group.map((character) => character.id).join("+")}`,
      kind: "duplicate-name",
      severity: "question",
      title: `${group.length} characters share the first name "${spelled}"`,
      detail: `${group.map(nameOfCharacter).join(", ")} — different people, one name to keep straight. Add a surname, a title or a nickname if they ever share a page.`,
      characterIds: group.map((character) => character.id),
    });
  }

  return findings;
}

/**
 * §5.4.5 — a character with no relationships.
 *
 * Scoped to casts of two or more: with a cast of one there is nobody to be
 * linked to, which is why `clean-minimal` expects zero findings.
 */
function orphanFindings(project: Project): Finding[] {
  if (project.characters.length < 2) return [];

  return project.characters
    .filter((character) => relationshipsFor(project, character.id).length === 0)
    .map((character) => ({
      id: `orphan-character:${character.id}`,
      kind: "orphan-character" as const,
      severity: "gap" as const,
      title: `${nameOfCharacter(character)} has no relationships`,
      detail: `The cast has ${project.characters.length} characters and none of them are connected to ${nameOfCharacter(character)}. Add one on their profile, or leave them as a walk-on.`,
      characterIds: [character.id],
    }));
}

/**
 * §5.6.4 — glossary spelling conflicts, in the two places they happen.
 *
 *  1. An alias one letter from its own term is a typo the writer meant to
 *     delete, because a legitimate alternative spelling is rarely one character
 *     away from the canonical one.
 *  2. A near-miss of a declared spelling used elsewhere in the bible is a
 *     second spelling already in the project.
 */
function glossaryFindings(project: Project): Finding[] {
  const findings: Finding[] = [];

  for (const entry of project.glossary) {
    const aliases = entry.aliases
      .map((alias) => alias.trim())
      .filter((alias) => alias !== "");
    const typos = aliases.filter((alias) => isNearDuplicate(alias, entry.term));

    if (typos.length > 0) {
      findings.push({
        id: `glossary-spelling:alias:${entry.id}`,
        kind: "glossary-spelling",
        severity: "gap",
        title: `"${typos.join('", "')}" ${pluralise(typos.length, "is", "are")} one letter away from "${entry.term}"`,
        detail: `You listed ${typos.length === 1 ? "this as one of the correct spellings" : "these as correct spellings"}. If it is a typo, remove it; if it really is a second spelling, the reader will need it to be deliberate.`,
        characterIds: [],
        glossaryEntryId: entry.id,
      });
    }
  }

  // Every declared spelling for an entry, and a scan of the prose for variants.
  const prose = tokens(proseOf(project).join("\n"));

  for (const entry of project.glossary) {
    const declared = [entry.term, ...entry.aliases]
      .map((spelling) => normaliseTerm(spelling))
      .filter((spelling) => spelling !== "");
    const declaredSet = new Set(declared);
    const offenders = new Set<string>();

    for (const spelling of declaredSet) {
      const size = tokens(spelling).length;
      if (size === 0) continue;

      for (let start = 0; start + size <= prose.length; start += 1) {
        const phrase = prose.slice(start, start + size).join(" ");
        if (declaredSet.has(phrase)) continue;
        if (isNearDuplicate(phrase, spelling)) offenders.add(phrase);
      }
    }

    if (offenders.size === 0) continue;
    findings.push({
      id: `glossary-spelling:usage:${entry.id}`,
      kind: "glossary-spelling",
      severity: "gap",
      title: `More than one spelling of "${entry.term}" is in use`,
      detail: `Elsewhere in the bible: ${[...offenders].map((phrase) => `"${phrase}"`).join(", ")}. Keep one, or add the others as aliases so they are not treated as mistakes.`,
      characterIds: [],
      glossaryEntryId: entry.id,
    });
  }

  return findings;
}

/**
 * §5.6.5 — a birth year and a timeline event that cannot both be true.
 *
 * The stated age is read as the age the story opens, so birth year + age is the
 * present. A character attached to an event is a character who was there: an
 * event before their birth, or one dated well after the present, contradicts
 * one of the three numbers the writer entered.
 */
function ageFindings(project: Project): Finding[] {
  const findings: Finding[] = [];

  for (const character of project.characters) {
    const age = parseCount(fieldValueToText(character.fields.age));
    const birthYear = parseCount(fieldValueToText(character.fields.birthYear));
    if (age === null || birthYear === null) continue;

    const opens = birthYear + age;
    const conflicts: string[] = [];

    for (const event of project.timelineEvents) {
      if (!event.characterIds.includes(character.id)) continue;
      const year = parseYear(event.when);
      if (year === null) continue;

      if (year < birthYear) {
        conflicts.push(`"${event.label}" (${year}) happens before they were born`);
      } else if (year > opens + AGE_TOLERANCE_YEARS) {
        conflicts.push(
          `"${event.label}" (${year}) would make them ${year - birthYear}`,
        );
      }
    }

    if (conflicts.length === 0) continue;

    findings.push({
      id: `impossible-age:${character.id}`,
      kind: "impossible-age",
      severity: "gap",
      title: `${nameOfCharacter(character)}'s age and the timeline cannot both be true`,
      detail: `${nameOfCharacter(character)} is ${age} and born in ${birthYear}, so the story opens around ${opens}. ${conflicts.join("; ")}. One of the three — the age, the birth year, or the event's date — has to change.`,
      characterIds: [character.id],
    });
  }

  return findings;
}

/** §5.5.3 — a rule with no cost or no limit is the one a later chapter bends. */
function ruleGapFindings(project: Project): Finding[] {
  return rulesWithGaps(project).map((rule) => {
    const missing = [
      rule.cost.trim() === "" ? "cost" : null,
      rule.cannotDo.trim() === "" ? "limit" : null,
    ].filter((part): part is string => part !== null);

    return {
      id: `rule-without-limit:${rule.id}`,
      kind: "rule-without-limit" as const,
      severity: "gap" as const,
      title: `The rule "${rule.name}" has no ${missing.join(" and no ")}`,
      detail:
        "A rule without a cost or a stated limit is the one that gets bent by accident. Fill it in while the answer is still obvious.",
      characterIds: [],
    };
  });
}

/**
 * §5.4.6 — a relationship the two sides read differently, reported as an open
 * question rather than an error, because an uneven relationship is usually
 * deliberate.
 */
function asymmetryFindings(project: Project): Finding[] {
  const names = new Map(project.characters.map((c) => [c.id, nameOfCharacter(c)]));

  return project.relationships
    .filter((relationship) => (relationship.asymmetryNote ?? "").trim() !== "")
    .map((relationship) => ({
      id: `one-sided-relationship:${relationship.id}`,
      kind: "one-sided-relationship" as const,
      severity: "question" as const,
      title: `${names.get(relationship.fromId) ?? "Someone"} and ${names.get(relationship.toId) ?? "someone"} read this relationship differently`,
      detail: `${relationship.asymmetryNote} — worth keeping in the bible so a collaborator does not flatten it by accident.`,
      characterIds: [relationship.fromId, relationship.toId],
    }));
}

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

const SEVERITY_ORDER = new Map(FINDING_SEVERITIES.map((severity, index) => [severity, index]));
const KIND_ORDER = new Map(FINDING_KINDS.map((kind, index) => [kind, index]));

/**
 * Run every rule and return the report (§5.6).
 *
 * Ordering is severity first (gaps, then questions, then opportunities), then
 * rule order, then id — deterministic, so two runs of an unchanged project give
 * an identical report and the UI never reshuffles under the writer.
 */
export function runContinuityCheck(project: Project): ContinuityReport {
  const findings = [
    ...missingFieldFindings(project),
    ...duplicateNameFindings(project),
    ...orphanFindings(project),
    ...glossaryFindings(project),
    ...ageFindings(project),
    ...ruleGapFindings(project),
    ...asymmetryFindings(project),
  ].sort(
    (a, b) =>
      (SEVERITY_ORDER.get(a.severity) ?? 0) - (SEVERITY_ORDER.get(b.severity) ?? 0) ||
      (KIND_ORDER.get(a.kind) ?? 0) - (KIND_ORDER.get(b.kind) ?? 0) ||
      a.id.localeCompare(b.id),
  );

  const byKind = Object.fromEntries(FINDING_KINDS.map((kind) => [kind, 0])) as Record<
    FindingKind,
    number
  >;
  for (const finding of findings) byKind[finding.kind] += 1;

  return { findings, coverage: measureCoverage(project), byKind };
}

/** The coverage meter of §5.6.8: how much of the bible answers what it asks. */
export function measureCoverage(project: Project): Coverage {
  const layers = GENRE_META[project.meta.genre].layers;

  let fieldsFilled = 0;
  let fieldsAsked = 0;
  let completeCharacters = 0;

  for (const character of project.characters) {
    const visible = fieldsForDepth(character.depth, layers);
    const filled = visible.filter(
      (field) => !isFieldValueEmpty(character.fields[field.key]),
    ).length;

    fieldsFilled += filled;
    fieldsAsked += visible.length;
    if (visible.length > 0 && filled === visible.length) completeCharacters += 1;
  }

  return {
    completeCharacters,
    totalCharacters: project.characters.length,
    fieldsFilled,
    fieldsAsked,
  };
}

/**
 * The report as text, grouped by severity — the block a writer can paste into a
 * note to themselves, and (from Phase E) a section of the compiled bible.
 * Returns an empty string when there is nothing to report.
 */
export function reportText(report: ContinuityReport): string {
  if (report.findings.length === 0) return "";

  const sections = FINDING_SEVERITIES.map((severity) => {
    const inSeverity = report.findings.filter((finding) => finding.severity === severity);
    if (inSeverity.length === 0) return null;

    const lines = inSeverity.map(
      (finding) =>
        `- **${finding.title}**\n  ${finding.detail.replace(/\n/g, "\n  ")}`,
    );
    return `**${SEVERITY_META[severity].label}**\n${lines.join("\n")}`;
  }).filter((section): section is string => section !== null);

  return sections.join("\n\n");
}
