"use client";

import { Fragment } from "react";

import type { BibleBlock } from "@/lib/bible";
import { inlineRuns } from "@/lib/export/inline";

/**
 * The one renderer for a compiled document's blocks.
 *
 * The Story Bible and the collaborator brief are the same kind of object (§8.2:
 * the brief is "deliberately the same object the Pitch Board publishes"), so
 * they are drawn by the same component. A section cannot look one way in the
 * bible and another in the brief, and there is no second renderer to keep in
 * step with the first.
 *
 * Headings nest under the page's own `h1`: a document's sections are `h3`, and
 * the entries inside them `h4`.
 */

const SUBHEADING_CLASS = "mt-5 text-xs font-semibold tracking-wide text-muted uppercase";

/**
 * A line of a document's text, with its `**bold**` drawn as bold.
 *
 * The document is Markdown, and some of its lines — the protected canon bullets
 * above all — carry emphasis. Without this the writer reads the asterisks
 * themselves on screen while the Word and PDF files have the actual emphasis,
 * which is the one place the view and the files are allowed to differ. The same
 * `inlineRuns` the DOCX writer uses does the splitting, so there is one
 * definition of what the markers mean.
 */
function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineRuns(text).map((run, index) =>
        run.bold ? (
          <strong key={index} className="font-semibold text-foreground">
            {run.text}
          </strong>
        ) : (
          <Fragment key={index}>{run.text}</Fragment>
        ),
      )}
    </>
  );
}

function Subheading({ text, level }: { text: string; level: number }) {
  return level >= 5 ? (
    <h5 className={SUBHEADING_CLASS}>
      <Inline text={text} />
    </h5>
  ) : (
    <h4 className={SUBHEADING_CLASS}>
      <Inline text={text} />
    </h4>
  );
}

function EntryTitle({ text, level }: { text: string; level: number }) {
  return level >= 5 ? (
    <h5 className="text-sm font-semibold text-foreground">
      <Inline text={text} />
    </h5>
  ) : (
    <h4 className="text-sm font-semibold text-foreground">
      <Inline text={text} />
    </h4>
  );
}

/** Render a compiled document's blocks. `level` is the heading level of an entry. */
export function DocumentBlocks({
  blocks,
  level,
}: {
  blocks: readonly BibleBlock[];
  level: number;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "paragraph":
            return (
              <p
                key={index}
                className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted"
              >
                <Inline text={block.text} />
              </p>
            );

          case "facts":
            return (
              <dl key={index} className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
                {block.facts.map((fact) => (
                  <div key={fact.label} className="contents">
                    <dt className="text-xs font-medium text-muted">{fact.label}</dt>
                    <dd className="text-sm text-foreground sm:col-start-2">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            );

          case "bullets":
            return (
              <ul key={index} className="mt-3 space-y-1.5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2 text-sm text-foreground">
                    <span aria-hidden className="text-muted">
                      ·
                    </span>
                    <span className="min-w-0">
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "subheading":
            return <Subheading key={index} text={block.text} level={level} />;

          case "markdown":
            // Already-Markdown text (the relationship map of §5.4.3), shown as
            // it will be exported rather than re-rendered as a second format.
            return (
              <pre
                key={index}
                className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground"
              >
                {block.text}
              </pre>
            );

          case "entries":
            return (
              <div key={index} className="mt-4 space-y-6">
                {block.entries.map((entry) => (
                  <section
                    key={entry.id}
                    id={entry.id}
                    className="scroll-mt-6 print:break-inside-avoid"
                  >
                    <EntryTitle text={entry.title} level={level} />
                    <DocumentBlocks blocks={entry.blocks} level={level + 1} />
                  </section>
                ))}
              </div>
            );
        }
      })}
    </>
  );
}
