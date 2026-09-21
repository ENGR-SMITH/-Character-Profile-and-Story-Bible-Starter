import { describe, expect, it } from "vitest";

import { FIELDS, FIELD_BY_KEY, fieldsForDepth } from "@/lib/fields";
import {
  MAX_OPEN_QUESTIONS,
  QUESTION_TEMPLATES,
  countGeneratedQuestions,
  generatedQuestions,
  openQuestionsFor,
  questionFor,
} from "@/lib/questions";
import { createCharacter, createProject, makeFieldValue } from "@/lib/schema";
import { brokenMessy, cleanMinimal, deepFull, fillVisibleFields } from "@/test/fixtures";

/**
 * §5.6.2's rules, held against the whole question bank rather than a sample:
 * every field has a question, every question is about a named character, and
 * every question is a question.
 */

/** The interrogatives a prompt may open with. An assertion may not. */
const STARTERS = [
  "what",
  "which",
  "where",
  "when",
  "who",
  "how",
  "why",
  "does",
  "do",
  "is",
  "are",
  "has",
  "have",
  "can",
  "will",
  "would",
  "should",
  "in which",
];

describe("the question bank", () => {
  it("has a question for every field in the catalog", () => {
    const missing = FIELDS.filter((field) => !QUESTION_TEMPLATES[field.key]).map(
      (field) => field.key,
    );
    expect(missing).toEqual([]);

    // And no question for a field that does not exist — a typo here would
    // silently leave a real field unanswered.
    const keys = new Set(FIELDS.map((field) => field.key));
    for (const key of Object.keys(QUESTION_TEMPLATES)) {
      expect(keys.has(key), `unknown field ${key}`).toBe(true);
    }
    expect(Object.keys(QUESTION_TEMPLATES)).toHaveLength(FIELDS.length);
  });

  it("asks about the character by name, as §5.6.2's example does", () => {
    for (const [key, template] of Object.entries(QUESTION_TEMPLATES)) {
      expect(template, key).toContain("{name}");
    }
  });

  it("asks, and never asserts", () => {
    for (const [key, template] of Object.entries(QUESTION_TEMPLATES)) {
      const question = template.replaceAll("{name}", "Mara");
      expect(question.endsWith("?"), `${key}: ${question}`).toBe(true);

      // An interrogative, which may be one word or two ("in which year").
      const opening = question.split(" ");
      const oneWord = opening[0]?.toLowerCase() ?? "";
      const twoWords = opening.slice(0, 2).join(" ").toLowerCase();
      expect(
        STARTERS.includes(oneWord) || STARTERS.includes(twoWords),
        `${key}: ${question}`,
      ).toBe(true);
      // One question per field: a second sentence would be the tool talking.
      expect(question.split("?").length - 1, key).toBe(1);
    }
  });

  it("fills the name in, and copes with a character who has none yet", () => {
    expect(questionFor(FIELD_BY_KEY.coreFear, "Mara Vale")).toBe(
      "What is Mara Vale most afraid of, and what have they already given up to avoid it?",
    );
    expect(questionFor(FIELD_BY_KEY.coreFear, "   ")).toContain("this character");
  });
});

describe("which questions a profile gets", () => {
  it("asks only about the fields that character's own depth shows", () => {
    const project = createProject({
      title: "Quick",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "quick" });
    project.characters.push(character);

    const questions = openQuestionsFor(project, character);
    const visible = new Set(fieldsForDepth("quick", []).map((field) => field.key));

    expect(questions.length).toBeGreaterThan(0);
    for (const question of questions) {
      expect(visible.has(question.fieldKey), question.fieldKey).toBe(true);
    }
  });

  it("never asks about a field that is already answered", () => {
    const project = createProject({
      title: "Quick",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "quick" });
    fillVisibleFields(character, "quick", []);
    character.fields.coreFear = { kind: "long", value: "" };
    project.characters.push(character);

    const questions = openQuestionsFor(project, character);
    expect(questions.map((question) => question.fieldKey)).toEqual(["coreFear"]);
  });

  it("puts the Quick fields first, because those are the ones the story needs", () => {
    const project = createProject({
      title: "Deep",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "deep" });
    project.characters.push(character);

    const questions = openQuestionsFor(project, character);
    expect(questions).toHaveLength(MAX_OPEN_QUESTIONS);

    const first = fieldsForDepth("quick", []).map((field) => field.key);
    expect(first).toContain(questions[0]?.fieldKey);
    // Ordered by tier, so a Deep field never jumps ahead of a Quick one.
    for (let index = 1; index < questions.length; index += 1) {
      const previous = questions[index - 1];
      const current = questions[index];
      if (!previous || !current) continue;
      const tiers = ["quick", "standard", "deep"];
      const before = tiers.indexOf(FIELD_BY_KEY[previous.fieldKey]?.tier ?? "quick");
      const after = tiers.indexOf(FIELD_BY_KEY[current.fieldKey]?.tier ?? "quick");
      expect(after).toBeGreaterThanOrEqual(before);
    }
  });

  it("keeps the list short enough to answer", () => {
    const project = createProject({
      title: "Deep",
      genre: "fantasy",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "deep" });
    project.characters.push(character);

    // 60 fields are visible and none are answered, so the cap is what keeps
    // this a prompt rather than a questionnaire.
    expect(fieldsForDepth("deep", ["speculative", "political", "faith", "historical"])).toHaveLength(60);
    expect(openQuestionsFor(project, character)).toHaveLength(MAX_OPEN_QUESTIONS);
  });

  it("says nothing about a profile that is complete at its depth", () => {
    const project = createProject({
      title: "Full",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "quick" });
    fillVisibleFields(character, "quick", []);
    project.characters.push(character);

    expect(openQuestionsFor(project, character)).toEqual([]);
    expect(generatedQuestions(project)).toEqual([]);
    expect(countGeneratedQuestions(project)).toBe(0);
  });

  it("knows which questions the writer has already kept", () => {
    const project = createProject({
      title: "Kept",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "quick" });
    fillVisibleFields(character, "quick", []);
    delete character.fields.coreFear;
    character.openQuestions.push(
      "What is Ada most afraid of, and what have they already given up to avoid it?",
    );
    project.characters.push(character);

    const [question] = openQuestionsFor(project, character);
    expect(question?.pinned).toBe(true);
  });

  it("treats an answer of whitespace as unanswered", () => {
    const project = createProject({
      title: "Blank",
      genre: "general",
      storyType: "novel",
    });
    const character = createCharacter({ name: "Ada", depth: "quick" });
    fillVisibleFields(character, "quick", []);
    character.fields.eyes = makeFieldValue(FIELD_BY_KEY.eyes, "   ");
    project.characters.push(character);

    expect(openQuestionsFor(project, character).map((q) => q.fieldKey)).toEqual(["eyes"]);
  });
});

describe("the fixtures", () => {
  it("gives a clean bible no questions, because it has nothing left unanswered", () => {
    expect(generatedQuestions(cleanMinimal())).toEqual([]);
  });

  it("asks the fully populated fixture nothing either", () => {
    // Every character answers what their own depth asks for, so there is no
    // prompt to raise — which is what makes this fixture a clean export.
    expect(generatedQuestions(deepFull())).toEqual([]);
  });

  it("asks the messy fixture exactly one question, about its one planted gap", () => {
    const { project, ids } = brokenMessy();
    const groups = generatedQuestions(project);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.character.id).toBe(ids.mara);
    expect(groups[0]?.questions).toHaveLength(1);
    // Mara is the fixture's only unanswered Quick field.
    expect(groups[0]?.questions[0]?.fieldKey).toBe("coreFear");
    expect(groups[0]?.questions[0]?.text).toContain("Mara Vale");
  });
});
