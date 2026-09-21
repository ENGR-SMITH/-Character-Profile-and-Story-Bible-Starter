/**
 * The visual relationship map (DEVELOPMENT.md §5.4.4).
 *
 * Laid out deterministically — characters on a circle — so the graph looks the
 * same every time it is opened and needs no physics simulation (§6.1). The
 * writer moves nodes by hand from there; those positions are a *view*
 * preference, not project data, so they live in localStorage beside the project
 * rather than in the export contract (§6.3).
 *
 * All of the geometry is here, apart from node dragging, so it can be tested
 * without a DOM.
 */

import type { Project } from "./schema";
import {
  RELATIONSHIP_TYPE_META,
  RELATIONSHIP_TYPES,
  type RelationshipType,
} from "./taxonomy";

export const GRAPH_WIDTH = 800;
export const GRAPH_HEIGHT = 600;

const NODE_HEIGHT = 34;
const NODE_MIN_WIDTH = 96;
const NODE_PADDING_X = 16;
const NODE_CHAR_WIDTH = 7.2;
const RADIUS_PAD = 70;
/** How far apart parallel edges between the same pair are bowed. */
const EDGE_SPREAD = 34;

/**
 * One colour per relationship type (§5.4.4: "typed edges"). Distinct enough to
 * tell apart at a glance, dark enough to read on a light surface.
 */
export const EDGE_COLORS: Record<RelationshipType, string> = {
  family: "#0369a1",
  "chosen-family": "#0f766e",
  romantic: "#be123c",
  friend: "#15803d",
  ally: "#65a30d",
  rival: "#b45309",
  enemy: "#dc2626",
  mentor: "#6d28d9",
  student: "#c026d3",
  authority: "#475569",
  colleague: "#a16207",
};

export interface GraphNode {
  id: string;
  name: string;
  color?: string;
  /** Centre of the node. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphEdge {
  id: string;
  fromId: string;
  toId: string;
  type: RelationshipType;
  typeLabel: string;
  /** Hover text: the type, both names, and whatever the writer filled in. */
  title: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Quadratic control point; on the midpoint this draws a straight line. */
  controlX: number;
  controlY: number;
}

export interface GraphLayout {
  width: number;
  height: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function nodeWidth(name: string): number {
  const length = name.length || 1;
  return Math.max(NODE_MIN_WIDTH, Math.round(length * NODE_CHAR_WIDTH + NODE_PADDING_X * 2));
}

/**
 * Every character is a node, including the isolated ones — an unlinked
 * character is exactly what the writer needs to see (§5.4.5).
 */
export function defaultNodes(project: Project): GraphNode[] {
  const count = project.characters.length;
  const centreX = GRAPH_WIDTH / 2;
  const centreY = GRAPH_HEIGHT / 2;
  const radius = Math.max(0, Math.min(centreX, centreY) - RADIUS_PAD);

  return project.characters.map((character, index) => {
    const name = character.name.trim() || "Unnamed";
    // Start at the top and go clockwise, so the first character is predictable.
    const angle = count <= 1 ? 0 : -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      id: character.id,
      name,
      color: character.colorTag,
      x: count <= 1 ? centreX : centreX + radius * Math.cos(angle),
      y: count <= 1 ? centreY : centreY + radius * Math.sin(angle),
      width: nodeWidth(name),
      height: NODE_HEIGHT,
    };
  });
}

function edgeTitle(
  project: Project,
  fromName: string,
  toName: string,
  relationship: Project["relationships"][number],
): string {
  const details: string[] = [];
  if (relationship.nature) details.push(relationship.nature);
  if (relationship.tension) details.push(`Tension: ${relationship.tension}`);
  if (relationship.secret) details.push(`Secret: ${relationship.secret}`);
  if (relationship.asymmetryNote) details.push(`They read it differently: ${relationship.asymmetryNote}`);

  const label = RELATIONSHIP_TYPE_META[relationship.type].label;
  return `${label}: ${fromName} ↔ ${toName}${details.length ? ` — ${details.join(" · ")}` : ""}`;
}

/**
 * Edges for the given node positions. Callers pass the nodes *after* any drag,
 * so the lines follow the boxes.
 *
 * Rows between the same pair are bowed apart rather than drawn on top of each
 * other, and the geometry is computed from a canonically ordered pair so the
 * bows stay on opposite sides whatever order the row was stored in.
 */
export function graphEdges(project: Project, nodes: GraphNode[]): GraphEdge[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const groups = new Map<string, Project["relationships"]>();

  for (const relationship of project.relationships) {
    if (!byId.has(relationship.fromId) || !byId.has(relationship.toId)) continue;
    const key = [relationship.fromId, relationship.toId].sort().join("|");
    const list = groups.get(key);
    if (list) list.push(relationship);
    else groups.set(key, [relationship]);
  }

  const edges: GraphEdge[] = [];
  for (const group of groups.values()) {
    for (const [index, relationship] of group.entries()) {
      const [firstId, secondId] = [relationship.fromId, relationship.toId].sort();
      const first = byId.get(firstId);
      const second = byId.get(secondId);
      if (!first || !second) continue;

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const length = Math.hypot(dx, dy) || 1;
      const offset = (index - (group.length - 1) / 2) * EDGE_SPREAD;
      const midX = (first.x + second.x) / 2;
      const midY = (first.y + second.y) / 2;

      const from = byId.get(relationship.fromId);
      const to = byId.get(relationship.toId);
      if (!from || !to) continue;

      edges.push({
        id: relationship.id,
        fromId: relationship.fromId,
        toId: relationship.toId,
        type: relationship.type,
        typeLabel: RELATIONSHIP_TYPE_META[relationship.type].label,
        title: edgeTitle(project, from.name, to.name, relationship),
        // Always anchored to the stored direction; only the bow is symmetric.
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        controlX: midX + (-dy / length) * offset,
        controlY: midY + (dx / length) * offset,
      });
    }
  }

  return edges;
}

export function graphLayout(project: Project): GraphLayout {
  const nodes = defaultNodes(project);
  return {
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT,
    nodes,
    edges: graphEdges(project, nodes),
  };
}

/** The relationship types present in a project, in catalogue order, for the legend. */
export function typesInUse(project: Project): RelationshipType[] {
  const used = new Set(project.relationships.map((relationship) => relationship.type));
  return RELATIONSHIP_TYPES.filter((type) => used.has(type));
}
