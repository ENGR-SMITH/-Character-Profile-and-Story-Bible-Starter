"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * Built on `useSyncExternalStore` rather than an effect so the server snapshot
 * is explicit: the server always reports `false`, React uses that for the
 * hydration render, and the server snapshot is a constant so it can never
 * change identity between renders.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
