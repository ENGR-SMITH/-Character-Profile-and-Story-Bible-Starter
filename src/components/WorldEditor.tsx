"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import {
  Badge,
  Button,
  Card,
  HelpText,
  InfoHint,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import type { GlossaryEntry, Location } from "@/lib/schema";
import { useProjectStore } from "@/lib/store";
import { LOCATION_TYPE_META, LOCATION_TYPES, type LocationType } from "@/lib/taxonomy";
import {
  parseAliasList,
  rulesWithGaps,
  timelineInOrder,
  worldCounts,
} from "@/lib/world";

/**
 * The world half of the tool (DEVELOPMENT.md §5.5).
 *
 * One card per collection, in the order the spec lists them. Everything writes
 * straight through to the store, so the autosave indicator covers the world
 * exactly as it covers the cast — there is no separate save step.
 */

/** The shared shell: heading, count, an optional warning and an add button. */
function SectionCard({
  title,
  hint,
  count,
  warning,
  actions,
  children,
}: {
  title: string;
  hint: string;
  count?: number;
  warning?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
            {title}
            {count !== undefined ? (
              <span className="font-normal text-muted">{count}</span>
            ) : null}
            <InfoHint label={title}>{hint}</InfoHint>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {warning ? (
            <Badge className="border-accent/40 text-accent" title={warning}>
              {warning}
            </Badge>
          ) : null}
          {actions}
        </div>
      </div>
      {children}
    </Card>
  );
}

/**
 * The one-field add form every collection shares, so naming something is always
 * the same gesture. `extra` carries the few collections that need a second
 * choice at creation time (a location's type).
 */
function AddForm({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  extra,
}: {
  placeholder: string;
  submitLabel: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  extra?: ReactNode;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-2 rounded-lg border border-border bg-surface-2 p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoFocus
          aria-label={placeholder}
        />
        {extra}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={!value.trim()}>
          {submitLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ToggleButton({
  open,
  label,
  onClick,
}: {
  open: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button size="sm" onClick={onClick}>
      {open ? "Cancel" : label}
    </Button>
  );
}

/** Attach cast members to something: a faction, or a point on the timeline. */
function CharacterChecklist({
  ids,
  onToggle,
  emptyLabel,
}: {
  ids: readonly string[];
  onToggle: (characterId: string) => void;
  emptyLabel: string;
}) {
  const project = useProjectStore((state) => state.project);
  if (!project) return null;
  if (project.characters.length === 0) return <HelpText>{emptyLabel}</HelpText>;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
      {project.characters.map((character) => (
        <label
          key={character.id}
          className="flex items-center gap-1.5 text-xs text-foreground"
        >
          <input
            type="checkbox"
            checked={ids.includes(character.id)}
            onChange={() => onToggle(character.id)}
            className="size-3.5 accent-accent"
          />
          {character.name || "Unnamed"}
        </label>
      ))}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-xl border border-border bg-surface p-3">{children}</li>
  );
}

/** The name input and Remove button every row starts with. */
function RowHeader({
  label,
  value,
  onChange,
  onRemove,
  right,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          placeholder={label}
        />
        {right}
      </div>
      <Button size="sm" variant="ghost" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

function Details({ children }: { children: ReactNode }) {
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs text-muted transition-colors hover:text-foreground">
        Details
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Setting & era (§5.5.1) and culture (§5.5.4)
// ---------------------------------------------------------------------------

function SettingCard() {
  const project = useProjectStore((state) => state.project);
  const updateWorld = useProjectStore((state) => state.updateWorld);
  if (!project) return null;

  const world = project.world;

  return (
    <SectionCard
      title="Setting & era"
      hint="Where and when the story happens, and how that world differs from the reader's."
    >
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="world-setting">Where it happens</Label>
          <Input
            id="world-setting"
            value={world.setting ?? ""}
            onChange={(event) => updateWorld({ setting: event.target.value })}
            placeholder="The salt road, and the valley it leaves"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="world-era">When</Label>
          <Input
            id="world-era"
            value={world.era ?? ""}
            onChange={(event) => updateWorld({ era: event.target.value })}
            placeholder="A late century, unrecognised"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="world-tech">Technology level</Label>
          <Input
            id="world-tech"
            value={world.techLevel ?? ""}
            onChange={(event) => updateWorld({ techLevel: event.target.value })}
            placeholder="Gunpowder, clockwork, no telegraph"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="world-differs">How it differs from the reader&apos;s world</Label>
          <Input
            id="world-differs"
            value={world.differs ?? ""}
            onChange={(event) => updateWorld({ differs: event.target.value })}
            placeholder="Salt is currency, and letters are testimony"
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="world-culture">Culture & society</Label>
          <Textarea
            id="world-culture"
            value={world.culture ?? ""}
            onChange={(event) => updateWorld({ culture: event.target.value })}
            placeholder="Norms, traditions, languages, government, taboos"
            rows={3}
            className="mt-1.5"
          />
          <HelpText>
            The things a newcomer would get wrong — and that a co-writer has no way to guess.
          </HelpText>
        </div>
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Locations (§5.5.2)
// ---------------------------------------------------------------------------

function LocationsCard() {
  const project = useProjectStore((state) => state.project);
  const addLocation = useProjectStore((state) => state.addLocation);
  const updateLocation = useProjectStore((state) => state.updateLocation);
  const removeLocation = useProjectStore((state) => state.removeLocation);

  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<LocationType>("building");

  if (!project) return null;

  return (
    <SectionCard
      title="Locations"
      hint="Places the story uses more than once. What it smells like is what a scene is made of."
      count={project.locations.length || undefined}
      actions={
        <ToggleButton
          open={adding}
          label="Add location"
          onClick={() => setAdding((open) => !open)}
        />
      }
    >
      {adding ? (
        <AddForm
          placeholder="Location name"
          submitLabel="Add location"
          onCancel={() => setAdding(false)}
          onSubmit={(name) => {
            addLocation({ name, type });
            setAdding(false);
          }}
          extra={
            <Select
              value={type}
              onChange={(event) => setType(event.target.value as LocationType)}
              aria-label="New location type"
              className="sm:w-44"
            >
              {LOCATION_TYPES.map((value) => (
                <option key={value} value={value}>
                  {LOCATION_TYPE_META[value].label}
                </option>
              ))}
            </Select>
          }
        />
      ) : null}

      {project.locations.length === 0 && !adding ? (
        <HelpText>
          No places yet. Even two — where the story opens, and where it ends — makes the world
          checkable later.
        </HelpText>
      ) : null}

      {project.locations.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {project.locations.map((location: Location) => (
            <Row key={location.id}>
              <RowHeader
                label="Location name"
                value={location.name}
                onChange={(name) => updateLocation(location.id, { name })}
                onRemove={() => removeLocation(location.id)}
                right={
                  <Select
                    value={location.type ?? ""}
                    onChange={(event) =>
                      updateLocation(location.id, {
                        type: event.target.value || undefined,
                      })
                    }
                    aria-label="Location type"
                    className="sm:w-44"
                  >
                    <option value="">Not decided yet</option>
                    {LOCATION_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {LOCATION_TYPE_META[value].label}
                      </option>
                    ))}
                  </Select>
                }
              />
              <Details>
                <div className="sm:col-span-2">
                  <Label htmlFor={`loc-description-${location.id}`}>Description</Label>
                  <Textarea
                    id={`loc-description-${location.id}`}
                    value={location.description ?? ""}
                    onChange={(event) =>
                      updateLocation(location.id, { description: event.target.value })
                    }
                    rows={2}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor={`loc-significance-${location.id}`}>
                    Why it matters
                  </Label>
                  <Input
                    id={`loc-significance-${location.id}`}
                    value={location.significance ?? ""}
                    onChange={(event) =>
                      updateLocation(location.id, { significance: event.target.value })
                    }
                    placeholder="What happens here, or what it cost"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor={`loc-who-${location.id}`}>Who is usually here</Label>
                  <Input
                    id={`loc-who-${location.id}`}
                    value={location.whoIsThere ?? ""}
                    onChange={(event) =>
                      updateLocation(location.id, { whoIsThere: event.target.value })
                    }
                    placeholder="The people a scene finds here"
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`loc-sensory-${location.id}`}>Sensory detail</Label>
                  <Input
                    id={`loc-sensory-${location.id}`}
                    value={location.sensory ?? ""}
                    onChange={(event) =>
                      updateLocation(location.id, { sensory: event.target.value })
                    }
                    placeholder="Smell, sound, light, texture"
                    className="mt-1.5"
                  />
                  <HelpText>
                    One concrete detail is worth more here than an adjective — it is what a
                    collaborator can reuse without asking.
                  </HelpText>
                </div>
              </Details>
            </Row>
          ))}
        </ul>
      ) : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Rules & systems (§5.5.3)
// ---------------------------------------------------------------------------

function RulesCard() {
  const project = useProjectStore((state) => state.project);
  const addRule = useProjectStore((state) => state.addRule);
  const updateRule = useProjectStore((state) => state.updateRule);
  const removeRule = useProjectStore((state) => state.removeRule);

  const [adding, setAdding] = useState(false);

  if (!project) return null;

  const incomplete = rulesWithGaps(project);

  return (
    <SectionCard
      title="Rules & systems"
      hint="How the world actually works — magic, technology, law, money. The cost and the limit are what stop a rule bending later."
      count={project.rules.length || undefined}
      warning={
        incomplete.length > 0
          ? `${incomplete.length} still missing a limit`
          : undefined
      }
      actions={
        <ToggleButton open={adding} label="Add rule" onClick={() => setAdding((open) => !open)} />
      }
    >
      {adding ? (
        <AddForm
          placeholder="Rule name"
          submitLabel="Add rule"
          onCancel={() => setAdding(false)}
          onSubmit={(name) => {
            addRule({ name });
            setAdding(false);
          }}
        />
      ) : null}

      {project.rules.length === 0 && !adding ? (
        <HelpText>
          No rules yet. A rule is anything a reader would notice being broken — including the
          plain physical limits of your world.
        </HelpText>
      ) : null}

      {project.rules.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {project.rules.map((rule) => {
            const missingCost = rule.cost.trim() === "";
            const missingLimit = rule.cannotDo.trim() === "";

            return (
              <Row key={rule.id}>
                <RowHeader
                  label="Rule name"
                  value={rule.name}
                  onChange={(name) => updateRule(rule.id, { name })}
                  onRemove={() => removeRule(rule.id)}
                  right={
                    missingCost || missingLimit ? (
                      <span className="sm:self-center">
                        <Badge className="border-accent/40 text-accent">
                          {missingCost && missingLimit
                            ? "Needs a cost and a limit"
                            : missingCost
                              ? "Needs a cost"
                              : "Needs a limit"}
                        </Badge>
                      </span>
                    ) : null
                  }
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor={`rule-does-${rule.id}`}>What it does</Label>
                    <Textarea
                      id={`rule-does-${rule.id}`}
                      value={rule.does}
                      onChange={(event) => updateRule(rule.id, { does: event.target.value })}
                      rows={2}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rule-cost-${rule.id}`}>What it costs</Label>
                    <Input
                      id={`rule-cost-${rule.id}`}
                      value={rule.cost}
                      onChange={(event) => updateRule(rule.id, { cost: event.target.value })}
                      placeholder="The price of using it"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rule-cannot-${rule.id}`}>What it cannot do</Label>
                    <Input
                      id={`rule-cannot-${rule.id}`}
                      value={rule.cannotDo}
                      onChange={(event) => updateRule(rule.id, { cannotDo: event.target.value })}
                      placeholder="The limit, stated as a rule"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`rule-access-${rule.id}`}>Who has access</Label>
                    <Input
                      id={`rule-access-${rule.id}`}
                      value={rule.access ?? ""}
                      onChange={(event) => updateRule(rule.id, { access: event.target.value })}
                      placeholder="Everyone, or only the orchard families"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </Row>
            );
          })}
        </ul>
      ) : null}

      {incomplete.length > 0 ? (
        <HelpText>
          A rule without a cost or a limit is the one a later chapter breaks by accident. Fill
          them in while the answer is still obvious.
        </HelpText>
      ) : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Factions & institutions (§5.5.5)
// ---------------------------------------------------------------------------

function FactionsCard() {
  const project = useProjectStore((state) => state.project);
  const addFaction = useProjectStore((state) => state.addFaction);
  const updateFaction = useProjectStore((state) => state.updateFaction);
  const toggleFactionMember = useProjectStore((state) => state.toggleFactionMember);
  const removeFaction = useProjectStore((state) => state.removeFaction);

  const [adding, setAdding] = useState(false);

  if (!project) return null;

  return (
    <SectionCard
      title="Factions & institutions"
      hint="Groups that act on their own, and the characters inside them."
      count={project.factions.length || undefined}
      actions={
        <ToggleButton
          open={adding}
          label="Add faction"
          onClick={() => setAdding((open) => !open)}
        />
      }
    >
      {adding ? (
        <AddForm
          placeholder="Faction name"
          submitLabel="Add faction"
          onCancel={() => setAdding(false)}
          onSubmit={(name) => {
            addFaction({ name });
            setAdding(false);
          }}
        />
      ) : null}

      {project.factions.length === 0 && !adding ? (
        <HelpText>
          No factions yet. Anything with a leader and an interest counts — a council, a guild, a
          family, a crew.
        </HelpText>
      ) : null}

      {project.factions.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {project.factions.map((faction) => (
            <Row key={faction.id}>
              <RowHeader
                label="Faction name"
                value={faction.name}
                onChange={(name) => updateFaction(faction.id, { name })}
                onRemove={() => removeFaction(faction.id)}
              />
              <Details>
                <div className="sm:col-span-2">
                  <Label htmlFor={`faction-purpose-${faction.id}`}>Purpose</Label>
                  <Input
                    id={`faction-purpose-${faction.id}`}
                    value={faction.purpose ?? ""}
                    onChange={(event) =>
                      updateFaction(faction.id, { purpose: event.target.value })
                    }
                    placeholder="What it exists to do"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor={`faction-leader-${faction.id}`}>Who leads it</Label>
                  <Input
                    id={`faction-leader-${faction.id}`}
                    value={faction.leader ?? ""}
                    onChange={(event) =>
                      updateFaction(faction.id, { leader: event.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor={`faction-notes-${faction.id}`}>Notes</Label>
                  <Input
                    id={`faction-notes-${faction.id}`}
                    value={faction.notes ?? ""}
                    onChange={(event) =>
                      updateFaction(faction.id, { notes: event.target.value })
                    }
                    placeholder="How it can be used, and by whom"
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-sm font-medium text-foreground">
                    Characters inside it
                  </span>
                  <div className="mt-1.5">
                    <CharacterChecklist
                      ids={faction.memberIds}
                      onToggle={(characterId) =>
                        toggleFactionMember(faction.id, characterId)
                      }
                      emptyLabel="Add a character to the cast and they can be named here."
                    />
                  </div>
                </div>
              </Details>
            </Row>
          ))}
        </ul>
      ) : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Timeline (§5.5.6)
// ---------------------------------------------------------------------------

function TimelineCard() {
  const project = useProjectStore((state) => state.project);
  const addTimelineEvent = useProjectStore((state) => state.addTimelineEvent);
  const updateTimelineEvent = useProjectStore((state) => state.updateTimelineEvent);
  const toggleTimelineCharacter = useProjectStore(
    (state) => state.toggleTimelineCharacter,
  );
  const moveTimelineEvent = useProjectStore((state) => state.moveTimelineEvent);
  const removeTimelineEvent = useProjectStore((state) => state.removeTimelineEvent);

  const [adding, setAdding] = useState(false);

  if (!project) return null;

  const ordered = timelineInOrder(project);

  return (
    <SectionCard
      title="Timeline"
      hint="What happened, in order. Attach the characters who were there — the age check in the continuity pass reads these."
      count={ordered.length || undefined}
      actions={
        <ToggleButton
          open={adding}
          label="Add event"
          onClick={() => setAdding((open) => !open)}
        />
      }
    >
      {adding ? (
        <AddForm
          placeholder="Event"
          submitLabel="Add event"
          onCancel={() => setAdding(false)}
          onSubmit={(label) => {
            addTimelineEvent({ label });
            setAdding(false);
          }}
        />
      ) : null}

      {ordered.length === 0 && !adding ? (
        <HelpText>
          Nothing on the timeline yet. Two anchors — the last thing that happened before the
          story, and where it opens — is enough to start.
        </HelpText>
      ) : null}

      {ordered.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {ordered.map((event, index) => (
            <Row key={event.id}>
              <RowHeader
                label="Event"
                value={event.label}
                onChange={(label) => updateTimelineEvent(event.id, { label })}
                onRemove={() => removeTimelineEvent(event.id)}
                right={
                  <span className="flex items-center gap-2">
                    <Input
                      value={event.when ?? ""}
                      onChange={(input) =>
                        updateTimelineEvent(event.id, { when: input.target.value })
                      }
                      aria-label="When"
                      placeholder="Year or age"
                      className="sm:w-36"
                    />
                    <span className="flex shrink-0 items-center gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveTimelineEvent(event.id, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${event.label} earlier`}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveTimelineEvent(event.id, 1)}
                        disabled={index === ordered.length - 1}
                        aria-label={`Move ${event.label} later`}
                      >
                        ↓
                      </Button>
                    </span>
                  </span>
                }
              />
              <Details>
                <div className="sm:col-span-2">
                  <Label htmlFor={`event-notes-${event.id}`}>Notes</Label>
                  <Input
                    id={`event-notes-${event.id}`}
                    value={event.notes ?? ""}
                    onChange={(input) =>
                      updateTimelineEvent(event.id, { notes: input.target.value })
                    }
                    placeholder="What changed, and who was there"
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-sm font-medium text-foreground">
                    Characters present
                  </span>
                  <div className="mt-1.5">
                    <CharacterChecklist
                      ids={event.characterIds}
                      onToggle={(characterId) =>
                        toggleTimelineCharacter(event.id, characterId)
                      }
                      emptyLabel="Add a character to the cast and they can be present here."
                    />
                  </div>
                </div>
              </Details>
            </Row>
          ))}
        </ol>
      ) : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Glossary (§5.5.7)
// ---------------------------------------------------------------------------

/**
 * One glossary row.
 *
 * The alias field keeps its own text rather than echoing the parsed list back,
 * because parsing on every keystroke would eat the comma or newline the writer
 * just typed and make a second alias impossible to enter.
 */
function GlossaryRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: GlossaryEntry;
  onChange: (patch: Partial<Pick<GlossaryEntry, "term" | "definition" | "aliases">>) => void;
  onRemove: () => void;
}) {
  const [aliases, setAliases] = useState(entry.aliases.join(", "));

  return (
    <Row>
      <RowHeader
        label="Term"
        value={entry.term}
        onChange={(term) => onChange({ term })}
        onRemove={onRemove}
      />
      <Details>
        <div className="sm:col-span-2">
          <Label htmlFor={`gloss-definition-${entry.id}`}>Definition</Label>
          <Textarea
            id={`gloss-definition-${entry.id}`}
            value={entry.definition}
            onChange={(event) => onChange({ definition: event.target.value })}
            rows={2}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`gloss-aliases-${entry.id}`}>
            Spellings that are also correct
          </Label>
          <Input
            id={`gloss-aliases-${entry.id}`}
            value={aliases}
            onChange={(event) => {
              setAliases(event.target.value);
              onChange({ aliases: parseAliasList(event.target.value) });
            }}
            placeholder="Vale orchard, the orchard"
            className="mt-1.5"
          />
          <HelpText>
            The canonical spelling is the term itself. Comma- or line-separated aliases are the
            ones that are not mistakes — anything else nearby gets flagged later.
          </HelpText>
        </div>
      </Details>
    </Row>
  );
}

function GlossaryCard() {
  const project = useProjectStore((state) => state.project);
  const addGlossaryEntry = useProjectStore((state) => state.addGlossaryEntry);
  const updateGlossaryEntry = useProjectStore((state) => state.updateGlossaryEntry);
  const removeGlossaryEntry = useProjectStore((state) => state.removeGlossaryEntry);

  const [adding, setAdding] = useState(false);

  if (!project) return null;

  return (
    <SectionCard
      title="Glossary"
      hint="Invented words, places and titles, with the one spelling you are keeping. The cheapest fix for the most common continuity error."
      count={project.glossary.length || undefined}
      actions={
        <ToggleButton
          open={adding}
          label="Add term"
          onClick={() => setAdding((open) => !open)}
        />
      }
    >
      {adding ? (
        <AddForm
          placeholder="Term"
          submitLabel="Add term"
          onCancel={() => setAdding(false)}
          onSubmit={(term) => {
            addGlossaryEntry({ term });
            setAdding(false);
          }}
        />
      ) : null}

      {project.glossary.length === 0 && !adding ? (
        <HelpText>
          No terms yet. Add one the moment you invent it — a word only gets two spellings after
          you have stopped looking at it.
        </HelpText>
      ) : null}

      {project.glossary.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {project.glossary.map((entry) => (
            <GlossaryRow
              key={entry.id}
              entry={entry}
              onChange={(patch) => updateGlossaryEntry(entry.id, patch)}
              onRemove={() => removeGlossaryEntry(entry.id)}
            />
          ))}
        </ul>
      ) : null}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------

/**
 * The world work area: setting and culture first, then the collections.
 *
 * The summary line counts what exists, so the writer can see at a glance what
 * the collaborator would be handed today.
 */
export function WorldPanel() {
  const project = useProjectStore((state) => state.project);
  if (!project) return null;

  const counts = worldCounts(project);

  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <span>
          {counts.locations + counts.rules + counts.factions + counts.timelineEvents +
            counts.glossary}{" "}
          world entries
        </span>
        <InfoHint label="World">
          Everything you enter here is saved in this browser as you type, and belongs in the
          bible a collaborator works from: the setting, the places, the rules that cannot be
          broken, who is on which side, what happened when, and the words only this world uses.
        </InfoHint>
      </p>

      <SettingCard />
      <LocationsCard />
      <RulesCard />
      <FactionsCard />
      <TimelineCard />
      <GlossaryCard />
    </div>
  );
}
