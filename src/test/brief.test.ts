import { describe, expect, it } from "vitest";

import { compileBible } from "@/lib/bible";
import {
  BRIEF_DISCLOSURE,
  BRIEF_FRAMING,
  castOneLiner,
  compileBrief,
  projectBriefText,
  suggestRole,
} from "@/lib/brief";
import { exportFilename } from "@/lib/export/download";
import { briefMarkdown } from "@/lib/export/markdown";
import {
  createCharacter,
  createProject,
  createRule,
  type Character,
  type Project,
} from "@/lib/schema";
import { cleanMinimal, deepFull } from "@/test/fixtures";

/**
 * The collaborator context brief (§5.8).
 *
 * The brief is the one output whose whole job is to make the second person
 * possible, so these tests hold it to the five things §8.1 promises, the
 * framing and privacy lines of §8.2 and §8.5, the role suggestion of §8.3, and
 * the honesty of a one-page document: each list that has to be clipped says how
 * much it left out rather than trailing off.
 */

const EXPORTED_AT = new Date("2026-09-21T10:00:00.000Z");

/** A project with `count` characters who have nothing written down yet. */
function castOf(count: number): Project {
  const project = createProject({ title: "Crowded", genre: "general", storyType: "novel" });
  for (let index = 1; index <= count; index += 1) {
    project.characters.push(createCharacter({ name: `Character ${index}` }));
  }
  return project;
}

function firstCharacter(project: Project): Character {
  const character = project.characters[0];
  if (!character) throw new Error("fixture has no character");
  return character;
}

describe("§8.1 — the five things, in the order a respondent needs them", () => {
  const brief = compileBrief(deepFull());

  it("leads with the ground, then the do-not-change block and the cast", () => {
    expect(brief.sections.map((section) => section.title)).toEqual([
      "The brief",
      "What must not change",
      "The cast, one line each",
      "The rules that cannot be broken",
      "Where you come in",
      "Open questions for the collaborator",
    ]);
  });

  it("is the same kind of object as the bible, with a label of its own", () => {
    // §8.2: "deliberately the same object the Pitch Board publishes".
    expect(brief.label).toBe("Collaborator brief");
    expect(brief.sections[0]?.blocks[0]).toEqual({
      kind: "paragraph",
      text: BRIEF_FRAMING,
    });
  });

  it("numbers its sections straight through, unlike the bible's fixed numbers", () => {
    const minimal = cleanMinimal();
    expect(compileBrief(minimal).sections.map((section) => section.number)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    // The bible keeps §5.7.3's numbers, so its second kept section is 3 — the
    // protected canon it does not have is still section 2.
    expect(compileBible(minimal).sections.map((section) => section.number)[1]).toBe(3);
  });

  it("has nothing pending, because a brief never leaves a section out", () => {
    expect(brief.pending).toEqual([]);
    expect(projectBriefText(deepFull())).not.toContain("Still to come in this bible");
  });

  it("is one page where the bible is a paginated document (§8.1)", () => {
    expect(brief.pageBreakSections).toBe(false);
    expect(compileBible(deepFull()).pageBreakSections).toBe(true);
  });

  it("says so when there is no protected canon rather than leaving a gap", () => {
    const text = projectBriefText(cleanMinimal());
    expect(text).toContain("Nothing is marked as protected yet.");
  });
});

describe("§8.1 — the cast, one line each", () => {
  it("names what a character wants, with their role and importance", () => {
    const ada = firstCharacter(cleanMinimal());
    const line = castOneLiner(ada);

    expect(line.startsWith("Ada Reyes (Protagonist, POV) — ")).toBe(true);
    expect(line).toContain("Recover the ledger her father burned.");
  });

  it("falls back to what is going on with them, then to what they are like", () => {
    const character = createCharacter({ name: "Nell" });
    character.fields.currentSituation = { kind: "long", value: "Waiting on the tide." };

    expect(castOneLiner(character)).toContain("Waiting on the tide.");

    const blank = createCharacter({ name: "Nell" });
    // Not a bare name: a line that looks complete is worse than one that asks.
    expect(castOneLiner(blank)).toContain("nothing written down yet");
  });

  it("keeps a one-liner one line, clipping rather than reformatting", () => {
    const character = createCharacter({ name: "Nell" });
    character.fields.externalGoal = { kind: "long", value: "a".repeat(400) };

    const line = castOneLiner(character);
    expect(line.endsWith("…")).toBe(true);
    expect(line.length).toBeLessThan(240);
  });

  it("counts what it left out once there is more than a page of cast", () => {
    expect(projectBriefText(castOf(11))).toContain(
      "+ 3 more characters in the full bible.",
    );
    // One left out is a plural of its own.
    expect(projectBriefText(castOf(9))).toContain("+ 1 more character in the full bible.");
  });
});

describe("§8.1 — the rules that cannot be broken", () => {
  const text = projectBriefText(deepFull());

  it("names what a rule does, what it costs and what it cannot do (§5.5.3)", () => {
    expect(text).toContain("The letters keep their signature — what it does:");
    expect(text).toContain("what it costs: The rite costs the writer the memory of writing it.");
    expect(text).toContain("who has access: Anyone who can reach the orchard ledger.");
  });

  it("flags a rule that has not said what it costs or what it cannot do", () => {
    const project = createProject({ title: "Loose rule", genre: "general", storyType: "novel" });
    project.rules.push(createRule({ name: "The tide comes at dawn" }));

    expect(projectBriefText(project)).toContain(
      "The tide comes at dawn — not written down yet: no cost, no limit",
    );
  });

  it("counts what it left out once there are more rules than fit", () => {
    const project = createProject({ title: "Many rules", genre: "general", storyType: "novel" });
    for (let index = 1; index <= 8; index += 1) {
      project.rules.push(createRule({ name: `Rule ${index}` }));
    }

    expect(projectBriefText(project)).toContain("+ 2 more rules in the full bible.");
  });
});

describe("§8.3 — the suggested role", () => {
  function withOpenQuestion(): Project {
    const project = cleanMinimal();
    firstCharacter(project).openQuestions.push("What does she owe her father's creditors?");
    return project;
  }

  function withGround(): Project {
    const project = cleanMinimal();
    project.canonFacts.push({
      id: "canon_ledger",
      statement: "The ledger is never recovered.",
      scope: "project",
    });
    return project;
  }

  it("suggests a builder when there is nothing to review", () => {
    const empty = createProject({ title: "Empty", genre: "general", storyType: "novel" });
    expect(suggestRole(empty).role).toBe("co-writer");
    expect(suggestRole(empty).why).toContain("no cast");

    const thin = createProject({ title: "Thin", genre: "general", storyType: "novel" });
    thin.characters.push(createCharacter({ name: "Nell" }));
    expect(suggestRole(thin).role).toBe("co-writer");
    expect(suggestRole(thin).why).toContain("still thin");
  });

  it("suggests an editor when the ground is settled but decisions are open", () => {
    expect(suggestRole(withOpenQuestion())).toMatchObject({
      role: "editor",
    });
  });

  it("suggests a beta reader when the ground is settled and nothing is open", () => {
    expect(suggestRole(withGround())).toMatchObject({ role: "beta-reader" });
  });

  it("suggests a proofreader when everything asked has been answered", () => {
    expect(suggestRole(cleanMinimal())).toMatchObject({ role: "proofreader" });
  });

  it("reads as a suggestion rather than a verdict", () => {
    const text = projectBriefText(withGround());
    expect(text).toContain("Suggested role: Beta reader");
    expect(text).toContain("It is a suggestion: the writer decides who they are asking.");
  });
});

describe("§8.5 — the privacy line", () => {
  it("says what the brief is not, in the plan's own spirit", () => {
    expect(BRIEF_DISCLOSURE).toContain("the context, not the manuscript");
    expect(BRIEF_DISCLOSURE).toContain("no prose");
    // The promise the whole tool rests on: nothing left the browser.
    expect(BRIEF_DISCLOSURE).toContain("browser");
  });

  it("travels with the document rather than sitting beside it on screen", () => {
    const brief = compileBrief(deepFull());
    expect(brief.disclosure).toBe(BRIEF_DISCLOSURE);
    expect(projectBriefText(deepFull())).toContain(BRIEF_DISCLOSURE);
  });
});

describe("§8.4 — copy and download", () => {
  it("exports the compiled brief, so the file and the copy cannot disagree", () => {
    const project = deepFull();
    expect(
      briefMarkdown(project, EXPORTED_AT).startsWith(projectBriefText(project)),
    ).toBe(true);
  });

  it("names the brief's file after the project, apart from the bible", () => {
    const project = deepFull();
    expect(exportFilename(project, "collaborator-brief", "md")).toBe(
      "orah-and-the-salt-road.collaborator-brief.md",
    );
    expect(exportFilename(project, "collaborator-brief", "docx")).toBe(
      "orah-and-the-salt-road.collaborator-brief.docx",
    );
  });

  it("stamps the exported file, so a stale brief is detectable", () => {
    expect(briefMarkdown(deepFull(), EXPORTED_AT)).toContain(
      "Exported from the Character Profile & Story Bible Starter on 2026-09-21T10:00:00.000Z.",
    );
  });
});
