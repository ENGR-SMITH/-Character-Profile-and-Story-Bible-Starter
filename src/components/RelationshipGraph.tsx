"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { Badge, Meter } from "@/components/ui";
import { cn, percent } from "@/lib/utils";
import {
  EDGE_COLORS,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  defaultNodes,
  graphEdges,
  typesInUse,
} from "@/lib/graph";
import {
  getGraphPositions,
  setGraphPositions,
  useGraphPositions,
  type GraphPosition,
} from "@/lib/graphPositions";
import { measureCharacter, type Project } from "@/lib/schema";
import {
  CHARACTER_ROLE_META,
  DEPTH_META,
  IMPORTANCE_META,
  RELATIONSHIP_TYPE_META,
} from "@/lib/taxonomy";

/** How far one arrow-key press moves a focused node. */
const NUDGE = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The same role, importance and completion the hover card shows, in words — so
 * the node carries them for a screen reader without needing the card (§6.5).
 */
function characterSummary(project: Project, characterId: string): string {
  const character = project.characters.find((candidate) => candidate.id === characterId);
  if (!character) return "";
  const { filled, total } = measureCharacter(project, character);
  return `${CHARACTER_ROLE_META[character.role].label}, ${
    IMPORTANCE_META[character.importance].label
  }, ${percent(filled, total)}% complete.`;
}

export function RelationshipGraph({ project }: { project: Project }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragOffset = useRef<GraphPosition>({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const positions = useGraphPositions(project.id);

  const nodes = defaultNodes(project).map((node) => ({
    ...node,
    ...(positions[node.id] ?? {}),
  }));
  const edges = graphEdges(project, nodes);

  // The hover card's subject. Hidden while that node is being dragged, so it
  // never sits under the pointer.
  const activeNode = activeId ? nodes.find((node) => node.id === activeId) : undefined;
  const activeCharacter = activeId
    ? project.characters.find((character) => character.id === activeId)
    : undefined;
  const activeProgress =
    activeCharacter && activeNode && draggingId !== activeNode.id
      ? measureCharacter(project, activeCharacter)
      : null;

  function move(
    id: string,
    next: GraphPosition,
    persist: boolean,
    nodesForBounds: (typeof nodes)[number],
  ) {
    const limit = bounds(nodesForBounds);
    setGraphPositions(
      project.id,
      {
        ...getGraphPositions(project.id),
        [id]: {
          x: clamp(next.x, limit.minX, limit.maxX),
          y: clamp(next.y, limit.minY, limit.maxY),
        },
      },
      persist,
    );
  }

  /** Screen coordinates to viewBox coordinates, so a drag tracks the pointer. */
  function toGraph(clientX: number, clientY: number): GraphPosition {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * GRAPH_WIDTH,
      y: ((clientY - rect.top) / rect.height) * GRAPH_HEIGHT,
    };
  }

  function bounds(node: { width: number; height: number }) {
    return {
      minX: node.width / 2,
      maxX: GRAPH_WIDTH - node.width / 2,
      minY: node.height / 2,
      maxY: GRAPH_HEIGHT - node.height / 2,
    };
  }

  function handlePointerDown(
    event: PointerEvent<SVGGElement>,
    node: (typeof nodes)[number],
  ) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingId(node.id);
    const pointer = toGraph(event.clientX, event.clientY);
    dragOffset.current = { x: pointer.x - node.x, y: pointer.y - node.y };
  }

  function handlePointerMove(
    event: PointerEvent<SVGGElement>,
    node: (typeof nodes)[number],
  ) {
    if (draggingId !== node.id) return;
    const pointer = toGraph(event.clientX, event.clientY);
    move(
      node.id,
      { x: pointer.x - dragOffset.current.x, y: pointer.y - dragOffset.current.y },
      false,
      node,
    );
  }

  function handlePointerUp(node: (typeof nodes)[number]) {
    if (draggingId !== node.id) return;
    setDraggingId(null);
    // One write per drag, not one per pointer move.
    setGraphPositions(project.id, getGraphPositions(project.id), true);
  }

  function handleKeyDown(
    event: KeyboardEvent<SVGGElement>,
    node: (typeof nodes)[number],
  ) {
    const step = event.shiftKey ? NUDGE * 3 : NUDGE;
    const delta: Record<string, GraphPosition> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const movement = delta[event.key];
    if (!movement) return;

    event.preventDefault();
    move(node.id, { x: node.x + movement.x, y: node.y + movement.y }, true, node);
  }

  function resetLayout() {
    setGraphPositions(project.id, {}, true);
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-border bg-surface-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          role="img"
          aria-label={`Relationship graph: ${project.characters.length} characters, ${project.relationships.length} relationships`}
          className="h-auto w-full touch-none select-none"
        >
          <title>Relationship graph</title>
          <desc>
            Characters as boxes, relationships as coloured lines. Drag a box, or focus it
            and use the arrow keys, to arrange the map.
          </desc>

          <g>
            {edges.map((edge) => (
              <path
                key={edge.id}
                d={`M ${edge.x1} ${edge.y1} Q ${edge.controlX} ${edge.controlY} ${edge.x2} ${edge.y2}`}
                fill="none"
                stroke={EDGE_COLORS[edge.type]}
                strokeWidth={1.75}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              >
                <title>{edge.title}</title>
              </path>
            ))}
          </g>

          <g>
            {nodes.map((node) => {
              const active = draggingId === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - node.width / 2} ${node.y - node.height / 2})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.name}. ${characterSummary(project, node.id)} Drag, or use the arrow keys, to move.`}
                  onPointerDown={(event) => handlePointerDown(event, node)}
                  onPointerMove={(event) => handlePointerMove(event, node)}
                  onPointerUp={() => handlePointerUp(node)}
                  onPointerEnter={() => setActiveId(node.id)}
                  onPointerLeave={() =>
                    setActiveId((current) => (current === node.id ? null : current))
                  }
                  onFocus={() => setActiveId(node.id)}
                  onBlur={() =>
                    setActiveId((current) => (current === node.id ? null : current))
                  }
                  onKeyDown={(event) => handleKeyDown(event, node)}
                  className={cn(
                    "cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active && "cursor-grabbing",
                  )}
                >
                  <rect
                    width={node.width}
                    height={node.height}
                    rx={10}
                    fill="var(--surface)"
                    stroke={node.color ?? "var(--border)"}
                    strokeWidth={active ? 3 : 2}
                  />
                  {node.color ? (
                    <circle cx={14} cy={node.height / 2} r={4} fill={node.color} />
                  ) : null}
                  <text
                    x={node.color ? 26 : node.width / 2}
                    y={node.height / 2}
                    dominantBaseline="central"
                    textAnchor={node.color ? "start" : "middle"}
                    fontSize={13}
                    fill="var(--foreground)"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.name}
                  </text>
                  <title>{node.name}</title>
                </g>
              );
            })}
          </g>
        </svg>

        {activeNode && activeCharacter && activeProgress ? (
          <div
            aria-hidden
            // Positioned in percentages of the viewBox, so the card tracks the
            // box at any rendered size. It flips below the node near the top
            // edge rather than overflowing the map.
            className="pointer-events-none absolute z-10 w-56 rounded-lg border border-border bg-surface p-3 shadow-lg"
            style={{
              left: `${(activeNode.x / GRAPH_WIDTH) * 100}%`,
              top: `${(activeNode.y / GRAPH_HEIGHT) * 100}%`,
              transform: `translate(-50%, ${
                activeNode.y > GRAPH_HEIGHT * 0.3 ? "-118%" : "18%"
              })`,
            }}
          >
            <p className="truncate text-sm font-medium text-foreground">
              {activeNode.name}
            </p>
            <span className="mt-1 flex flex-wrap items-center gap-1">
              <Badge>{CHARACTER_ROLE_META[activeCharacter.role].label}</Badge>
              <Badge>{IMPORTANCE_META[activeCharacter.importance].label}</Badge>
              <Badge>{DEPTH_META[activeCharacter.depth].label}</Badge>
            </span>
            <span className="mt-2 flex items-center gap-2">
              <Meter
                value={activeProgress.filled}
                total={activeProgress.total}
                className="max-w-24"
              />
              <span className="text-[11px] whitespace-nowrap text-muted">
                {activeProgress.filled}/{activeProgress.total} fields ·{" "}
                {percent(activeProgress.filled, activeProgress.total)}%
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          {typesInUse(project).map((type) => (
            <li key={type} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-0.5 w-4 rounded-full"
                style={{ background: EDGE_COLORS[type] }}
              />
              {RELATIONSHIP_TYPE_META[type].label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={resetLayout}
          className="ml-auto rounded text-[11px] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Reset arrangement
        </button>
      </div>
    </div>
  );
}
