"use client";

import { useEffect, useState } from "react";

import { BibleView } from "@/components/BibleView";
import { BriefView } from "@/components/BriefView";
import { CastList } from "@/components/CastList";
import { CharacterEditor } from "@/components/CharacterEditor";
import { ContinuityPanel } from "@/components/ContinuityPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { RelationshipGraph } from "@/components/RelationshipGraph";
import { WorldPanel } from "@/components/WorldEditor";
import { Badge, Button, Card, EmptyState, HelpText, InfoHint, Input } from "@/components/ui";
import { relationshipMapText } from "@/lib/relationships";
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

/**
 * The relationship map in both of its specified forms (§5.4.3 and §5.4.4): the
 * visual graph, and the grouped text block the bible exports. Both read the
 * same single rows the profiles do.
 */
function RelationshipMapCard() {
  const project = useProject();
  const [copied, setCopied] = useState(false);

  // Drawn once there is more than one character: a lone box says nothing, but
  // two unconnected boxes are exactly what the writer needs to notice.
  if (!project || project.characters.length < 2) return null;

  const text = relationshipMapText(project);

  async function copyMap() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard access can be refused; the text is on screen either way.
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
            Relationship map
            <InfoHint label="Relationship map">
              Who is connected to whom. Colour is the relationship type; the character&apos;s
              own cast colour borders their box. Drag a box — or focus it and use the arrow
              keys — to arrange the map; the arrangement is a view preference and never
              reaches an export.
            </InfoHint>
          </h2>
        </div>
        {text ? (
          <Button size="sm" onClick={copyMap}>
            {copied ? "Copied" : "Copy text map"}
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        <RelationshipGraph project={project} />
      </div>

      {text ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-muted transition-colors hover:text-foreground">
            Text map — the block the bible exports
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface-2 p-3 text-xs leading-relaxed text-foreground">
            {text}
          </pre>
        </details>
      ) : (
        <HelpText>
          No relationships yet. Add one on a character&apos;s profile and a line appears here.
        </HelpText>
      )}
    </Card>
  );
}

export function Workspace() {
  const project = useProject();
  const characters = useCharacters();
  const updateMeta = useProjectStore((state) => state.updateMeta);
  const clearProject = useProjectStore((state) => state.clearProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  /**
   * The §4.1 work areas, in the order the tool asks for them: the cast, the
   * world they stand in, the check, and the compiled bible both feed.
   *
   * The brief sits beside the bible because §4.1 puts them in one stage — the
   * bible's outputs are "a Story Bible ... + a one-page collaborator brief" —
   * and because it is the thing a writer reads before handing the ground over.
   */
  const [area, setArea] = useState<"cast" | "world" | "check" | "bible" | "brief">("cast");
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
      {/* The toolbar is the one thing on the page that means nothing on paper. */}
      <Card className="px-5 py-4 print:hidden">
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
            <span
              role="group"
              aria-label="Work area"
              className="inline-flex rounded-lg border border-border p-0.5"
            >
              {(["cast", "world", "check", "bible", "brief"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setArea(option)}
                  aria-pressed={area === option}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    area === option
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </span>
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

      {area === "world" ? (
        <WorldPanel />
      ) : area === "check" ? (
        <ContinuityPanel
          onOpenCharacter={(id) => {
            setSelectedId(id);
            setArea("cast");
          }}
        />
      ) : area === "bible" ? (
        <div className="space-y-4">
          <ExportPanel />
          <BibleView />
        </div>
      ) : area === "brief" ? (
        <BriefView />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div className={cn(editorIsOpen && "hidden lg:block")}>
              <CastList selectedId={resolvedId} onSelect={setSelectedId} />
            </div>

            <div className={cn(!editorIsOpen && "hidden lg:block")}>
              {selected ? (
                <CharacterEditor character={selected} onBack={() => setSelectedId(null)} />
              ) : (
                <EmptyState title="No character selected">
                  Pick someone from the cast to open their profile, or add the first
                  character.
                </EmptyState>
              )}
            </div>
          </div>

          <RelationshipMapCard />
        </>
      )}
    </div>
  );
}
