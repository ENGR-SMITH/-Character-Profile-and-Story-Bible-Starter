import { describe, expect, it } from "vitest";

import {
  createCharacter,
  createProject,
  type Project,
  type Relationship,
} from "@/lib/schema";
import {
  relationshipCount,
  relationshipMapText,
  relationshipsFor,
} from "@/lib/relationships";

function cast() {
  const project = createProject({
    title: "Orah and the Salt Road",
    genre: "general",
    storyType: "novel",
  });
  const mara = createCharacter({ name: "Mara Vale" });
  const elias = createCharacter({ name: "Elias Vale" });
  const imani = createCharacter({ name: "Imani Reed" });
  return {
    mara,
    elias,
    imani,
    project: { ...project, characters: [mara, elias, imani] },
  };
}

function row(
  fromId: string,
  toId: string,
  patch: Partial<Relationship> = {},
): Relationship {
  return { id: `rel_${fromId}_${toId}`, fromId, toId, type: "family", ...patch };
}

describe("relationshipsFor", () => {
  it("is empty for a character with no connections", () => {
    const { imani, project } = cast();
    expect(relationshipsFor(project, imani.id)).toEqual([]);
  });

  it("returns the same row from both sides, so one row serves both profiles", () => {
    const { mara, elias, project } = cast();
    const withRow: Project = { ...project, relationships: [row(mara.id, elias.id)] };

    const fromMara = relationshipsFor(withRow, mara.id);
    const fromElias = relationshipsFor(withRow, elias.id);

    expect(fromMara).toHaveLength(1);
    expect(fromElias).toHaveLength(1);
    // Same stored row, different "other" — nothing is duplicated per side.
    expect(fromMara[0].relationship.id).toBe(fromElias[0].relationship.id);
    expect(fromMara[0].other.name).toBe("Elias Vale");
    expect(fromElias[0].other.name).toBe("Mara Vale");
  });

  it("counts only the rows the character is in", () => {
    const { mara, elias, imani, project } = cast();
    const withRows: Project = {
      ...project,
      relationships: [row(mara.id, elias.id), row(elias.id, imani.id)],
    };

    expect(relationshipCount(withRows, mara.id)).toBe(1);
    expect(relationshipCount(withRows, elias.id)).toBe(2);
    expect(relationshipCount(withRows, imani.id)).toBe(1);
  });

  it("skips a row pointing at a character that no longer exists", () => {
    const { mara, project } = cast();
    const withRow: Project = {
      ...project,
      relationships: [row(mara.id, "character_gone")],
    };
    expect(relationshipsFor(withRow, mara.id)).toEqual([]);
  });
});

describe("relationshipMapText", () => {
  it("is empty when there is nothing to map", () => {
    const { project } = cast();
    expect(relationshipMapText(project)).toBe("");
  });

  it("renders a relationship once, naming both sides, because that is how it is stored", () => {
    const { mara, elias, project } = cast();
    const text = relationshipMapText({
      ...project,
      relationships: [row(mara.id, elias.id, { nature: "Missing brother" })],
    });

    expect(text).toContain("**Mara Vale** ↔ **Elias Vale**");
    expect(text).toContain("Missing brother");
    // One bullet, not two: a bidirectional row is one line, not a pair.
    expect(text.match(/^- /gm)).toHaveLength(1);
  });

  it("does not invert the names on the reverse side — there is no reverse side", () => {
    const { elias, mara, project } = cast();
    const text = relationshipMapText({
      ...project,
      relationships: [row(elias.id, mara.id)],
    });
    expect(text).toContain("**Elias Vale** ↔ **Mara Vale**");
    expect(text).not.toContain("Mara Vale** ↔ **Elias Vale");
  });

  it("groups by type in the catalogue's order", () => {
    const { mara, elias, imani, project } = cast();
    const text = relationshipMapText({
      ...project,
      relationships: [
        row(mara.id, elias.id, { type: "friend" }),
        row(mara.id, imani.id, { type: "family" }),
      ],
    });

    expect(text).toContain("**Family**");
    expect(text).toContain("**Friend**");
    expect(text.indexOf("**Family**")).toBeLessThan(text.indexOf("**Friend**"));
  });

  it("leaves out detail the writer never filled in", () => {
    const { mara, elias, project } = cast();
    const text = relationshipMapText({
      ...project,
      relationships: [row(mara.id, elias.id)],
    });
    expect(text).not.toContain("Tension");
    expect(text).not.toContain("Secret");
    expect(text).not.toContain("Status");
  });

  it("reports a non-open status but not the default", () => {
    const { mara, elias, project } = cast();
    const broken = relationshipMapText({
      ...project,
      relationships: [row(mara.id, elias.id, { status: "broken" })],
    });
    expect(broken).toContain("Status: broken");

    const open = relationshipMapText({
      ...project,
      relationships: [row(mara.id, elias.id, { status: "open" })],
    });
    expect(open).not.toContain("Status");
  });

  it("notes an uneven relationship as a difference of view, never as an error", () => {
    const { mara, elias, project } = cast();
    const text = relationshipMapText({
      ...project,
      relationships: [
        row(mara.id, elias.id, { asymmetryNote: "She thinks they are friends" }),
      ],
    });
    expect(text).toContain("The two sides read it differently: She thinks they are friends");
    expect(text).not.toContain("error");
  });
});
