"use client";

import { useEffect, useState } from "react";

import { CastList } from "@/components/CastList";
import { CharacterEditor } from "@/components/CharacterEditor";
import { Badge, Button, Card, EmptyState, Input } from "@/components/ui";
import { useCharacters, useLastSavedAt, useProject, useProjectStore } from "@/lib/store";
import { GENRE_META, STORY_TYPE_META } from "@/lib/taxonomy";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn, formatSavedAt } from "@/lib/utils";

/**
 * The autosave label is relative ("Saved 20s ago"), so it needs its own timer
 * to age. Fifteen seconds is frequent enough to feel live without re-rendering
 * the workspace on a hot loop.
 */
function AutosaveIndicator() {
  const lastSavedAt = useLastSavedAt();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((tick) => tick + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      {formatSavedAt(lastSavedAt)}
    </span>
  );
}

export function Workspace() {
  const project = useProject();
  const characters = useCharacters();
  const updateMeta = useProjectStore((state) => state.updateMeta);
  const clearProject = useProjectStore((state) => state.clearProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const isWide = useMediaQuery("(min-width: 1024px)");

  if (!project) return null;

  // The selection is derived rather than synchronised in an effect. An
  // explicitly chosen character wins; otherwise a wide screen falls back to the
  // first one, because the editor pane is visible beside the list. A stale id
  // (the character was deleted) resolves to that same fallback for free.
  const chosen =
    characters.find((character) => character.id === selectedId) ?? null;
  const selected = chosen ?? (isWide ? (characters.at(0) ?? null) : null);
  const editorIsOpen = selected !== null;
  const resolvedId = selected?.id ?? null;

  return (
    <div className="space-y-6">
      <Card className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-64 flex-1 items-center gap-3">
            <label htmlFor="workspace-title" className="sr-only">
              Project title
            </label>
            <Input
              id="workspace-title"
              value={project.meta.title}
              onChange={(event) => updateMeta({ title: event.target.value })}
              className="h-9 max-w-sm border-transparent bg-transparent px-2 text-base font-semibold hover:border-border focus:border-accent"
            />
            <span className="flex flex-wrap items-center gap-1">
              <Badge>{GENRE_META[project.meta.genre].label}</Badge>
              <Badge>{STORY_TYPE_META[project.meta.storyType].label}</Badge>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AutosaveIndicator />
            {confirmingReset ? (
              <span className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    clearProject();
                    setConfirmingReset(false);
                  }}
                >
                  Erase this project
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmingReset(false)}
                >
                  Keep
                </Button>
              </span>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmingReset(true)}>
                Start over
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className={cn(editorIsOpen && "hidden lg:block")}>
          <CastList selectedId={resolvedId} onSelect={setSelectedId} />
        </div>

        <div className={cn(!editorIsOpen && "hidden lg:block")}>
          {selected ? (
            <CharacterEditor character={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <EmptyState title="No character selected">
              Pick someone from the cast to open their profile, or add the first character.
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
