// @vitest-environment jsdom
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { BibleView } from "@/components/BibleView";
import { BriefView } from "@/components/BriefView";
import { CastList } from "@/components/CastList";
import { CharacterEditor } from "@/components/CharacterEditor";
import { ExportPanel } from "@/components/ExportPanel";
import { WorldPanel } from "@/components/WorldEditor";
import { cleanMinimal, deepFull } from "@/test/fixtures";
import { createProject, type Project } from "@/lib/schema";
import { useProjectStore } from "@/lib/store";

/**
 * The two document views, actually rendered.
 *
 * There is no testing-library here and none is needed: these views are pure
 * renders of a compiled document, and the only state they read is the project.
 * Mounting them with `react-dom/client` is enough to hold the things that would
 * otherwise only be caught by eye — that the shared `DocumentBlocks` draws the
 * bible and the brief the same way, that a section's own words reach the screen,
 * and that the brief with no cast says so instead of rendering an empty shell.
 *
 * What no test here checks is how any of it *looks*. Nothing in this file has
 * seen a browser.
 */

// React only allows a render outside `act` when it has been told this is a test.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function render(element: ReactElement): Promise<string> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(element);
  });
  const html = container.innerHTML;

  await act(async () => {
    root.unmount();
  });
  container.remove();
  return html;
}

function withProject(project: Project): void {
  useProjectStore.setState({ project, lastSavedAt: null });
}

/**
 * The hints a rendered view carries: `{ id }` → its tooltip text.
 *
 * The tooltip is always in the DOM, which is what lets a screen reader be told
 * what a section is; whether it becomes *visible* on hover is CSS, and no test
 * here has seen a browser.
 */
function tooltipsOf(html: string): Map<string, string> {
  const tooltips = new Map<string, string>();
  for (const match of html.matchAll(/id="([^"]+)" role="tooltip"[^>]*>([\s\S]*?)<\/span>/g)) {
    tooltips.set(match[1] ?? "", match[2] ?? "");
  }
  return tooltips;
}

/** Every `aria-describedby` in a rendered view, and the label that points with it. */
function describedBy(html: string): { label: string; id: string }[] {
  return [...html.matchAll(/aria-label="([^"]*)"[^>]*aria-describedby="([^"]+)"/g)].map(
    (match) => ({ label: match[1] ?? "", id: match[2] ?? "" }),
  );
}

afterEach(() => {
  useProjectStore.setState({ project: null, lastSavedAt: null });
});

describe("the Story Bible view", () => {
  it("draws the compiled document: contents, numbered sections and profiles", async () => {
    withProject(deepFull());
    const html = await render(createElement(BibleView));

    expect(html).toContain("Orah and the Salt Road — Story Bible");
    expect(html).toContain("Contents");
    expect(html).toContain("2. Protected canon — do not change");
    expect(html).toContain("Mara Vale");
    expect(html).toContain("That the truth will prove she abandoned her brother.");
    // The live badge is a page fact, not a document one, and never prints.
    expect(html).toContain("Live — updates as you type");
  });

  it("offers nothing to compile when there is no cast", async () => {
    withProject(createProject({ title: "Empty", genre: "general", storyType: "novel" }));
    const html = await render(createElement(BibleView));

    expect(html).toContain("Nothing to compile yet");
  });
});

describe("the Collaborator brief view", () => {
  it("reads as the frozen brief a collaborator answers (§8.2)", async () => {
    withProject(deepFull());
    const html = await render(createElement(BriefView));

    expect(html).toContain("Orah and the Salt Road — Collaborator brief");
    expect(html).toContain("the ground is set before a word is written");
    expect(html).toContain("One page — the context, not the manuscript");
    // §8.5 travels with the document rather than sitting beside it on screen.
    expect(html).toContain("This is the context, not the manuscript.");
  });

  it("hands over copy, Markdown and Word from the same place (§8.4)", async () => {
    withProject(deepFull());
    const html = await render(createElement(BriefView));

    expect(html).toContain("Copy the brief");
    expect(html).toContain("Markdown (.md)");
    expect(html).toContain("Word (.docx)");
  });

  it("keeps the one-page order of §8.1", async () => {
    withProject(deepFull());
    const html = await render(createElement(BriefView));

    const headings = [
      "1. The brief",
      "2. What must not change",
      "3. The cast, one line each",
      "4. The rules that cannot be broken",
      "5. Where you come in",
      "6. Open questions for the collaborator",
    ];
    let previous = -1;
    for (const heading of headings) {
      const at = html.indexOf(heading);
      expect(at, heading).toBeGreaterThan(previous);
      previous = at;
    }
  });

  it("says there is nothing to hand over yet, rather than showing an empty page", async () => {
    withProject(createProject({ title: "Empty", genre: "general", storyType: "novel" }));
    const html = await render(createElement(BriefView));

    expect(html).toContain("Nothing to hand over yet");
    expect(html).not.toContain("Copy the brief");
  });
});

describe("section explanations live behind an icon", () => {
  /** The hinted text of a rendered view, all of it joined. */
  function hintsOf(html: string): { labels: string[]; text: string } {
    const tooltips = tooltipsOf(html);
    const described = describedBy(html);
    return {
      labels: described.map((entry) => entry.label),
      // Every icon must point at a tooltip that exists, or the words are lost.
      text: described
        .map((entry) => tooltips.get(entry.id) ?? `MISSING TOOLTIP ${entry.id}`)
        .join("\n"),
    };
  }

  it("wires an icon to the words it is hiding, for hover, focus and a screen reader", async () => {
    withProject(deepFull());
    const html = await render(
      createElement(CastList, { selectedId: null, onSelect: () => {} }),
    );
    const hints = hintsOf(html);

    expect(hints.labels).toContain("What “Cast” is for");
    expect(hints.text).toContain("Every answer is saved in this browser as you type");
    expect(hints.text).not.toContain("MISSING TOOLTIP");
    // Hidden from print: an un-hoverable tooltip has no way to be read on paper.
    expect(html).toContain("print:hidden");
  });

  it("leaves the count as the only line under the cast", async () => {
    withProject(deepFull());
    const html = await render(
      createElement(CastList, { selectedId: null, onSelect: () => {} }),
    );

    expect(html).toContain("3 characters in the cast");
    expect(html).not.toContain("in the cast. Every answer");
  });

  it("leaves the export panel with no explanation paragraphs at all", async () => {
    withProject(deepFull());
    const html = await render(createElement(ExportPanel));
    const hints = hintsOf(html);

    expect(hints.text).toContain("Every file here is built in this browser");
    expect(hints.text).toContain("The JSON file is the round-trip format");
    expect(hints.text).not.toContain("MISSING TOOLTIP");
    // Nothing section-level is left sitting in the panel as visible prose.
    expect(html).not.toContain('<p class="mt-1 text-xs leading-relaxed text-muted">');
  });

  it("hides every world section's explanation, and keeps the heading", async () => {
    withProject(deepFull());
    const html = await render(createElement(WorldPanel));
    const hints = hintsOf(html);

    // Ampersands are escaped in the markup, hence `&amp;` here.
    expect(hints.labels).toEqual([
      "What “World” is for",
      "What “Setting &amp; era” is for",
      "What “Locations” is for",
      "What “Rules &amp; systems” is for",
      "What “Factions &amp; institutions” is for",
      "What “Timeline” is for",
      "What “Glossary” is for",
    ]);
    expect(hints.text).toContain("The cost and the limit are what stop a rule bending later.");
    expect(hints.text).not.toContain("MISSING TOOLTIP");
    // The headings themselves are still headings, and still the section's name.
    expect(html).toContain(">Rules &amp; systems<");
    expect(html).toContain(">Glossary<");
  });

  it("hides the field groups' blurbs on a profile", async () => {
    withProject(deepFull());
    const character = deepFull().characters[0];
    if (!character) throw new Error("fixture has no character");

    const hints = hintsOf(
      await render(createElement(CharacterEditor, { character, onBack: () => {} })),
    );

    expect(hints.labels).toContain("What “Identity” is for");
    expect(hints.labels).toContain("What “Relationships” is for");
    expect(hints.labels).toContain("What “Custom fields” is for");
    expect(hints.text).toContain("Who they are, and where they sit in the story.");
    expect(hints.text).not.toContain("MISSING TOOLTIP");
  });
});

describe("the two documents share one renderer", () => {
  it("draws the same do-not-change line in both views, with its emphasis", async () => {
    // §8.2 makes the brief the same object as the bible; the block renderer is
    // what keeps them from drifting apart, so this is asserted on both. The
    // markers are not in the markup: the view has to draw the bold the file has.
    withProject(deepFull());
    const [bible, brief] = [
      await render(createElement(BibleView)),
      await render(createElement(BriefView)),
    ];
    const line =
      "<strong class=\"font-semibold text-foreground\">Mara's hesitation and guilt are protected.</strong>";

    expect(bible).toContain(line);
    expect(brief).toContain(line);
    // The markers never reach the screen. The one place Markdown is shown as it
    // will be exported is the relationship map's `pre` block, which is why this
    // is asserted on the canon line rather than on the whole document.
    expect(bible).not.toContain("**Mara's hesitation");
    expect(brief).not.toContain("**Mara's hesitation");
  });

  it("draws a thin project's cast in both", async () => {
    withProject(cleanMinimal());
    const [bible, brief] = [
      await render(createElement(BibleView)),
      await render(createElement(BriefView)),
    ];

    expect(bible).toContain("Ada Reyes");
    expect(brief).toContain("Ada Reyes");
  });
});
