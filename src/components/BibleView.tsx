"use client";

import { useState } from "react";

import { DocumentBlocks } from "@/components/DocumentBlocks";
import { Badge, Button, Card, EmptyState, HelpText } from "@/components/ui";
import {
  bibleToText,
  compileBible,
  tableOfContents,
  type BibleDocument,
} from "@/lib/bible";
import { useProject } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * The live Story Bible (§5.7.1–7.3).
 *
 * Nothing here is stored: the document is compiled from the project on every
 * render, so it is live by construction and cannot drift from the answers. The
 * table of contents is derived from the document it links into, which is what
 * keeps an anchor from ever dangling. Its blocks are drawn by the shared
 * `DocumentBlocks`, which the collaborator brief uses too.
 *
 * It is also what prints (§5.7.4): the toolbar, the export buttons and the
 * live badge are hidden by the print variant, each section starts on a new page
 * as the Word export's sections do, and a profile is kept from splitting across
 * two.
 */

function TableOfContents({ bible }: { bible: BibleDocument }) {
  const toc = tableOfContents(bible);

  return (
    <Card className="p-5 print:break-after-page">
      <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
        Contents
      </h3>
      <ol className="mt-3 space-y-1.5">
        {toc.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="text-sm text-foreground underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {`${entry.number}. ${entry.label}`}
            </a>
            {entry.children.length > 0 ? (
              <ul className="mt-1 ml-4 space-y-1">
                {entry.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="text-xs text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
      {bible.pending.length > 0 ? (
        <HelpText>
          {`Not in this bible yet: ${bible.pending.join(" · ")}. Each section appears as soon as it has something in it.`}
        </HelpText>
      ) : null}
    </Card>
  );
}

export function BibleView() {
  const project = useProject();
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const bible = compileBible(project);

  async function copyBible() {
    try {
      await navigator.clipboard.writeText(bibleToText(bible));
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard access can be refused; the bible is on screen either way.
    }
  }

  if (project.characters.length === 0) {
    return (
      <EmptyState title="Nothing to compile yet">
        The bible assembles itself from your answers — cast, relationships, world and the
        questions still open. Add a character and the first sections appear.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              {`${bible.title} — Story Bible`}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{bible.subtitle}</span>
              <Badge className="border-accent/40 text-accent print:hidden">
                Live — updates as you type
              </Badge>
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
              {bible.disclosure}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button size="sm" onClick={copyBible}>
              {copied ? "Copied" : "Copy as Markdown"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.print()}>
              Print the bible
            </Button>
          </div>
        </div>
      </Card>

      <TableOfContents bible={bible} />

      {bible.sections.map((section, index) => (
        <Card
          key={section.id}
          className={cn("p-5", index > 0 && "print:break-before-page")}
        >
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
