import { describe, expect, it } from "vitest";

import {
  EDGE_COLORS,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  defaultNodes,
  graphEdges,
  graphLayout,
  nodeWidth,
  typesInUse,
} from "@/lib/graph";
import {
  createCharacter,
  createProject,
  type Project,
  type Relationship,
} from "@/lib/schema";
import { RELATIONSHIP_TYPES } from "@/lib/taxonomy";

function cast() {
  const project = createProject({
    title: "Orah and the Salt Road",
    genre: "general",
    storyType: "novel",
  });
  const mara = createCharacter({ name: "Mara Vale", colorTag: "#0369a1" });
  const elias = createCharacter({ name: "Elias Vale" });
  const imani = createCharacter({ name: "Imani Reed" });
  return {
    mara,
    elias,
    imani,
    project: { ...project, characters: [mara, elias, imani] },
  };
}

function row(fromId: string, toId: string, patch: Partial<Relationship> = {}): Relationship {
  return { id: `rel_${fromId}_${toId}`, fromId, toId, type: "family", ...patch };
}

describe("edge colours", () => {
  it("has a colour for every relationship type, so no edge renders unstyled", () => {
    for (const type of RELATIONSHIP_TYPES) {
      expect(EDGE_COLORS[type], `${type} colour`).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(Object.keys(EDGE_COLORS)).toHaveLength(RELATIONSHIP_TYPES.length);
  });
});

describe("nodeWidth", () => {
  it("never shrinks below the minimum, so a one-letter name stays clickable", () => {
    expect(nodeWidth("A")).toBe(96);
  });

  it("grows with the name", () => {
    expect(nodeWidth("Bartholomew Featherstonehaugh")).toBeGreaterThan(
      nodeWidth("Mara Vale"),
    );
  });
});

describe("defaultNodes", () => {
  it("makes a node for every character, isolated ones included", () => {
    const { project, imani } = cast();
    // Imani has no relationships, and is still on the map — that is the point.
    const nodes = defaultNodes(project);
    expect(nodes.map((node) => node.id)).toContain(imani.id);
    expect(nodes).toHaveLength(3);
  });

  it("carries the cast colour onto the node and trims the name", () => {
    const { project, mara } = cast();
    const node = defaultNodes(project).find((candidate) => candidate.id === mara.id);
    expect(node?.color).toBe("#0369a1");
    expect(node?.name).toBe("Mara Vale");
  });

  it("falls back to a label rather than rendering an empty box", () => {
    const project = createProject({ title: "T", genre: "general", storyType: "novel" });
    const blank = createCharacter({ name: "   " });
    const nodes = defaultNodes({ ...project, characters: [blank] });
    expect(nodes[0].name).toBe("Unnamed");
  });

  it("centres a single character", () => {
    const project = createProject({ title: "T", genre: "general", storyType: "novel" });
    const only = createCharacter({ name: "Mara" });
    const nodes = defaultNodes({ ...project, characters: [only] });
    expect(nodes[0].x).toBe(GRAPH_WIDTH / 2);
    expect(nodes[0].y).toBe(GRAPH_HEIGHT / 2);
  });

  it("is deterministic, so the map looks the same every time it opens", () => {
    const { project } = cast();
    expect(defaultNodes(project)).toEqual(defaultNodes(project));
  });

  it("keeps every node well inside the viewBox", () => {
    const { project } = cast();
    for (const node of defaultNodes(project)) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.x).toBeLessThan(GRAPH_WIDTH);
      expect(node.y).toBeGreaterThan(0);
      expect(node.y).toBeLessThan(GRAPH_HEIGHT);
    }
  });

  it("spreads many characters without putting two in the same place", () => {
    const project = createProject({ title: "T", genre: "general", storyType: "novel" });
    const characters = Array.from({ length: 12 }, (_, index) =>
      createCharacter({ name: `Character ${index + 1}` }),
    );
    const nodes = defaultNodes({ ...project, characters });
    const unique = new Set(nodes.map((node) => `${node.x.toFixed(2)},${node.y.toFixed(2)}`));
    expect(unique.size).toBe(nodes.length);
  });
});

describe("graphEdges", () => {
  it("draws one edge per relationship", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = { ...project, relationships: [row(mara.id, elias.id)] };
    const nodes = defaultNodes(withRows);
    expect(graphEdges(withRows, nodes)).toHaveLength(1);
  });

  it("skips a relationship pointing at a missing character", () => {
    const { mara, project } = cast();
    const withRows: Project = {
      ...project,
      relationships: [row(mara.id, "character_ghost")],
    };
    const nodes = defaultNodes(withRows);
    expect(graphEdges(withRows, nodes)).toEqual([]);
  });

  it("draws a single edge straight, with the control point on the midpoint", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = { ...project, relationships: [row(mara.id, elias.id)] };
    const nodes = defaultNodes(withRows);
    const [edge] = graphEdges(withRows, nodes);

    expect(edge.controlX).toBeCloseTo((edge.x1 + edge.x2) / 2);
    expect(edge.controlY).toBeCloseTo((edge.y1 + edge.y2) / 2);
  });

  it("bows parallel edges apart instead of drawing them on top of each other", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = {
      ...project,
      relationships: [
        row(mara.id, elias.id, { id: "rel_family", type: "family" }),
        row(mara.id, elias.id, { id: "rel_rival", type: "rival" }),
      ],
    };
    const nodes = defaultNodes(withRows);
    const edges = graphEdges(withRows, nodes);

    expect(edges).toHaveLength(2);
    expect(edges[0].controlX).not.toBe(edges[1].controlX);
  });

  it("keeps the two bows on opposite sides even when the rows are stored reversed", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = {
      ...project,
      relationships: [
        row(mara.id, elias.id, { id: "rel_one" }),
        row(elias.id, mara.id, { id: "rel_two", type: "ally" }),
      ],
    };
    const nodes = defaultNodes(withRows);
    const edges = graphEdges(withRows, nodes);

    // Canonical ordering means the perpendicular is stable, so the offsets
    // separate the lines rather than landing them on the same side.
    expect(edges[0].controlX).not.toBe(edges[1].controlX);
    expect(Math.abs(edges[0].controlX - edges[1].controlX)).toBeGreaterThan(20);
  });

  it("anchors the line to the stored direction, so the row still means something", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = { ...project, relationships: [row(mara.id, elias.id)] };
    const nodes = defaultNodes(withRows);
    const [edge] = graphEdges(withRows, nodes);
    const maraNode = nodes.find((node) => node.id === mara.id);

    expect(edge.fromId).toBe(mara.id);
    expect(edge.x1).toBe(maraNode?.x);
  });

  it("labels an edge with its type and both names for hover text", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = {
      ...project,
      relationships: [row(mara.id, elias.id, { nature: "Missing brother" })],
    };
    const nodes = defaultNodes(withRows);
    const [edge] = graphEdges(withRows, nodes);

    expect(edge.typeLabel).toBe("Family");
    expect(edge.title).toContain("Mara Vale");
    expect(edge.title).toContain("Elias Vale");
    expect(edge.title).toContain("Missing brother");
  });

  it("follows the nodes when they are moved", () => {
    const { mara, elias, project } = cast();
    const withRows: Project = { ...project, relationships: [row(mara.id, elias.id)] };
    const nodes = defaultNodes(withRows).map((node) =>
      node.id === mara.id ? { ...node, x: 40, y: 40 } : node,
    );
    const [edge] = graphEdges(withRows, nodes);
    expect(edge.x1).toBe(40);
    expect(edge.y1).toBe(40);
  });
});

describe("typesInUse", () => {
  it("lists the types present, in catalogue order, without duplicates", () => {
    const { mara, elias, imani, project } = cast();
    const withRows: Project = {
      ...project,
      relationships: [
        row(mara.id, elias.id, { type: "friend" }),
        row(elias.id, imani.id, { type: "family" }),
        row(mara.id, imani.id, { type: "friend" }),
      ],
    };
    expect(typesInUse(withRows)).toEqual(["family", "friend"]);
  });

  it("is empty when nothing is connected", () => {
    const { project } = cast();
    expect(typesInUse(project)).toEqual([]);
  });
});

describe("graphLayout", () => {
  it("exposes the viewBox size alongside the nodes and edges", () => {
    const { mara, elias, project } = cast();
    const layout = graphLayout({
      ...project,
      relationships: [row(mara.id, elias.id)],
    });
    expect(layout.width).toBe(GRAPH_WIDTH);
    expect(layout.height).toBe(GRAPH_HEIGHT);
    expect(layout.nodes).toHaveLength(3);
    expect(layout.edges).toHaveLength(1);
  });
});
