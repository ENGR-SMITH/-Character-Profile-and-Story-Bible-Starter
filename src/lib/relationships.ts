/**
 * Relationships (DEVELOPMENT.md §5.4).
 *
 * A relationship is stored **once** (§5.4.1) and rendered from both sides, so
 * nothing is duplicated across characters. Everything here reads that single
 * row and works out which side a given character is on; nothing stores a
 * reverse entry. The text map is the export-facing view of the same rows,
 * grouped by type for the compiled bible (§5.4.3).
 */

import type { Character, Project, Relationship } from "./schema";
import {
  RELATIONSHIP_STATUS_META,
  RELATIONSHIP_TYPE_META,
  RELATIONSHIP_TYPES,
  type RelationshipType,
} from "./taxonomy";

/** A relationship as seen from one character: the row, plus the other party. */
export interface CharacterRelationship {
  relationship: Relationship;
  other: Character;
}

/**
 * Every relationship a character is part of, from either side of the row.
 *
 * Rows pointing at a character that no longer exists are skipped rather than
 * crashing: `removeCharacter` deletes them, but a hand-edited JSON import may
 * not have been so careful.
 */
export function relationshipsFor(
  project: Project,
  characterId: string,
): CharacterRelationship[] {
  const byId = new Map(project.characters.map((character) => [character.id, character]));

  return project.relationships
    .filter(
      (relationship) =>
        relationship.fromId === characterId || relationship.toId === characterId,
    )
    .map((relationship) => ({
      relationship,
      other: byId.get(
        relationship.fromId === characterId ? relationship.toId : relationship.fromId,
      ),
    }))
    .filter((entry): entry is CharacterRelationship => entry.other !== undefined);
}

export function nameOf(project: Project, characterId: string): string {
  const character = project.characters.find((candidate) => candidate.id === characterId);
  return character?.name.trim() || "Unnamed";
}

/** How many relationships a character is part of. Drives the unlinked warning. */
export function relationshipCount(project: Project, characterId: string): number {
  return relationshipsFor(project, characterId).length;
}

function describe(relationship: Relationship): string {
  const detail: string[] = [];
  if (relationship.nature) detail.push(relationship.nature);
  if (relationship.tension) detail.push(`Tension: ${relationship.tension}`);
  if (relationship.secret) detail.push(`Secret: ${relationship.secret}`);
  if (relationship.status && relationship.status !== "open") {
    detail.push(`Status: ${RELATIONSHIP_STATUS_META[relationship.status].label.toLowerCase()}`);
  }
  return detail.join(". ");
}

/**
 * The relationship map as text, grouped by type, for the compiled bible
 * (§5.4.3). Each row is rendered once with both names, because that is how it
 * is stored — a bidirectional row, not two one-sided entries.
 *
 * Returns the block *without* a top-level heading, so the bible and the tool can
 * each supply their own. An empty string means there is nothing to print.
 */
export function relationshipMapText(project: Project): string {
  if (project.relationships.length === 0) return "";

  const sections = RELATIONSHIP_TYPES.map((type: RelationshipType) => {
    const rows = project.relationships.filter((relationship) => relationship.type === type);
    if (rows.length === 0) return null;

    const lines = rows.map((relationship) => {
      let line = `- **${nameOf(project, relationship.fromId)}** ↔ **${nameOf(
        project,
        relationship.toId,
      )}**`;
      const detail = describe(relationship);
      if (detail) line += ` — ${detail}`;
      if (relationship.asymmetryNote) {
        // §5.4.6: an uneven relationship is an open question, not an error, so
        // it is noted in the writer's own terms rather than flagged.
        line += `\n  - The two sides read it differently: ${relationship.asymmetryNote}`;
      }
      return line;
    });

    return `**${RELATIONSHIP_TYPE_META[type].label}**\n${lines.join("\n")}`;
  }).filter((section): section is string => section !== null);

  return sections.join("\n\n");
}
