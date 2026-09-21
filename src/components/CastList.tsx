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
import { characterMatchesQuery, fieldValueToText, measureCharacter } from "@/lib/schema";
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

type CastView = "cards" | "table";

/** The comparison grid's columns: the Quick fields every character answers. */
const TABLE_FIELDS = fieldsForDepth("quick", []);

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

  const [view, setView] = useState<CastView>("cards");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<CharacterRole | "all">("all");
  const [importanceFilter, setImportanceFilter] = useState<Importance | "all">("all");

  const layers = project ? GENRE_META[project.meta.genre].layers : [];
  const customFields = project?.customFields ?? [];

  // Search and filters are applied to one list, so the cards and the table can
  // never disagree about what is on screen.
  const filtering =
    query.trim() !== "" || roleFilter !== "all" || importanceFilter !== "all";
  const visible = characters.filter(
    (character) =>
      (roleFilter === "all" || character.role === roleFilter) &&
      (importanceFilter === "all" || character.importance === importanceFilter) &&
      characterMatchesQuery(character, query),
  );

  function resetFilters() {
    setQuery("");
    setRoleFilter("all");
    setImportanceFilter("all");
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    const id = addCharacter({ name, role, importance, depth });
    setName("");
    setAdding(false);
    if (id) onSelect(id);
  }

  // One definition of "how complete is this character?" for both views, so the
  // cards and the table can never disagree.
  const progress = (character: (typeof characters)[number]) =>
    project ? measureCharacter(project, character) : { filled: 0, total: 1 };

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="Cast"
        count={
          characters.length > 0
            ? filtering
              ? `${visible.length} of ${characters.length}`
              : `${characters.length}`
            : undefined
        }
        hint={
          <>
            Every answer is saved in this browser as you type, and nothing is uploaded. The
            meter beside each name counts the fields that character&apos;s own depth (and this
            project&apos;s genre layers) asks for, plus your custom fields.
          </>
        }
        actions={
          <span className="flex items-center gap-1">
            <span
              role="group"
              aria-label="Cast view"
              className="inline-flex rounded-lg border border-border p-0.5"
            >
              {(["cards", "table"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  aria-pressed={view === option}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    view === option
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </span>
            <Button size="sm" onClick={() => setAdding((open) => !open)}>
              {adding ? "Cancel" : "Add character"}
            </Button>
          </span>
        }
      />

      {characters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-40 flex-1">
            <label htmlFor="cast-search" className="sr-only">
              Search the cast
            </label>
            <Input
              id="cast-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names and answers…"
              className="h-9"
            />
          </div>
          <label htmlFor="cast-role-filter" className="sr-only">
            Filter by role
          </label>
          <Select
            id="cast-role-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as CharacterRole | "all")}
            className="h-9 w-36"
          >
            <option value="all">Every role</option>
            {CHARACTER_ROLES.map((value) => (
              <option key={value} value={value}>
                {CHARACTER_ROLE_META[value].label}
              </option>
            ))}
          </Select>
          <label htmlFor="cast-importance-filter" className="sr-only">
            Filter by importance
          </label>
          <Select
            id="cast-importance-filter"
            value={importanceFilter}
            onChange={(event) =>
              setImportanceFilter(event.target.value as Importance | "all")
            }
            className="h-9 w-36"
          >
            <option value="all">Every importance</option>
            {IMPORTANCE_LEVELS.map((value) => (
              <option key={value} value={value}>
                {IMPORTANCE_META[value].label}
              </option>
            ))}
          </Select>
          {filtering ? (
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

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

      {characters.length > 0 && visible.length === 0 ? (
        <EmptyState title="No one matches">
          Nothing in the cast matches this search and filter. Clear it to see everyone
          again.
        </EmptyState>
      ) : null}

      {view === "cards" && visible.length > 0 ? (
        <ul className="space-y-2">
          {visible.map((character) => {
            const { filled, total } = progress(character);
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
      ) : null}

      {view === "table" && visible.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[64rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              Every character on one row, one column per key field. Use it to spot a gap
              across the whole cast.
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface-2 text-muted">
                <th scope="col" className="p-2 font-medium">
                  Name
                </th>
                <th scope="col" className="p-2 font-medium">
                  Role
                </th>
                <th scope="col" className="p-2 font-medium">
                  Importance
                </th>
                <th scope="col" className="p-2 font-medium">
                  Depth
                </th>
                <th scope="col" className="p-2 font-medium">
                  Complete
                </th>
                {TABLE_FIELDS.map((field) => (
                  <th key={field.key} scope="col" className="p-2 font-medium" title={field.help}>
                    {field.label}
                  </th>
                ))}
                {customFields.map((def) => (
                  <th key={def.id} scope="col" className="p-2 font-medium">
                    {def.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((character) => {
                const { filled, total } = progress(character);
                const selected = character.id === selectedId;

                return (
                  <tr
                    key={character.id}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-surface-2",
                      selected && "bg-accent-soft",
                    )}
                  >
                    <th scope="row" className="p-2 font-normal">
                      <button
                        type="button"
                        onClick={() => onSelect(character.id)}
                        className="flex items-center gap-2 text-left text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-full border border-black/10"
                          style={{ background: character.colorTag ?? "var(--muted)" }}
                        />
                        <span className="truncate">{character.name || "Unnamed"}</span>
                      </button>
                    </th>
                    <td className="p-2 whitespace-nowrap text-muted">
                      {CHARACTER_ROLE_META[character.role].label}
                    </td>
                    <td className="p-2 whitespace-nowrap text-muted">
                      {IMPORTANCE_META[character.importance].label}
                    </td>
                    <td className="p-2 whitespace-nowrap text-muted">
                      {DEPTH_META[character.depth].label}
                    </td>
                    <td className="p-2 whitespace-nowrap text-muted">
                      {percent(filled, total)}%
                    </td>
                    {TABLE_FIELDS.map((field) => {
                      const text = fieldValueToText(character.fields[field.key]);
                      return (
                        <td
                          key={field.key}
                          className={cn("max-w-56 p-2 align-top", text ? "text-foreground" : "text-muted/60")}
                        >
                          <span className="line-clamp-2 break-words whitespace-pre-line">
                            {text || "—"}
                          </span>
                        </td>
                      );
                    })}
                    {customFields.map((def) => {
                      const text = fieldValueToText(character.custom[def.id]);
                      return (
                        <td
                          key={def.id}
                          className={cn("max-w-56 p-2 align-top", text ? "text-foreground" : "text-muted/60")}
                        >
                          <span className="line-clamp-2 break-words whitespace-pre-line">
                            {text || "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {characters.length > 0 ? (
        <p className="text-xs text-muted">
          {`${characters.length} ${pluralise(characters.length, "character")} in the cast`}
        </p>
      ) : null}
    </section>
  );
}
