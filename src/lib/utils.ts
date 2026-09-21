/** Join conditional class names without pulling in a dependency. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Short, human-friendly "last saved" label for the autosave indicator. */
export function formatSavedAt(iso: string | null): string {
  if (!iso) return "Not saved yet";

  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "Not saved yet";

  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  if (seconds < 10) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Saved ${minutes} min ago`;

  return `Saved at ${then.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** Percentage of a whole, clamped to 0–100 and safe when the whole is zero. */
export function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
