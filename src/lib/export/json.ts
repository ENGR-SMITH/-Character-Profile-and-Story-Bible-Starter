/**
 * The JSON export (§5.9) — the round-trip format, and the one the Authors Den
 * import is designed around (§6.3).
 *
 * It is written through `projectSchema` rather than straight from memory, so the
 * file is the contract: defaults that live in the schema are written out
 * explicitly, and a project that somehow holds a value the schema rejects fails
 * here rather than producing a file nobody can read back.
 */

import { projectSchema, SCHEMA_VERSION, type Project } from "../schema";

export function projectJson(project: Project): string {
  return `${JSON.stringify(projectSchema.parse(project), null, 2)}\n`;
}

export type JsonImportResult =
  | { ok: true; project: Project; writtenBy: number }
  | { ok: false; error: string };

/**
 * Read an exported project back.
 *
 * An older payload is *defaulted, not rejected*: `projectSchema` fills in
 * whatever the tool has gained since, and the version it was written with is
 * reported rather than overwritten, because that is what tells the writer (and
 * the eventual Authors Den import) what they are holding.
 */
export function readProjectJson(raw: string): JsonImportResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file is not JSON, so it cannot be a Story Bible export." };
  }

  const result = projectSchema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first?.path.join(".") || "the file";
    return {
      ok: false,
      error: `That JSON is not a Story Bible export: ${where} ${first?.message ?? "did not validate"}.`,
    };
  }

  return {
    ok: true,
    project: result.data,
    writtenBy: typeof data === "object" && data !== null && "schemaVersion" in data
      ? Number((data as { schemaVersion?: unknown }).schemaVersion)
      : SCHEMA_VERSION,
  };
}
