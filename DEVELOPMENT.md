# Character Profile & Story Bible Starter — Development Plan

> **Free tool #4 · Authors Den · Phase 2**
>
> Part of the Nexet free-tools marketing program.
> **Product promise:** *Post what you started. Finish it with someone else.*
> **Tool promise:** *Build the cast and world once, so everyone works from the same ground.*

| Field | Value |
|---|---|
| Tool name | Character Profile & Story Bible Starter |
| Den | Authors Den |
| Route | `/tools/character-profile-story-bible` |
| Strategic role | High-fit planning tool — prepares the ground *before* a collaborator is invited |
| Priority | Rank 4 (Build next — first tool of Phase 2) |
| Primary persona | The novelist / series writer with a growing cast |
| Secondary persona | The returning collaborator, co-writer, editor and beta reader |
| Nexet features introduced | Characters, World, Story Bible, shared project |
| Primary CTA | *Keep this character and world context in a Nexet Story Bible, then invite a co-writer or editor to work from the same approved context.* |
| Build effort | Medium |
| Status | **Specification — approved for build** |

**Source documents**

| Document | What it contributes |
|---|---|
| `ABOUT-NEXET (1).md` | The product: Story Bible, Characters, World, Plots, roles, the collaboration lifecycle, provenance |
| `nexet-free-tools-research-and-build-planFINALL_BUILD.md` | Rank 4 definition, inputs/outputs, example output, MVP boundary, CTA library, page pattern, measurement plan |

---

## 1. Why this tool exists

### 1.1 The strategic job

The first three Author Den tools all point at *the moment of asking* — the beta-reader pack, the collaboration brief, the outline. This tool points at the step **before** that, and it is the step that silently decides whether a collaboration works at all.

Rank 4's stated strategic role:

> A high-fit planning tool for writers who need a consistent source of truth before inviting another person into a project. Collaborators can only contribute well when they understand the characters, relationships, world rules, and continuity constraints the author wants protected. It should turn loose notes into a shared starting point rather than trying to write the entire story.

That sentence contains the whole design brief. The visitor arrives with **scattered notes**, and the tool converts them into a **structure two people can stand on**. That structure is, by design, the same one the Authors Den already stores: a **Story Bible**.

So the tool is not "a generator with a CTA attached". It is the Authors Den's Story Bible, **with the walls off** — useful with no account, exportable, and complete enough that a writer will keep using it even if they never sign up. Which is exactly why some of them will sign up.

### 1.2 The problem it answers

| The writer's problem in practice | What that costs | What the tool does about it |
|---|---|---|
| Character details live in five notebooks, a Notes app and three DOCX files | Eye colour changes in chapter 15; a name is spelled two ways | One place per fact, entered once, referenced by everyone |
| A story bible "should" exist but starting one is a blank-page problem | The bible never gets made, so the collaboration starts with no shared ground | A guided wizard turns loose notes into a filled bible in one sitting |
| Templates online are either a 90-field monster or an empty table | Writers abandon them halfway | Depth modes (Quick / Standard / Deep) so the tool grows with the project |
| Continuity errors are found by readers, not the author | A beta reader's first note is a typo instead of a story note | A **deterministic** gap-and-conflict checker that reports what is missing and what contradicts |
| A new collaborator needs a 40-minute briefing | The writer re-explains the world every time | A one-page **collaborator context brief** exported from the same bible |
| Sharing the whole manuscript is the only way to share context | Writers over-share or get nothing | Share the *context*, not the manuscript — the Story Bible is the safe artifact |

### 1.3 The line the tool must not cross

The free-tools plan is explicit about the Author Den's forbidden story:

> Avoid making the first product story: "Generate an entire novel." / "Write your book with AI." / "Replace your editor." / "Create unlimited content instead."

And Rank 4's own MVP boundary:

> **MVP boundary:** Generate structured fields and useful prompts. Do not attempt a complete manuscript knowledge graph or claim that the character is automatically consistent across an entire book.

Both are hard requirements, not guidance. They translate into four build rules:

1. **The tool structures, it does not author.** AI may *suggest* a field value when asked. It never fills the bible behind the writer's back.
2. **The checker is honest.** It reports structural problems in the data the writer entered (a duplicate name, an age that contradicts the timeline, an empty core field). It never claims to have read the manuscript.
3. **No manuscript ingestion in v1.** The tool works from the writer's own notes and answers — not from a pasted novel it pretends to understand.
4. **The human stays the source of truth.** Every AI suggestion is labelled, editable and rejectable, in the same spirit as the Story Oracle's provider disclosure.

---

## 2. Who this is for

### 2.1 Primary persona — "The series writer with a cast problem"

| Attribute | Detail |
|---|---|
| Who | Mid-to-serious novelist, 1–3 drafts deep, often writing a series or a large secondary cast |
| Where they are | Between outline and drafting; a collaborator is on the horizon (editor, beta reader, co-writer) |
| What they say | *"I need to get my characters straight before anyone else reads this."* / *"I can't remember what I decided about her brother."* |
| What they currently do | Scrivener character sheets, a Notion database, a Google Doc, or nothing |
| What they need | One authoritative place for cast + world + continuity, and a clean way to hand that context to someone else |
| Search phrases | `character profile template`, `character sheet`, `story bible template`, `character profile generator`, `fiction character generator` |

### 2.2 Secondary persona — "The collaborator who needs the ground"

The second reader of this tool's output. A co-writer, editor or beta reader who receives the exported bible and needs to know **what must not be changed**. They may never open the tool themselves — they receive its output. This is why **export quality is not a nice-to-have**: the file leaves the building and becomes the shared ground.

### 2.3 Anti-persona (explicitly not the target)

- Someone who wants the tool to invent a plot and a cast from a single prompt.
- Someone who wants to paste a whole manuscript and receive a continuity report.
- Someone writing a one-page short story who needs two fields, not two hundred.

The tool should still be *usable* by all three — it just should not be *designed* around them.

---

## 3. What the research says the tool must contain

This section is the evidence base for the field schema in §5. It is drawn from published character-sheet templates, story-bible guides and the free tools already ranking for these queries.

### 3.1 Character profile — what published templates actually collect

Cross-referencing a widely-shared working writer's character sheet (Shannon Fallon, 2022), Reedsy Studio's 50+ question character profile, and standard story-bible guidance (Atmosphere Press), the recurring categories are stable across sources:

| Category | What sources consistently ask for |
|---|---|
| **Identity** | Name, reason for the name, nickname/alias, gender, pronouns, age, occupation, role in the story |
| **Appearance** | Build, hair, eyes, skin, height, distinguishing marks, dominant hand, signature outfit, default expression |
| **Voice & mannerisms** | Voice sound, speech register, catchphrases, tics, how they joke |
| **Personality** | Core traits, strengths, weaknesses, pet peeves, values, emotional triggers, quirks |
| **Motivation (the engine)** | Greatest goal / external want, internal need, greatest fear, the misbelief they act on |
| **Backstory** | Family, hometown, class, first language, formative events, regrets, secrets, formative wound |
| **Arc** | Arc type (positive / negative / flat), starting state, turning point, ending state |
| **Relationships** | Family, friends, enemies, romantic, mentor/rival, chosen family |
| **Genre layer** | Fantasy: magic tier, specialty, cost. Sci-fi: implants, modifications. Extra: political affiliation, religion |
| **Open questions** | Prompts a new or thin character still needs answered |

Two observations that shape the design:

- **The reasoning behind a field matters as much as the field.** Shannon Fallon's sheet records *"Reason for Name"* and *"Reason for Nickname"* — and explains that the sheet is used both to *remember* and to *ask questions*. A profile that only stores facts is a filing cabinet; a profile that stores *reasons* is a writing tool.
- **Fewer fields, chosen well, beat a long list.** The same author's explicit advice: include categories you will actually use, and put the most-referenced information first. That is the design justification for **depth modes** rather than one fixed schema.

### 3.2 Story bible — what a bible must hold

Published guidance converges on five sections, plus continuity as a cross-cutting concern:

| Section | Contents | Tool coverage |
|---|---|---|
| **Character profiles** | Basic info, physical traits, personality, backstory, relationships, arc | ✅ Full — the tool's centre of gravity |
| **Setting & world-building** | Geography, culture, history, rules (especially magic/tech, with limits) | ✅ Starter scope |
| **Timeline & chronology** | Story events, character milestones, historical events, ages | ✅ Starter timeline + age derivation |
| **Plot outlines & subplots** | Act structure, threads, foreshadowing | ⚠️ Out of MVP — belongs to the outline tool and the Nexet Outline |
| **Themes, motifs, symbols** | Recurring ideas, symbols, intentional echoes | ✅ Light — project-level list only |
| **Continuity** | Spellings of invented terms, canonical rules, "what must not change" | ✅ The differentiator — see §6 |

### 3.3 The competitive landscape, and the gap

| Competitor type | Examples | What they do well | Where Nexet's tool differs |
|---|---|---|---|
| **Random/AI character generators** | character-generator.org.uk, BookWriter, perchance, toolsaday | Instant output, zero effort, no signup | They **invent** a stranger. Nexet's tool **records the writer's own** character. A writer cannot use a generated protagonist. |
| **Big-platform templates** | Reedsy Studio character profile (300k+ downloads) | Authoritative, huge question bank, integrates with their editor and story tools | Excellent, but it is a **document inside their product**. Nexet's angle is not "better template" — it is *what happens after the profile exists*: a shared ground a second person can work from. |
| **Purpose-built worldbuilding software** | Campfire, World Anvil, Notion story-bible templates | Deep, interlinked, powerful | Reedsy/Campfire compete on *depth inside a walled product*. Nexet competes on **free, instant, exportable, and pointed at a collaborator**. |
| **The blank template** | Word / Google Docs / PDF character sheet downloads | Free, portable, familiar | No guidance, no checking, no assembly, no export, and it silently rots as the story changes. |
| **Generic AI writing assistants** | ChatGPT wrappers | Flexible | No structure, no persistence, no continuity, no handoff artifact. |

**The differentiation, stated once:** every competitor helps you *write down* a character. This tool helps you **hand the character to the next person without losing anything**. That is Nexet's own thesis applied to a template — and it is why the export, the collaborator brief and the continuity constraints are first-class features rather than extras.

---

## 4. The product model

### 4.1 The shape of the tool

Three work areas, one compiled document:

```
        ┌─────────────────────────────────────────────────────┐
        │  1. CAST          2. WORLD          3. BIBLE         │
        │  characters  →    places, rules  →  the compiled     │
        │  + relationships   + timeline        Story Bible     │
        └─────────────────────────────────────────────────────┘
                              ↓
              CHECK  →  EXPORT / SHARE  →  NEXET CTA
```

| Stage | The writer does | The tool produces |
|---|---|---|
| **1 · Cast** | Adds characters and answers the fields that matter for each | Structured profiles + a relationship map |
| **2 · World** | Pins down setting, locations, rules and a rough timeline | A world starter + chronology |
| **3 · Bible** | Reviews the compiled document, resolves flagged gaps | A Story Bible (Markdown / DOCX / PDF / JSON) + a one-page collaborator brief |

Everything below is free, with no account, until the writer chooses to save beyond the browser or share it — which are the two moments the CTA appears.

### 4.2 The three depth modes

The single most important UX decision in this tool. A blank 90-field form kills completion; a 6-field form produces something useless.

| Mode | Fields per character | Time | For | Positioning line |
|---|---|---|---|---|
| **Quick** | 13 | 5–10 min | A writer who has never made a sheet, or a large secondary cast | *"Get the essentials down for everyone."* |
| **Standard** | 38 | 20–30 min | The default. A character the story actually depends on | *"Enough for a collaborator to write them correctly."* |
| **Deep** | 56 (+ up to 4 genre-layer fields) | 45–90 min | The protagonist, the antagonist, a series anchor | *"Every question you have not asked yet."* |

Counts are the real totals from the field catalog implemented in `src/lib/fields.ts`, so the promise on the button matches the number of inputs behind it.

Rules:

- Depth is **per character**, not per project. A project mixes one Deep protagonist, four Standard leads and a Quick row of named minor characters.
- Depth can be raised at any time without losing data (Deep ⊇ Standard ⊇ Quick, in field terms).
- Lowering depth **hides** fields, never deletes values, and warns before doing so.
- Completing a Quick profile shows a single, quiet prompt: *"Make this one Deep — there are 43 questions you haven't been asked yet."* This is a soft upsell of *effort*, not of payment, and it maps directly to the Story Bible's Characters section.

### 4.3 Three ways in (never a blank page)

| Entry | What it is | For |
|---|---|---|
| **Guided wizard** | Project facts → first character → first location → compiled bible | A new project, or a writer who wants to be walked |
| **Paste-and-parse** | Paste existing notes; the tool proposes field assignments for confirmation | A writer arriving with a Scrivener sheet or a notes dump |
| **Load an example** | A complete worked bible (with the mystery example from the plan) to explore, then clear | The curious visitor who will not type anything |

The paste-and-parse path is **not** AI magic and must not be sold as such: it is a heuristic + optional AI suggestion pass that proposes *"this line looks like a Core fear"*, and the writer confirms each. Every unconfirmed proposal is discarded. Nothing is written to the bible without an explicit accept.

---

## 5. Feature specification

Priority key: **P0** = required for launch · **P1** = launch if time allows · **P2** = fast follow · **Out** = deliberately excluded from MVP.

### 5.1 Project & onboarding

| # | Feature | Priority | Detail |
|---|---|---|---|
| 1.1 | Project setup | P0 | Working title, author name (optional), genre, story type (novel / series / novella / screenplay), tone, POV, tense, target audience, content notes |
| 1.2 | Genre presets | P0 | Fantasy, Science Fiction, Romance, Thriller/Crime, Literary, Historical, YA, Horror, Screenplay, General. Each preset toggles a **genre layer** of extra fields (see §5.3) and pre-loads a handful of starter prompts |
| 1.3 | Depth mode selector | P0 | Quick / Standard / Deep, set at project level and overridable per character (§4.2) |
| 1.4 | Autosave to browser | P0 | Every keystroke, debounced, to `localStorage`. No account, no loss on refresh |
| 1.5 | Resume banner | P1 | *"You have a project in progress — Orah and the Salt Road (6 characters). Continue?"* |
| 1.6 | Multiple projects (local) | P1 | A simple switcher; projects are keyed locally, with no server round-trip |
| 1.7 | Clear / reset project | P0 | Explicit destructive action with typed confirmation, so a demo visitor can start clean |
| 1.8 | Guided wizard | P1 | The linear first-run path described in §4.3 |

### 5.2 Characters (the centre of the tool)

| # | Feature | Priority | Detail |
|---|---|---|---|
| 2.1 | Cast list | P0 | Table/list of all characters with name, role, importance, colour tag, depth, and completion % |
| 2.2 | Add / edit / duplicate / delete | P0 | Full CRUD. Duplicate is important — many characters share a shape |
| 2.3 | Role & importance taxonomy | P0 | Role: Protagonist, Antagonist, Deuteragonist, Love interest, Mentor, Foil, Ally, Rival, Family, Background. Importance: POV, Major, Supporting, Minor, Named-only |
| 2.4 | Profile editor | P0 | Sectioned, collapsible, with a progress meter per section and a "what's still thin" indicator |
| 2.5 | Field help | P0 | Every field carries a one-line explanation and, where useful, a worked example — the guided-question quality that makes Reedsy's template work, without the 50-question wall |
| 2.6 | Custom key/value fields | P1 | Directly mirrors the Nexet Characters feature (custom fields per character). This is the field that makes the tool genre-proof |
| 2.7 | Colour tag & filter | P1 | Colour per character, used in the cast list, the relationship map and the exported bible |
| 2.8 | Character search & filter | P1 | Search across all character fields; filter by role/importance |
| 2.9 | Cast table view | P1 | A comparison grid — one row per character, one column per key field. The fastest way to spot a gap across a cast |
| 2.10 | AI field suggestion | P1 | Optional, per-field. Proposes a value from the fields already entered; the writer accepts, edits or dismisses. Provider and failover disclosed (see §7.4) |
| 2.11 | Voice samples | P2 | 2–3 sample lines per character, exported into the bible's Voice section |
| 2.12 | Character images / mood board | Out | Adds storage, moderation and cost with no collaboration payoff in v1 |

### 5.3 The character field schema

This is the specification's core deliverable and the contract the export, the checker and the Nexet Characters mapping all depend on. **Tier**: Q = Quick, S = Standard, D = Deep. **L** = genre layer field.

#### A · Identity

| Field | Tier | Notes |
|---|---|---|
| Full name | Q | Required. Uniqueness is enforced by the checker, not by the input |
| Reason for the name | S | *Why this name* — the reasoning layer the research says is missing from most templates |
| Nickname / alias / codename | Q | |
| Reason for nickname | D | |
| Pronouns | Q | Free text, not a fixed enum |
| Gender | Q | |
| Age / age range | Q | Feeds the timeline age derivation |
| Birthday / birth year | S | Optional; enables the timeline check |
| Role in story | Q | Taxonomy in §5.2 |
| Importance | Q | Taxonomy in §5.2 |
| Occupation / school level | Q | |
| Species / ancestry / lineage | L | Fantasy, SF |
| Political affiliation | L | Fantasy, historical, literary |
| Religion / moral philosophy | L | |
| Economic class | S | |
| Current situation (one line) | S | *Where are they as the story opens* |

#### B · Appearance

| Field | Tier | Notes |
|---|---|---|
| Build & frame | S | |
| Height | S | |
| Hair | Q | |
| Eyes | Q | The classic continuity failure the bible exists to prevent |
| Skin tone / complexion | S | |
| Distinguishing marks | S | Scars, tattoos, birthmarks |
| Dominant hand | D | Included on the evidence of the source template — becomes load-bearing in action scenes |
| Signature outfit / style | S | |
| Default facial expression | D | *"They have a resting ___ face."* |
| Voice description | S | |
| Speech register & vocabulary | S | |
| Mannerisms / tics | S | |

#### C · Personality & psychology

| Field | Tier | Notes |
|---|---|---|
| Core traits (3–5) | Q | |
| Strengths | S | |
| Weaknesses / flaws | Q | |
| Values above all else | S | |
| Emotional triggers | S | |
| Pet peeves | D | |
| Habits / quirks | S | |
| How they handle conflict | S | |
| How they approach love | D | |
| Humour — what they find funny | D | |
| **External goal (want)** | Q | The engine. Required for Quick |
| **Internal need** | Q | |
| **Core fear** | Q | |
| **Misbelief — the lie they act on** | S | The field that makes arcs work and that most templates omit |
| Secret | S | |
| Regret | S | |
| Stakes if they fail | S | |

#### D · Backstory

| Field | Tier | Notes |
|---|---|---|
| Hometown / origin | S | |
| Family & upbringing | S | |
| Formative wound | S | |
| Key life events | D | Feeds the timeline |
| Education / training | D | |
| Cultural heritage & first language | D | |
| Historical events witnessed | L | |
| What they carry (prized possession) | D | |

#### E · Arc

| Field | Tier | Notes |
|---|---|---|
| Arc type | Q | Positive / Negative / Flat |
| Starting state | S | |
| Turning point | S | |
| Ending state | S | |
| What they must let go of | S | |
| The change they refuse | D | |

#### F · Relationships

| Field | Tier | Notes |
|---|---|---|
| Relationship entries | Q | Repeating: **target character · type · nature · tension · secret · status** |
| Type taxonomy | Q | Family, Chosen family, Romantic, Friend, Ally, Rival, Enemy, Mentor, Student, Authority, Colleague |
| Relationship map | P0 | Auto-derived from entries — text tree always, optional visual graph (§5.4) |

#### G · Voice & continuity

| Field | Tier | Notes |
|---|---|---|
| Catchphrases / speech habits | D | |
| How they lie or deflect | D | |
| Sample lines (2–3) | P2 | |
| Open threads | S | *What is still undecided about them* |

The last two rows of group G are **not** stored as character fields. *Continuity questions* are generated by the checker into `Character.openQuestions` (§6.2), and *protected canon* lives in the project-level `canonFacts` array (§5.8), because marking canon is an editorial act that must survive later edits to the field it came from.

#### H · Genre layer (L)

| Genre | Extra fields |
|---|---|
| Fantasy | Magic tier / access, speciality, cost & limit, first use, faction allegiance |
| Science fiction | Implants, modifications, tech access, system permissions |
| Historical | Era-specific status, trade, literacy, real-world event ties |
| Romance | Relationship stage at open, obstacle type, emotional wound in love |
| Thriller / crime | Secret held, alibi, leverage, what they are lying about |
| Screenplay | Casting notes, wardrobe, wardrobe change points |
| All | Custom key/value fields (user-defined) |

### 5.4 Relationships

| # | Feature | Priority | Detail |
|---|---|---|---|
| 4.1 | Relationship builder | P0 | Add a relationship on either character; it appears on both automatically (bidirectional, single source) |
| 4.2 | Relationship detail | P0 | Type, nature, tension, secret, status (open / resolved / broken), and the POV difference (*"she thinks they are friends; he is using her"*) |
| 4.3 | Relationship map — text | P0 | Generated, grouped by type, for export into the bible |
| 4.4 | Relationship map — visual | P1 | Lightweight SVG graph: characters as nodes, typed edges, colour by tag, drag to arrange. No physics simulation required in v1 |
| 4.5 | Unlinked-character warning | P0 | A character with no relationships is flagged **when the cast has two or more characters**. With a cast of one there is nobody to be linked to, and `clean-minimal` (§11.2) expects zero findings — so the rule cannot fire on a single character. |
| 4.6 | Asymmetry check | P1 | Surfaces a relationship the two sides feel differently. Because a relationship is a single bidirectional row (§5.4.1), this is the `asymmetryNote` field from §6.3 — the POV difference described in §4.2 — **not** a missing reverse entry, which that model cannot express. Reported as an open question for the writer rather than as an error, since an uneven relationship is usually deliberate. |

### 5.5 World & locations

| # | Feature | Priority | Detail |
|---|---|---|---|
| 5.1 | Setting & era | P0 | Place, time period, technology level, and how the world differs from the reader's |
| 5.2 | Locations | P0 | Repeating entries: name, type (city / building / region / room / vehicle), description, significance, who is usually there, sensory detail |
| 5.3 | Rules & systems | P0 | Repeating entries: rule name, what it does, **what it costs**, **what it cannot do**, who has access. The "cannot do" and "cost" fields are what prevent rule-bending later |
| 5.4 | Culture & society | P1 | Norms, traditions, language(s), government, taboos |
| 5.5 | Factions & institutions | P1 | Name, purpose, who leads it, the characters inside it, how it can be used |
| 5.6 | Timeline | P0 | Ordered events with a year/age anchor. Supports attaching characters to events |
| 5.7 | Glossary | P0 | Invented terms, places and titles with a single canonical spelling — the cheapest possible fix for the most common continuity error |
| 5.8 | Project themes & motifs | P1 | A short list, kept light — the plan places full plot work outside this tool |

### 5.6 Continuity tools (the differentiator)

The checker is **deterministic and honest**. It reads only what the writer entered, says so plainly, and never implies it has read the manuscript.

| # | Feature | Priority | Detail |
|---|---|---|---|
| 6.1 | Missing-field report | P0 | Grouped by character and by section, with a depth-aware notion of "expected": missing a Quick field is a gap; missing a Deep field is an opportunity |
| 6.2 | Open questions | P0 | Generated, field-aware prompts: *"What does Mara already know about the handwriting?"* Always phrased as questions for the writer, never as assertions |
| 6.3 | Duplicate & near-duplicate names | P0 | Exact match, case-insensitive match, and same-first-name warnings |
| 6.4 | Glossary spelling conflicts | P0 | A term used in prose fields in more than one spelling |
| 6.5 | Age / timeline conflict | P1 | Where a birth year and a timeline event cannot both be true |
| 6.6 | Contradiction flags | P1 | Same field, contradictory values on the same character; a relationship typed two ways by two sides |
| 6.7 | Protected canon list | P0 | The writer marks facts as canon. These are compiled into a **"do not change"** block exported at the top of the bible and the collaborator brief |
| 6.8 | Coverage meter | P1 | Project-level completeness, per section |
| 6.9 | Semantic manuscript consistency | Out | Explicit MVP boundary. Never claimed, never implied in copy |

### 5.7 The compiled Story Bible

| # | Feature | Priority | Detail |
|---|---|---|---|
| 7.1 | Live bible view | P0 | A rendered, navigable document that updates as the writer types — the payoff view |
| 7.2 | Table of contents | P0 | Anchored, with per-character jump links |
| 7.3 | Bible sections | P0 | 1 Project facts · 2 Protected canon (do-not-change) · 3 Cast overview · 4 Character profiles · 5 Relationships · 6 World & locations · 7 Rules & systems · 8 Timeline · 9 Glossary · 10 Open questions for the collaborator |
| 7.4 | Print stylesheet | P1 | A clean, page-broken, printer-friendly rendering |
| 7.5 | Regenerate notice | P1 | If the writer edits after exporting, tell them the export is stale rather than letting two versions drift |

### 5.8 The collaborator context brief

The single most strategically important output, because it is the thing that makes the Nexet CTA land.

| # | Feature | Priority | Detail |
|---|---|---|---|
| 8.1 | One-page brief | P0 | Project facts, protected canon, cast one-liners, the rules that cannot be broken, and the open questions |
| 8.2 | Frozen-brief framing | P0 | Presented in the same vocabulary as the Authors Den — the document the respondent answers. *Deliberately the same object the Pitch Board publishes* |
| 8.3 | Role suggestion | P1 | From the brief, suggest the likely open role: Co-writer, Editor, Beta reader, Proofreader |
| 8.4 | Copy as brief / download | P0 | Markdown and DOCX |
| 8.5 | Privacy reminder | P0 | An explicit line, in the plan's own spirit: share the *context*, not the manuscript |

### 5.9 Export & import

| Format | Priority | Contents |
|---|---|---|
| **Markdown** | P0 | The complete bible |
| **DOCX** | P0 | The complete bible, with headings, tables and character sections |
| **PDF** | P0 | Print-ready bible |
| **JSON** | P0 | Full structured project — the round-trip format, and the future import into the Authors Den |
| **CSV** | P1 | Cast table — one row per character, one column per field |
| **Plain text** | P1 | Paste-anywhere, minimal |
| **Collaborator brief** | P0 | The one-pager (§5.8), Markdown + DOCX |
| **Copy to clipboard** | P0 | Any individual section |
| **Import JSON** | P1 | Restore a previous export |
| **Import from Scrivener / notes dump** | P2 | The paste-and-parse path from §4.3 |

### 5.10 Save, share & account

| # | Feature | Priority | Detail |
|---|---|---|---|
| 10.1 | Local-first, no signup | P0 | The plan's page rule: *do not require an account before the visitor receives the first useful result* |
| 10.2 | Read-only share link | P1 | A shareable, non-editable view of the bible — the natural bridge from "I made this" to "someone else should see it" |
| 10.3 | Cloud save under an account | P1 | The honest use of signup: the project should survive a lost laptop |
| 10.4 | "Export to Nexet" | P1 | Deep-link the JSON into an Authors Den project as a seeded Story Bible — the strongest possible conversion, and the one that makes the tool part of the product rather than adjacent to it |
| 10.5 | Email me a copy | P2 | Only with explicit consent |

### 5.11 Deliberately out of scope

| Excluded | Why |
|---|---|
| Manuscript upload / analysis | MVP boundary. Breaks the honest-checker rule |
| Full plot, subplot and beat planning | Claimed by the outline tool and the Nexet Outline |
| AI-written characters | Violates "AI as bridge, not author" |
| Real-time multi-user editing | That is Nexet, not a free tool |
| Images, mood boards, uploads | Storage and moderation cost with no v1 payoff |
| Publishing, agent submission, query tooling | Different tool, different intent |
| World-graph visualisation of everything | Eats the build budget for a minority need |

---

## 6. Technical plan

### 6.1 Recommended stack

| Layer | Recommendation | Rationale |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | These are SEO-driven marketing pages first; server rendering and static generation are load-bearing. Also the conventional choice for a standalone tool repo |
| Styling | **Tailwind CSS**, with the Nexet design tokens | Consistency with the house |
| Components | **shadcn/ui** primitives for form, dialog, tabs, table | Accessible defaults without a heavyweight dependency |
| Validation | **Zod** | One schema, used for form validation, the JSON export contract and the checker |
| State | **Zustand** with a `localStorage` persist middleware | Small, predictable, survives refresh, no server required |
| Export — DOCX | **`docx`** | Maintained, browser-side, no server rendering |
| Export — PDF | **`@react-pdf/renderer`** | Component model rather than print-CSS guesswork |
| Export — MD / TXT / CSV | Hand-rolled serialisers over the Zod schema | Trivial, and keeps the format fully under control |
| Relationship graph | **Inline SVG**, `d3-force` optional | Small datasets; no need for a canvas engine |
| AI assist | A **server route** proxying a configurable provider | Matches the Story Oracle model — never call a provider from the browser with a key |
| Analytics | **Mixpanel**, with the plan's event names | Nexet already standardises on Mixpanel |
| Testing | **Vitest**, with **jsdom** for the store tests only | Handles TypeScript and the `@/*` alias with no extra config. jsdom is opted into per file, because creating a DOM environment costs more than the tests themselves |
| Hosting | **Vercel** | Matches Next.js; free tier is ample for a marketing tool |

> **Decision to confirm before build:** whether this tool ships as its own Next.js app (recommended, given this repo) or as a route inside the existing Nexet frontend. The JSON export contract in §6.3 is designed to make that choice reversible.

### 6.2 Routes

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Landing + the tool itself | Static shell, client tool |
| `/character-profile-template` | SEO landing for `character profile template` / `character sheet` | Static, links into the tool pre-set to Quick depth |
| `/story-bible-template` | SEO landing for `story bible template` | Static |
| `/examples` | Worked example bibles | Static |
| `/examples/[slug]` | A single example, loadable into the tool | Static |
| `/faq` | The FAQ block, standalone and indexable | Static |
| `/privacy` | Local-first storage, what is sent to a provider, and when | Static |

Deliberately **not** a client-rendered single page: the four SEO landings each need their own title, description, H1 and FAQ schema.

### 6.3 Data model

The export contract. Everything in the app — editor state, checker, exports, and the future Authors Den import — reads from this shape.

```ts
type ID = string;

interface Project {
  id: ID;
  meta: {
    title: string;
    author?: string;
    genre: GenreKey;            // drives the genre layer
    storyType: 'novel' | 'series' | 'novella' | 'screenplay';
    tone?: string;
    pov?: string;
    tense?: string;
    audience?: string;
    contentNotes?: string[];
    themes?: string[];
  };
  characters: Character[];
  relationships: Relationship[];
  locations: Location[];
  rules: Rule[];
  factions: Faction[];
  timelineEvents: TimelineEvent[];
  glossary: GlossaryEntry[];
  canonFacts: CanonFact[];       // the protected "do not change" list
  customFields: CustomFieldDef[];
  updatedAt: string;             // ISO
  schemaVersion: number;         // for forward-compatible imports
}

interface Character {
  id: ID;
  name: string;
  depth: 'quick' | 'standard' | 'deep';
  role: CharacterRole;
  importance: Importance;
  colorTag?: string;
  fields: Partial<Record<FieldKey, FieldValue>>;
  custom: Record<string, FieldValue>;   // keyed by CustomFieldDef.id
  openQuestions: string[];              // writer- or tool-generated
}

type FieldValue =
  | { kind: 'text';   value: string }
  | { kind: 'long';   value: string }
  | { kind: 'list';   value: string[] }
  | { kind: 'number'; value: number }
  | { kind: 'ref';    value: ID }        // → another Character / Location / Rule
  | { kind: 'ai';     value: string; suggestedBy: ProviderRef; accepted: boolean };

interface Relationship {
  id: ID;
  fromId: ID; toId: ID;
  type: RelationshipType;
  nature?: string;
  tension?: string;
  secret?: string;
  status?: 'open' | 'resolved' | 'broken';
  asymmetryNote?: string;   // used by the reciprocity check
}

interface Rule {
  id: ID; name: string;
  does: string;
  cost: string;            // required
  cannotDo: string;        // required — the field that prevents later rule-bending
  access?: string;
}

interface CanonFact {
  id: ID;
  statement: string;       // e.g. "Mara has never left the valley"
  scope: 'project' | 'character' | 'world';
  subjectId?: ID;
}
```

Rules that the model enforces:

- **One source per fact.** A relationship exists once and is rendered from both sides. Nothing is duplicated across characters.
- **`ai` values carry provenance.** A suggestion that was accepted keeps its provider reference — the same principle as the Story Oracle's failover disclosure.
- **`canonFacts` are a separate axis from `fields`.** Marking canon is an editorial act, not a data entry one, and it must survive any later edit to the field it came from.
- **`schemaVersion` from day one.** The Authors Den import is a stated P1 goal; a versioned file is the difference between that being easy and impossible.

### 6.4 The AI assist, scoped

| Property | Rule |
|---|---|
| Direction | Suggestions only. The writer accepts, edits or dismisses |
| Provenance | Every accepted suggestion records which provider answered |
| Disclosure | If a request fails over to a second provider, the UI says so — the Story Oracle's standard |
| Providers | Configurable server-side: Groq, OpenRouter, Ollama, LM Studio (the same set the Story Oracle routes across) |
| Context sent | Only the fields needed for the request, shown to the writer before sending. Never the project title or author name unless the field requires it |
| Fallback | With AI unavailable or disabled, the tool is fully functional. AI assist is an enhancement, never a dependency |
| Refusal | No request may generate a character wholesale. Field-level only |

### 6.5 Performance & accessibility targets

| Target | Value |
|---|---|
| Largest Contentful Paint | < 2.0s on a mid-range mobile connection |
| Tool interactive | < 2.5s |
| Works offline after first load | Yes — the tool is client-side |
| Keyboard | Every field, section, tab and action reachable |
| Screen reader | Labelled fields, `aria-live` on checker results and autosave status |
| Contrast | WCAG 2.1 AA |
| Autosave status | Always visible: *Saved locally · 12:04* |

---

## 7. Page structure & SEO

### 7.1 The page, following the plan's reusable pattern

| Order | Section | Content |
|---|---|---|
| 1 | **Search-matching title** | *Free Character Profile & Story Bible Starter* |
| 2 | **Immediate value statement** | *Build a consistent cast and a shared world in one sitting — then hand the whole context to a co-writer or editor.* |
| 3 | **Working tool** | Depth selector, cast, world, live bible. No signup |
| 4 | **Copy & export** | Markdown, DOCX, PDF, JSON, CSV, collaborator brief |
| 5 | **Contextual Nexet CTA** | The Rank 4 CTA (§8) |
| 6 | **Why this matters** | Protect the manuscript, invite a role, review a response |
| 7 | **Related tools** | Outline → collaboration brief → beta-reader pack → review checklist → Pitch Board |
| 8 | **FAQ** | §7.3 |
| 9 | **Final CTA** | Repeat after the workflow is understood |

### 7.2 Keyword targets to validate in Ahrefs

Per the plan's Step 3, the seed is the tool name plus task modifiers:

```text
character profile template        character sheet template
character profile generator       story bible template
character sheet                   novel story bible
fiction character generator       story bible for series
character profile maker           world bible template
```

Validation still follows the plan's process — **KD < 10, volume > 1,000**, inspect the SERP, then record the result in the tool table. Two standing exceptions apply, both favouring this tool: keep a candidate under 1,000 if the visitor is a serious writer (high fit), and keep the tool because it leads to a strong workflow rather than a generic answer.

The four landing routes (§6.2) each target one query family rather than one page chasing all of them.

### 7.3 FAQ block

Answer the questions the plan's Step 8 requires, plus the ones this tool uniquely invites:

- Do I need a Nexet account? *(No. It works in your browser and saves locally.)*
- Do I need to be online? *(Only for AI suggestions and sharing.)*
- What does the export include? *(All of it — see §5.9.)*
- Is my writing sent anywhere? *(Only the specific fields you confirm, and only when you ask for a suggestion.)*
- Will it write my characters for me? *(No. It structures what you decide, and asks questions you haven't answered yet.)*
- Does it check my whole manuscript for continuity errors? *(No — and it will never claim to. It checks the bible you entered, for gaps and structural conflicts.)*
- Can I use it for a series / screenplay / game? *(Yes — genre presets and a screenplay story type.)*
- Can a co-writer work from this? *(Yes — that is the point. Export the collaborator brief, or import the whole bible into a Nexet project.)*

---

## 8. CTA & funnel

### 8.1 The CTAs, exactly as specified

| Placement | CTA |
|---|---|
| **Primary, after the bible compiles** (plan §5.4) | *Keep this character and world context in a Nexet Story Bible, then invite a co-writer or editor to work from the same approved context.* |
| **Short form** (plan §9 library) | *Keep this character in the Story Bible, then invite a co-writer or editor to work from the same context.* |
| **After exporting the collaborator brief** | *This is the brief another writer answers. Publish it as a frozen seed on Nexet and let them work from the exact same ground.* |
| **After the continuity check flags gaps** | *Open an Editor or Beta Reader role on Nexet and get a decision on the questions this bible leaves open.* |
| **Final CTA, after "Why this matters"** | *Your Story Bible is the ground. Bring one more person onto it.* |

### 8.2 Destination deep links

The Authors Den exposes deep links the CTA should use, so a click lands on the right surface rather than a dashboard:

| Intent | Destination |
|---|---|
| Create the project and import the bible | New Authors Den project, `?import=bible` with the JSON payload offered |
| Invite a co-writer / editor | `?arena=1` (the Audition Arena) |
| Publish the context as a frozen brief | `?answer=<seedId>` flow, or a new seed prefilled from the collaborator brief |
| Browse open roles | `?arena=1&role=editor` |

The CTA sentence must be written **before the build is approved** — the plan's Step 7 is a hard gate, and the test is whether the sentence sounds natural when spoken.

### 8.3 Placement rules

- The primary CTA appears **after the writer has a compiled bible**, never above an empty tool.
- It never blocks an export. The file is theirs whether or not they click.
- One CTA per screen; the reader should never be choosing between two Nexet actions.
- The `nexet_cta_viewed` event fires on scroll-into-view, so impressions are measurable, not assumed.

---

## 9. Measurement

### 9.1 Events

Shared (plan §11):

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
```

Tool-specific, extending `author_bible_generated` from the plan:

```text
author_bible_started
author_character_added              { depth, role, source: manual | paste | example }
author_character_depth_changed      { from, to }
author_relationship_added           { type }
author_world_entity_added           { kind: location | rule | faction | glossary }
author_bible_generated              { characters, locations, rules, completeness }
author_bible_exported               { format }
author_brief_exported
author_continuity_check_run         { issues_found, by_type }
author_open_question_answered
author_ai_suggestion_requested      { provider }
author_ai_suggestion_accepted       { provider, fieldKey }
author_ai_suggestion_dismissed      { provider, fieldKey }
author_bible_imported               { schemaVersion }
author_seed_cta_clicked
author_editor_role_cta_clicked
```

### 9.2 Funnel

| Stage | Signal | Target |
|---|---|---|
| Visitor | `free_tool_page_view` | — |
| Activated | First character created | ≥ 35% of visitors |
| Producing | A character reaches `standard` depth + ≥ 1 location | ≥ 18% |
| Completed | Bible exported (`author_bible_generated`) | ≥ 10% |
| Converted | `nexet_cta_clicked` | ≥ 6% of completions |
| Activated in Nexet | Project created / role opened | ≥ 25% of clicks |
| Collaboration started | Seed published or audition received | — |

### 9.3 Decision rules (from the plan §11)

| Symptom | Diagnosis | Action |
|---|---|---|
| Traffic, no characters created | The tool looks heavier than it is | Lead with Quick depth; reduce the visible form |
| Characters created, few exported | Perceived value stops before assembly | Show the live bible earlier; surface the progress meter |
| High completion, low CTA clicks | The tool feels self-sufficient | Strengthen the collaborator-brief step so the "one more person" need is felt |
| CTA clicks, no Nexet activation | Destination friction | Simplify the import / role flow; test the deep links |
| Strong activation, low traffic | SEO or internal linking | Invest in the four landing routes and related-tool links |
| Low traffic, low activation | Wrong tool | Stop investing and redirect effort |

---

## 10. Build phases

### Phase A — Foundations (the schema is the product)

1. Project setup, genre presets, depth modes.
2. Zod schema + local persistence + autosave.
3. Cast CRUD, role taxonomy, colour tags.

**Exit criteria:** a writer can create a project, add five characters at mixed depths, refresh, and lose nothing.

### Phase B — The profile

4. The full field schema (§5.3), all three tiers, genre layers.
5. Field help and examples.
6. Custom key/value fields.
7. Cast table view, search, filter.

**Exit criteria:** a real writer completes a Deep profile without asking what a field means.

### Phase C — Relationships & world

8. Relationship builder + bidirectional rendering + text map.
9. Locations, rules & systems, factions, glossary, timeline.
10. Visual relationship map.

**Exit criteria:** two characters connected in the tool appear correctly on both profiles and in the map.

### Phase D — The bible

11. Compiled bible view + table of contents.
12. Continuity checker (missing fields, duplicates, glossary conflicts, unlinked characters).
13. Open questions.
14. Protected canon list.

**Exit criteria:** the checker finds every planted issue in a deliberately broken fixture bible, reports zero false positives on a clean one, and its copy never mentions the manuscript.

### Phase E — Output

15. Markdown, DOCX, PDF, JSON, CSV, plain text.
16. The collaborator brief.
17. Print stylesheet.

**Exit criteria:** a DOCX bible opens cleanly in Word and Google Docs; the JSON round-trips without loss.

### Phase F — Conversion

18. CTA placement, deep links, `nexet_cta_viewed`.
19. Analytics wiring at every event in §9.1.
20. Read-only share link; account cloud save; export-to-Nexet.
21. The four SEO landing routes and the FAQ.

**Exit criteria:** every funnel stage in §9.2 is measurable end-to-end.

### Phase G — Polish

22. Accessibility pass, performance pass, mobile pass.
23. AI assist with provenance disclosure.
24. Example projects gallery.

---

## 11. QA & acceptance criteria

### 11.1 Functional acceptance

| # | Criterion |
|---|---|
| 1 | A visitor completes a Quick character, exports a bible, and never sees a signup wall |
| 2 | Reloading mid-session loses nothing |
| 3 | Changing depth up preserves every value; changing down hides without deleting |
| 4 | A relationship added on either character appears on both |
| 5 | Every export format opens in its target application without repair |
| 6 | The JSON export re-imports to an identical project |
| 7 | The checker finds all planted issues in the broken fixture and none in the clean fixture |
| 8 | Checker copy never claims manuscript analysis |
| 9 | Every AI suggestion is labelled, rejectable, and absent when AI is disabled |
| 10 | The CTA is unreachable before a bible exists, and never blocks an export |
| 11 | Every analytics event in §9.1 fires with the documented properties |

### 11.2 Test fixtures

- **`clean-minimal`** — one Quick character, no relationships. Expect zero checker findings.
- **`broken-messy`** — duplicate names, an orphan character, a misspelled glossary term, an impossible age, a one-sided relationship, a missing core fear. Expect one finding per planted issue, no more.
- **`deep-full`** — a fully populated fantasy project. Expect a clean export in all six formats.
- **`legacy-v0`** — an export from an earlier `schemaVersion`, to prove forward compatibility.

Implemented in `src/test/fixtures.ts`. Every fixture round-trips through `projectSchema` today, `broken-messy` carries a machine-readable manifest of the findings it *expects*, and `legacy-v0` proves a version-0 payload still parses and is defaulted rather than rejected. The checker and export assertions are marked `todo` until Phases D and E land; everything structural is asserted now, which is what keeps the fixtures honest in the meantime.

Building the fixtures surfaced two rules that contradicted the spec as written. Both are fixed above (§5.4.5 and §5.4.6) and flagged in the fixture file:

| Contradiction | Resolution |
|---|---|
| §5.4.5 flags any character with no relationships, but `clean-minimal` is a single character and expects zero findings. | The warning is scoped to casts of two or more. |
| §5.4.1 makes a relationship one bidirectional row, while §5.4.6 described a one-sided relationship as a missing reverse entry, which that model cannot represent. | A one-sided relationship is the `asymmetryNote` field, surfaced as an open question rather than an error. |

### 11.3 Non-functional acceptance

| Area | Standard |
|---|---|
| Performance | §6.5 targets met on a throttled mid-range mobile profile |
| Accessibility | Keyboard-only completion of a Quick character; screen-reader pass on the checker |
| Privacy | No field content leaves the device without an explicit, per-request confirmation |
| Copy | No sentence anywhere claims to write characters or check a manuscript |

---

## 12. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Completion dies in a 90-field form | High | High | Depth modes; Quick default; progress meter; help text on every field |
| The tool is mistaken for an AI character generator | Medium | High | Positioning copy, no bulk generation, AI strictly field-level and labelled |
| Crowded keyword space (Reedsy, Campfire) | High | Medium | Do not compete on template depth. Compete on free + exportable + handoff-shaped |
| Reedsy/Campfire are already excellent | High | Medium | Accept it. The wedge is the artifact that leaves the walled product and lands on shared ground |
| Checker erodes trust with a false positive | Medium | High | Deterministic rules only; every finding cites the exact field; a "why am I seeing this" link |
| The CTA feels bolted on | Medium | High | The collaborator brief *is* the CTA's premise — the output and the invitation are the same object |
| Export quality judged as the product | Medium | Medium | Treat DOCX/PDF fidelity as a launch gate (Phase E exit criteria) |
| Storage loss in `localStorage` | Medium | Medium | Autosave, JSON export, resume banner, and a plain "download a backup" nudge |
| Scope creeps into plot planning | Medium | Medium | §5.11 is a contract, not a suggestion |

---

## 13. Open questions

| # | Question | Needs |
|---|---|---|
| 1 | Standalone Next.js app, or a route in the existing Nexet frontend? | Product decision. The JSON contract makes it reversible |
| 2 | Does the read-only share link land before the Nexet CTA, or after? | A/B decision in Phase F |
| 3 | Which AI providers are enabled by default for a logged-out visitor, and what is the cost ceiling? | Infrastructure decision |
| 4 | Does "export to Nexet" ship in Phase F, or wait for the Authors Den import endpoint? | Depends on the main app's roadmap |
| 5 | Is the example project the plan's Mara Vale mystery, or a genre-neutral one? | Copy decision; the plan already provides the Mara example |
| 6 | Do the four SEO landings ship as separate routes or as one page with anchored sections? | SEO decision after Ahrefs validation |

---

## 14. Appendix

### 14.1 Worked output — the plan's example, reproduced

The tool must be able to produce exactly this, from the fields in §5.3:

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

Every line maps to a specified field: External goal → §5.3 C, Internal conflict → C, Core fear → C, Relationships → F, Arc → E, Continuity questions → G, Collaborator note → G (canon).

### 14.2 Mapping to the Authors Den

| This tool | Nexet Authors Den |
|---|---|
| Project meta | Project: title, author, template, premise, summary |
| Characters + schema | Characters: role, POV, importance, colour, description, notes, custom key/value |
| Locations, rules, factions, glossary | World: places, institutions, world items, the story-specific layer |
| Timeline, themes | Story Bible structure |
| Protected canon + open questions | The frozen brief a seed is published from |
| Collaborator brief | The brief a respondent answers on the Pitch Board |
| Relationship map | The context a shared project carries |
| JSON export | The import payload for a new Authors Den project |

The tool is a **pre-Nexet version of the Story Bible**. A writer who fills it in has, without signing up, already produced the exact artifact the Authors Den stores — which is what makes "export to Nexet" a continuation rather than a pitch.

### 14.3 Related tools (internal link chain)

```text
Outline & beat sheet → Collaboration brief → Character profile & story bible
   → Beta-reader feedback pack → Scene critique checklist → Pitch Board
```

Each link targets the *next* need, not the same one twice.

### 14.4 Glossary

| Term | Meaning |
|---|---|
| **Depth mode** | Quick / Standard / Deep — how much of the schema a character is asked for |
| **Genre layer** | Extra genre-specific fields toggled by the preset |
| **Protected canon** | Facts the writer marks as unchangeable; exported as the do-not-change block |
| **Collaborator brief** | The one-page context handoff — the same shape as a frozen brief |
| **Open question** | A gap surfaced as a question for the writer, never as an assertion |
| **Checker** | The deterministic continuity pass over the entered bible |
| **Bible** | The compiled Story Bible document |
| **Round-trip** | Export to JSON and re-import without loss |

---

*Specification complete. Build begins at Phase A. The CTA sentence in §8.1 must be signed off before Phase A starts (plan §7, Step 7).*
