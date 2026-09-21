"use client";

import { useState } from "react";

import { CanonList } from "@/components/CanonList";
import { Badge, Button, Card, EmptyState, InfoHint, Meter } from "@/components/ui";
import {
  CHECKER_DISCLOSURE,
  FINDING_SEVERITIES,
  SEVERITY_META,
  reportText,
  runContinuityCheck,
  type Finding,
} from "@/lib/checker";
import { generatedQuestions } from "@/lib/questions";
import { useProject, useProjectStore } from "@/lib/store";
import { cn, percent } from "@/lib/utils";

/**
 * The continuity check, as the writer sees it (§5.6).
 *
 * The panel is deliberately quiet: it lists what it found, says plainly what it
 * read, and never implies it has seen the manuscript. Findings that belong to a
 * character link back to their profile, because a report you cannot act on
 * from is a report nobody acts on.
 */
export function ContinuityPanel({
  onOpenCharacter,
}: {
  onOpenCharacter: (id: string) => void;
}) {
  const project = useProject();
  const addOpenQuestion = useProjectStore((state) => state.addOpenQuestion);
  const removeOpenQuestion = useProjectStore((state) => state.removeOpenQuestion);
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const report = runContinuityCheck(project);
  const { findings, coverage } = report;
  const questionGroups = generatedQuestions(project);
  const questionCount = questionGroups.reduce(
    (total, group) => total + group.questions.length,
    0,
  );

  const nameOf = (id: string) =>
    project.characters.find((character) => character.id === id)?.name.trim() || "Unnamed";

  async function copyReport() {
    const text = reportText(report);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard access can be refused; the findings are on screen either way.
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
              Continuity check
              <InfoHint label="Continuity check">
                Every rule it applies, in one line each: unanswered Quick fields, duplicate
                and near-duplicate names, unlinked characters, glossary spellings that
                disagree, an age the timeline contradicts, and rules still missing a cost or
                a limit. A finding is a question about the bible, not a judgement of the
                story — an uneven relationship or a shared first name is usually deliberate,
                and the check names it so a collaborator does not have to guess.
              </InfoHint>
            </h2>
            {/* The disclosure stays out here rather than in the hint: §11.1's
                promise is that the tool says plainly what it read. */}
            <p className="text-xs text-muted">{CHECKER_DISCLOSURE}</p>
          </div>
          {findings.length > 0 ? (
            <Button size="sm" onClick={copyReport}>
              {copied ? "Copied" : "Copy findings"}
            </Button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex min-w-56 flex-1 items-center gap-2">
            <Meter value={coverage.fieldsFilled} total={coverage.fieldsAsked} />
            <span className="text-[11px] whitespace-nowrap text-muted">
              {`${coverage.fieldsFilled}/${coverage.fieldsAsked} fields · ${percent(
                coverage.fieldsFilled,
                coverage.fieldsAsked,
              )}%`}
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-1">
            <Badge>
              {`${coverage.completeCharacters}/${coverage.totalCharacters} characters complete`}
            </Badge>
            {FINDING_SEVERITIES.map((severity) => {
              const count = findings.filter(
                (finding) => finding.severity === severity,
              ).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={severity}
                  className="border-accent/40 text-accent"
                >{`${count} ${SEVERITY_META[severity].label.toLowerCase()}`}</Badge>
              );
            })}
          </span>
        </div>
      </Card>

      {findings.length === 0 ? (
        <EmptyState title="Nothing flagged">
          Every rule the checker applies came back clean: no missing Quick fields, no
          duplicate names, no unlinked characters, no conflicting dates and nothing in the
          glossary fighting itself. Add more characters and it will have more to read.
        </EmptyState>
      ) : null}

      {FINDING_SEVERITIES.map((severity) => {
        const inSeverity = findings.filter((finding) => finding.severity === severity);
        if (inSeverity.length === 0) return null;

        return (
          <Card key={severity} className="p-5">
            <div>
              <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
                {SEVERITY_META[severity].label}
                <span className="font-normal text-muted">{inSeverity.length}</span>
                <InfoHint label={SEVERITY_META[severity].label}>
                  {SEVERITY_META[severity].blurb}
                </InfoHint>
              </h3>
            </div>

            <ul className="mt-4 space-y-3">
              {inSeverity.map((finding: Finding) => (
                <li
                  key={finding.id}
                  className="rounded-xl border border-border bg-surface p-3"
                >
                  <p className="text-sm font-medium text-foreground">{finding.title}</p>
                  <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-muted">
                    {finding.detail}
                  </p>
                  {finding.characterIds.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {finding.characterIds.map((id) => (
                        <Button
                          key={id}
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenCharacter(id)}
                        >
                          Open {nameOf(id)}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      {questionGroups.length > 0 ? (
        <Card className="p-5">
          <div>
            <h3 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
              Questions to answer
              <span className="font-normal text-muted">{questionCount}</span>
              <InfoHint label="Questions to answer">
                Prompts from the fields these profiles have not answered yet — the tool
                asking, not telling. Keep the ones worth answering and they join the open
                questions in the bible.
              </InfoHint>
            </h3>
          </div>

          <div className="mt-4 space-y-4">
            {questionGroups.map(({ character, questions: forCharacter }) => (
              <div key={character.id}>
                <h4 className="text-xs font-medium tracking-wide text-muted uppercase">
                  {character.name.trim() || "Unnamed"}
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {forCharacter.map((question) => (
                    <li
                      key={question.fieldKey}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-sm",
                          question.pinned ? "text-muted" : "text-foreground",
                        )}
                      >
                        {question.text}
                      </span>
                      <Button
                        size="sm"
                        variant={question.pinned ? "ghost" : "secondary"}
                        onClick={() =>
                          question.pinned
                            ? removeOpenQuestion(character.id, question.text)
                            : addOpenQuestion(character.id, question.text)
                        }
                        aria-label={
                          question.pinned
                            ? `Stop keeping: ${question.text}`
                            : `Keep: ${question.text}`
                        }
                      >
                        {question.pinned ? "Kept — remove" : "Keep"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <CanonList />
    </div>
  );
}
