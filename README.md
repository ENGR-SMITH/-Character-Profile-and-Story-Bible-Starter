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
- The full character field catalog with per-field help
- Local-first storage with debounced autosave and a saved indicator

Everything is client-side. There is no account, no server round-trip and no
upload: the project lives in `localStorage` and survives a refresh.

**Still to come** (see `DEVELOPMENT.md` §10): the relationship and world editors,
the compiled bible view, the continuity checker, the export formats, the AI
assist and the Nexet CTA.

## Tests

```bash
npm test
```

Vitest. jsdom is opted into per file — only the two store test files need a
real `localStorage`, and creating a DOM environment costs more than the rest of
the suite put together.

| Area | What is covered |
|---|---|
| `fields.test.ts` | Depth counts, tier nesting, layer switching, catalog integrity |
| `taxonomy.test.ts` | Every vocabulary value has metadata; presets only use real layers |
| `schema.test.ts` | Factories, validation, and the field value helpers the editor relies on |
| `store.test.ts` | Cast CRUD, depth changes, deep-copy on duplicate, debounced writes |
| `store.reload.test.ts` | A genuine reload: fresh module, same storage, nothing lost |
| `fixtures.test.ts` | Each §11.2 fixture is structurally what it claims to be |

`src/test/fixtures.ts` holds the four named fixtures from `DEVELOPMENT.md`
§11.2. Each declares what it should contain, and `broken-messy` declares its
own **planted issues**, so the Phase D continuity checker can be tested by
asserting it finds exactly those and nothing else. The checker and export
assertions are `todo` until those phases land.

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
    CastList.tsx       the cast, with add / duplicate / remove
    CharacterEditor.tsx depth-aware profile editor
    ui.tsx             shared primitives
  lib/
    taxonomy.ts        roles, importance, depth, genres, colours
    fields.ts          the character field catalog and its depth tiers
    schema.ts          the Zod data contract
    store.ts           zustand store, local persistence, cast CRUD
    useMediaQuery.ts   media-query hook, built on useSyncExternalStore
    utils.ts           small shared helpers
  test/
    fixtures.ts        the four named fixtures from DEVELOPMENT.md §11.2
    *.test.ts          unit tests
vitest.config.mts      test runner config
```

## Data contract

`src/lib/schema.ts` is the single source of truth for the persisted shape —
`Project`, `Character`, `Relationship`, `Location`, `Rule`, `CanonFact` and the
rest, from `DEVELOPMENT.md` §6.3. It carries a `schemaVersion` so the JSON
export can later be imported into an Authors Den project without guessing.

The `fields` map stores values keyed by the field catalog, so **lowering a
character's depth only hides fields — it never deletes an answer.** Raising the
depth again brings the value straight back.
