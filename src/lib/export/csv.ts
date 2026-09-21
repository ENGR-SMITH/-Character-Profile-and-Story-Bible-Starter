/**
 * The cast CSV (§5.9): one row per character, one column per field.
 *
 * Written to RFC 4180, and with a UTF-8 byte order mark, because the file's
 * destination is a spreadsheet — Excel reads a BOM-less UTF-8 file as the local
 * codepage and mangles every accented name in it.
 */

import { FIELDS } from "../fields";
import { fieldValueToText, type Project } from "../schema";
import {
  CHARACTER_ROLE_META,
  DEPTH_META,
  IMPORTANCE_META,
} from "../taxonomy";
import { percent } from "../utils";
import { measureCharacter } from "../schema";

/** RFC 4180: quote when the value contains a comma, a quote or a newline. */
export function csvValue(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function csvRow(values: readonly string[]): string {
  return values.map(csvValue).join(",");
}

export function castCsv(project: Project): string {
  const columns = [
    "Name",
    "Role",
    "Importance",
    "Depth",
    "Complete %",
    ...FIELDS.map((field) => field.label),
    ...project.customFields.map((def) => def.label),
  ];

  const rows = project.characters.map((character) => {
    const { filled, total } = measureCharacter(project, character);
    return csvRow([
      character.name,
      CHARACTER_ROLE_META[character.role].label,
      IMPORTANCE_META[character.importance].label,
      DEPTH_META[character.depth].label,
      String(percent(filled, total)),
      // A list answer joins on one line, so a row stays a row.
      ...FIELDS.map((field) =>
        fieldValueToText(character.fields[field.key]).replace(/\s*\n\s*/g, "; "),
      ),
      ...project.customFields.map((def) =>
        fieldValueToText(character.custom[def.id]).replace(/\s*\n\s*/g, "; "),
      ),
    ]);
  });

  return `\uFEFF${[csvRow(columns), ...rows].join("\r\n")}\r\n`;
}
