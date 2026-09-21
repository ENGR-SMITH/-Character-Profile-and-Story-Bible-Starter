# Nexet Free Tools Research and Build Plan

## Author Den and Creator Den

**Main product:** Nexet  
**Product promise:** *Post what you started. Finish it with someone else.*  
**Strategy:** Free tools marketing / engineering as marketing  
**Prepared from:** Nexet product documentation, the Expanded Free Tools Marketing Playbook, and public market research

---

## 1. Executive decision

Nexet should not begin by copying the most obvious generic AI generators. Those categories already have many free competitors, and they do not naturally explain Nexet's strongest advantage:

> Two people can work on separate desks, submit against a frozen artifact, review the change, and merge it with attribution.

The strongest free tools for Nexet are therefore **workflow-entry tools**:

- For the **Author Den**, tools that help a writer prepare a seed, outline a manuscript, brief an editor, ask for beta-reader feedback, or review a scene.
- For the **Creator Den**, tools that help a creator prepare a production brief, generate a shot list, organize a handoff, calculate production requirements, or review a locked timeline.

Each tool should give the visitor a complete small result and then offer the relevant Nexet workflow as the next step.

### Recommended first build batch

#### Author Den

1. **Beta Reader Feedback Pack Generator**
2. **Story Seed and Collaboration Brief Generator**
3. **Scene / Chapter Outline and Beat Sheet Generator**

#### Creator Den

1. **Video Collaboration Brief and Open-Role Generator**
2. **Shot List and Scene Breakdown Generator**
3. **Post-Production Handoff Checklist Generator**

These six tools have the best combination of:

- Strong relationship to Nexet's existing product.
- A natural CTA into the Pitch Board or Audition Arena.
- Low-to-moderate build complexity.
- Clear differentiation from generic writing and video AI tools.
- A useful free result that does not require Nexet to replace a professional's existing tools.

---

## 2. Important research limitation

No Ahrefs account or keyword-data integration was available for this research. Therefore, this document does **not** invent exact monthly search volumes or keyword-difficulty numbers.

The ranking uses:

1. Public search-result evidence.
2. Existing competitor and tool categories.
3. Search-intent breadth.
4. Nexet product relevance.
5. CTA strength.
6. Differentiation.
7. Build effort.

Before implementation, every candidate must go through the exact Ahrefs validation process:

```text
Search the seed
→ add task modifiers
→ filter KD below 10
→ filter volume above 1,000
→ inspect the actual SERP
→ record the result in the Nexet tool table
```

For narrow professional tools, a keyword may be worth building even below 1,000 monthly searches if the intent is highly relevant and the visitor can become a serious Nexet user.

---

## 3. What the market research shows

### 3.1 Author market

The public author-tool market is already crowded with:

- Book title generators.
- Plot and outline generators.
- Book blurb generators.
- Query-letter generators.
- Character-name generators.
- Word-count and royalty calculators.
- General AI writing tools.

Examples include free blurb tools from Built&Written and ManuscriptReport, a query-letter generator from The Write Practice, and large collections of free author tools from AIWriteBook and ManuscriptReport.

The collaborative-writing market is also established. Reedsy's comparison of collaborative writing tools lists Reedsy Studio, Ellipsus, Google Docs, Microsoft Word, and Notion. Those products validate the demand for shared writing, track changes, side-by-side drafts, previews, and beta-reader collaboration.

### Author Den opportunity

Nexet should not position itself as another tool that writes a book for someone. Its better position is:

```text
Prepare the work
→ invite the right human contribution
→ work privately
→ review the response
→ merge with attribution
```

That gives Nexet a clear angle around:

- Frozen writing seeds.
- Collaboration briefs.
- Beta-reader requests.
- Editorial review.
- Open writing roles.
- Private clones.
- Review-before-merge.
- Provenance and public portfolio evidence.

### 3.2 Creator market

The public creator-tool market is crowded with:

- AI video-script generators.
- Script-to-video tools.
- Caption and subtitle tools.
- Thumbnail tools.
- Video calculators.
- Production budget calculators.
- Storyboard and shot-list tools.

The public research also shows a more specialized technical market around video handoffs. Tools such as AAF Bridge focus on moving timeline/session data between Ableton, Resolve, Pro Tools, Media Composer, Premiere, and Final Cut. ShotLogic represents an emerging category around screenplay analysis and shot-list planning.

### Creator Den opportunity

Nexet should not compete by becoming another browser video editor or generic “make a video with AI” app. The Creator Den is stronger as the collaboration and version-control layer around existing professional tools:

```text
Brief the work
→ open a role
→ let the specialist work in their own tool
→ submit a new version
→ review against the approved timeline
→ merge and preserve the contributor's role
```

That gives Nexet a clear angle around:

- Production briefs.
- Shot planning.
- Open roles for Visual, Audio, Script, and Thumbnail work.
- Handoff packages.
- Timecode-aware review.
- Timeline versions.
- A/B comparison.
- Comments attached to the cut.
- External-first workflows for Premiere, Resolve, Pro Tools, Avid, and After Effects.

---

## 4. Ranking method

Each candidate is ranked using five dimensions:

| Dimension | Meaning |
|---|---|
| **Search opportunity** | How broad and discoverable the query family appears to be |
| **Nexet fit** | How directly the tool leads into an existing Nexet workflow |
| **CTA strength** | How naturally the visitor can be invited into Nexet |
| **Build ease** | How quickly a useful version can be shipped using reusable patterns |
| **Differentiation** | How clearly Nexet can be different from generic tools |

Scores use a 1–5 scale:

- **5** = very strong
- **4** = strong
- **3** = workable
- **2** = weak or crowded
- **1** = poor

The ranking is **fit-first**, not traffic-first. A high-volume tool that produces irrelevant visitors is less valuable than a smaller tool that attracts an author, editor, video editor, sound designer, or colourist who needs Nexet.

Recommended weighting:

```text
Nexet fit       30%
CTA strength    25%
Search demand   20%
Build ease      15%
Differentiation 10%
```

---

# 5. Author Den ranked free-tool options

## Author Den table

| Rank | Free tool to build | Search-intent family to validate in Ahrefs | Main user | Nexet feature it introduces | CTA / next action | Search opportunity | Nexet fit | CTA strength | Build ease | Differentiation | Recommendation |
|---:|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| **1** | **Beta Reader Feedback Pack Generator** | `beta reader questions`, `beta reader questionnaire`, `book feedback form`, `manuscript feedback questions` | Author preparing a draft for readers | Seed publishing, role calls, review desk, Audition Arena | “Turn this into a frozen seed and invite beta readers or editors to respond on Nexet.” | 4 | 5 | 5 | 5 | 5 | **Build first** |
| **2** | **Story Seed and Collaboration Brief Generator** | `writing brief template`, `story brief`, `creative writing brief`, `co-writer brief` | Author who wants another writer to contribute | Frozen seed, Pitch Board, private clone, submit/review/merge | “Publish this brief as a Nexet seed and let another writer answer it without exposing your whole manuscript.” | 3 | 5 | 5 | 5 | 5 | **Build first** |
| **3** | **Scene / Chapter Outline and Beat Sheet Generator** | `scene outline`, `chapter outline`, `beat sheet`, `story outline template` | Novelist planning a project or unblocking a scene | Story Bible, outline, scenes, co-writer collaboration | “Put this outline into a Nexet project and invite a co-writer or editor to develop the next scene.” | 5 | 5 | 4 | 4 | 4 | **Build first** |
| **4** | **Character Profile and Story Bible Starter** | `character profile template`, `character sheet`, `story bible template`, `fiction character generator` | Writer building a consistent cast and world | Characters, World, Story Bible, shared project | “Keep the character and world context in one Story Bible, then invite a collaborator to work from the same ground.” | 5 | 5 | 4 | 5 | 4 | **Build next** |
| **5** | **Scene Critique and Editorial Checklist** | `scene critique checklist`, `chapter feedback checklist`, `developmental edit checklist` | Author or early-stage editor reviewing a scene | Review desk, revision history, Editor role | “Use the checklist to prepare a review, then open an Editor role on Nexet.” | 3 | 5 | 5 | 4 | 5 | **Build next** |
| **6** | **Manuscript Word Count and Reading-Time Calculator** | `manuscript word count`, `book word count calculator`, `reading time calculator` | Author checking progress and market norms | Project targets, daily/session word targets, revision history | “Track the manuscript in Nexet with scene targets and revision history.” | 5 | 3 | 3 | 5 | 3 | **Traffic support tool** |
| **7** | **Book Synopsis and Blurb Generator** | `book blurb generator`, `book synopsis generator`, `Amazon book description` | Author preparing a book for readers or submission | Project summary, public profile, collaboration brief | “Use the synopsis as the project brief, then invite an editor or beta reader to improve it.” | 5 | 3 | 3 | 5 | 2 | **Build after differentiation** |
| **8** | **Query Letter and Submission Pack Generator** | `query letter generator`, `book query letter`, `literary agent query` | Author approaching agents or publishers | Editor role, manuscript review, portfolio record | “Have an editor review the query and manuscript through a structured Nexet submission.” | 4 | 3 | 4 | 4 | 3 | **Build later** |
| **9** | **Chapter Continuity and Character Consistency Checker** | `character consistency checker`, `story continuity checker`, `plot hole checker` | Author revising a long manuscript | Story Bible, revision history, Oracle advisory layer | “Keep the source of truth in a Nexet Story Bible and invite a human reviewer to verify the changes.” | 3 | 5 | 4 | 3 | 5 | **High-fit deeper tool** |
| **10** | **Book Title and Subtitle Generator** | `book title generator`, `novel title generator`, `book subtitle generator` | Author naming a project | Project setup, public profile, project page | “Create the project in Nexet and develop the opening with another writer.” | 5 | 2 | 2 | 5 | 2 | **Only as a traffic feeder** |
| **11** | **Writing Prompt and Story Idea Generator** | `writing prompts`, `story idea generator`, `fiction writing prompts` | New or blocked writer | Seed creation and Pitch Board | “Turn the idea into a structured seed and let another writer answer it.” | 5 | 3 | 3 | 5 | 2 | **Only with collaboration angle** |
| **12** | **Pen Name / Author Bio Generator** | `pen name generator`, `author bio generator` | New or self-publishing author | Profile, portfolio, public identity | “Build a public Nexet author profile that shows finished collaborations and roles.” | 4 | 2 | 2 | 5 | 2 | **Low priority** |

### Author Den ranking interpretation

#### Rank 1: Beta Reader Feedback Pack Generator

This is the best first tool because it connects directly to an existing Nexet role: **Beta reader**.

### What the tool should do

The visitor selects:

- Genre.
- Manuscript stage.
- Book length.
- Reader type.
- Feedback depth.
- Whether they want line-level, character, pacing, plot, or overall-response questions.

The tool produces:

- A short beta-reader questionnaire.
- A detailed version.
- A feedback rubric.
- A response deadline suggestion.
- A “what to read for” brief.
- A clean copy/download format.

### Example output

```text
Beta reader brief

Please read this draft for:
- Whether the opening creates a clear question.
- Whether the protagonist's motivation is understandable.
- Where the pace slows.
- Which character relationship feels strongest.
- Where you became confused or disengaged.

Please do not line-edit grammar in this round.
Return feedback by:
[date]
```

### Nexet CTA

```text
Ready to get human feedback on the actual manuscript?
Publish this as a frozen Author Den role, invite beta readers,
and review each response without exposing your whole project.
Open a Beta Reader role on Nexet.
```

This CTA is stronger than “Try Nexet” because it names the exact next workflow.

---

#### Rank 2: Story Seed and Collaboration Brief Generator

This tool should become Nexet's most strategically differentiated Author Den tool.

### What the visitor enters

- Working title.
- Passage or scene excerpt.
- Genre.
- Tone.
- Language.
- Point of view.
- What the collaborator should continue, rewrite, or challenge.
- Desired role.
- Constraints.
- Number of responses wanted.

### What the tool produces

- A short public-facing pitch.
- A frozen-brief version.
- A collaborator-facing context note.
- A clear role description.
- Suggested review criteria.
- A privacy reminder to share only the intended passage.

### Example generated brief

```text
Project: The Glass Orchard
Role wanted: Developmental editor
Unit: Opening scene
Genre: Literary mystery
Tone: Quiet, tense, observational

What I have started:
The protagonist returns to an abandoned orchard after receiving
a letter written in her own handwriting.

What I need from the collaborator:
Review whether the central mystery is clear without explaining too much.
Suggest one possible direction for the next scene.
Do not rewrite the passage yet.

Review questions:
1. What question did the opening make you want answered?
2. Where did the tension weaken?
3. What detail should be protected?
```

### Nexet CTA

```text
This brief is ready to become a real collaboration.
Publish it as a frozen seed in the Nexet Pitch Board,
let another writer answer privately, and decide what gets merged.
```

This tool directly demonstrates Nexet's central product idea: **a safe, limited invitation is better than sending an entire manuscript to a stranger**.

---

#### Rank 3: Scene / Chapter Outline and Beat Sheet Generator

This is a strong traffic and activation tool because writers search for outlines and beat sheets, while Nexet already has scenes, plots, outlines, and Story Bible objects.

### Inputs

- Genre.
- Scene purpose.
- Character POV.
- Previous scene summary.
- Desired conflict.
- Desired outcome.
- Target word count.
- Whether the scene is an opening, midpoint, reversal, climax, or ending.

### Outputs

- Scene goal.
- Conflict.
- Turning point.
- Emotional change.
- Key beats.
- Continuity questions.
- Suggested next-scene handoff.

### Example output

```text
Scene goal:
Mara must decide whether to open the letter.

Conflict:
The letter contains information she has spent ten years avoiding,
but opening it may expose her brother's secret.

Beats:
1. Mara notices the handwriting.
2. She tests the envelope for signs it was opened.
3. A second person arrives at the orchard.
4. The visitor calls her by a name she no longer uses.
5. Mara hides the letter instead of opening it.

Handoff question:
What should the next collaborator preserve: the secrecy,
the visitor's identity, or Mara's hesitation?
```

### Nexet CTA

```text
Turn this outline into a Nexet project.
Invite a co-writer or editor to develop the next scene
against a shared Story Bible.
```

---

## 5.4 Full Author Den rank interpretation

The first three tools are the initial launch batch. The remaining Author Den tools are not filler ideas; each one has a different acquisition role in the Nexet funnel. This section defines what each tool means, what the first useful version must produce, and how the result should lead into human collaboration.

### Rank 4: Character Profile and Story Bible Starter

**Strategic role:** A high-fit planning tool for writers who need a consistent source of truth before inviting another person into a project.

This tool is important because collaborators can only contribute well when they understand the characters, relationships, world rules, and continuity constraints that the author wants protected. It should turn loose notes into a shared starting point rather than trying to write the entire story.

**Inputs**

- Character name, role, age range, and relationships.
- Wants, fears, conflict, and change arc.
- Setting, era, rules, and important locations.
- Genre, tone, point of view, and continuity constraints.

**Outputs**

- A structured character profile.
- A relationship map in text form.
- A world and location starter.
- Continuity questions for the writer or collaborator.
- A compact Story Bible starter that can be copied or downloaded.

### Example output

```text
Character: Mara Vale
Role: Protagonist
External goal: Discover who sent the letter written in her handwriting.
Internal conflict: Mara wants the truth but fears reopening the family secret.
Core fear: That the truth will prove she abandoned her brother.

Important relationships:
- Elias Vale — missing brother; source of Mara's guilt.
- Dr. Imani Reed — trusted friend who challenges Mara's assumptions.

Character arc:
Mara begins by hiding evidence from everyone. She gradually learns
that protecting the family story has prevented her from understanding it.

Continuity questions:
1. What does Mara already know about the handwriting?
2. Why has she avoided the orchard for ten years?
3. What would make her trust Elias's message?

Collaborator note:
Protect Mara's hesitation and guilt. Do not resolve the mystery
in the next scene.
```

### Nexet CTA

> Keep this character and world context in a Nexet Story Bible, then invite a co-writer or editor to work from the same approved context.

**MVP boundary:** Generate structured fields and useful prompts. Do not attempt a complete manuscript knowledge graph or claim that the character is automatically consistent across an entire book.

### Rank 5: Scene Critique and Editorial Checklist

**Strategic role:** A review-entry tool that attracts authors and early-stage editors at the moment feedback is needed.

This tool is useful because many authors ask for “general feedback” and receive comments that are too broad to act on. The checklist should define what the reviewer is evaluating, what they should ignore for now, and how their response can become a structured Nexet review.

**Inputs**

- Scene or chapter purpose.
- Genre and intended audience.
- Draft stage.
- Review focus: plot, pacing, character, clarity, dialogue, stakes, or line editing.
- Whether the reviewer should comment, suggest, or rewrite.

**Outputs**

- A scene-review checklist.
- Questions grouped by review focus.
- A reviewer brief explaining what not to assess yet.
- A response template for strengths, concerns, and recommended next steps.

### Example output

```text
Scene review: The Orchard Letter
Review stage: Developmental feedback
Primary focus: Clarity, tension, and character motivation

Please answer:
1. What question did you want answered after the first page?
2. Was Mara's reason for entering the orchard clear?
3. Where did the tension increase?
4. Where did the scene slow down or become confusing?
5. What detail about Elias felt most significant?
6. What should the next scene preserve?

Please do not assess:
- Grammar and punctuation.
- Final dialogue polish.
- Publication readiness.

Response summary:
Strongest element:
Main concern:
Suggested revision:
Question for the author:
```

### Nexet CTA

> Open an Editor or Beta Reader role on Nexet and review the same frozen scene without losing the original version.

**MVP boundary:** Help people ask better questions. Do not provide an automated final judgment about literary quality or replace an editor.

### Rank 6: Manuscript Word Count and Reading-Time Calculator

**Strategic role:** A broad traffic feeder that introduces authors to Nexet through a simple utility.

This tool is intentionally simple. Its value is not only the calculation; it gives an author a concrete progress signal and a natural reason to create a project with targets, scenes, and revision history.

**Inputs**

- Pasted manuscript text or word count.
- Reading speed.
- Optional genre and target format.
- Optional daily writing target.

**Outputs**

- Total word count.
- Estimated reading time.
- Optional session or daily target.
- A simple progress breakdown.

### Example output

```text
Manuscript estimate
Word count: 82,450 words
Estimated reading time:
- At 200 words per minute: 6 hours 52 minutes
- At 250 words per minute: 5 hours 30 minutes

If you write 750 words per day:
- Estimated drafting time: 110 writing days

Suggested Nexet project target:
- Current manuscript: 82,450 words
- Next milestone: 90,000 words
- Remaining: 7,550 words
- Suggested review point: after the next 3 scenes
```

### Nexet CTA

> Turn the target into a Nexet project with scene goals, session targets, and revision history.

**MVP boundary:** Keep this fast and privacy-conscious. Do not require a full manuscript upload or store pasted text by default.

### Rank 7: Book Synopsis and Blurb Generator

**Strategic role:** A high-volume discovery tool that becomes useful when the author needs positioning feedback from another person.

The tool should not stop at producing promotional copy. It should expose the promise of the book clearly enough that an editor, beta reader, or co-writer can review whether the premise, audience, conflict, and stakes are understandable.

**Inputs**

- Title or working title.
- Genre and audience.
- Premise, protagonist, conflict, stakes, and ending.
- Desired format: short pitch, synopsis, retailer description, or back-cover blurb.
- Tone and length.

**Outputs**

- One-sentence logline.
- Short pitch.
- Longer synopsis.
- Retailer or back-cover version.
- Questions an editor or beta reader should answer about clarity and promise.

### Example output

```text
Working title: The Glass Orchard
Genre: Literary mystery

Logline:
After receiving a letter written in her own handwriting, a woman
returns to the abandoned orchard where her brother disappeared.

Short synopsis:
Mara Vale has spent ten years avoiding the orchard and the unanswered
questions surrounding her brother Elias's disappearance. When a letter
arrives in her own handwriting, she returns to the place where the
family story began. Each clue forces Mara to choose between preserving
the version of events her family believes and uncovering what really
happened.

Review questions:
1. Is the protagonist's goal clear?
2. Does the mystery create a specific reason to keep reading?
3. Does the synopsis reveal enough without explaining the resolution?
```

### Nexet CTA

> Use the synopsis as a project brief, then invite an editor or beta reader to review whether the book’s promise is clear.

**MVP boundary:** Produce several editable versions. Do not present generated copy as final publishing or retailer-approved language.

### Rank 8: Query Letter and Submission Pack Generator

**Strategic role:** A conversion tool for authors who are preparing a serious submission and may need editorial review.

This tool should help an author organize the material around a submission without suggesting that a generated letter guarantees representation. Its strongest Nexet use is preparing a reviewable pack that an editor can inspect against a frozen manuscript version.

**Inputs**

- Manuscript title, genre, word count, and audience.
- Query recipient or submission type.
- Hook, protagonist, conflict, stakes, comparable titles, and author bio.
- Submission requirements and tone.

**Outputs**

- Query-letter structure.
- Submission checklist.
- Short pitch and synopsis fields.
- Personalization prompts.
- Editor-review questions for clarity, positioning, and completeness.

### Example output

```text
Query pack: The Glass Orchard
Genre: Upmarket literary mystery
Word count: 82,450

Opening pitch:
When Mara receives a letter written in her own handwriting,
she returns to the orchard where her brother vanished ten years ago.

Query structure:
1. Opening hook and title.
2. Protagonist and immediate situation.
3. Central conflict and stakes.
4. Comparable titles and audience.
5. Short author bio.
6. Closing manuscript and contact details.

Editor review questions:
1. Does the opening establish a specific promise?
2. Are the stakes concrete enough?
3. Does the comparison section identify the intended readership?
4. Does the letter accurately represent the submitted manuscript?
```

### Nexet CTA

> Send the query and selected manuscript material through a structured Editor review on Nexet before submitting externally.

**MVP boundary:** Provide structure and review prompts. Do not promise access to agents, guaranteed publication, or legal protection for submissions.

### Rank 9: Chapter Continuity and Character Consistency Checker

**Strategic role:** A differentiated, high-fit tool for long-form authors who need a second pass over facts before inviting a human reviewer.

This is not an automated “fix my novel” tool. Its job is to surface possible continuity problems in a way that an author and collaborator can inspect together before any change is accepted.

**Inputs**

- Chapter or scene text.
- Character and location notes.
- Optional Story Bible fields.
- Known dates, ages, objects, rules, and prior events.

**Outputs**

- Potential contradictions.
- Repeated or missing character details.
- Timeline questions.
- Unresolved setup and payoff questions.
- A human-review checklist separating likely issues from items requiring author judgment.

### Example output

```text
Continuity review: Chapter 12

Possible issue 1 — Character detail
Earlier Story Bible note: Mara has a scar above her left eyebrow.
Chapter 12 text: “She brushed hair away from the scar above her right eye.”
Status: Needs author verification

Possible issue 2 — Timeline
Chapter 10: The storm begins on Tuesday evening.
Chapter 12: The same event is described as happening “the next morning”
after a scene marked Thursday.
Status: Possible date mismatch

Possible issue 3 — Unresolved setup
The brass key is introduced in Chapter 4 but has not appeared
in the current outline after the orchard scene.
Status: Review whether this is intentional

Human review:
Do not apply these findings automatically. Confirm each item
against the approved Story Bible and manuscript version.
```

### Nexet CTA

> Keep the source of truth in a Nexet Story Bible and invite a human reviewer to verify which suggested changes should be accepted.

**MVP boundary:** Label findings as possible issues, not facts. Avoid silently rewriting the manuscript or making irreversible changes.

### Rank 10: Book Title and Subtitle Generator

**Strategic role:** A low-fit, high-volume traffic feeder that should support project creation rather than define Nexet.

This tool can attract early-stage authors, but the result should be framed as a working shortlist. The collaboration opportunity is the review of which title best communicates the project’s promise to its intended readers.

**Inputs**

- Genre, premise, audience, tone, and key themes.
- Title style: literal, evocative, commercial, literary, or playful.
- Optional keywords and subtitle purpose.

**Outputs**

- Title options grouped by style.
- Subtitle options where relevant.
- A short explanation of the promise each option communicates.
- A shortlist for feedback.

### Example output

```text
Project signals:
Genre: Literary mystery
Tone: Quiet, tense, atmospheric
Core image: An abandoned orchard and a letter in the protagonist's handwriting

Title shortlist:
1. The Glass Orchard
   Promise: Literary mystery with a strong place-based image.
2. A Letter from Mara
   Promise: Personal mystery centred on identity and memory.
3. The Orchard Keeps Its Names
   Promise: Atmospheric, literary, and slightly uncanny.

Questions for a collaborator:
1. Which title creates the clearest genre expectation?
2. Which title is easiest to remember?
3. Does the subtitle clarify the book or over-explain it?
```

### Nexet CTA

> Create the project in Nexet, choose a working title, and invite a collaborator to develop the opening or review the direction.

**MVP boundary:** Keep it as a lightweight utility. Do not invest in complex title scoring before the higher-fit tools prove demand.

### Rank 11: Writing Prompt and Story Idea Generator

**Strategic role:** A broad acquisition tool that must be deliberately connected to collaboration to avoid attracting only one-time users.

The distinctive version should generate a starting point that another writer can respond to. The user should leave with more than a random prompt: they should have a bounded creative challenge, constraints, and a clear invitation for contribution.

**Inputs**

- Genre, format, theme, setting, character seed, and conflict.
- Desired originality constraints.
- Whether the visitor wants a prompt, premise, scene seed, or collaboration challenge.

**Outputs**

- Story or scene ideas.
- A structured seed.
- Constraints and questions for the next writer.
- Optional collaboration brief generated from the selected idea.

### Example output

```text
Story seed: The Name the River Forgot
Genre: Speculative mystery
Setting: A coastal town where maps change after every storm

Starting situation:
A cartographer discovers that one street has disappeared from every
map except the map she drew as a child.

Creative constraints:
- The missing street must be connected to a family decision.
- The first response should preserve uncertainty about whether the town
  is changing or whether the cartographer is remembering incorrectly.
- Do not reveal the final explanation in the opening scene.

Question for the next collaborator:
What is the first thing the cartographer finds on the missing street?

Suggested role:
Co-writer or developmental editor
```

### Nexet CTA

> Turn the selected idea into a structured seed on Nexet and let another writer answer it privately.

**MVP boundary:** The collaboration-brief handoff is more important than generating a large number of ideas. Avoid becoming a generic prompt directory.

### Rank 12: Pen Name and Author Bio Generator

**Strategic role:** A low-priority identity and profile feeder for authors who may later use Nexet’s public portfolio and attribution features.

This tool should connect identity to contribution without pressuring a user to reveal more personal information than they want to publish. It is useful for profile preparation, but it should remain behind the collaboration and review tools in the build sequence.

**Inputs**

- Genre, tone, public identity preferences, experience, and selected works.
- Desired bio length and audience.
- Whether the bio is for a profile, submission, website, or book.

**Outputs**

- Pen-name suggestions with style notes.
- Short, medium, and long bio versions.
- Profile prompts for roles, skills, and collaboration interests.
- A reminder to review privacy and identity choices before publishing.

### Example output

```text
Profile direction:
Primary role: Fiction writer
Genres: Literary mystery, contemporary fiction
Collaboration interests: Beta reading, developmental feedback

Short bio:
Mara writes atmospheric fiction about memory, family secrets,
and the places people return to when the past is unfinished.

Longer bio:
Mara is a fiction writer working across literary mystery and
contemporary fiction. Her projects explore memory, unreliable
family stories, and the emotional cost of keeping secrets. She is
interested in thoughtful beta reading and developmental collaboration.

Profile review:
- Publish only the experience and interests you want collaborators to see.
- Confirm whether the selected pen name is available before using it publicly.
- Add verified Nexet roles and contributions as they are completed.
```

### Nexet CTA

> Build a Nexet author profile that shows your roles, contributions, and finished collaborations.

**MVP boundary:** Do not imply that a generated pen name is available as a trademark, domain, or legal identity. Keep this tool behind higher-value workflow tools in the build order.

### Author Den full-rank build interpretation

| Rank | Tool role in the funnel | Primary Nexet destination | MVP output | Build posture |
|---:|---|---|---|---|
| 1 | Collaboration/review entry | Beta Reader role / Audition Arena | Questionnaire and reader brief | Build first |
| 2 | Seed and role entry | Pitch Board | Frozen brief and role description | Build first |
| 3 | Planning and activation | Story Bible / project | Outline and beats | Build first |
| 4 | Context and continuity | Story Bible | Character/world starter | Build next |
| 5 | Editorial review entry | Editor role | Review checklist | Build next |
| 6 | Broad traffic feeder | Author Den project | Word count and reading estimate | Support tool |
| 7 | Positioning feedback entry | Editor or Beta Reader role | Synopsis, blurb, and review questions | Build later |
| 8 | Submission review entry | Editor role | Query and submission pack | Build later |
| 9 | Technical/high-fit review | Story Bible and review desk | Possible issue report | Build after core workflow |
| 10 | Broad traffic feeder | Project setup | Title and subtitle options | Low priority |
| 11 | Seed acquisition | Pitch Board | Story idea and collaboration seed | Build with collaboration angle |
| 12 | Identity/profile feeder | Author profile | Bio and profile prompts | Lowest priority |

### Author Den build specifications

| Tool | Minimum useful version | Do not build first | Nexet event to track |
|---|---|---|---|
| Beta Reader Feedback Pack | Form inputs → tailored questionnaire → copy/download | Accounts, full manuscript upload, complex AI analysis | `author_beta_pack_generated`, `author_beta_cta_clicked` |
| Collaboration Brief | Form inputs → public brief + private context version | Directly publishing into a user's project before consent | `author_brief_generated`, `author_seed_cta_clicked` |
| Outline / Beat Sheet | Form inputs → structured beats → export | Full novel generation | `author_outline_generated`, `author_project_cta_clicked` |
| Story Bible Starter | Character/world fields → structured starter pack | Full manuscript knowledge graph | `author_bible_generated`, `author_collab_cta_clicked` |
| Scene Critique Checklist | Scene context → review criteria → copy/download | Automated final judgment of literary quality | `author_review_pack_generated`, `author_editor_role_cta_clicked` |

---

# 6. Creator Den ranked free-tool options

## Creator Den table

| Rank | Free tool to build | Search-intent family to validate in Ahrefs | Main user | Nexet feature it introduces | CTA / next action | Search opportunity | Nexet fit | CTA strength | Build ease | Differentiation | Recommendation |
|---:|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| **1** | **Video Collaboration Brief and Open-Role Generator** | `video production brief`, `creative brief template`, `video project brief`, `hire video editor brief` | Creator, producer, channel, or studio | Audition Arena, roles, project preview, portfolio | “Publish this brief as a Video, Audio, Script, or Thumbnail role on Nexet.” | 3 | 5 | 5 | 5 | 5 | **Build first** |
| **2** | **Shot List and Scene Breakdown Generator** | `shot list generator`, `shot list template`, `script breakdown`, `film shot list` | Director, producer, editor, filmmaker | Project setup, Story Architect stage, versioned timeline | “Turn this shot list into a project and invite the next role to work against the same brief.” | 5 | 5 | 5 | 4 | 4 | **Build first** |
| **3** | **Post-Production Handoff Checklist Generator** | `video editing handoff checklist`, `post production checklist`, `editor handoff template`, `video delivery checklist` | Producer, editor, sound designer, colourist | External-first checkout/import, submissions, review, comments | “Send the handoff as a Nexet submission with the version, files, and change note attached.” | 3 | 5 | 5 | 5 | 5 | **Build first** |
| **4** | **Production Budget and Crew-Day Calculator** | `video production budget calculator`, `film budget calculator`, `crew day rate calculator` | Producer, creator, studio | Project planning, role assignment, channel/project management | “Turn the estimate into a structured project and open the roles you need filled.” | 5 | 4 | 4 | 4 | 4 | **Build next** |
| **5** | **Storyboard and Visual Beat Planner** | `storyboard template`, `storyboard generator`, `video storyboard`, `visual beat sheet` | Director, content creator, visual editor | Timeline planning, project preview, Visual Editor role | “Share the visual plan as a read-only project preview and invite a visual editor.” | 5 | 5 | 4 | 4 | 4 | **Build next** |
| **6** | **Timecode and Frame-Rate Calculator** | `timecode calculator`, `frame rate calculator`, `timecode converter`, `video duration frames` | Editor, sound designer, colourist | Timecode comments, review desk, timeline diff | “Review the exact cut in Nexet with timecode-attached comments and version history.” | 4 | 5 | 4 | 5 | 5 | **Build next** |
| **7** | **Subtitle / Caption Format Converter and Validator** | `SRT to VTT`, `subtitle converter`, `caption validator`, `subtitle timing checker` | Editor, captioner, creator | Submission, versioning, Audio/Video roles | “Submit the corrected caption version against the approved cut.” | 5 | 4 | 4 | 4 | 3 | **Traffic support tool** |
| **8** | **Video Script and Production Brief Generator** | `video script generator`, `YouTube script generator`, `short-form script generator` | Creator, educator, marketer, channel | Script role, open role, project brief, collaboration | “Ask a script collaborator to review or continue the brief inside Nexet.” | 5 | 3 | 3 | 5 | 2 | **Build later** |
| **9** | **Thumbnail Brief and Review Pack Generator** | `YouTube thumbnail brief`, `thumbnail size checker`, `thumbnail design brief` | Channel owner, thumbnail artist, editor | Thumbnail role, Audition Arena, portfolio | “Open a Thumbnail role and compare submissions before accepting one.” | 4 | 5 | 5 | 5 | 5 | **High-fit niche tool** |
| **10** | **Video Review and Feedback Pack Generator** | `video review checklist`, `video feedback form`, `film review notes template` | Producer, client, editor, reviewer | Timecode comments, resolve/reopen, Captain review | “Attach the review pack to a Nexet submission and keep feedback on the cut.” | 3 | 5 | 5 | 5 | 5 | **High-fit niche tool** |
| **11** | **EDL / AAF / FCPXML / OTIO Validator** | `AAF validator`, `EDL checker`, `FCPXML validator`, `OTIO validator` | Professional editor, post house, sound designer | External-first pipeline, checkout/import, technical handoff | “Move the validated handoff into a versioned Nexet project and submit it for review.” | 2 | 5 | 4 | 3 | 5 | **Technical authority tool** |
| **12** | **Aspect Ratio, Resolution, and Export Preset Calculator** | `video aspect ratio calculator`, `YouTube resolution`, `TikTok video size`, `export settings` | Social creator, editor, channel | Project setup and delivery requirements | “Record the delivery requirements in the Nexet project before the edit begins.” | 5 | 3 | 3 | 5 | 3 | **Traffic feeder** |

### Creator Den ranking interpretation

#### Rank 1: Video Collaboration Brief and Open-Role Generator

This is the strongest Creator Den tool because it turns a vague hiring or collaboration need into the exact object Nexet already supports: an open role.

### Inputs

- Project title.
- Project type: short film, YouTube video, music video, commercial, podcast video, course, documentary, social campaign.
- Current stage.
- Role needed: Video, Audio, Script, Thumbnail.
- Deliverables.
- Source materials available.
- Deadline.
- Expected tools: Premiere, Resolve, Pro Tools, Avid, After Effects.
- Review criteria.
- Application requirements.

### Example output

```text
Role: Sound Designer
Project: 8-minute documentary short
Current version: Locked picture v03

What is ready:
- H.264 reference export
- 48 kHz stereo reference audio
- Timecoded notes
- Dialogue stems

What the collaborator should deliver:
- Clean dialogue
- Sound design pass
- Music placement notes
- 48 kHz WAV mix
- Change note describing what was changed

Review criteria:
1. Dialogue remains intelligible.
2. Sound supports the emotional turn at 04:12.
3. No clipping or unwanted noise.
4. Deliverables can be checked against the locked timeline.
```

### Nexet CTA

```text
This is ready to become an open role.
Publish it on the Creator Den Audition Arena,
let specialists preview the project, and accept the person
whose submission best fits the work.
```

---

#### Rank 2: Shot List and Scene Breakdown Generator

This tool has broader search potential than a collaboration brief while still fitting the Creator Den's project and timeline model.

### Inputs

- Script or scene description.
- Scene location.
- Characters.
- Time of day.
- Camera style.
- Shot priority.
- Dialogue or action.
- Deliverable format.

### Outputs

- Scene number.
- Shot number.
- Shot type.
- Camera angle.
- Lens suggestion.
- Movement.
- Subject/action.
- Audio notes.
- Continuity notes.
- Priority.

### Example output

| Shot | Type | Action | Audio | Priority | Handoff note |
|---:|---|---|---|---|---|
| 01 | Wide | Establish empty station at dawn | Train ambience | Must-have | Protect opening silence |
| 02 | Medium | Mara enters frame holding letter | Footsteps, paper | Must-have | Match wardrobe continuity |
| 03 | Close-up | Handwriting on envelope | Paper movement | Must-have | Hold long enough for audience to read |
| 04 | Over-shoulder | Visitor appears behind Mara | Distant announcement | Nice-to-have | Review timing against the reveal |

### Nexet CTA

```text
Turn this breakdown into the first project version.
Invite a Story Architect, Visual Editor, Sound Designer,
or Motion & Color specialist to work from the same frozen plan.
```

---

#### Rank 3: Post-Production Handoff Checklist Generator

This is less likely to win broad consumer traffic, but it is highly aligned with Nexet's external-first model and can attract exactly the professional users who understand the value of version control.

### Tool modes

- Editor → Sound Designer.
- Editor → Colourist.
- Producer → Editor.
- Director → Editor.
- Creator → Thumbnail Artist.
- Agency → Freelance Editor.

### Example output

```text
Post-production handoff: picture lock to sound

Project:
Version:
Frame rate:
Start timecode:
Audio sample rate:

Included:
[x] Reference video
[x] Dialogue stems
[x] Music guide
[x] Timecoded notes
[x] Change list
[ ] OMF / AAF
[ ] Picture-lock approval

Recipient should confirm:
1. The reference cut opens and matches the stated frame rate.
2. The audio starts at the stated timecode.
3. All required stems are present.
4. Notes refer to the same approved version.
5. Any missing media is reported before work begins.
```

### Nexet CTA

```text
Do not lose this handoff in email or a chat thread.
Create the Nexet project, attach the version, and submit the next
cut with the change note and review history preserved.
```

---

## 6.4 Full Creator Den rank interpretation

The first three Creator Den tools establish the main collaboration workflow. Ranks 4–12 extend that workflow into planning, review, delivery, technical interoperability, and audience-facing production. Each tool should produce a complete result while making the next human or specialist handoff obvious.

### Rank 4: Production Budget and Crew-Day Calculator

**Strategic role:** A broad planning tool that attracts producers and creators before a project has enough structure to open roles.

This tool should turn an early production idea into a transparent estimate with assumptions. Its Nexet value is that a clear budget helps the creator define which roles are needed, what stage the project is in, and what each collaborator is expected to deliver.

**Inputs**

- Project type, duration, and production days.
- Crew roles and day rates.
- Equipment, location, transport, talent, insurance, and post-production.
- Currency, contingency percentage, and paid/unpaid assumptions.

**Outputs**

- Line-item estimate.
- Crew-day summary.
- Pre-production, production, and post-production subtotals.
- Contingency amount.
- Assumptions and missing-cost warnings.

### Example output

```text
Project: 8-minute documentary short
Currency: USD

Pre-production:
- Research and development: $400
- Producer: 3 days × $250 = $750
- Location planning and permits: $300

Production:
- Director: 2 days × $350 = $700
- Camera operator: 2 days × $400 = $800
- Sound recordist: 2 days × $300 = $600
- Equipment and transport: $900

Post-production:
- Video editor: 5 days × $350 = $1,750
- Sound design and mix: $500
- Colour grade: $400
- Captions and delivery exports: $150

Subtotal: $7,250
Contingency at 10%: $725
Estimated total: $7,975

Roles to open:
Video Editor, Sound Designer, Colourist, Caption Editor

Assumption:
Rates are user-provided planning values and should be reviewed
against the actual project, location, and agreement.
```

### Nexet CTA

> Turn the estimate into a structured Creator Den project and open the roles needed to produce it.

**MVP boundary:** Use user-provided assumptions and clearly label estimates. Do not claim that the calculator reflects local market rates or replace a producer’s budget review.

### Rank 5: Storyboard and Visual Beat Planner

**Strategic role:** A planning and communication tool for directors, producers, and visual editors who need to align before the timeline is built.

This tool should make the intended visual sequence understandable to another specialist. The output is valuable when a collaborator can inspect the plan, identify missing shots, and work from the same approved direction.

**Inputs**

- Scene description or script excerpt.
- Shot purpose, subject, location, movement, framing, and visual style.
- Dialogue, action, sound, transition, and continuity notes.
- Priority and delivery format.

**Outputs**

- Visual beat sequence.
- Shot cards.
- Composition and movement notes.
- Audio and continuity notes.
- Exportable storyboard or shot-planning table.

### Example output

```text
Scene 03: The Orchard
Visual intention: Begin observational, then introduce unease.

Beat 1 — Establishing wide
Image: Empty orchard at first light.
Movement: Locked frame.
Audio: Wind and distant road noise.
Purpose: Make the location feel still before Mara arrives.

Beat 2 — Medium tracking shot
Image: Mara enters carrying the unopened letter.
Movement: Slow track behind her.
Audio: Footsteps and paper movement.
Continuity: Coat must match Scene 02.

Beat 3 — Insert close-up
Image: Her handwriting on the envelope.
Movement: Hold for the audience to read the name.
Audio: Paper tension, no score.
Purpose: Connect the object to Mara before the visitor appears.

Visual review question:
Does the sequence create suspense without showing the visitor too early?
```

### Nexet CTA

> Share the visual plan as a project preview and invite a Story Architect, Visual Editor, or Motion & Color specialist to work from the same approved direction.

**MVP boundary:** Start with structured shot cards and optional reference images. Do not build a full nonlinear editor or promise production-ready visual assets.

### Rank 6: Timecode and Frame-Rate Calculator

**Strategic role:** A small but highly relevant professional utility that brings editors, sound designers, and colourists into Nexet’s review language.

The tool should be extremely clear about frame rate and drop-frame assumptions because an apparently small timecode error can send a collaborator to the wrong moment in a cut.

**Inputs**

- Frame rate and drop-frame/non-drop-frame mode.
- Start timecode.
- Timecode or frame number to convert.
- Optional duration and offset.

**Outputs**

- Converted timecode and frame values.
- Duration calculation.
- Frame-rate and format warning.
- Copyable review-note format.

### Example output

```text
Timecode conversion
Frame rate: 23.976 fps
Mode: Non-drop-frame
Start timecode: 01:00:00:00
Input position: 00:04:12:10

Absolute timeline position:
01:04:12:10

Review note:
At 01:04:12:10, the visitor appears behind Mara.
Check whether the entrance should remain silent until the cut.

Warning:
Confirm that the receiving collaborator is using the same frame rate
and timecode start before applying this note to another timeline.
```

### Nexet CTA

> Keep review notes attached to the correct timeline version in Nexet, with timecode preserved for the next specialist.

**MVP boundary:** Make the conversion transparent and test against known edge cases. Do not attempt full timeline parsing in the first version.

### Rank 7: Subtitle / Caption Format Converter and Validator

**Strategic role:** A practical traffic tool that connects a common delivery problem to versioned submissions.

The first useful version should focus on deterministic checks: malformed timestamps, overlaps, invalid ordering, excessive line length, and format conversion. That makes the output trustworthy and easy to compare against the approved cut.

**Inputs**

- SRT, VTT, or supported caption text.
- Target format.
- Optional frame rate, language, maximum line length, and reading-speed limits.

**Outputs**

- Converted caption file.
- Invalid timestamps and overlap warnings.
- Line-length and timing warnings.
- Corrected export where the change is deterministic.

### Example output

```text
Caption validation: scene03.srt
Target format: WebVTT
Status: Converted with warnings

Issue 1 — Overlap
Cue 18 ends at 00:04:12.500.
Cue 19 begins at 00:04:12.300.
Suggested action: Confirm whether the overlap is intentional.

Issue 2 — Line length
Cue 24 contains 52 characters on one line.
Suggested action: Split after “the orchard”.

Issue 3 — Timestamp format
Cue 31 uses a comma where WebVTT requires a period.
Action taken: Converted automatically.

Output:
- scene03.vtt
- Validation report
- Changes requiring human review
```

### Nexet CTA

> Submit the corrected caption version against the approved cut so the editor or reviewer can verify the exact delivery file.

**MVP boundary:** Never silently alter ambiguous timing or wording. Show changes and preserve the original input for comparison.

### Rank 8: Video Script and Production Brief Generator

**Strategic role:** A broad creator acquisition tool that becomes strategically useful only when it leads to review or specialist collaboration.

This tool should produce a brief that a real production team can act on. It should separate the spoken script from visual, audio, graphics, and delivery requirements so different Creator Den roles can respond to the same source.

**Inputs**

- Topic, audience, platform, duration, and format.
- Key message, call to action, tone, references, and restrictions.
- Presenter, visual, audio, and delivery requirements.

**Outputs**

- Script structure.
- Scene and visual direction.
- Voiceover/dialogue sections.
- Production brief.
- Open-role suggestions for script, video, audio, or thumbnail work.

### Example output

```text
Project: How Local Food Reaches the Market
Format: 90-second documentary social video
Audience: First-time market visitors
Tone: Warm, practical, observant

Scene 1 — Opening, 0:00–0:10
Voiceover: “Before the stalls open, the market is already moving.”
Visual: Dawn arrival, empty tables, first crates unloaded.
Audio: Natural ambience; no music for the first three seconds.

Scene 2 — Process, 0:10–0:55
Voiceover: Explain the route from local farms to the market.
Visual: Hands sorting produce, transport, vendor preparation.
Audio: Interview excerpt plus restrained music bed.

Scene 3 — Closing, 0:55–1:30
Voiceover: Invite viewers to visit and ask where their food comes from.
Visual: Market opens; close on vendor and customer exchange.
Delivery: 16:9 master, 9:16 social cut, captions required.

Roles suggested:
Script reviewer, Video Editor, Sound Designer, Caption Editor
```

### Nexet CTA

> Ask a script collaborator or production specialist to review or continue the brief inside Nexet.

**MVP boundary:** Do not position this as an automatic finished video. The output should create a better handoff to people.

### Rank 9: Thumbnail Brief and Review Pack Generator

**Strategic role:** A high-fit niche tool for creators and channels that need multiple visual submissions and a clear acceptance decision.

The tool should help a channel owner communicate the idea behind a thumbnail without prescribing every creative choice. The review pack gives the creator a fair way to compare different submissions against the same brief.

**Inputs**

- Platform and dimensions.
- Video title, subject, audience, hook, and desired emotion.
- Brand colours, reference examples, text limits, and prohibited elements.
- Review criteria and delivery deadline.

**Outputs**

- Thumbnail design brief.
- Text and composition constraints.
- Variant checklist.
- Review scorecard.
- Export and naming requirements.

### Example output

```text
Thumbnail brief: “I Found the Missing Orchard”
Platform: YouTube
Canvas: 1280 × 720, 16:9
Audience: Viewers interested in mystery documentaries

Core question:
Can the viewer understand the mystery in one second?

Required visual elements:
- One expressive close-up of Mara.
- A visible handwritten letter.
- The orchard as a recognisable background shape.

Text limit:
Maximum 3 words. Suggested direction: “WHO SENT IT?”

Avoid:
- Tiny text.
- More than two competing focal points.
- Revealing the visitor's identity.

Review scorecard:
1. Clear at mobile size.
2. Matches the video promise.
3. Strong focal hierarchy.
4. Legible without relying on the title.
5. Can be delivered in the required format.
```

### Nexet CTA

> Open a Thumbnail role on Nexet and compare submissions against the same brief before accepting one.

**MVP boundary:** Support the brief and review process first. Do not build a complete thumbnail editor or promise click-through-rate performance.

### Rank 10: Video Review and Feedback Pack Generator

**Strategic role:** A direct bridge into Nexet’s review desk for producers, clients, editors, and directors who need feedback that is specific and actionable.

This tool should turn subjective reactions into a review record that a collaborator can act on. It should separate required changes from preferences and keep every note tied to a specific version.

**Inputs**

- Project type and review stage.
- Review focus: story, picture, sound, colour, graphics, captions, brand, or delivery.
- Version name, reviewer role, deadline, and approval status.

**Outputs**

- Review checklist.
- Timecode-note template.
- Must-fix, should-fix, and preference categories.
- Approval or revision summary.
- Change-note structure for the next submission.

### Example output

```text
Review pack: Documentary Short v03
Review stage: Picture lock review
Reviewer: Director

Must fix:
- 00:04:12:10 — Hold the visitor's entrance for 8 more frames.
- 00:05:48:02 — Dialogue is difficult to understand under the music.

Should fix:
- 00:02:31:18 — Trim the pause before the interview answer.
- 00:06:14:00 — Confirm the lower-third spelling.

Preference:
- Consider a quieter music transition before the final line.

Approval status:
Revision requested

Next submission must include:
- Updated reference export.
- Revised audio mix.
- Change note responding to each must-fix item.
```

### Nexet CTA

> Attach the review pack to a Nexet submission and keep feedback on the exact cut instead of scattering it across email and chat.

**MVP boundary:** Generate a disciplined review structure. Do not pretend to assess a video that the tool has not actually received or analysed.

### Rank 11: EDL / AAF / FCPXML / OTIO Validator

**Strategic role:** A technical-authority tool for professional users who have a real interchange or handoff problem and value correctness over broad traffic.

This tool is valuable because a professional handoff can fail before creative review even begins. The validator should make structural problems visible early and produce a report that can travel with the package.

**Inputs**

- Supported EDL, AAF, FCPXML, or OTIO file.
- Optional source application, destination application, frame rate, and expected timeline settings.

**Outputs**

- File-format and schema checks.
- Missing media or reference warnings where detectable.
- Timebase and timeline warnings.
- Unsupported-feature report.
- Human-readable handoff summary.

### Example output

```text
Interchange validation: picture-lock-v03.fcpxml
Detected format: FCPXML
Declared frame rate: 23.976 fps
Timeline duration: 00:08:14:12

Checks passed:
- XML structure is readable.
- Timeline has a declared timebase.
- 42 clips contain source references.

Warnings:
- 3 source references use relative paths.
- 2 clips contain effects that may not transfer.
- Audio channel layout is not declared for one compound clip.

Handoff summary:
Receiving application: Resolve
Review before import:
1. Relink source media.
2. Confirm the two effect clips manually.
3. Verify audio channel mapping.
```

### Nexet CTA

> Validate the exchange package, then move the handoff into a versioned Nexet project and submit it for review.

**MVP boundary:** Begin with deterministic structural validation. Do not promise that a valid interchange file will automatically relink every media asset in every professional application.

### Rank 12: Aspect Ratio, Resolution, and Export Preset Calculator

**Strategic role:** A broad traffic feeder for creators who need delivery requirements before handing work to an editor or publishing team.

Its most useful Nexet output is a delivery brief that can be attached to a project or handoff. The tool should make platform requirements understandable without pretending that every platform has one permanent export rule.

**Inputs**

- Platform and destination.
- Source resolution and aspect ratio.
- Orientation, frame rate, codec preference, and delivery quality.
- Whether the output is master, web, social, preview, or archive.

**Outputs**

- Recommended dimensions.
- Aspect-ratio conversion.
- Crop or letterbox warning.
- Export requirement summary.
- Copyable delivery brief.

### Example output

```text
Delivery preset
Destination: YouTube Shorts
Source: 3840 × 2160, 16:9
Target orientation: 9:16

Recommended output:
- Resolution: 1080 × 1920
- Aspect ratio: 9:16
- Frame rate: Match source
- Codec: H.264
- Audio: AAC, 48 kHz

Framing warning:
Converting this source to 9:16 will crop the left and right sides.
Keep the speaker and the letter inside the vertical safe area.

Handoff note:
Create a 9:16 preview and review the crop before final export.
```

### Nexet CTA

> Record the delivery requirements in the Nexet project before the edit begins and attach them to the next handoff.

**MVP boundary:** Present recommendations as presets, not universal rules. Keep the platform list maintainable and show the date of the last preset review.

### Creator Den full-rank build interpretation

| Rank | Tool role in the funnel | Primary Nexet destination | MVP output | Build posture |
|---:|---|---|---|---|
| 1 | Collaboration and role entry | Audition Arena | Open-role brief | Build first |
| 2 | Planning and activation | Creator Den project | Shot list and scene breakdown | Build first |
| 3 | Professional handoff entry | Submission and review desk | Handoff checklist | Build first |
| 4 | Production planning | Creator Den project and roles | Budget estimate and assumptions | Build next |
| 5 | Visual planning | Project preview / Visual Editor role | Storyboard and visual beats | Build next |
| 6 | Technical review entry | Timeline review desk | Timecode conversion and notes | Build next |
| 7 | Delivery utility | Submission workflow | Validated caption export | Support tool |
| 8 | Script and brief acquisition | Script role / project | Script and production brief | Build later |
| 9 | Specialist role acquisition | Thumbnail role / Audition Arena | Thumbnail brief and scorecard | High-fit niche tool |
| 10 | Review activation | Review desk | Video feedback pack | High-fit niche tool |
| 11 | Technical authority | External-first handoff | Interchange validation report | Build after core workflow |
| 12 | Distribution traffic feeder | Project delivery requirements | Export preset and delivery brief | Support tool |

### Creator Den build specifications

| Tool | Minimum useful version | Do not build first | Nexet event to track |
|---|---|---|---|
| Collaboration Brief | Form inputs → role brief → copy/download | Full applicant matching algorithm | `creator_role_brief_generated`, `creator_role_cta_clicked` |
| Shot List | Script/text input → structured shot list → CSV/PDF export | Full nonlinear editor | `creator_shotlist_generated`, `creator_project_cta_clicked` |
| Handoff Checklist | Select handoff type → checklist → package notes | Automatic media transfer in the first version | `creator_handoff_generated`, `creator_submission_cta_clicked` |
| Budget Calculator | Project days, crew, equipment, location, post, contingency → estimate | Marketplace pricing or vendor database | `creator_budget_generated`, `creator_role_cta_clicked` |
| Timecode Calculator | Frame rate/timecode inputs → conversion/check → copy result | Full timeline parser | `creator_timecode_checked`, `creator_review_cta_clicked` |
| Subtitle Validator | Upload/paste caption file → errors and corrected export | Full caption editor | `creator_caption_validated`, `creator_submission_cta_clicked` |

---

## 7. Exact Ahrefs research plan for Nexet

The following is the Nexet-specific version of the process from the Expanded Free Tools Marketing Playbook.

### Step 1: Separate the research into two databases

Create two Notion databases:

- `Nexet — Author Den Free Tools`
- `Nexet — Creator Den Free Tools`

Do not mix the dens at the keyword stage. The language, audience, role vocabulary, and CTA are different.

### Step 2: Search Author Den seed families

Run these seed groups separately:

```text
Writing and planning:
book outline
scene outline
beat sheet
story bible
character profile
plot outline

Collaboration and review:
beta reader
manuscript feedback
editorial checklist
chapter critique
co-writing
writing collaboration

Publishing and positioning:
book blurb
book synopsis
query letter
author bio
book title

Utility:
manuscript word count
reading time
book royalty calculator
character name
```

Then combine the strongest task terms with:

```text
generator
template
checklist
calculator
questionnaire
review
feedback
```

### Step 3: Search Creator Den seed families

Run these seed groups separately:

```text
Planning:
shot list
storyboard
script breakdown
video brief
production brief

Production:
video budget
crew day rate
production schedule
video call sheet
thumbnail brief

Post-production:
editing handoff
post production checklist
timecode calculator
subtitle converter
caption validator

Professional interoperability:
AAF
EDL
FCPXML
OTIO
timeline validator
media handoff

Distribution:
video script
YouTube title
video description
thumbnail size
aspect ratio
export settings
```

Then combine with:

```text
generator
template
calculator
validator
checker
converter
review
handoff
```

### Step 4: Apply the initial filters

Use the same starting thresholds from the original playbook:

```text
KD < 10
Monthly search volume > 1,000
```

Then make two exceptions:

1. **High-fit professional tools:** keep a candidate below 1,000 volume if the visitor is likely to be a serious editor, sound designer, colourist, producer, or studio.
2. **High-volume traffic feeders:** keep a candidate with weaker Nexet fit only if it can link naturally to a stronger workflow tool.

### Step 5: Inspect the SERP manually

For each candidate:

1. Search the exact phrase.
2. Record whether the current results are tools, articles, templates, or product pages.
3. Check whether the top results are old, slow, difficult to use, or narrowly focused.
4. Note whether the query wants a quick utility or a full software product.
5. Identify what Nexet can offer that the existing results do not.

### Step 6: Add a Nexet-fit test

Reject the keyword if all of these are true:

- The visitor only wants a one-time answer.
- The tool result has no relationship to collaboration.
- There is no plausible Author Den or Creator Den role.
- The CTA would be “Try Nexet” without a specific reason.

Keep the keyword if at least one of these is true:

- The visitor needs another person to review the result.
- The visitor needs to hire or find a role.
- The visitor needs to hand work to another specialist.
- The visitor needs version history or approval.
- The visitor needs a structured project after using the tool.

### Step 7: Write the CTA before approving the build

Use this template:

```text
You just completed [small task].
The next problem is [larger collaboration or workflow problem].
Nexet lets you [specific Author Den or Creator Den action].
[CTA button]
```

If the sentence does not sound natural, reject or redesign the tool.

### Step 8: Prioritize in the Notion table

Add these columns:

| Column | Example |
|---|---|
| Keyword | `beta reader questionnaire` |
| Den | Author Den |
| Search intent | Create questions for a beta reader |
| Search volume | Copy from Ahrefs |
| KD | Copy from Ahrefs |
| SERP type | Tools / templates / articles |
| Tool concept | Beta Reader Feedback Pack |
| Primary persona | Author |
| Nexet feature | Beta Reader role / Audition Arena |
| CTA | Publish a frozen role |
| Build effort | Low |
| Strategic fit | 5/5 |
| Differentiation | High |
| Phase | 1 / 2 / 3 |
| Status | Candidate / building / live |

---

## 8. Free-tool page structure for Nexet

Every tool should follow the same reusable page pattern.

### 1. Search-matching title

Examples:

- `Free Beta Reader Questionnaire Generator`
- `Free Video Post-Production Handoff Checklist`
- `Free Shot List Generator`

### 2. Immediate value statement

Examples:

```text
Create a focused beta-reader questionnaire for your manuscript in minutes.
```

```text
Prepare a clean handoff from picture lock to sound, colour, or the next editor.
```

### 3. Working tool interface

Do not require a Nexet account before the visitor receives the first useful result unless the tool truly requires saved project state.

### 4. Copy and export

Support:

- Copy to clipboard.
- Markdown.
- PDF.
- DOCX where relevant.
- CSV for shot lists.
- SRT/VTT where relevant.

### 5. Contextual Nexet CTA

The CTA should be specific to the den and role.

### 6. “Why this matters” section

Explain the larger workflow:

- Authors: protect the manuscript, invite a role, review a response.
- Creators: lock the version, send a handoff, review the next cut.

### 7. Related tools

Create a chain:

```text
Author:
Outline → collaboration brief → beta-reader pack → review checklist → Pitch Board

Creator:
Shot list → production brief → handoff checklist → timecode review → Audition Arena
```

### 8. FAQ and search coverage

Answer practical questions about:

- File formats.
- Privacy.
- Whether signup is required.
- What the output includes.
- What the tool does not decide for the user.

### 9. Final CTA

Repeat the next Nexet action after the visitor understands the workflow.

---

## 9. Nexet-specific CTA library

### Author Den CTAs

| Free tool | CTA |
|---|---|
| Beta Reader Feedback Pack | “Turn this questionnaire into a real beta-reader role on Nexet. Share only the passage or chapter you are ready to expose, then review each response before anything merges.” |
| Collaboration Brief | “Publish this as a frozen seed on Nexet and let another writer answer it privately.” |
| Scene Outline | “Develop this scene inside a Nexet project with a shared Story Bible and revision history.” |
| Character Profile | “Keep this character in the Story Bible, then invite a co-writer or editor to work from the same context.” |
| Scene Critique Checklist | “Open an Editor role on Nexet and review the manuscript against the same frozen version.” |
| Synopsis / Blurb | “Let an editor or beta reader review the positioning before you publish.” |
| Word Count Calculator | “Track the project in Nexet with daily and session word targets.” |

### Creator Den CTAs

| Free tool | CTA |
|---|---|
| Collaboration Brief | “Publish this as an open Creator Den role and let specialists apply with a message and portfolio.” |
| Shot List | “Turn this shot list into a versioned project and invite the next role.” |
| Handoff Checklist | “Attach this handoff to a Nexet submission so the recipient reviews the exact version.” |
| Budget Calculator | “Create the project and open the roles needed to produce it.” |
| Timecode Calculator | “Keep review notes attached to the correct timeline version.” |
| Subtitle Validator | “Submit the corrected caption version against the approved cut.” |
| Thumbnail Brief | “Open a Thumbnail role and compare submissions before accepting one.” |
| EDL/AAF/FCPXML Validator | “Validate the exchange package, then move the handoff into a versioned Nexet project.” |

---

## 10. Build order and launch sequence

### Phase 1 — Prove the Author Den workflow

Build:

1. Beta Reader Feedback Pack.
2. Collaboration Brief Generator.
3. Scene / Chapter Outline Generator.

Launch sequence:

1. Publish the tool pages.
2. Add Author Den branding and internal links.
3. Add the Nexet CTA below the result.
4. Link the CTA to the most relevant destination:
   - Pitch Board.
   - Writers' Audition Arena.
   - New Author Den project.
5. Track tool completion and CTA clicks.
6. Review whether visitors create projects, roles, seeds, or accounts.

### Phase 2 — Prove the Creator Den workflow

Build:

1. Video Collaboration Brief.
2. Shot List Generator.
3. Post-Production Handoff Checklist.

Launch sequence:

1. Publish the tool pages.
2. Add Creator Den examples.
3. Link each tool to the relevant open-role or project flow.
4. Track CTA clicks by role:
   - Video.
   - Audio.
   - Script.
   - Thumbnail.
5. Add realistic production examples.
6. Ask early users what they currently send through email, Drive, WeTransfer, or chat.

### Phase 3 — Add traffic feeders

After the high-fit tools are working, add:

- Author word-count calculator.
- Book title or blurb tool.
- Creator aspect-ratio calculator.
- Subtitle converter.
- Video export settings calculator.

These tools can bring broader traffic, but every page should point toward a higher-fit Nexet workflow.

### Phase 4 — Add technical authority tools

Build only after the first workflow tools have usage evidence:

- Timeline handoff validator.
- AAF/EDL/FCPXML/OTIO inspection tool.
- Character continuity checker.
- Manuscript revision comparison tool.

These may have lower search volume but can create strong trust with serious users.

---

## 11. Measurement plan

### Shared events

```text
free_tool_page_view
free_tool_started
free_tool_completed
free_tool_result_copied
free_tool_result_downloaded
nexet_cta_viewed
nexet_cta_clicked
nexet_signup_started
nexet_den_opened
nexet_project_created
nexet_role_created
nexet_seed_published
nexet_audition_started
nexet_submission_created
```

### Author-specific events

```text
author_beta_pack_generated
author_brief_generated
author_outline_generated
author_bible_generated
author_review_pack_generated
author_seed_cta_clicked
author_editor_role_cta_clicked
author_beta_role_cta_clicked
```

### Creator-specific events

```text
creator_role_brief_generated
creator_shotlist_generated
creator_handoff_generated
creator_budget_generated
creator_timecode_checked
creator_caption_validated
creator_role_cta_clicked
creator_submission_cta_clicked
```

### Funnel dashboard

| Funnel stage | Author Den | Creator Den |
|---|---|---|
| Visitor | Tool page visitor | Tool page visitor |
| Activated | Generated questionnaire, outline, or brief | Generated shot list, brief, or checklist |
| Converted | Clicked Pitch Board, role, project, or beta-reader CTA | Clicked role, project, or submission CTA |
| Activated in Nexet | Created a project, seed, or role | Created a project or open role |
| Collaboration started | Received or sent an answer | Received or sent an audition/submission |
| Business outcome | Accepted collaboration / active project | Accepted role / active project |

### Decision rules

- **Traffic but no tool completion:** improve the interface and promise.
- **Tool completion but no CTA clicks:** the tool is not creating a clear next need.
- **CTA clicks but no Nexet activation:** simplify the destination and first-run flow.
- **Nexet activation but no collaboration:** improve role descriptions, trust, previews, and onboarding.
- **Low traffic but strong activation:** improve SEO and internal linking.
- **Low traffic and low activation:** stop investing or redesign the tool.

---

## 12. What Nexet should avoid

### Author Den

Avoid making the first product story:

- “Generate an entire novel.”
- “Write your book with AI.”
- “Replace your editor.”
- “Create unlimited content instantly.”

Those messages conflict with Nexet's human-led collaboration and provenance principles. The Story Oracle can remain advisory, but the free-tool funnel should lead to people, review, and shared authorship.

### Creator Den

Avoid making the first product story:

- “Edit your video in the browser.”
- “Replace Premiere or Resolve.”
- “Generate an entire film automatically.”
- “Automate every creative role.”

Nexet's documented advantage is external-first collaboration, version control, handoff, review, and attribution. Free tools should reinforce that position.

---

## 13. Final recommendation

Nexet's free-tool strategy should be built around **the moment another person is needed**.

### Author Den

The best visitor is not simply someone who wants a title or a paragraph. It is someone who has:

- A scene that needs another perspective.
- A manuscript that needs a beta reader.
- An outline that needs development.
- A brief that needs a co-writer or editor.

### Creator Den

The best visitor is not simply someone who wants an AI-generated video. It is someone who has:

- A project that needs a specialist.
- A shot list that needs execution.
- A locked cut that needs sound or colour.
- A handoff that needs a versioned review record.

The two dens can therefore use different search-facing tools while leading into the same Nexet engine:

```text
Useful free result
    ↓
The work needs another person
    ↓
Create a structured brief or role
    ↓
Invite or discover the collaborator
    ↓
Work privately
    ↓
Review
    ↓
Merge with provenance
```

That is the free-tool portfolio Nexet should own.

---

## Sources and research references

### Nexet source

- `attached_assets/ABOUT-NEXET_(1)_1789950945181.md`

### Strategy source

- [Expanded Free Tools Marketing Playbook](free-tools-marketing-playbook.md)

### Author market references

- [Reedsy — The 5 Best Collaborative Writing Tools](https://reedsy.com/studio/resources/collaborative-writing-tools)
- [The Write Practice — Query Letter Generator](https://thewritepractice.com/query-letter-generator)
- [Built&Written — Book Blurb Generator](https://app.builtwritten.com/tools/book-blurb-generator)
- [ManuscriptReport — Free Author Tools](https://manuscriptreport.com/tools)
- [AIWriteBook — Free Author Tools](https://aiwritebook.com/en)

### Creator market references

- [Teleprompter.com — Free AI Video Script Generator](https://www.teleprompter.com/tools/script-generator)
- [StudioHero — Production Budget Calculator](https://thestudiohero.com/tools/production-budget-calculator)
- [AAF Bridge — AAF / XML Workflow Tool](https://aafbridge.com/)
- [ShotLogic — AI Screenplay Analysis](https://www.shotlogic.studio/)
- [Pictory — Free AI Video Creator Tools](https://pictory.ai/free-ai-video-creator-tools)
