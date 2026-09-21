"use client";

import { useState, type ChangeEvent } from "react";

import { Button, Card, InfoHint } from "@/components/ui";
import { bibleToText, compileBible } from "@/lib/bible";
import { castCsv } from "@/lib/export/csv";
import { bibleDocxBlob } from "@/lib/export/docx";
import {
  downloadBlob,
  downloadText,
  exportFilename,
  readFileAsText,
} from "@/lib/export/download";
import { projectJson, readProjectJson } from "@/lib/export/json";
import { bibleMarkdown } from "@/lib/export/markdown";
import { biblePdfBlob } from "@/lib/export/pdf";
import { biblePlainText } from "@/lib/export/text";
import type { Project } from "@/lib/schema";
import { useProject, useProjectStore } from "@/lib/store";

/**
 * Copy, export and import (§5.9, and §7.1's "copy & export" step).
 *
 * Everything is generated in the browser and handed straight to the writer's
 * disk: there is no upload, no account and no server round trip anywhere in
 * here. The two formats that need a library — Word and PDF — fetch it when the
 * button is pressed, which is why they show what they are doing.
 *
 * The collaborator brief has its own work area (`BriefView`), where it can be
 * read before it is handed over, so it is not exported from here as well: one
 * document, one place its buttons live.
 */

type Format = "copy" | "markdown" | "text" | "json" | "csv" | "docx" | "pdf";
type PendingImport = { project: Project; writtenBy: number };

export function ExportPanel() {
  const stored = useProject();
  const importProject = useProjectStore((state) => state.importProject);

  const [busy, setBusy] = useState<Format | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  if (!stored) return null;
  // A definite binding, so the handlers below need no narrowing gymnastics.
  const project: Project = stored;

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

  async function copyBible() {
    try {
      await navigator.clipboard.writeText(bibleToText(compileBible(project)));
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      setNote("The browser refused clipboard access. The Markdown export has the same text.");
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clearing the input means picking the same file twice still fires a change.
    event.target.value = "";
    if (!file) return;

    const result = readProjectJson(await readFileAsText(file));
    if (!result.ok) {
      setPendingImport(null);
      setNote(result.error);
      return;
    }

    setNote(null);
    if (project.characters.length === 0) {
      // Nothing to lose, so nothing to confirm.
      importProject(result.project);
      setNote("Project imported.");
      return;
    }
    setPendingImport({ project: result.project, writtenBy: result.writtenBy });
  }

  return (
    // Hidden when printing: the buttons that make the file are not the file.
    <Card className="p-5 print:hidden">
      <div>
        <h2 className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-foreground">
          Copy &amp; export
          <InfoHint label="Copy & export">
            Every file here is built in this browser and saved straight to your disk —
            nothing is uploaded, and there is no account to make. Word and PDF fetch their
            library when you press the button, which is why those two show what they are
            doing.
          </InfoHint>
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => void run("copy", copyBible)}>
          {copied ? "Copied" : "Copy the bible"}
        </Button>

        <Button
          size="sm"
          variant="primary"
          disabled={busy === "markdown"}
          onClick={() =>
            void run("markdown", async () => {
              downloadText(
                bibleMarkdown(project),
                exportFilename(project, "story-bible", "md"),
                "text/markdown",
              );
              setNote("Markdown saved.");
            })
          }
        >
          {busy === "markdown" ? "Building…" : "Markdown (.md)"}
        </Button>

        <Button
          size="sm"
          disabled={busy === "text"}
          onClick={() =>
            void run("text", async () => {
              downloadText(
                biblePlainText(project),
                exportFilename(project, "story-bible", "txt"),
                "text/plain",
              );
              setNote("Plain text saved.");
            })
          }
        >
          {busy === "text" ? "Building…" : "Plain text (.txt)"}
        </Button>

        <Button
          size="sm"
          disabled={busy === "json"}
          onClick={() =>
            void run("json", async () => {
              downloadText(
                projectJson(project),
                exportFilename(project, null, "json"),
                "application/json",
              );
              setNote("JSON saved — this is the file that imports back without loss.");
            })
          }
        >
          {busy === "json" ? "Building…" : "JSON (.json)"}
        </Button>

        <Button
          size="sm"
          disabled={busy === "csv"}
          onClick={() =>
            void run("csv", async () => {
              downloadText(
                castCsv(project),
                exportFilename(project, "cast", "csv"),
                "text/csv",
              );
              setNote("Cast table saved.");
            })
          }
        >
          {busy === "csv" ? "Building…" : "Cast table (.csv)"}
        </Button>

        <Button
          size="sm"
          disabled={busy === "docx"}
          onClick={() =>
            void run("docx", async () => {
              downloadBlob(
                await bibleDocxBlob(project),
                exportFilename(project, "story-bible", "docx"),
              );
              setNote("Word file saved.");
            })
          }
        >
          {busy === "docx" ? "Building Word file…" : "Word (.docx)"}
        </Button>

        <Button
          size="sm"
          disabled={busy === "pdf"}
          onClick={() =>
            void run("pdf", async () => {
              downloadBlob(
                await biblePdfBlob(project),
                exportFilename(project, "story-bible", "pdf"),
              );
              setNote("PDF saved.");
            })
          }
        >
          {busy === "pdf" ? "Building PDF…" : "PDF (.pdf)"}
        </Button>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* The hint sits beside the label rather than inside it: a button in a
              label would open the file picker when the writer asked a question. */}
          <span className="flex items-center gap-1.5">
            <label htmlFor="import-json" className="text-xs font-medium text-foreground">
              Import a JSON export
            </label>
            <InfoHint label="Import a JSON export">
              The JSON file is the round-trip format: it re-imports without loss, and it is
              what a later export to the Authors Den will be built from. Importing replaces
              the project in this browser, so export a copy first if you want to keep it. The
              one-page brief for a collaborator lives in its own work area.
            </InfoHint>
          </span>
          <input
            id="import-json"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleFile(event)}
            className="max-w-64 text-xs text-muted file:mr-2 file:rounded-md file:border file:border-border file:bg-surface file:px-2 file:py-1 file:text-xs file:text-foreground"
          />
        </div>

      </div>

      {pendingImport ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
          <p className="text-xs leading-relaxed text-foreground">
            {`That file holds "${pendingImport.project.meta.title}" with ${pendingImport.project.characters.length} ${
              pendingImport.project.characters.length === 1 ? "character" : "characters"
            }, written by schema version ${pendingImport.writtenBy}. Importing replaces the project in this browser — export a JSON copy of what you have first if you want to keep it.`}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                importProject(pendingImport.project);
                setPendingImport(null);
                setNote("Project imported.");
              }}
            >
              Replace this project
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPendingImport(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className="mt-3 text-xs text-muted">
        {note ?? ""}
      </p>
    </Card>
  );
}
