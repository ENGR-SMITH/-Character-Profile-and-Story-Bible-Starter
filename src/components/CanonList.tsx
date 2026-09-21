"use client";

import { useState, type FormEvent } from "react";

import { Badge, Button, Card, HelpText, InfoHint, Input, Select } from "@/components/ui";
import {
  useCharacters,
  useProject,
  useProjectStore,
} from "@/lib/store";
import { CANON_SCOPE_META, CANON_SCOPES, type CanonScope } from "@/lib/taxonomy";
import { pluralise } from "@/lib/utils";

/**
 * The protected canon list (§5.6.7).
 *
 * Marking canon is an editorial act rather than another field, which is why a
 * protected fact stores its own statement instead of pointing at the field it
 * came from (§6.3): the writer's words here have to survive any later edit to
 * the answer they were taken from.
 *
 * Everything on this list is compiled into the top of the bible, so a
 * collaborator knows what must not change before they read anything else.
 */
export function CanonList() {
  const project = useProject();
  const characters = useCharacters();
  const addCanonFact = useProjectStore((state) => state.addCanonFact);
  const updateCanonFact = useProjectStore((state) => state.updateCanonFact);
  const removeCanonFact = useProjectStore((state) => state.removeCanonFact);

  const [statement, setStatement] = useState("");
  const [scope, setScope] = useState<CanonScope>("project");
  const [subjectId, setSubjectId] = useState("");

  if (!project) return null;

  const facts = project.canonFacts;
  // A character-scoped fact needs a character; without one the scope is not
  // offered, so the list can never hold a fact about nobody.
  const canScopeToCharacter = characters.length > 0;
  const characterScopeReady = scope !== "character" || subjectId !== "";

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!statement.trim() || !characterScopeReady) return;

    addCanonFact({ statement, scope, subjectId: subjectId || undefined });
    setStatement("");
    setScope("project");
    setSubjectId("");
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
            Protected canon — do not change
            {facts.length > 0 ? (
              <span className="font-normal text-muted">{facts.length}</span>
            ) : null}
            <InfoHint label="Protected canon">
              Facts a collaborator must not change. Each one stores its own wording, so it
              survives any later edit to the answer it came from, and they are compiled into
              the top of the bible, ahead of everything else.
            </InfoHint>
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        className="mt-3 space-y-2 rounded-lg border border-border bg-surface-2 p-3"
      >
        <Input
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
          placeholder="Mara has never left the valley, in any era of the story"
          aria-label="Protected fact"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={scope}
            onChange={(event) => setScope(event.target.value as CanonScope)}
            aria-label="What the fact is true of"
            className="sm:w-40"
          >
            {CANON_SCOPES.filter(
              (value) => value !== "character" || canScopeToCharacter,
            ).map((value) => (
              <option key={value} value={value}>
                {CANON_SCOPE_META[value].label}
              </option>
            ))}
          </Select>
          {scope === "character" ? (
            <Select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              aria-label="Which character"
              className="sm:w-48"
            >
              <option value="">Which character?</option>
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name || "Unnamed"}
                </option>
              ))}
            </Select>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!statement.trim() || !characterScopeReady}
            className="sm:ml-auto"
          >
            Protect this fact
          </Button>
        </div>
        <HelpText>{CANON_SCOPE_META[scope].hint}.</HelpText>
      </form>

      {facts.length === 0 ? (
        <HelpText>
          Nothing is protected yet. Write the things someone else would otherwise get wrong —
          how a name is spelled, what a rule costs, what the story never resolves.
        </HelpText>
      ) : null}

      {facts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {facts.map((fact) => (
            <li
              key={fact.id}
              className="flex flex-wrap items-start gap-2 rounded-xl border border-border bg-surface p-3"
            >
              <Input
                value={fact.statement}
                onChange={(event) =>
                  updateCanonFact(fact.id, { statement: event.target.value })
                }
                aria-label="Protected fact"
                className="min-w-56 flex-1"
              />
              <Select
                value={fact.scope}
                onChange={(event) => {
                  const nextScope = event.target.value as CanonScope;
                  // Rescoping to a character keeps whoever is already named, and
                  // otherwise takes the first one — so the change always lands
                  // on a fact that names somebody.
                  updateCanonFact(fact.id, {
                    scope: nextScope,
                    subjectId:
                      nextScope === "character"
                        ? (fact.subjectId ?? characters[0]?.id)
                        : undefined,
                  });
                }}
                aria-label="What the fact is true of"
                className="sm:w-40"
              >
                {CANON_SCOPES.map((value) => (
                  <option key={value} value={value}>
                    {CANON_SCOPE_META[value].label}
                  </option>
                ))}
              </Select>
              {fact.scope === "character" ? (
                <Select
                  value={fact.subjectId ?? ""}
                  onChange={(event) =>
                    updateCanonFact(fact.id, { subjectId: event.target.value })
                  }
                  aria-label="Which character"
                  className="sm:w-48"
                >
                  <option value="">Which character?</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name || "Unnamed"}
                    </option>
                  ))}
                </Select>
              ) : null}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeCanonFact(fact.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {facts.length > 0 ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge className="border-accent/40 text-accent">
            {`${facts.length} protected ${pluralise(facts.length, "fact")}`}
          </Badge>
          <span>
            A fact scoped to a character keeps its wording if that character is deleted — it
            is your sentence, not theirs.
          </span>
        </p>
      ) : null}
    </Card>
  );
}
