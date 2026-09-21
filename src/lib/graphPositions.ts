"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Where the writer has dragged the relationship graph's nodes.
 *
 * This is a *view* preference, not project data: the export contract in §6.3
 * has no coordinates, and an arrangement should never leak into a JSON export
 * or an Authors Den import. It therefore lives in localStorage under its own
 * key, beside the project rather than inside it, and is keyed by project id so
 * one project's arrangement never appears on another.
 *
 * Built on `useSyncExternalStore`, like `useMediaQuery`, so the server snapshot
 * is explicit and the hydration render is stable. `getSnapshot` returns a
 * cached object, because React treats a new reference as new data.
 */

const LAYOUT_KEY = "nexet.character-profile-story-bible-starter.graph";

export interface GraphPosition {
  x: number;
  y: number;
}

export type GraphPositions = Record<string, GraphPosition>;

/** The one shared empty value: a fresh `{}` per call would loop the snapshot. */
const EMPTY: GraphPositions = {};

const cache = new Map<string, GraphPositions>();
const listeners = new Set<() => void>();

function readAll(): Record<string, GraphPositions> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, GraphPositions>) : {};
  } catch {
    return {};
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function getGraphPositions(projectId: string): GraphPositions {
  const cached = cache.get(projectId);
  if (cached) return cached;

  const saved = readAll()[projectId];
  const positions = saved && typeof saved === "object" ? saved : EMPTY;
  cache.set(projectId, positions);
  return positions;
}

/**
 * `persist: false` during a drag keeps localStorage writes off the pointer-move
 * path; the drag commits once, on release.
 */
export function setGraphPositions(
  projectId: string,
  positions: GraphPositions,
  persist = true,
): void {
  cache.set(projectId, positions);

  if (persist && typeof localStorage !== "undefined") {
    try {
      const all = readAll();
      all[projectId] = positions;
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(all));
    } catch {
      // A full or unavailable storage must never break the graph.
    }
  }

  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useGraphPositions(projectId: string): GraphPositions {
  const subscribeToStore = useCallback((listener: () => void) => subscribe(listener), []);
  const getSnapshot = useCallback(() => getGraphPositions(projectId), [projectId]);

  return useSyncExternalStore(subscribeToStore, getSnapshot, () => EMPTY);
}
