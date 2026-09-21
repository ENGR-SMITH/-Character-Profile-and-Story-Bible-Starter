"use client";

import { useState } from "react";

import { DocumentBlocks } from "@/components/DocumentBlocks";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { compileBrief, projectBriefText } from "@/lib/brief";
import { downloadBlob, downloadText, exportFilename } from "@/lib/export/download";
import { briefDocxBlob } from "@/lib/export/docx";
import { briefMarkdown } from "@/lib/export/markdown";
import type { Project } from "@/lib/schema";
import { useProject } from "@/lib/store";

/**
 * The collaborator context brief, on screen (§5.8).
 *
 * Its own work area rather than a paragraph in the export panel, because the
 * writer is meant to *read* it before handing it over: §8.2's frozen framing
 * only works if the brief is the thing they are looking at, and §8.4's copy and
 * download belong beside what they are handing over.
 *
 * Everything here is the compiled document and nothing else — the same blocks
 * the Story Bible renders, drawn by the shared `DocumentBlocks`, so the brief on
 * screen, the copy and the two files cannot disagree. It is also the one place
 * the brief is exported from, so there is no second set of buttons to keep in
 * step.
 */

type Format = "copy" | "md" | "docx";

export function BriefView() {
  const stored = useProject();

  const [busy, setBusy] = useState<Format | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!stored) return null;
  // A definite binding, so the handlers below need no narrowing gymnastics.
  const project: Project = stored;

  const brief = compileBrief(project);

  async function run(format: Format, work: () => Promise<void>) {
    setBusy(format);
    setNote(null);
    try {
      await work();
    } catch (error) {
      // A download that fails should say so rather than quietly doing nothing.
      setNote(
        `That export could not be built: ${
          error instanceof Error ? error.message : "unknown error"
        }.`,
      );
    } finally {
      setBusy(null);
    }
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(projectBriefText(project));
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      setNote("The browser refused clipboard access. The Markdown export has the same text.");
    }
  }

  if (project.characters.length === 0) {
    return (
      <EmptyState title="Nothing to hand over yet">
        The brief is the ground a co-writer, editor or beta reader works from — the
        project facts, what must not change, one line per character and the rules of the
        world. It has no cast to describe yet, so add a character and it fills in.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              {`${brief.title} — Collaborator brief`}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{brief.subtitle}</span>
              <Badge className="border-accent/40 text-accent print:hidden">
                One page — the context, not the manuscript
              </Badge>
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
              {brief.disclosure}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button size="sm" onClick={() => void run("copy", copyBrief)}>
              {copied ? "Copied" : "Copy the brief"}
            </Button>
            <Button
              size="sm"
              disabled={busy === "md"}
              onClick={() =>
                void run("md", async () => {
                  downloadText(
                    briefMarkdown(project),
                    exportFilename(project, "collaborator-brief", "md"),
                    "text/markdown",
                  );
                  setNote("Brief saved as Markdown.");
                })
              }
            >
              {busy === "md" ? "Building…" : "Markdown (.md)"}
            </Button>
            <Button
              size="sm"
              disabled={busy === "docx"}
              onClick={() =>
                void run("docx", async () => {
                  downloadBlob(
                    await briefDocxBlob(project),
                    exportFilename(project, "collaborator-brief", "docx"),
                  );
                  setNote("Brief saved as a Word file.");
                })
              }
            >
              {busy === "docx" ? "Building Word file…" : "Word (.docx)"}
            </Button>
          </div>
        </div>
        <p aria-live="polite" className="mt-2 text-xs text-muted">
          {note ?? ""}
        </p>
      </Card>

      {brief.sections.map((section) => (
        <Card key={section.id} className="p-5 print:break-inside-avoid">
          <section id={section.id} className="scroll-mt-6">
            <h3 className="text-sm font-semibold text-foreground">
              {`${section.number}. ${section.title}`}
            </h3>
            <DocumentBlocks blocks={section.blocks} level={4} />
          </section>
        </Card>
      ))}
    </div>
  );
}
