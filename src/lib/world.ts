/**
 * World helpers (DEVELOPMENT.md §5.5).
 *
 * Everything here is a pure read over the stored project. The editors use these
 * to keep their counts and warnings honest, and the Phase D checker will use
 * the same functions rather than re-deriving the same answers.
 */

import type {
  Character,
  Faction,
  Project,
  Rule,
  TimelineEvent,
} from "./schema";

/**
 * Sort events by `order`, leaving ties in storage order so two events that
 * share an order value never swap places between renders.
 */
export function sortTimeline(
  events: readonly TimelineEvent[],
): TimelineEvent[] {
  return events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => a.event.order - b.event.order || a.index - b.index)
    .map((entry) => entry.event);
}

/** Timeline events in the order the writer arranged them (§5.5.6). */
export function timelineInOrder(project: Project): TimelineEvent[] {
  return sortTimeline(project.timelineEvents);
}

/** The order value a newly appended event should take. */
export function nextTimelineOrder(events: readonly TimelineEvent[]): number {
  return events.reduce((highest, event) => Math.max(highest, event.order + 1), 0);
}

/**
 * Move one event a step earlier or later, renumbering the whole timeline.
 *
 * Renumbering rather than swapping keeps the stored orders a dense 0..n-1
 * sequence, which is what makes a hand-edited import with duplicate orders
 * self-correct the first time the writer touches it. Returns the same array
 * when the move is impossible (an unknown id, or already at the end).
 */
export function reorderedTimeline(
  events: readonly TimelineEvent[],
  id: string,
  direction: -1 | 1,
): TimelineEvent[] {
  const ordered = sortTimeline(events);
  const from = ordered.findIndex((event) => event.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ordered.length) return [...events];

  const moved = [...ordered];
  const [event] = moved.splice(from, 1);
  if (!event) return [...events];
  moved.splice(to, 0, event);

  return moved.map((entry, index) =>
    entry.order === index ? entry : { ...entry, order: index },
  );
}

/**
 * Rules still missing the limit that stops them bending later (§5.5.3).
 *
 * `cost` and `cannotDo` are the two fields the spec calls load-bearing, so a
 * rule without them is reported rather than silently accepted.
 */
export function rulesWithGaps(project: Project): Rule[] {
  return project.rules.filter(
    (rule) => rule.cost.trim() === "" || rule.cannotDo.trim() === "",
  );
}

/**
 * The members of a faction, in cast order, with dangling ids skipped.
 *
 * The cast is the authority on who exists: `removeCharacter` detaches deleted
 * characters, but an imported project may still name someone who is gone.
 */
export function charactersInFaction(project: Project, faction: Faction): Character[] {
  const members = new Set(faction.memberIds);
  return project.characters.filter((character) => members.has(character.id));
}

/** The characters attached to one timeline event, in cast order. */
export function charactersAtEvent(
  project: Project,
  event: TimelineEvent,
): Character[] {
  const attached = new Set(event.characterIds);
  return project.characters.filter((character) => attached.has(character.id));
}

/**
 * The canonical spellings a glossary term is allowed to appear as: the term
 * itself, plus every alias the writer declared (§5.5.7).
 *
 * This is what the Phase D spelling check compares prose fields against. Blank
 * aliases are dropped and repeats are removed case-insensitively, because a
 * term and its alias differing only in case is not a conflict — it is noise.
 */
export function glossaryTerms(project: Project): { id: string; term: string }[] {
  const seen = new Set<string>();
  const terms: { id: string; term: string }[] = [];

  for (const entry of project.glossary) {
    for (const spelling of [entry.term, ...entry.aliases]) {
      const trimmed = spelling.trim();
      const key = trimmed.toLowerCase();
      if (!trimmed || seen.has(key)) continue;
      seen.add(key);
      terms.push({ id: entry.id, term: trimmed });
    }
  }

  return terms;
}

/**
 * Comma- or newline-separated alias input from the editor.
 *
 * Both separators are accepted because a writer may paste either, and a term
 * containing a comma is rare enough that the convenience is worth it.
 */
export function parseAliasList(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(/[\n,]/)
    .map((alias) => alias.trim())
    .filter((alias) => {
      const key = alias.toLowerCase();
      if (!alias || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export interface WorldCounts {
  locations: number;
  rules: number;
  factions: number;
  timelineEvents: number;
  glossary: number;
  /** Rules missing a cost or a limit — surfaced next to the rules heading. */
  rulesWithGaps: number;
}

export function worldCounts(project: Project): WorldCounts {
  return {
    locations: project.locations.length,
    rules: project.rules.length,
    factions: project.factions.length,
    timelineEvents: project.timelineEvents.length,
    glossary: project.glossary.length,
    rulesWithGaps: rulesWithGaps(project).length,
  };
}

/** Whether the writer has written anything in the world section at all. */
export function worldIsEmpty(project: Project): boolean {
  const counts = worldCounts(project);
  return (
    counts.locations === 0 &&
    counts.rules === 0 &&
    counts.factions === 0 &&
    counts.timelineEvents === 0 &&
    counts.glossary === 0 &&
    Object.values(project.world).every((value) => !value?.trim())
  );
}
