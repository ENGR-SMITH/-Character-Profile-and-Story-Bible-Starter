# Character Profile & Story Bible Starter

A free tool from the **Nexet Authors Den** free-tools program (candidate #4).

> Build a consistent cast and a shared world in one sitting — then hand the whole
> context to a co-writer, editor or beta reader without handing over your
> manuscript.

A writer arrives with scattered notes and leaves with a **structured Story
Bible**: character profiles at the depth they choose, relationships, a world
starter and the continuity questions the bible still leaves open.

It is deliberately **not** a character generator. The tool structures what the
writer decides and asks the questions they have not answered yet. It never
invents a character, and it never claims to check a manuscript.

## Documentation

| Document | What it covers |
|---|---|
| [`DEVELOPMENT.md`](./DEVELOPMENT.md) | The development plan: feature spec, field schema, data model, SEO, CTA, analytics, phases, QA |
| [`ABOUT-NEXET (1).md`](./ABOUT-NEXET%20(1).md) | The main Nexet product this tool markets |
| [`nexet-free-tools-research-and-build-planFINALL_BUILD.md`](./nexet-free-tools-research-and-build-planFINALL_BUILD.md) | The free-tools program and this tool's ranking |

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Run the unit tests in watch mode |

## What is built

**Phase A — foundations.** The schema, persistence and cast management:

- Project setup, genre presets and their extra field layers
- Three depth modes — Quick 13 / Standard 38 / Deep 56 fields — set per character
- Character CRUD: add, edit, duplicate, remove
- Role and importance taxonomy, cast colour tags, per-character completion
- Local-first storage with debounced autosave and a saved indicator

**Phase B — the profile.** The catalog is now the whole contract:

- The full character field catalog with per-field help and examples
- Custom key/value fields — defined once for the project, answered per character
- Cast search across names and every stored answer
- Role and importance filters, applied to both views
- A cast table: one row per character, one column per key field

**Phase C — relationships & world.** All three steps of §10:

- A relationship builder on the profile: type, one-line nature, tension, secret,
  status, and the POV difference when the two sides read it unevenly
- One bidirectional row per relationship, so it appears on both profiles and is
  never stored twice
- A text relationship map, grouped by type, shown from the workspace and copyable
  — the block the compiled bible will export
- A visual relationship map: an inline SVG graph, characters as boxes bordered by
  their cast colour, edges coloured by relationship type, with a legend. Drag a
  box — or focus it and use the arrow keys — to arrange it; the arrangement is a
  view preference, kept out of the export contract
- A hover card on each box with the character's role, importance, depth and
  completion, shown on focus too — and the same summary in the box's label, so a
  screen reader never needs the card
- A **World** work area beside the cast: setting, era, technology level and how
  the world differs from the reader's; locations with type, significance, who is
  usually there and one sensory detail; rules and systems with **what it costs**
  and **what it cannot do**; factions with their members; a timeline of ordered
  events with the characters present at each; and a glossary of invented terms
  with the aliases that are also correct spellings
- A rule that leaves its cost or its limit blank is badged as still missing one,
  from the same `rulesWithGaps` the continuity checker will read

**Phase D — the bible, the check and the canon.** Steps 11–14 of §10, so the
phase is complete:

- A live **Story Bible** view in its own work area, compiled from the project on
  every render — there is no second copy to fall out of date
- §5.7.3's ten sections in its order, each numbered as the spec numbers it even
  when a section is empty and left out, so "Cast overview" is section 3 in every
  bible
- A **table of contents** derived from the document it links into, with a jump
  link per character — an anchor cannot dangle because it is read off the same
  document
- Profiles print only the fields each character's own depth asks for, and say so
  when a lowered depth is hiding answers instead of dropping them
- Copy as Markdown, which is also the base the Phase E serialisers will build on

And the checker:

- A deterministic continuity check in its own **Check** work area: unanswered
  Quick fields, duplicate and near-duplicate names, unlinked characters,
  glossary spellings that disagree, an age the timeline contradicts, and rules
  still missing a cost or a limit
- Every finding carries a **severity**: a *gap* is something the bible owes the
  story, an *opportunity* is depth the character's own depth has room for, and a
  *question* is a decision only the writer can make — which is how an uneven
  relationship is reported, per §5.4.6
- A coverage meter over what each character's own depth asks for, and findings
  that link back to the profile they are about
- **Generated open questions**: a per-field question bank asks about the answers
  a profile is still missing, Quick fields first, capped at five so it stays a
  prompt rather than a questionnaire. Each one is a *question*, held to that by a
  test over the whole bank — and generated questions are derived, never stored,
  so they cannot go stale. Keeping one stores it on the profile, which is how it
  reaches the bible's open-questions section
- A **protected canon list** (§5.6.7): facts marked do-not-change, scoped to the
  project, the world or one character. A protected fact stores its own wording —
  marking canon is an editorial act, not another field — so it survives any later
  edit to the answer it came from, and outlives the character it names. The list
  compiles into the top of the bible, ahead of everything else
- Copy says what the checker read, and nothing more: it never claims to have
  read the manuscript, and a test holds the copy to that

**Phase E — output.** Steps 15–17 of §10:

- **Markdown** — the compiled bible as it stands, with the do-not-change block
  first and an export timestamp so a stale file is detectable
- **Plain text** — the same bible with Markdown's heading markers and emphasis
  stripped, for a notes app, a wiki box or an email: paste-anywhere, minimal
- **JSON** — the round-trip format, written *through* the schema so the file is
  the contract, with a byte-for-byte re-import (§11.1's promise, tested on all
  three project fixtures)
- **CSV** — the cast table: one row per character, one column per field of the
  catalog plus your custom fields, RFC 4180 quoting and a BOM so a spreadsheet
  reads accented names correctly
- **DOCX** — real Word headings, real bullet lists, a page break per section
- **PDF** — an A4 document rendered by `@react-pdf/renderer`
- **Print** — a print stylesheet for the live bible: the toolbar, the export
  buttons and the live badge are dropped, every section starts a page (as the
  Word export's do) and a profile is kept from splitting across two, on 18mm
  margins. Printing from a dark-mode browser prints ink on paper, not white on
  white
- **The collaborator brief** (§5.8) — one page of context for a second person:
  the project facts, the protected canon, one line per character, the rules that
  cannot be broken and what is still open. It has its own **Brief** work area,
  beside the bible, so it can be read before it is handed over — and copied,
  downloaded as Markdown or downloaded as Word from there. It is the *same
  compiled document* as the bible with its own label, drawn by the same block
  renderer, so the two can never disagree
- **Import** — read a JSON export back, replacing the project only after saying
  whose file it is and what it would replace

`docx` and `@react-pdf/renderer` are the two libraries `DEVELOPMENT.md` §6.1
names. Both are imported when a writer presses the button, so neither is in the
page's initial bundle.

The brief follows §8.1's three rules rather than its own:

- **One page.** Each list is clipped to what fits and counts what it left out
  ("+ 3 more characters in the full bible") instead of quietly stopping, and its
  Word file starts no section on a new page, where the bible's starts every one
- **A suggestion, not a verdict.** §8.3's role — co-writer, editor, beta reader,
  proofreader — is read off the state of the ground (no cast, thin profiles,
  questions still open, settled ground), it says *why* it points that way, and
  the document ends by handing the choice back to the writer. The panel shows
  the same suggestion, since one nobody reads until they export is not much of
  a suggestion
- **Share the context, not the manuscript.** §8.5's line is the document's own
  disclosure and travels with every copy of it, because the fear a writer has
  about sharing work is never about the context

Everything is client-side. There is no account, no server round-trip and no
upload: the project lives in `localStorage` and survives a refresh.

**Still to come** (see `DEVELOPMENT.md` §10): the CTA, the analytics events, the
share link and the SEO landing routes (Phase F); and the accessibility pass with
the AI assist (Phase G).

## Tests

```bash
npm test
```

Vitest. jsdom is opted into per file: the two store tests need a real
`localStorage`, `export-files.test.ts` needs a DOM for Word and PDF, and
`views.test.ts` mounts the two document views. Everything else runs in node,
because creating a DOM environment costs more than those tests do.

| Area | What is covered |
|---|---|
| `fields.test.ts` | Depth counts, tier nesting, layer switching, catalog integrity |
| `taxonomy.test.ts` | Every vocabulary value has metadata; presets only use real layers |
| `schema.test.ts` | Factories, validation, and the field value helpers the editor relies on |
| `store.test.ts` | Cast, custom-field and relationship CRUD; depth changes; debounced writes |
| `store.reload.test.ts` | A genuine reload: fresh module, same storage, nothing lost |
| `fixtures.test.ts` | Each §11.2 fixture is structurally what it claims to be |
| `relationships.test.ts` | Both-sides lookup, dangling references, and the grouped text map |
| `graph.test.ts` | Node layout, parallel-edge bows, edge colours, the legend's type order |
| `world.test.ts` | Timeline ordering and moves, rule gaps, faction membership, glossary spellings |
| `store.world.test.ts` | World CRUD: patch semantics, membership toggles, detaching a deleted character |
| `checker.test.ts` | Each continuity rule, including the cases that must stay silent; the copy rule |
| `bible.test.ts` | Section order and numbering, contents anchors, what each section prints |
| `questions.test.ts` | The question bank's coverage, and that every prompt asks rather than asserts |
| `export.test.ts` | Filenames, the Markdown and plain-text block order, CSV quoting and a real CSV parse, the JSON round trip |
| `export-files.test.ts` | A packaged .docx (zip, with `word/document.xml`), the brief's page-break-free one, a real %PDF, and every fixture through every writer |
| `brief.test.ts` | The brief's five things and their order, one-liners, rule gaps, the role ladder, the privacy line |
| `views.test.ts` | The bible, the brief, the cast, the world and the export panel mounted for real: one block renderer for both documents, the emphasis the files carry, every `InfoHint` wired to words that exist, empty states |

`src/test/fixtures.ts` holds the four named fixtures from `DEVELOPMENT.md`
§11.2. Each declares what it should contain, and `broken-messy` declares its
own **planted issues**. The checker is now held to that manifest: it reports
exactly one finding per planted issue and nothing besides, on a fixture whose
six issues were written down before the checker existed. `clean-minimal`
reports zero findings, which is the half of the exit criterion a clean bible
proves, and `deep-full` reads as clean but for the one relationship its writer
deliberately left uneven. The export assertions queued for Phase E now run:
`export-files.test.ts` puts all four fixtures through all six formats and the
JSON round trip, so an empty world, a deliberately broken project and a payload
from before the current schema all still come out.

## Layout

```
src/
  app/
    globals.css        design tokens, mapped to Tailwind utilities
    layout.tsx         metadata and fonts
    page.tsx           server-rendered page shell
  components/
    ToolRoot.tsx       hydration gate: loading → setup → workspace
    ProjectSetup.tsx   project facts and genre preset
    Workspace.tsx      two-pane shell, autosave indicator, reset
    CastList.tsx       the cast: add / duplicate / remove, search, filter, table view
    CharacterEditor.tsx depth-aware profile editor, relationships, custom fields
    RelationshipGraph.tsx the draggable SVG relationship map
    WorldEditor.tsx    the world work area: setting, locations, rules, factions,
                       timeline and glossary
    ExportPanel.tsx    copy, export, the collaborator brief and the JSON round trip
    BiblePdf.tsx       the bible as an @react-pdf document
    ContinuityPanel.tsx the continuity findings, questions and copy
    CanonList.tsx      the protected do-not-change canon list
    BibleView.tsx      the compiled Story Bible and its table of contents
    BriefView.tsx      the collaborator brief on screen, with its copy / download
    DocumentBlocks.tsx the one renderer for a compiled document's blocks, shared
                       by the bible and the brief
    ui.tsx             shared primitives
  lib/
    taxonomy.ts        roles, importance, depth, genres, colours, relationship types
    fields.ts          the character field catalog and its depth tiers
    schema.ts          the Zod data contract
    checker.ts         the continuity rules and the report they produce
    questions.ts       the per-field question bank and the prompts it generates
    bible.ts           the compiled bible document, its contents and its text
    brief.ts           the collaborator brief compiled from the same document,
                       and the role it suggests (§8.1, §8.3)
    export/            the writers: markdown, text, json, csv, docx, pdf, downloads
    relationships.ts   per-character lookup and the grouped text relationship map
    graph.ts           the graph's layout maths: nodes, typed edges, colours, legend
    world.ts           timeline ordering, rule gaps, faction members, glossary terms
    graphPositions.ts  dragged node positions, an external store over localStorage
    store.ts           zustand store, local persistence, cast and relationship CRUD
    useMediaQuery.ts   media-query hook, built on useSyncExternalStore
    utils.ts           small shared helpers
  test/
    fixtures.ts        the four named fixtures from DEVELOPMENT.md §11.2
    *.test.ts          unit tests
vitest.config.mts      test runner config
```

## Section explanations

Every section's one-line explanation lives behind a small **i** beside its heading
(`InfoHint` in `ui.tsx`) instead of sitting under it as a paragraph: shown on
hover and on keyboard focus, wired to the icon with `aria-describedby` so a
screen reader is told what the section is without anyone hovering, and hidden
from print.

What stays visible is what is not an explanation of a section:

- **Disclosures.** §8.5's share-the-context line in the brief, the bible's "no
  manuscript was read" line, and the checker's "this reads the answers and
  nothing else" line. These are promises the tool makes, and a promise behind a
  hover is a weaker promise
- **Status and counts.** "3 characters in the cast", "12 world entries", "Not in
  this bible yet: …"
- **Empty-state prompts**, which are the only text in a section with nothing in it
- **Per-field help** under each input, which is what Phase B's exit criterion
  turns on ("a real writer completes a Deep profile without asking what a field
  means")

The `views.test.ts` suite holds the wiring: every icon points at a tooltip that
exists, the tooltip carries the words, and the heading is still a heading.
Whether it *looks* right on hover is a person's check — no test here has seen a
browser.

## Exports

`src/lib/export/` holds one writer per format, all reading the same compiled
`BibleDocument` the on-screen bible renders — so a file cannot say something the
view does not. The collaborator brief (§8.4) is written by the same Markdown and
Word writers, because §8.2 makes it the same kind of object; only its label, its
closing lists and its page breaks differ, and `bibleDocxChildren` is what both
files share. The on-screen views are drawn by one block renderer too, down to
the inline `**bold**` — the same `inlineRuns` the Word writer splits with, so the
writer sees the emphasis the files carry rather than the markers. Three
deliberate choices are worth knowing:

- **JSON is written through the schema**, not straight from memory, so defaults
  live in the file rather than in the reader, and a project holding a value the
  schema rejects fails at export instead of producing a file nobody can read.
- **DOCX and PDF load their library on demand.** Both packages are large, and
  nothing downloads them until the button is pressed. The DOCX writer builds
  from the document's blocks rather than from its Markdown, which is what gives
  the file real Word headings and bullet lists.
- **Plain text drops the Markdown, not the structure.** Markdown's `**` and its
  heading markers are removed on the way out, because the file's destination is
  a notes app where they would have to be cleaned up by hand. Hierarchy is
  carried by layout instead: a numbered section line, an uppercased tool-authored
  subheading, `Label: value` facts, and the writer's own words left exactly as
  they are.

What the tests can honestly check is that a real file is produced — a zip whose
`word/document.xml` is present, a buffer starting `%PDF-` and ending `%%EOF`, and
plain text with no Markdown left in it. §10's exit criterion, *"a DOCX bible opens
cleanly in Word and Google Docs"*, is a person's check; so is whether a printed
bible paginates well. Nothing here pretends otherwise.

The CSV field values are written as they stand, so a scenario where someone else
authored the project you import and you then open the CSV in a spreadsheet is not
guarded against formula injection. Worth fixing if the tool ever ships a shared
bible.

## Data contract

`src/lib/schema.ts` is the single source of truth for the persisted shape —
`Project`, `Character`, `Relationship`, `Location`, `Rule`, `CanonFact` and the
rest, from `DEVELOPMENT.md` §6.3. It carries a `schemaVersion` so the JSON
export can later be imported into an Authors Den project without guessing.

Custom fields split the definition from the answer, as `§5.2 2.6` requires: the
`CustomFieldDef` lives on the project, and each character's answer lives in its
own `custom` map keyed by that id. Removing a definition removes the answers it
gathered, because a value with no definition no longer means anything.

A project persisted by an earlier build is missing whatever the schema has gained
since — `world` most recently. Hydration re-parses the stored project through
`projectSchema`, so those fields arrive as defaults and an older local project
keeps opening instead of reaching a component that expects a field it has never
heard of.

Relationship graph positions are deliberately **not** in this shape. §6.3 has no
coordinates, so a dragged arrangement is a view preference: it lives in
`localStorage` under its own key (`src/lib/graphPositions.ts`) rather than in the
project, and can never leak into a JSON export or an Authors Den import.

The `fields` map stores values keyed by the field catalog, so **lowering a
character's depth only hides fields — it never deletes an answer.** Raising the
depth again brings the value straight back.
