/**
 * Open questions (DEVELOPMENT.md §5.6.2).
 *
 * The tool asks the writer questions they have not answered yet — the quality
 * that makes a sheet a writing tool rather than a filing cabinet. Two rules,
 * both from the spec:
 *
 *  - **Field-aware.** Every prompt is phrased for one field of the catalog, and
 *    names the character it is about. §5.6.2's example is *"What does Mara
 *    already know about the handwriting?"*, so the name is not optional.
 *  - **A question, never an assertion.** Each template is interrogative and
 *    ends in a question mark; `questions.test.ts` holds the whole bank to that,
 *    because an assertion from a tool that has read nothing would be a lie.
 *
 * Generated prompts are **derived, never stored**: they are recomputed from the
 * project, so they cannot go stale when an answer changes. What *is* stored is a
 * question the writer chooses to keep — that goes on `Character.openQuestions`
 * (§6.3), which is the writer's own list and the one the bible prints.
 */

import { fieldsForDepth, type FieldDef } from "./fields";
import { isFieldValueEmpty, type Character, type Project } from "./schema";
import { GENRE_META } from "./taxonomy";

/** How many prompts one profile is given, so a list stays answerable. */
export const MAX_OPEN_QUESTIONS = 5;

/**
 * One question per field of the catalog, in the field's own terms.
 *
 * `{name}` is replaced with the character's name. A field with no template is
 * skipped rather than asked about badly — but a test asserts every field has
 * one, so adding a field to the catalog means writing its question.
 */
export const QUESTION_TEMPLATES: Record<string, string> = {
  // Identity
  nickname: "What does {name} get called, and by whom?",
  pronouns: "Which pronouns does {name} use, and does anyone in the story get them wrong?",
  gender: "How does {name} describe their own gender, and does it matter to anybody else?",
  age: "How old is {name} when the story opens — exactly, or near enough for the timeline to check?",
  occupation: "What does {name} do all day when the plot is not happening?",
  nameReason: "Where did {name}'s name come from, and who chose it?",
  birthYear: "In which year was {name} born, by your world's calendar or the story's?",
  currentSituation: "What is {name}'s situation on page one, before anything has changed?",
  economicClass: "What does {name} have, and what does having it cost them?",
  nicknameReason: "Who gave {name} that nickname, and do they answer to it?",
  species: "What is {name}'s lineage, and what does it cost them socially?",
  politicalAffiliation: "Which side is {name} on, and are they open about it?",
  religion: "What does {name} believe — or claim to believe — and what do they actually keep?",

  // Appearance
  hair: "What does {name}'s hair look like, including the detail most likely to drift?",
  eyes: "What colour are {name}'s eyes, and is there anything unusual about them?",
  build: "How does {name} take up space, as a stranger would see them across a room?",
  skin: "What would a stranger notice about {name}'s skin and complexion?",
  marks: "What marks does {name} carry, and how did they get them?",
  outfit: "What does {name} reach for, and which single item matters in a particular scene?",
  voice: "How does {name}'s voice sound out loud, not what it says?",
  height: "How tall is {name} next to the people around them?",
  dominantHand: "Which is {name}'s dominant hand — and has an action scene assumed the wrong one?",
  defaultExpression: "What would fill the blank, because {name} has a resting ___ face?",
  speechRegister:
    "How would {name} ask a stranger for a favour, and how is that different from asking a friend?",
  mannerisms: "What do {name}'s hands do when they are lying?",

  // Personality & motivation
  coreTraits: "Which three to five traits would {name}'s friends agree on?",
  weaknesses: "What are {name}'s flaws, and where does each one actually cost them?",
  externalGoal: "What is {name} chasing, in a way a scene could show them doing?",
  internalNeed: "What does {name} need but could not say out loud?",
  coreFear:
    "What is {name} most afraid of, and what have they already given up to avoid it?",
  strengths: "What is {name} genuinely good at, and what does being good at it cost them?",
  values: "What will {name} refuse to trade, even when trading it would be sensible?",
  triggers: "What makes {name} react before they think?",
  habits: "What small thing does {name} do over and over?",
  conflictStyle: "When a conversation turns into a fight, what does {name} default to?",
  misbelief: "What false thing does {name} believe about themselves or the world?",
  secret: "What is {name} hiding, and from whom?",
  regret: "What would {name} undo, if they could choose again?",
  stakes: "What specifically does {name} lose if they fail?",
  petPeeves: "What small thing makes {name} unreasonable?",
  loveApproach: "How does {name} behave when they care about someone?",
  humor: "What does {name} find funny — what joke would they actually tell?",

  // Backstory
  hometown: "Where is {name} from, and would they go back?",
  family: "Who raised {name}, and what did that household expect of them?",
  formativeWound: "What happened to {name} that taught them the lie they act on?",
  keyEvents: "Which events made {name} who they are, and when did each happen?",
  education: "What training does {name} have, and who paid for it?",
  heritage: "What did {name} leave behind, and what can they not stop doing?",
  carries: "What does {name} always carry, and when will a scene need it?",
  witnessedEvents: "Which of your world's events did {name} live through, and on which side?",

  // Arc
  arcType: "Does {name} change, fall, or hold while the world changes around them?",
  startingState: "Who is {name} when the story begins, in one honest sentence?",
  turningPoint: "What moment makes {name}'s change possible — or impossible?",
  endingState: "Who is {name} at the end, next to who they were at the start?",
  letGo: "What must {name} release before their arc can finish?",
  refusesChange: "What line will {name} not cross, whatever it costs them?",

  // Voice & continuity
  openThreads:
    "What about {name} is still undecided — the question a collaborator must not answer for you?",
  catchphrases: "What does {name} say too often, and who does it annoy?",
  deflection: "How does {name} lie or avoid a question?",
  sampleLines: "What two or three lines would {name} actually say?",
};

export interface OpenQuestion {
  characterId: string;
  characterName: string;
  fieldKey: string;
  fieldLabel: string;
  text: string;
  /** True once the writer has kept this question on the profile. */
  pinned: boolean;
}

function displayName(name: string): string {
  return name.trim() || "this character";
}

/** The question for one field, or null if the catalog has no template for it. */
export function questionFor(field: FieldDef, name: string): string | null {
  const template = QUESTION_TEMPLATES[field.key];
  if (!template) return null;
  return template.replaceAll("{name}", displayName(name));
}

const TIER_RANK = { quick: 0, standard: 1, deep: 2 } as const;

/**
 * The questions one character has not answered yet.
 *
 * Only the fields their own depth asks for, and only the ones still empty. Quick
 * fields come first, because those are the ones the story needs; within a tier
 * the catalog's order holds, so the list is stable between renders.
 */
export function openQuestionsFor(
  project: Project,
  character: Character,
): OpenQuestion[] {
  const layers = GENRE_META[project.meta.genre].layers;
  const name = displayName(character.name);

  const unanswered = fieldsForDepth(character.depth, layers).filter((field) =>
    isFieldValueEmpty(character.fields[field.key]),
  );
  const ordered = [...unanswered].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

  return ordered
    .slice(0, MAX_OPEN_QUESTIONS)
    .flatMap((field) => {
      const text = questionFor(field, name);
      if (!text) return [];
      return [
        {
          characterId: character.id,
          characterName: character.name.trim() || "Unnamed",
          fieldKey: field.key,
          fieldLabel: field.label,
          text,
          pinned: character.openQuestions.includes(text),
        },
      ];
    });
}

/**
 * Every character with questions left, in cast order. Characters whose profiles
 * are complete at their depth are left out rather than listed as empty.
 */
export function generatedQuestions(
  project: Project,
): { character: Character; questions: OpenQuestion[] }[] {
  return project.characters
    .map((character) => ({
      character,
      questions: openQuestionsFor(project, character),
    }))
    .filter((entry) => entry.questions.length > 0);
}

/** How many prompts the project has outstanding, for headings and analytics. */
export function countGeneratedQuestions(project: Project): number {
  return generatedQuestions(project).reduce(
    (total, entry) => total + entry.questions.length,
    0,
  );
}
