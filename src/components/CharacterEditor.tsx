"use client";

import { useState, type FormEvent } from "react";

import {
  Badge,
  Button,
  Card,
  HelpText,
  InfoHint,
  Input,
  Label,
  Meter,
  Select,
  Textarea,
} from "@/components/ui";
import {
  FIELD_GROUPS,
  FIELD_GROUP_META,
  fieldsForDepth,
  fieldsInGroup,
  type FieldDef,
} from "@/lib/fields";
import {
  fieldValueToText,
  measureFields,
  isFieldValueEmpty,
  type Character,
  type CustomFieldDef,
  type Relationship,
} from "@/lib/schema";
import { relationshipsFor } from "@/lib/relationships";
import { useProjectStore } from "@/lib/store";
import {
  CHARACTER_COLORS,
  CHARACTER_ROLE_META,
  CHARACTER_ROLES,
  DEPTH_META,
  DEPTH_MODES,
  DEPTH_ORDER,
  GENRE_META,
  IMPORTANCE_META,
  IMPORTANCE_LEVELS,
  RELATIONSHIP_STATUSES,
  RELATIONSHIP_STATUS_META,
  RELATIONSHIP_TYPE_META,
  RELATIONSHIP_TYPES,
  type DepthMode,
  type LayerKey,
} from "@/lib/taxonomy";
import { cn, percent } from "@/lib/utils";

/**
 * One field, with its label, control and help line.
 *
 * A filled field gets a subtle raised background so progress is visible while
 * scanning a long form, and carries a clear action so removing a wrong answer
 * is one click rather than a select-all and delete.
 */
function FieldControl({
  character,
  field,
}: {
  character: Character;
  field: FieldDef;
}) {
  const setCharacterField = useProjectStore((state) => state.setCharacterField);
  const clearCharacterField = useProjectStore((state) => state.clearCharacterField);

  const value = character.fields[field.key];
  const text = fieldValueToText(value);
  const filled = !isFieldValueEmpty(value);
  const id = `${character.id}-${field.key}`;

  const handleChange = (raw: string) => setCharacterField(character.id, field, raw);

  let control;
  if (field.kind === "select") {
    control = (
      <Select
        id={id}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
      >
        <option value="">Not decided yet</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  } else if (field.kind === "list") {
    control = (
      <Textarea
        id={id}
        rows={3}
        value={text}
        placeholder={field.placeholder}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-20"
      />
    );
  } else if (field.kind === "long") {
    control = (
      <Textarea
        id={id}
        rows={3}
        value={text}
        placeholder={field.placeholder}
        onChange={(event) => handleChange(event.target.value)}
      />
    );
  } else {
    control = (
      <Input
        id={id}
        value={text}
        placeholder={field.placeholder}
        onChange={(event) => handleChange(event.target.value)}
      />
    );
  }

  return (
    <div className={cn("rounded-lg p-3", filled ? "bg-surface-2" : "bg-transparent")}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{field.label}</Label>
        {filled ? (
          <button
            type="button"
            onClick={() => clearCharacterField(character.id, field.key)}
            className="rounded text-[11px] text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-1.5">{control}</div>
      <HelpText>
        {field.help}
        {field.kind === "list" ? " One per line." : ""}
      </HelpText>
    </div>
  );
}

const CUSTOM_FIELD_KINDS: Array<{ value: CustomFieldDef["kind"]; label: string }> = [
  { value: "text", label: "Short text" },
  { value: "long", label: "Long answer" },
  { value: "list", label: "List — one per line" },
  { value: "number", label: "Number" },
];

/**
 * One writer-defined field, bound to the current character's answer.
 *
 * The definition is project-wide (§5.2 2.6), so the input here writes to
 * `character.custom` while the label, kind and remove action come from the
 * project's `customFields` list.
 */
function CustomFieldControl({
  character,
  def,
}: {
  character: Character;
  def: CustomFieldDef;
}) {
  const setCharacterCustomField = useProjectStore(
    (state) => state.setCharacterCustomField,
  );
  const clearCharacterCustomField = useProjectStore(
    (state) => state.clearCharacterCustomField,
  );
  const removeCustomField = useProjectStore((state) => state.removeCustomField);

  const value = character.custom[def.id];
  const text = fieldValueToText(value);
  const filled = !isFieldValueEmpty(value);
  const id = `${character.id}-custom-${def.id}`;
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const handleChange = (raw: string) => setCharacterCustomField(character.id, def, raw);

  let control;
  if (def.kind === "list" || def.kind === "long") {
    control = (
      <Textarea
        id={id}
        rows={3}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-20"
      />
    );
  } else {
    control = (
      <Input
        id={id}
        value={text}
        inputMode={def.kind === "number" ? "numeric" : undefined}
        onChange={(event) => handleChange(event.target.value)}
      />
    );
  }

  return (
    <div className={cn("rounded-lg p-3", filled ? "bg-surface-2" : "bg-transparent")}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{def.label}</Label>
        <span className="flex items-center gap-2">
          {filled ? (
            <button
              type="button"
              onClick={() => clearCharacterCustomField(character.id, def.id)}
              className="rounded text-[11px] text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear
            </button>
          ) : null}
          {confirmingRemove ? (
            <>
              <button
                type="button"
                onClick={() => removeCustomField(def.id)}
                className="rounded text-[11px] text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Remove from every character
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                className="rounded text-[11px] text-muted hover:text-foreground"
              >
                Keep
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              className="rounded text-[11px] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Remove
            </button>
          )}
        </span>
      </div>
      <div className="mt-1.5">{control}</div>
      <HelpText>
        {def.kind === "list" ? "One per line. " : ""}
        Defined once for the whole project — every character answers the same question.
      </HelpText>
    </div>
  );
}

/**
 * The relationships section (§5.4).
 *
 * A relationship is added from one character but stored as a single
 * bidirectional row, so the same entry appears on the other profile without
 * being copied there. The row is never edited per-side; the one field that
 * carries a difference of view is `asymmetryNote`, surfaced as an open
 * question rather than a contradiction (§5.4.6).
 */
function RelationshipsCard({ character }: { character: Character }) {
  const project = useProjectStore((state) => state.project);
  const addRelationship = useProjectStore((state) => state.addRelationship);
  const updateRelationship = useProjectStore((state) => state.updateRelationship);
  const removeRelationship = useProjectStore((state) => state.removeRelationship);

  const [adding, setAdding] = useState(false);
  const [toId, setToId] = useState("");
  const [type, setType] = useState<Relationship["type"]>("ally");
  const [nature, setNature] = useState("");

  if (!project) return null;

  const others = project.characters.filter((candidate) => candidate.id !== character.id);
  const entries = relationshipsFor(project, character.id);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!toId) return;
    addRelationship({ fromId: character.id, toId, type, nature });
    setToId("");
    setType("ally");
    setNature("");
    setAdding(false);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
            Relationships
            <InfoHint label="Relationships">
              Each relationship is one row, so it appears on the other character&apos;s
              profile automatically and is never stored twice. Tension, a secret and the POV
              difference are kept for the bible, where a collaborator reads them.
            </InfoHint>
          </h3>
        </div>
        <Button
          size="sm"
          onClick={() => setAdding((open) => !open)}
          disabled={others.length === 0}
          title={others.length === 0 ? "Add a second character first" : undefined}
        >
          {adding ? "Cancel" : "Add relationship"}
        </Button>
      </div>

      {others.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          A relationship needs two people. Add another character to the cast, then connect
          them here.
        </p>
      ) : null}

      {adding ? (
        <form
          onSubmit={handleAdd}
          className="mt-3 space-y-3 rounded-lg border border-border bg-surface-2 p-3"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="relationship-target">Related to</Label>
              <Select
                id="relationship-target"
                value={toId}
                onChange={(event) => setToId(event.target.value)}
                className="mt-1.5"
              >
                <option value="">Choose a character…</option>
                {others.map((other) => (
                  <option key={other.id} value={other.id}>
                    {other.name || "Unnamed"}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="relationship-type">Type</Label>
              <Select
                id="relationship-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as Relationship["type"])
                }
                className="mt-1.5"
              >
                {RELATIONSHIP_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {RELATIONSHIP_TYPE_META[value].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="relationship-nature">In one line</Label>
            <Input
              id="relationship-nature"
              value={nature}
              onChange={(event) => setNature(event.target.value)}
              placeholder="Missing brother; source of her guilt"
              className="mt-1.5"
            />
            <HelpText>
              The plain-language description that goes into the bible&apos;s relationship map.
            </HelpText>
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={!toId}>
            Add relationship
          </Button>
        </form>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-4 space-y-2">
          {entries.map(({ relationship, other }) => (
            <div
              key={relationship.id}
              className="rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full border border-black/10"
                      style={{ background: other.colorTag ?? "var(--muted)" }}
                    />
                    <span className="truncate">{other.name || "Unnamed"}</span>
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge>{RELATIONSHIP_TYPE_META[relationship.type].label}</Badge>
                    {relationship.status ? (
                      <Badge>{RELATIONSHIP_STATUS_META[relationship.status].label}</Badge>
                    ) : null}
                    {relationship.asymmetryNote ? (
                      <Badge className="border-accent/40 text-accent">Uneven</Badge>
                    ) : null}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRelationship(relationship.id)}
                >
                  Remove
                </Button>
              </div>

              {relationship.nature ? (
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {relationship.nature}
                </p>
              ) : null}

              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted transition-colors hover:text-foreground">
                  Details
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`rel-type-${relationship.id}`}>Type</Label>
                    <Select
                      id={`rel-type-${relationship.id}`}
                      value={relationship.type}
                      onChange={(event) =>
                        updateRelationship(relationship.id, {
                          type: event.target.value as Relationship["type"],
                        })
                      }
                      className="mt-1.5"
                    >
                      {RELATIONSHIP_TYPES.map((value) => (
                        <option key={value} value={value}>
                          {RELATIONSHIP_TYPE_META[value].label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`rel-status-${relationship.id}`}>Status</Label>
                    <Select
                      id={`rel-status-${relationship.id}`}
                      value={relationship.status ?? "open"}
                      onChange={(event) =>
                        updateRelationship(relationship.id, {
                          status: event.target.value as Relationship["status"],
                        })
                      }
                      className="mt-1.5"
                    >
                      {RELATIONSHIP_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {RELATIONSHIP_STATUS_META[value].label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`rel-nature-${relationship.id}`}>In one line</Label>
                    <Input
                      id={`rel-nature-${relationship.id}`}
                      value={relationship.nature ?? ""}
                      onChange={(event) =>
                        updateRelationship(relationship.id, { nature: event.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`rel-tension-${relationship.id}`}>Tension</Label>
                    <Input
                      id={`rel-tension-${relationship.id}`}
                      value={relationship.tension ?? ""}
                      onChange={(event) =>
                        updateRelationship(relationship.id, { tension: event.target.value })
                      }
                      placeholder="What is pulling them apart"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`rel-secret-${relationship.id}`}>
                      Secret in this relationship
                    </Label>
                    <Input
                      id={`rel-secret-${relationship.id}`}
                      value={relationship.secret ?? ""}
                      onChange={(event) =>
                        updateRelationship(relationship.id, { secret: event.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`rel-asymmetry-${relationship.id}`}>
                      Do they see it the same way?
                    </Label>
                    <Input
                      id={`rel-asymmetry-${relationship.id}`}
                      value={relationship.asymmetryNote ?? ""}
                      onChange={(event) =>
                        updateRelationship(relationship.id, {
                          asymmetryNote: event.target.value,
                        })
                      }
                      placeholder="She thinks they are friends; he is using her"
                      className="mt-1.5"
                    />
                    <HelpText>
                      If the two sides feel differently, say so here. It is reported as an
                      open question, not as an error — an uneven relationship is usually
                      deliberate.
                    </HelpText>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

/**
 * The custom-field section: add a field, answer it, or remove it everywhere.
 *
 * This directly mirrors the Nexet Characters feature, and it is what keeps the
 * fixed §5.3 catalog from being a ceiling on what a writer can record.
 */
function CustomFieldsCard({ character }: { character: Character }) {
  const project = useProjectStore((state) => state.project);
  const addCustomField = useProjectStore((state) => state.addCustomField);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<CustomFieldDef["kind"]>("text");

  const defs = project?.customFields ?? [];

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) return;
    addCustomField({ label, kind });
    setLabel("");
    setKind("text");
    setAdding(false);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
            Custom fields
            <InfoHint label="Custom fields">
              Your own questions, on top of the catalog: defined once for the project, and
              answered by each character in their own profile. Removing a definition removes
              the answers it gathered, because a value with no definition no longer means
              anything.
            </InfoHint>
          </h3>
        </div>
        <Button size="sm" onClick={() => setAdding((open) => !open)}>
          {adding ? "Cancel" : "Add field"}
        </Button>
      </div>

      {adding ? (
        <form
          onSubmit={handleAdd}
          className="mt-3 space-y-3 rounded-lg border border-border bg-surface-2 p-3"
        >
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Field label — e.g. Accent"
              autoFocus
              aria-label="New custom field label"
            />
            <Select
              value={kind}
              onChange={(event) => setKind(event.target.value as CustomFieldDef["kind"])}
              aria-label="New custom field type"
            >
              {CUSTOM_FIELD_KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!label.trim()}
          >
            Add field to the project
          </Button>
        </form>
      ) : null}

      {defs.length === 0 && !adding ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Nothing here yet. If your world has a detail the catalog never asks about, add it
          here and it applies to every character — and it travels with them into the bible
          and the exports.
        </p>
      ) : null}

      {defs.length > 0 ? (
        <div className="mt-4 space-y-2">
          {defs.map((def) => (
            <CustomFieldControl key={def.id} character={character} def={def} />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export function CharacterEditor({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const project = useProjectStore((state) => state.project);
  const renameCharacter = useProjectStore((state) => state.renameCharacter);
  const patchCharacter = useProjectStore((state) => state.patchCharacter);
  const setCharacterDepth = useProjectStore((state) => state.setCharacterDepth);
  const duplicateCharacter = useProjectStore((state) => state.duplicateCharacter);

  const [pendingDepth, setPendingDepth] = useState<DepthMode | null>(null);

  const layers: readonly LayerKey[] = project
    ? GENRE_META[project.meta.genre].layers
    : [];

  const visibleFields = fieldsForDepth(character.depth, layers);
  const customFields = project?.customFields ?? [];
  const overall = measureFields(character, visibleFields, customFields);

  /** Fields a proposed depth change would hide, where the writer has answers. */
  function fieldsHiddenBy(next: DepthMode): FieldDef[] {
    const nextKeys = new Set(fieldsForDepth(next, layers).map((f) => f.key));
    return visibleFields.filter(
      (field) => !nextKeys.has(field.key) && !isFieldValueEmpty(character.fields[field.key]),
    );
  }

  function chooseDepth(next: DepthMode) {
    if (next === character.depth) return;
    setPendingDepth(null);

    const raising = DEPTH_ORDER[next] > DEPTH_ORDER[character.depth];
    if (raising || fieldsHiddenBy(next).length === 0) {
      setCharacterDepth(character.id, next);
      return;
    }
    // Lowering would hide answers the writer already gave, so ask first.
    setPendingDepth(next);
  }

  const waitingOn = pendingDepth ? fieldsHiddenBy(pendingDepth) : [];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onBack}>
            ← Cast
          </Button>
          <span className="ml-auto text-xs text-muted">
            {overall.filled}/{overall.total} fields · {percent(overall.filled, overall.total)}%
          </span>
        </div>

        <div className="mt-3">
          <Label htmlFor="character-name">Name</Label>
          <Input
            id="character-name"
            value={character.name}
            onChange={(event) => renameCharacter(character.id, event.target.value)}
            placeholder="Character name"
            className="mt-1.5 text-base font-medium"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="character-role">Role in the story</Label>
            <Select
              id="character-role"
              value={character.role}
              onChange={(event) =>
                patchCharacter(character.id, {
                  role: event.target.value as Character["role"],
                })
              }
              className="mt-1.5"
            >
              {CHARACTER_ROLES.map((value) => (
                <option key={value} value={value}>
                  {CHARACTER_ROLE_META[value].label}
                </option>
              ))}
            </Select>
            <HelpText>{CHARACTER_ROLE_META[character.role].hint}</HelpText>
          </div>

          <div>
            <Label htmlFor="character-importance">Importance</Label>
            <Select
              id="character-importance"
              value={character.importance}
              onChange={(event) =>
                patchCharacter(character.id, {
                  importance: event.target.value as Character["importance"],
                })
              }
              className="mt-1.5"
            >
              {IMPORTANCE_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {IMPORTANCE_META[value].label}
                </option>
              ))}
            </Select>
            <HelpText>{IMPORTANCE_META[character.importance].hint}</HelpText>
          </div>
        </div>

        <div className="mt-4">
          <Label>How much do you want to answer?</Label>
          <div className="mt-1.5 inline-flex flex-wrap rounded-lg border border-border p-0.5">
            {DEPTH_MODES.map((mode) => {
              const active = character.depth === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => chooseDepth(mode)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {DEPTH_META[mode].label} · {fieldsForDepth(mode, layers).length}
                </button>
              );
            })}
          </div>
          <HelpText>
            {DEPTH_META[character.depth].hint}. Around {DEPTH_META[character.depth].minutes}.
            Raising the depth brings back anything you answered before; nothing is deleted.
          </HelpText>
        </div>

        {pendingDepth ? (
          <div className="mt-4 rounded-lg border border-accent/40 bg-accent-soft p-3">
            <p className="text-sm text-foreground">
              {`${DEPTH_META[pendingDepth].label} hides ${waitingOn.length} ${
                waitingOn.length === 1 ? "field" : "fields"
              } you have already filled in: ${waitingOn
                .slice(0, 3)
                .map((field) => field.label)
                .join(", ")}${waitingOn.length > 3 ? "…" : ""}.`}
            </p>
            <p className="mt-1 text-xs text-muted">
              Your answers are kept — raising the depth again shows them. They just will not
              appear in this view or in an export at this depth.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setCharacterDepth(character.id, pendingDepth);
                  setPendingDepth(null);
                }}
              >
                {`Hide and switch to ${DEPTH_META[pendingDepth].label}`}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPendingDepth(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-4">
          <div>
            <Label>Cast colour</Label>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {CHARACTER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={character.colorTag === color.value}
                  onClick={() => patchCharacter(character.id, { colorTag: color.value })}
                  className={cn(
                    "size-5 rounded-full border border-black/10 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                    character.colorTag === color.value
                      ? "ring-2 ring-accent ring-offset-1 ring-offset-surface"
                      : "hover:scale-110",
                  )}
                  style={{ background: color.value }}
                />
              ))}
              {character.colorTag ? (
                <button
                  type="button"
                  onClick={() => patchCharacter(character.id, { colorTag: undefined })}
                  className="rounded px-1 text-[11px] text-muted hover:text-foreground"
                >
                  None
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge>{DEPTH_META[character.depth].label}</Badge>
            <Button
              size="sm"
              onClick={() => {
                const id = duplicateCharacter(character.id);
                if (id) onBack();
              }}
            >
              Duplicate
            </Button>
          </div>
        </div>
      </Card>

      {FIELD_GROUPS.map((group) => {
        const fields = fieldsInGroup(group, character.depth, layers);
        if (fields.length === 0) return null;

        const groupProgress = measureFields(character, fields);
        const meta = FIELD_GROUP_META[group];

        return (
          <Card key={group} className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
                  {meta.label}
                  <InfoHint label={meta.label}>{meta.blurb}</InfoHint>
                </h3>
              </div>
              <span className="text-[11px] whitespace-nowrap text-muted">
                {groupProgress.filled}/{groupProgress.total}
              </span>
            </div>
            <Meter
              value={groupProgress.filled}
              total={groupProgress.total}
              className="mt-3"
            />
            <div className="mt-4 space-y-2">
              {fields.map((field) => (
                <FieldControl key={field.key} character={character} field={field} />
              ))}
            </div>
          </Card>
        );
      })}

      <RelationshipsCard character={character} />

      <CustomFieldsCard character={character} />
    </div>
  );
}
