"use client";

import { useState, type FormEvent } from "react";

import {
  Badge,
  Button,
  EmptyState,
  Input,
  Meter,
  Select,
  SectionHeading,
} from "@/components/ui";
import { fieldsForDepth } from "@/lib/fields";
import { measureFields } from "@/lib/schema";
import { useCharacters, useProject, useProjectStore } from "@/lib/store";
import {
  CHARACTER_ROLE_META,
  CHARACTER_ROLES,
  DEPTH_META,
  DEPTH_MODES,
  GENRE_META,
  IMPORTANCE_META,
  IMPORTANCE_LEVELS,
  type CharacterRole,
  type DepthMode,
  type Importance,
} from "@/lib/taxonomy";
import { cn, percent, pluralise } from "@/lib/utils";

export function CastList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const project = useProject();
  const characters = useCharacters();
  const addCharacter = useProjectStore((state) => state.addCharacter);
  const duplicateCharacter = useProjectStore((state) => state.duplicateCharacter);
  const removeCharacter = useProjectStore((state) => state.removeCharacter);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<CharacterRole>("background");
  const [importance, setImportance] = useState<Importance>("supporting");
  const [depth, setDepth] = useState<DepthMode>("quick");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const layers = project ? GENRE_META[project.meta.genre].layers : [];

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    const id = addCharacter({ name, role, importance, depth });
    setName("");
    setAdding(false);
    if (id) onSelect(id);
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="Cast"
        count={characters.length > 0 ? `${characters.length}` : undefined}
        actions={
          <Button size="sm" onClick={() => setAdding((open) => !open)}>
            {adding ? "Cancel" : "Add character"}
          </Button>
        }
      />

      {adding ? (
        <form
          onSubmit={handleAdd}
          className="space-y-3 rounded-xl border border-border bg-surface-2 p-3"
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Character name"
            autoFocus
            aria-label="New character name"
          />
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={role}
              onChange={(event) => setRole(event.target.value as CharacterRole)}
              aria-label="New character role"
            >
              {CHARACTER_ROLES.map((value) => (
                <option key={value} value={value}>
                  {CHARACTER_ROLE_META[value].label}
                </option>
              ))}
            </Select>
            <Select
              value={importance}
              onChange={(event) => setImportance(event.target.value as Importance)}
              aria-label="New character importance"
            >
              {IMPORTANCE_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {IMPORTANCE_META[value].label}
                </option>
              ))}
            </Select>
          </div>
          <Select
            value={depth}
            onChange={(event) => setDepth(event.target.value as DepthMode)}
            aria-label="New character depth"
          >
            {DEPTH_MODES.map((value) => (
              <option key={value} value={value}>
                {DEPTH_META[value].label} —{" "}
                {fieldsForDepth(value, layers).length} fields
              </option>
            ))}
          </Select>
          <Button type="submit" variant="primary" className="w-full" disabled={!name.trim()}>
            Add to cast
          </Button>
        </form>
      ) : null}

      {characters.length === 0 && !adding ? (
        <EmptyState title="No characters yet">
          Add the first one. Quick mode asks for thirteen fields and takes five minutes —
          enough to keep a name, a look and a want consistent.
        </EmptyState>
      ) : null}

      <ul className="space-y-2">
        {characters.map((character) => {
          const fields = fieldsForDepth(character.depth, layers);
          const { filled, total } = measureFields(character, fields);
          const selected = character.id === selectedId;

          return (
            <li key={character.id}>
              <div
                className={cn(
                  "rounded-xl border bg-surface p-3 transition-colors",
                  selected ? "border-accent" : "border-border hover:border-border-strong",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(character.id)}
                  className="flex w-full items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  aria-current={selected ? "true" : undefined}
                >
                  <span
                    aria-hidden
                    className="mt-1 size-2.5 shrink-0 rounded-full border border-black/10"
                    style={{ background: character.colorTag ?? "var(--muted)" }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {character.name || "Unnamed"}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1">
                      <Badge>{CHARACTER_ROLE_META[character.role].label}</Badge>
                      <Badge>{IMPORTANCE_META[character.importance].label}</Badge>
                      <Badge className="border-accent/40 text-accent">
                        {DEPTH_META[character.depth].label}
                      </Badge>
                    </span>
                    <span className="mt-2 flex items-center gap-2">
                      <Meter value={filled} total={total} className="max-w-32" />
                      <span className="text-[11px] whitespace-nowrap text-muted">
                        {filled}/{total} fields
                      </span>
                    </span>
                  </span>
                </button>

                <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
                  <span className="text-[11px] text-muted">
                    {percent(filled, total)}% complete
                  </span>
                  <span className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const id = duplicateCharacter(character.id);
                        if (id) onSelect(id);
                      }}
                    >
                      Duplicate
                    </Button>
                    {confirmingDelete === character.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            removeCharacter(character.id);
                            setConfirmingDelete(null);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmingDelete(null)}
                        >
                          Keep
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmingDelete(character.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {characters.length > 0 ? (
        <p className="text-xs text-muted">
          {`${characters.length} ${pluralise(characters.length, "character")} in the cast. Every answer is saved in this browser as you type.`}
        </p>
      ) : null}
    </section>
  );
}
