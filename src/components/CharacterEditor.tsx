"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  HelpText,
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
} from "@/lib/schema";
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
  const overall = measureFields(character, visibleFields);

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
                <h3 className="text-sm font-semibold text-foreground">{meta.label}</h3>
                <p className="text-xs text-muted">{meta.blurb}</p>
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
    </div>
  );
}
