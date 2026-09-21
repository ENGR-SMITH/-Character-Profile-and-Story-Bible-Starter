# About Nexet

> **Post what you started. Finish it with someone else.**
>
> Nexet is a creative collaboration platform where unfinished work finds the
> person who can finish it with you — and where every pass keeps the name of the
> person who made it.

This document explains what Nexet is, what problem it exists to solve for people
in real fields and careers, the vision behind it, **how it unites collaborators
from different backgrounds and foundations on common ground**, and every feature
built into the platform and its dens today.

---

## 1. The one paragraph

Nexet is a **house of rooms**, and each room is a **den** built for one craft.
One person posts a piece of work they have started — a manuscript scene, a rough
video cut — along with a short brief. Another person answers with their own
version of it. The two then work together on a **shared, versioned record**
where every contribution is attributed, reviewable, and reversible. The
original creator always has the final say on what gets merged into their work.
Nothing of yours goes on the record before you decide it should, and no synthetic
substitute ever stands in for a person.

The platform is deliberately built around one insight: **the diffable artifact is
the work, not the file.** Nexet tracks the *structure* of a creative project —
scenes, timelines, roles, versions — the way a code host tracks source, and
treats the raw media as large-file storage attached to it.

---

## 2. "Two desks, one record" — how Nexet is different

Most collaboration tools fall into one of two failures:

- **Single-player tools** (a writing app, a desktop video editor) are excellent
  for one person and collapse the moment a second person needs in.
- **Shared-document tools** (a shared doc, a chat thread) let everyone edit at
  once but destroy the record — nobody can tell who wrote what, work-in-progress
  leaks into the document, and there is no review step before a change becomes
  final.

Nexet is built on three principles that avoid both:

| Principle | What it means in the product |
|---|---|
| **Work on your own desk** | Your draft stays yours until you send it. Work-in-progress never goes on the shared record early. |
| **AI as bridge** | The system holds context, finds the join between two people's work, and protects the provenance of every contribution. AI advises; it never replaces or impersonates a person. |
| **Review, then merge** | The other person reads your work beside the version before it and leaves notes. Approving merges it in — with your name still on it. Nobody can silently overwrite you. |

This is modelled openly on how **fork + pull request** works on GitHub:

- **Fork** → answering someone's post makes you a private clone of their work.
- **Pull request** → submitting your version sends it to their review desk.
- **Review** → they read it beside the previous version, with notes.
- **Merge** → approving it merges your work into their project. Rejecting it
  leaves their original untouched.

---

## 3. The problem — what people in real fields and careers are up against

Creative and professional work stalls in the same places regardless of the craft.
Nexet was built after studying six recurring failures.

### 3.1 The solo trap

| Field / career | The problem in practice |
|---|---|
| **Novelists & writers** | Manuscripts die in the drawer. A writer needs an editor, a beta reader, a co-author, or a second pair of eyes — but has no neutral place to find one, no way to show work safely, and no way to try a collaboration without handing over their whole manuscript. |
| **Video creators & editors** | Collaboration is `final_v3_FINAL_actual.mp4` in a chat thread. Files are gigabytes, so they move by USB stick or a broken link. Feedback is scattered across DMs, timestamps in a group chat, and "can you re-send?". No audit trail, no version history, no attribution. |
| **Musicians, DJs & vocalists** | Two people write toward the same song and never meet in the middle. Stems and sessions go back and forth with no version record, and the writing credit gets fuzzy fast. |
| **Visual artists & designers** | Two visual languages need to meet on one canvas, but all the collaboration happens over screenshots and comments on exports. The file history lives on one person's laptop. |
| **Analysts, traders & strategists** | The edge is often in the second opinion — the pattern someone else notices before the chart explains it. Today that means a private chat that leaves no record of the reasoning. |
| **Architects & builders** | Spatial work is worked out in one head or one document. A brief cannot hold the options, and there is no clean way to review two proposals against the same constraints. |
| **Educators & students** | Learning-by-contributing is the strongest form of learning, but classroom tools reward one submitted answer from one person, not a body of work assembled between people. |
| **Therapists, counsellors & anyone in grief work** | Some work cannot be done alone and cannot be done out loud in public. Existing tools are either too public or too clinical to hold witness and reflection. |

### 3.2 The problems all six share

1. **Starting is easy; finishing is lonely.** The hard part of creative work is
   the last 40% — and it usually needs another person.
2. **Matching is arbitrary.** People find collaborators by luck, geography, or
   who happens to be in the group chat.
3. **Collaboration destroys the record.** Shared tools let a change happen
   without anyone knowing who made it or what it replaced.
4. **Work-in-progress leaks.** To get help you must expose unfinished, fragile
   work — often all of it.
5. **Credit is lost.** By the time a piece is finished, the second, third and
   fourth hands (the editor, the beta reader, the sound designer) are invisible.
6. **Handoffs are blind.** Reviewer, editor and creator are never looking at the
   same locked version, so feedback refers to work that has already changed
   underneath it.

### 3.3 The career-level stake

For a professional, these are not conveniences — they are the difference between
a career that compounds and one that stalls:

- **A portfolio you can point at.** Every accepted collaboration becomes public
  proof of work on a real project, with a role attached.
- **Reputation that survives the project.** Attribution is structural, not a
  favour someone remembers to give you.
- **Access to work you would never be invited to.** The pitch board and the
  Audition Arena let anyone with the skill answer an open call from someone
  they have never met.
- **A professional handoff record.** Commit messages, review notes and version
  timelines are the difference between "professional" and "we'll sort it out in
  person".

---

## 4. The vision

**Every room starts with two.**

Nexet is not a single product for a single profession. It is a **house** of
dens, each one a full studio for one craft, all standing on the same engine:

```
        THE ENGINE  —  post a call → match → work privately → review → merge
                        (attribution and provenance kept at every step)

        ┌──────────────┬──────────────────┬─────────────────┐
        │  Authors Den │   Creators Den   │  the rest of    │
        │   (writers)  │  (video makers)  │  the house      │
        └──────────────┴──────────────────┴─────────────────┘
```

The vision, in order:

1. **One engine, many rooms.** The same collaboration protocol — open call,
   private fork, review, merge with attribution — is reused for every craft.
   A new den is a new *vocabulary of roles*, not a new platform.
2. **AI as bridge, not author.** AI holds context between two people, finds the
   join between their work, and protects provenance. There is no synthetic
   substitute for a person, and the specific route an idea took to arrive is
   never erased.
3. **A career is what you can show.** Collaborations become public portfolio
   entries and reviews. The platform is a place where you earn a record, not
   just produce files.
4. **Open calls beat closed circles.** Discovery is a board, not a network
   referral. Anyone can pitch; anyone can answer.
5. **The house grows by room.** Writers and video makers are open today.
   Singers, DJs, artists, storytellers — and the professional and human rooms
   beyond them — are already on the blueprint.

The closing line on the front page is the whole thesis:

> *Nexet keeps a clear line back to every hand in the room. No synthetic
> substitute for a person. No erasing the strange, specific route an idea took
> to arrive.*

---

## 5. One field, many foundations — uniting people from different backgrounds

A collaboration rarely fails because two people disagree. It fails because they
never stood on the same ground: they use different tools, different words,
different definitions of "done" — and there is no single thing they can both
point at. Nexet's answer is not to make people more alike. It is to give
**everyone, whatever trade or foundation they arrive from, one common ground to
stand on.**

### 5.1 The five things that become common ground

| Common ground | What everyone shares, regardless of craft |
|---|---|
| **One artifact** | A frozen snapshot — a seed, a frozen brief, a timeline version. It cannot move under the people answering it, so both sides are provably talking about the same thing. |
| **One vocabulary of roles** | Roles name the contribution without requiring anyone's background — **Co-writer, Editor, Beta reader, Ghostwriter, Proofreader** for writing; **Story Architect, Visual Editor, Sound Designer, Motion & Color** for video. |
| **One lifecycle** | Post the call → work on your own desk → send it for review → review, then merge. The same four steps in every den — the protocol described in-product as *"the house beneath the house."* |
| **One record** | Provenance: names kept on every pass, genealogy and activity trails, version timelines. |
| **One field** | The house itself. Dens are rooms in a single place, not separate products in separate silos, so people from different practices keep meeting. |

### 5.2 The frozen artifact is the ground

The reason Nexet can unite strangers is that it removes the thing that usually
requires prior trust: a shared reference.

- The **frozen brief** is published at the moment of the call and cannot be
  edited afterwards, so a respondent answers the exact shape the creator is
  protecting.
- A **timeline version** is the same idea for video — a commit against the last
  approved cut.
- Because both people address an immutable object, they do not need to share a
  history, a taste, or a vocabulary. They need only to answer the same thing.

This is why a writer and an editor who have never met can collaborate in an
afternoon: **the artifact carries the context.**

### 5.3 Meet people in their own tools

You do not unite people by forcing one practice into another's software. Nexet
adapts at the edges so the shared record in the middle can stay universal.

- **Video stays external-first.** The den never asks a professional editor to
  abandon Premiere, Resolve, Pro Tools, Avid or After Effects. Hand-offs use the
  **industry-standard file round-trip** (EDL / AAF / FCPXML / OTIO) — the way
  post houses already hand work between exactly those tools.
- **Writing exports into a writer's world** — Word, PDF, EPUB, Final Draft,
  Markdown, OpenDocument and more.
- **First-party plugins** meet other crafts on their own canvas: **Blender**,
  **Ableton / Logic**, **Figma**, **Notion / Google Docs**.
- **Large footage** is carried by the Desktop Agent when it is too big to move
  through a browser.

### 5.4 AI as the translator

Different foundations come with different vocabularies, and the gap between them
is usually context that never got written down.

- The system **holds context** across a collaboration, so the join between two
  people's work can be found and explained rather than assumed.
- It **protects provenance**: no synthetic substitute for a person, and the
  strange, specific route an idea took is never erased.
- The **Story Oracle** is advisory — it suggests, a human applies — and the den
  reports which provider answered and whether it failed over, so a local model
  and a hosted one stay visibly different things.

AI here is a **bridge between two backgrounds, not a replacement for either.**

### 5.5 Why this works across backgrounds

| Pair that often struggles to collaborate | What Nexet gives them instead |
|---|---|
| A first-time novelist and a career editor | One frozen brief, one role, one review desk — the editor's background never has to be explained to be useful. |
| A shooter and a colourist in different time zones | One locked timeline, commit-style versions and A/B diffs — both review the same cut. |
| A freelancer with no network and a studio with an open seat | The **Audition Arena**: an open call anyone can answer, and a portfolio that records the outcome. |
| A writer and a designer | A shared artifact, plus plugins that meet each craft in its own tool. |
| People from different disciplines entirely — analysis, architecture, education, care | The same engine and the same four-step lifecycle, in blueprint rooms built for those fields. |

### 5.6 The house holds the field

The house's own mottos are all statements of unity:

- *"Two desks, one record."*
- *"Every room starts with two."*
- *"Five seats. One manuscript."* — the Authors Den
- *"Four roles. One locked timeline."* — the Creators Den

A den is not a fence. It is one field inside a larger one, and because every den
stands on the same engine, someone who learns to collaborate in one room can
collaborate in any other. That is what turns a set of tools into **a place where
people from different foundations meet** — and it is why the closing promise is
about the record rather than the software: *a clear line back to every hand in
the room.*

---

## 6. How Nexet solves the problem

### 6.1 The collaboration lifecycle (the engine)

The same four-step lifecycle runs in every den, and is described in-product as
the platform's own diagram: **Together → Write / Create / Match / Approve**.

| Step | What happens | The problem it kills |
|---|---|---|
| **1. Post the call** | Publish a *frozen* snapshot of your work plus a short brief (what a collaborator should know, the role you want, how many answers you will take). | Matching stops being luck. Your original project is untouched — the call is its own invitation. |
| **2. Work on your own desk** | The other person gets a **private clone**. They work in their own studio, in their own tools. Work in progress stays off the record until they choose to send it. | Work-in-progress stops leaking. You never have to expose your whole manuscript or rough cut to get help. |
| **3. Send it for review** | Submitting sends the work to the creator's inbox as a continuation, or a pull request against the latest approved version — with a note on what changed. | Handoffs stop being blind. Creator and collaborator are looking at the same frozen version. |
| **4. Review, then merge** | The creator reads the submission beside the previous version, leaves notes, then **accepts** or **rejects**. Accepting merges it, locks the contract, and creates a shared project. Both people keep their names on the work. | Credit stops being lost. Attribution is structural. Nothing merges without the creator's consent. |

### 6.2 The rules that make it trustworthy

These are enforced in the product, not just by etiquette:

- **Your draft is yours until you send it.** Submissions are immutable once
  submitted; unsubmitted drafts are never visible to the other person.
- **One active answer per call.** You cannot re-apply to the same post until the
  creator has responded to your open submission.
- **Frozen briefs.** The thing people answer is a snapshot taken at publish
  time, so the target cannot move under the respondents.
- **Authorization is server-side.** Ownership and state transitions are enforced
  by the API, never only by a disabled button.
- **Hidden prose stays hidden.** A preview never exposes another respondent's
  draft, locked text, or unapproved AI context.
- **Read-only preview.** When a creator previews a submitted project they can
  read but not write it, and the work is not downloaded into their own studio.

---

## 7. The platform at a glance

The repo ships several applications that sit behind one router and one domain.

| App | What it is |
|---|---|
| **Nexet** (the house) | The front door, the atrium (dashboard), the category doors, subscriptions, profile, inbox, notifications, and the Engine blueprint page. |
| **Authors Den** | The full writing studio: book/project management, the Story Oracle AI, the collaboration pipeline, and the Writers' Audition Arena. |
| **Creators Den** | The video version-control platform: a four-role relay across review stages, external-tool checkout & import, commits, pull requests, A/B compare, channels and analytics. |
| **API server** | The Express REST API, Clerk auth, Socket.IO realtime, the Story Oracle AI routing, the video job queue, and billing. |
| **Oracle Admin** | Private control room for the AI model providers that power the Story Oracle. |
| **Desktop Agent** | Standalone Electron app that generates proxies with FFmpeg and uploads large raw files directly to Cloudflare R2. |

### 7.1 The doors that are open today

Two dens are **Available** on the front page and the dashboard:

- **Authors & Writers** — *"Post what you have started. Another writer answers,
  and the manuscript keeps both names."*
- **Content Creators** — *"Turn raw footage into publish-ready masters with a
  four-role relay. The clips stay locked in the room."*

The two open dens get their own section next — the industry problems they answer,
and what they change for a project.

### 7.2 The rest of the house (on the blueprint)

These rooms are visible on the blueprint with a waitlist, not a dead card:

- **Creative:** Singers & Vocalists, DJs & Producers, Visual Artists,
  Storytellers & Podcasters.
- **Systems & strategy:** Nexet in Trading, Nexet in Architecture.
- **Human rooms:** Nexet for Connection, Nexet in Therapy / Grief, Generative
  Dating, Finding Soul Mates, Nexet in Memory.
- **Everyday tools:** Nexet Keyboard, Tour / Holiday / Vacation, Nexet for
  Education.
- **The far room:** The Open Orchestra — a collective piece made without a
  conductor.
- **Creative tools:** first-party plugins for Blender, Ableton / Logic, Figma,
  and Notion / Google Docs.

---

## 8. The two dens that are open today — and the industries they change

Only two rooms are walkable today, and each is a complete studio for a different
industry:

| Open den | For | Door |
|---|---|---|
| **The Authors Den** | Novelists, writers, editors, beta readers, ghostwriters, proofreaders | `/categories/authors` |
| **The Creators Den** | Video creators, editors, sound designers, colourists, thumbnail artists, channels and studios | `/categories/content-creators` |

These are not two products that happen to share a login. They are **the same way
of working seen through a different craft** — the same four-step lifecycle, the
same fork-and-pull-request logic, the same review desk and the same merge. What
changes is the artifact, the roles, and the tools each industry already uses.
Each is unlocked by a **monthly category pass**.

### 8.1 The Authors Den and the writing industry

**The collaboration problems writers actually hit**

| Problem | What it looks like in practice |
|---|---|
| The work is solo by default | A manuscript is written alone, and the readers who can actually help usually arrive after the draft is done — when feedback can no longer change the book cheaply. |
| Finding a collaborator is luck | Beta readers and editors are found by word of mouth, or in transactional marketplaces where you cannot see how someone works. |
| Sharing means handing over everything | Real feedback seems to require emailing a whole manuscript, so writers either over-share or get nothing. |
| "Track changes" is not version control | Everything merges into one document. There is no fork, no review step, no rollback, and no record of who changed what. |
| Filename versioning | `manuscript_v3_final_final.docx` is the entire version system most writers have. |
| Dead air | A reader takes the draft and vanishes for six weeks, with no status and no obligation. |
| Credit dissolves | The editor, the beta reader and the ghostwriter are invisible by the time the book exists. |
| Format friction | Final Draft, Word, EPUB and PDF are each somebody's required hand-off format. |

**How the Authors Den solves it**

| Challenge | The den's answer |
|---|---|
| Solo by default | The **Pitch Board** and the **Writers' Audition Arena** make collaboration a first-class act: post a seed, or open a role — Co-writer, Editor, Beta reader, Ghostwriter, Proofreader. |
| Finding the right person | A **frozen brief** states the role, tone, language and constraints once, so the right respondent self-selects. Fulfilled roles and **My Auditions** become a public record of how someone works. |
| Handing over everything | A **seed is a passage plus a brief**, never the manuscript. The rest of the project stays on your desk. |
| The merge problem | **Fork → private clone → submit → review → accept**, exactly like a pull request. Submissions are immutable, so nothing is silently overwritten. |
| Version chaos | Structure instead of filenames: the **Story Bible**, characters, plots, world, outline and scenes with status, POV, labels and targets — plus per-scene **revision history**. |
| Dead air | **One active answer per call**, an explicit **accept/reject** decision, and notifications for both sides. |
| Credit dissolves | An accepted collaborator gets a **contract** and a **shared project synchronised across both studios**, both names on the work, every pass in the activity trail. |
| Format friction | Export into the writer's world: Word, PDF, EPUB, **Final Draft**, Markdown, OpenDocument, RTF and HTML. |
| Being stuck | The **Story Oracle** (Groq / OpenRouter / Ollama / LM Studio / Freebuff) advises on the draft, so a writer is not blocked waiting on an editorial round-trip. |

### 8.2 The Creators Den and the video industry

**The collaboration problems video teams actually hit**

| Problem | What it looks like in practice |
|---|---|
| The footage is the bottleneck | RAW is measured in tens of gigabytes. Moving it means a USB stick, a courier, or a link that expires before the editor opens it. |
| The project file is fragile | An edit is a project file pointing at media paths on one machine. Move it and everything goes offline — relinking media is the classic time sink. |
| Version naming chaos | `final_v3_FINAL.mp4`: no parent, no message, no history. |
| Feedback is scattered | Review-site notes, screenshots, DMs, group-chat timestamps and voice notes — no single record, and nobody is sure which cut a note refers to. |
| Blind handoffs across the relay | Story architect → editor → sound → colour, and each handoff loses the context the previous person held. |
| Web editors cannot replace the tools | Premiere, Resolve, Pro Tools, Avid and After Effects are desktop applications. Nothing in a browser is Premiere-class, and professionals will not trade their speed for a lighter tool. |
| No audit trail or credit | The reasoning behind a choice, and the person who made it, live in memory until the credits roll. |
| Discovery is cold outreach | Freelancers find work by emailing strangers; studios cannot tell a portfolio from a highlight reel. |
| Sync-bound work | Everything waits on a review meeting, because there is no shared object to review against. |
| Processing blocks the next decision | Transcoding and rendering consume hours of machine time and get in the way of the work itself. |

**How the Creators Den solves it**

| Challenge | The den's answer |
|---|---|
| Massive footage | The **Desktop Agent** builds FFmpeg proxies locally and uploads the raw file straight to **Cloudflare R2** through presigned URLs — no browser, no USB stick. |
| Fragile project files | **External-first checkout & import**: the den exports a manifest and media bundle (or a timed grant), the editor works in Premiere / Resolve / Pro Tools / Avid, then pushes back a **new version plus a submission**. |
| Version chaos | **Timeline versions as commits** — snapshot, message and parent — with a version timeline and shelf you can restore to. |
| Scattered feedback | **Timecode and spatial comments** you can resolve and reopen, attached to the cut itself. |
| Blind handoffs | A **submission is a pull request** against the last approved version, with a **diff** and **A/B compare**, so the next person sees exactly what changed. |
| Tool switching | The den never edits. Hand-offs use the industry's own file round-trip — **EDL / AAF / FCPXML / OTIO** — the standard way post houses already pass work between these exact tools. |
| Credit and reasoning | **Genealogy, activity and per-stage roles** keep the trail, and a role is attached to the work. |
| Discovery | The **Audition Arena**: post Video / Audio / Script / Thumbnail roles, preview the project read-only while the role is open, apply with a message and documents, and see a **live applicant count**. Accepting hires the applicant into the role. **Mutual work reviews** and a public portfolio replace the highlight reel. |
| Sync-bound work | Realtime **notifications, project chat and presence** ("who's editing which leg") keep a team moving without a meeting. |
| Processing blocks work | A **BullMQ + Redis job queue** runs proxy, transcribe, sync, render, audio and finish in the background, with the database row as the source of truth so a lost worker never loses the work. |
| Duplicate storage | **Content-addressed media**, so the same footage is stored once. |

### 8.3 The two dens side by side

| Dimension | The Authors Den | The Creators Den |
|---|---|---|
| Craft | Long-form writing | Video |
| The artifact that gets diffed | The manuscript's structure — scenes and Story Bible | The timeline |
| What is frozen | The seed passage + its brief | The approved timeline version |
| Unit of one pass | A continuation submission | A submission (pull request) |
| Roles | Co-writer · Editor · Beta reader · Ghostwriter · Proofreader | Story Architect · Visual Editor · Sound Designer · Motion & Color (+ Thumbnail) |
| Who decides | The author | The Captain |
| The big-file problem | Not applicable (text) | Desktop Agent + R2 + proxies |
| Tools it meets | Word, Final Draft, EPUB, PDF… | Premiere, Resolve, Pro Tools, Avid, After Effects |
| The AI | The Story Oracle, advisory | The Role Oracle, advisory |

### 8.4 Different backgrounds, same ground

Neither den asks where you trained. Both ask one question: **can you answer this
frozen brief with a contribution the creator wants to merge?**

- A **self-taught writer** can answer a published author's seed on the Pitch
  Board, because the brief is the job description and the submission is the
  audition.
- A **freelancer with no network** can audition for a studio's open role on the
  Arena the moment it is posted — and the zero-state literally reads *"Be the
  first to audition."*
- **A career editor and a first-time novelist** meet on the same review desk;
  nothing about either background has to be explained for the work to be judged.
- **A shooter and a colourist in different time zones** review the same locked
  timeline and never have to be online together.
- **An unconventional path becomes legible**: fulfilled roles, accepted
  collaborations and mutual work reviews accumulate as a record, so the person
  without the traditional résumé has something better — a history of finished
  work with named roles.

The reason this works is that the context a newcomer would normally lack lives
**in the artifact, not in the team's memory**: the Story Bible on one side, the
timeline and its commit history on the other. Onboarding becomes reading, not an
interview.

### 8.5 What this does for projects and productivity

Each mechanism below closes a specific leak in how collaborative work currently
spends its time. (This is a structural account of where the time goes, not a set
of measured benchmarks.)

| Where the time leaks | What closes it | Authors Den | Creators Den |
|---|---|---|---|
| Re-sending documents and re-uploading media | One shared project, content-addressed media, sync across both studios | ✔ | ✔ |
| "Which version are you looking at?" | A frozen brief and a frozen approved version | ✔ | ✔ |
| Handover meetings | Submission notes, commit messages, diffs, and a Story Bible / timeline that carries context | ✔ | ✔ |
| Waiting on a sequential relay | Asynchronous by construction — work proceeds per stage, per person, across time zones | ✔ | ✔ |
| Re-review rounds | Review against the approved version; diff and A/B compare in one pass | ✔ | ✔ |
| Feedback lost across five apps | One review desk; timecode comments stuck to the frame | ✔ | ✔ |
| Spam applications and no-shows | One active answer per call, explicit accept/reject, role watches | ✔ | ✔ |
| Losing progress | Revision history, version timeline, activity and genealogy trail | ✔ | ✔ |
| Reformatting for hand-off | Export to the writer's formats; industry file interop for video | ✔ | ✔ |
| Repeated transcoding and re-rendering | Background job queue and reusable, content-addressed proxies | — | ✔ |
| Re-briefing a brand-new collaborator | The project document *is* the onboarding | ✔ | ✔ |
| Credit disputes | Contracts, roles and structural attribution | ✔ | ✔ |
| Unmeasured progress | Word and session targets, revisions, analytics, presence | ✔ | ✔ |
| A blocked draft or cut | Advisory AI that suggests without taking the pen | ✔ | ✔ |

Productivity here is not about anyone typing faster. It is about removing the
round-trips that collaboration currently costs: re-sending, re-explaining,
re-reviewing, and waiting. Both dens are built so that the only thing two people
need to agree on is **the artifact in front of them** — which is what lets a
writer and an editor, or an editor and a colourist, get to something great
whether or not they share a background.

---

## 9. The Authors Den — features

The dens are the heart of the product. The Authors Den is the writing studio.

### 9.1 The studio itself

| Feature | What it does |
|---|---|
| **Projects** | A full project document: title, author, template, premise, synopsis, summary, daily and session word targets. Stored as a first-class project you own. |
| **Story Bible** | The structured reference for the whole work — the single source of truth collaborators read. |
| **Characters** | Named characters with role, POV, importance, colour, description, notes, and custom key/value fields. |
| **Plots** | Main plots and subplots with status, description, notes, ordered steps, and the characters involved. |
| **World** | Places, institutions and other world items, with description, notes, and the story-specific "fantasy" layer. |
| **Outline & Draft (editor)** | Scene-by-scene writing: title, synopsis, status, target word count, POV, labels, notes, scene media, and the prose itself. |
| **Revisions** | Per-scene revision history with date and word count, so you can see the work move. |
| **Search** | Search across the project. |
| **Word targets** | Daily and per-session targets, tracked against scenes flagged to compile. |
| **Export** | Project JSON, Word (`.docx`), PDF, EPUB, RTF, plain text, HTML, Final Draft (`.fdx`), Markdown, OpenDocument (`.odt`), legacy Word (`.doc`), and print. |

### 9.2 The Story Oracle (AI)

- A writing assistant built into the den: **Oracle**, plus **Tools**.
- Providers are configurable from the private control room: **Groq**,
  **OpenRouter**, **Ollama** (local), **LM Studio** (local), and Freebuff.
- The UI reports which route answered and whether it **failed over** from another
  provider, so a local model and a hosted model are visibly different things.
- The Oracle is **advisory**. It suggests; the human applies.

### 9.3 The collaboration pipeline (seeds)

This is the engine as it appears to a writer.

| Stage | What it is |
|---|---|
| **Publish a seed** | Freeze a passage plus a brief. Fields: project title, unit (paragraph / scene / chapter / opening / ending / POV), protocol, genre, tone, language, plot constraints, desired role, respondent limit (3 / 5 / 10 / unlimited), and visibility (seed + brief, or seed only). |
| **Pitch Board** | Where open seeds live. Any writer can read a seed and its brief. |
| **Answer this seed** | Forks the frozen snapshot into the respondent's own Authors Den as a **private clone**, marked with a clone icon on their project page. |
| **Submit** | Sends the clone back with a **"note for the creator"** card. The respondent cannot re-apply to the same seed until the creator responds. |
| **Inbox / review desk** | The creator receives the submission, previews it read-only (cannot write, and it is not downloaded into their studio), then **Accept** or **Reject**. |
| **Contract** | Accepting locks a contract between the two. |
| **Shared project** | The pair gets one synchronised project present in **both** studios — updates flow both ways so they continue writing together as collaborators and co-writers. |
| **Waiting room** | The holding state while a collaboration is being set up. |
| **Genealogy & activity** | The provenance record: how the work got here and who touched it. |

### 9.4 The Writers' Audition Arena

One board where an author calls for a second voice and any signed-in writer can
answer. It runs **two rails over one system**, so it adds discovery and
organisation without forking the collaboration logic.

| Rail | What it is |
|---|---|
| **Open Roles** | An author opens a *writing role* on a project — **Co-writer, Editor, Beta reader, Ghostwriter, Proofreader** — with a public pitch and a frozen brief. |
| **Seed Pitches** | The existing Pitch Board, on the same board, unchanged. |

Arena features:

- **Board** with role filter chips, live applicant count, posted-time, sort
  (Newest / Most auditions), and an "already auditioned" state.
- **Role detail** — the pitch, the frozen brief, the current applicant count,
  the audition action, a **Watch** button and a **Share** link.
- **Author's management view** — close / reopen the call, live and lifetime
  stats, and the audition list with **Accept** / **Decline**.
- **My Auditions** — the applicant's own history across both rails, with
  statuses (in review, accepted, declined) and **Withdraw**.
- **Role watches** — subscribe to a role (optionally scoped to one author) and
  get notified once when a matching call is posted.
- **Anti-spam by design** — one active audition per call, immutable submissions,
  and no draft text ever exposed through a listing.

Accepting an audition lands the pair in exactly the same contract and shared
project flow as an accepted seed continuation.

### 9.5 Den-level features

- **Home, Explore, Notifications** and a **Settings / Profile** surface.
- **Project Room** — the room for one collaboration, with its own contract,
  waiting room, story bible and activity pages.
- **Inbox** for received submissions and collaboration notices.
- **Realtime chat and voice notes** between collaborators.
- **Notifications** with categories and realtime toasts that arrive from either
  den through one socket.
- **Deep links** into the den (`?answer=<seedId>`, `?arena=1`,
  `?arenaPost=<id>`, `?arenaMine=1`, `?project=…`) so the hub can hand a user
  straight into the right room.

---

## 10. The Creators Den — features

The Creators Den is the video den: **"GitHub for video."** It is explicitly
**external-first** — there is no in-browser video *editing*. Editing happens in
the tools creators already use (Premiere Pro, DaVinci Resolve, Pro Tools, Avid
Media Composer, After Effects); the den is the **version-control, review and
collaboration layer** around them. Review, compare, comment and approve stay in
the browser, because you cannot approve a cut you cannot watch.

### 10.1 The four-role relay

Work moves in stages, and each stage takes the current cut out to its own tool
and sends it back for review against the last approved version.

| Stage | Role | Works in |
|---|---|---|
| **01 · Selects** | Story Architect | Avid Media Composer |
| **02 · Cut** | Visual Editor | Adobe Premiere Pro |
| **03 · Sound** | Sound Designer | Avid Pro Tools |
| **04 · Finish** | Motion & Color | After Effects (motion) + DaVinci Resolve (colour) |
| **Thumbnail** | Cover & thumbnail work | dedicated review stage |

The relay's tooling is modelled on the real reference applications — panelled
workspaces, direct manipulation, source/record dual monitors, playhead-driven
panels, non-destructive editing with versioned history, and AI that only
suggests.

### 10.2 Version control for video

The core mapping is deliberately GitHub-shaped:

| Git / GitHub | Creators Den |
|---|---|
| Repository | Project |
| Commit (snapshot + message + parent) | Timeline version |
| Commit message | Message + "what I worked on" |
| Pull request | Submission |
| Review / approve / merge | Decide submission → advance the current version |
| Code review comments | Timecode + spatial comments |
| Git LFS | Assets (content-addressed media storage) |
| `git clone` / checkout | Export manifest + media bundle, or a timed grant |
| `git push` | Re-import files + commit message → new version + submission |
| Diff | Timeline text diff + side-by-side A/B of rendered proxies |
| `git blame` | Genealogy / activity provenance |
| Contributors / roles | Members |

**The diffable artifact is the timeline, not the pixels.** The timeline is text;
the media is large-file storage. That single insight is what makes video version
control feasible.

### 10.3 Collaboration and review

- **Checkout & import** — an editor takes the project out to their own machine
  and pushes work back with a commit message.
- **Submissions / pull requests** — with a note on what changed, reviewed against
  the last approved version.
- **Version timeline, version shelf and timeline history** — every version is
  reachable.
- **Diff view, diff map and A/B compare** — see exactly what changed, in text and
  in picture.
- **Unified annotations** — timestamped and spatial comments on the frame,
  resolve/reopen.
- **Captain review** — the project owner's decide surface.
- **Presence** — who is working on which leg right now.
- **Project chat** and realtime progress.
- **Desktop Agent** — an Electron app that runs FFmpeg to build 720p H.264
  proxies and uploads large raw files straight to Cloudflare R2 via presigned
  URLs, so multi-gigabyte footage never has to go through a browser.
- **Job queue** — video processing (proxy, transcribe, sync, render, audio,
  finish, reference) runs through BullMQ + Redis when configured, with the
  database row as the source of truth.

### 10.4 Channels, CMS and analytics

- **Channels** group projects the way a studio groups work, with a channel home.
- **CMS** — the channel/project management surface, including unlinked projects.
- **Analytics** — a dedicated analytics area with a video-level view, so creators
  can see how published work performs.
- **Portfolio / profile** — a public profile showing track history (projects
  created or participated in), CV, contributions and followers.

### 10.5 The Creators Den Audition Arena

The same open-call idea, adapted to video:

- A Captain running projects under a channel can post an **open role** —
  **Video, Audio, Script or Thumbnail** — on a specific project.
- Any signed-in creator can browse the board and, while the role is open,
  **preview the project read-only** (PREVIEW + TIMELINE only — the exact
  surface a public viewer gets, extended to private projects that carry an open
  post).
- **Apply** with a required message and up to three supporting documents
  (≤ 15 MB each).
- **Live applicant count** on every card and post — the number of people
  *competing right now*, not a lifetime total.
- **View portfolio** on every application, linking into the applicant's public
  profile.
- **Accept / Reject** in the Captain's notification centre; accepting adds the
  applicant to the project as a member holding that role and auto-fills the post;
  rejecting notifies them.
- **My Auditions** and **Withdraw** for applicants.
- **Role watches**, **share links**, **sorting** and a **follow-first feed**.
- **Mutual work reviews** — after a hire, both sides can leave one short public
  review, shown on profiles with project and role context.
- **Anti-spam** — a server-enforced per-week application cap and per-Captain
  applicant blocks.

---

## 11. The house itself (Nexet hub)

| Surface | Purpose |
|---|---|
| **Home** | The front page: the pitch, the platform diagram, the open rooms, the upcoming rooms and the waitlist doors. |
| **Dashboard (atrium)** | The signed-in landing: your doors, the rooms that are lit, and the way into the blueprint. |
| **Category doors** | `/categories/authors` and `/categories/content-creators` are the doorways into their dens (including the Arena). Closed rooms resolve to a waitlist page; a room with no match says "That room moved." |
| **The Engine page** (`/room/engine`) | The foundation: what a collaboration is, the shape of the lifecycle, and the dens that stand on it. |
| **Subscriptions** | The billing desk: category passes, Creator Den storage, and Authors Den project plans. |
| **Ticket gate** | The paywall that unlocks a category room for a pass holder. |
| **Profile** | Your account surface — the same identity the dens reflect. |
| **Activity** | What has happened across your work. |
| **Inbox** | Where submissions and collaboration notices arrive. |
| **Notifications** | One realtime notice feed for both dens, with per-category metadata. |
| **Blueprint / waitlist** | Every room not yet open, each with its own waitlist. |

### 11.1 Realtime

One Socket.IO connection carries the whole platform. Project rooms stream job
progress, new and updated comments, submissions and decisions, asset uploads and
processing, timeline saves, and grant creation/revocation; each user's room
streams notifications; presence drives the "who's editing which leg" strip.

### 11.2 Billing and access

Access is sold as **monthly passes and quotas**, handled by **Whop** as the
payment gateway (USD only), with no card data ever touching Nexet's code —
customers pay on Whop's hosted checkout, and access is granted from a
signature-verified webhook through a single idempotent grant path.

| Product | Plans | Effect |
|---|---|---|
| **Nexet category pass** | Authors, Content Creators | Unlocks that room for the period ($5.88 / month). |
| **Creator Den storage** | g200 / g500 / tb1 | Raises the account's storage quota. |
| **Authors Den projects** | p10 / p50 / p200 | Raises the account's project limit. |

Billing is built to fail safely: grants are idempotent, renewals are reconciled
by a background sweep so a missed webhook cannot leave a paying customer with
nothing, a full refund or an open dispute revokes the entitlement immediately,
and a won dispute restores it. Quota revocation is floored at the free tier so a
refund can never push an account below what everyone gets.

### 11.3 Analytics and identity

- **Clerk** is the single identity source for every app; the acting user is
  always derived server-side.
- **Mixpanel** tracks the funnel, but page views are first resolved to a stable
  **page identity** (route pattern + human-readable name + section), so
  `/authors/nexet/8f3c…` and `/authors/nexet/a91b…` aggregate as the same screen
  instead of splintering every report.

---

## 12. Problems → solutions, by field

| Field / career | The problem | How Nexet solves it |
|---|---|---|
| **Novelists & writers** | Manuscripts stall; no safe way to try a collaborator; credit gets lost. | The **Authors Den**: a full studio, the Pitch Board for seeds, and the **Audition Arena** for roles. A frozen seed means you share a passage, not your manuscript. Accepted work merges with both names on it. |
| **Editors, beta readers, proofreaders & ghostwriters** | No structured way to find work or prove it; "freelance" means cold outreach. | Open Roles are a public board. Every hire is a locked contract, and accepted work becomes portfolio proof with a role attached. |
| **Video creators & editors** | Files are too big, versions are unlabelled, feedback is scattered, attribution is fuzzy. | The **Creators Den**: content-addressed media, commit-style timeline versions, submissions as pull requests, timecode comments, A/B diff, and the Desktop Agent for huge files. |
| **Sound designers, motion & colour** | Work arrives as an unversioned export and leaves with no record of what was done. | The four-role relay gives each role a stage, a review desk, and a version timeline. |
| **Musicians, DJs & vocalists** | Two people write toward the same song and never meet in the middle. | On the blueprint: **Singers & Vocalists** and **DJs & Producers** rooms built on the same post → answer → merge engine. |
| **Visual artists & designers** | Collaboration happens on screenshots of exports. | On the blueprint: **Visual Artists** plus first-party **Figma** and **Blender** plugins so the work itself, not a screenshot, is the shared artifact. |
| **Storytellers & podcasters** | Following a thread another voice left is manual. | On the blueprint: **Storytellers & Podcasters**, plus **Notion / Google Docs** interop for the writing-first version. |
| **Analysts, traders & strategists** | The second opinion lives in a private chat with no record. | On the blueprint: **Nexet in Trading** — surface the pattern another mind notices, with the reasoning on the record. |
| **Architects & builders** | Options cannot fit in one brief and cannot be reviewed side by side. | On the blueprint: **Nexet in Architecture** for spatial thinking worked through together. |
| **Educators & students** | Classroom tools reward one answer from one person. | On the blueprint: **Nexet for Education** — learn by contributing to a body of work. |
| **Therapists & anyone in grief work** | Needs a container that is neither public nor clinical. | On the blueprint: **Nexet in Therapy / Grief** — a gentle container for witness and reflection. |
| **Anyone hiring or being hired on creative work** | Trust is a guess; portfolios are self-reported. | Outcome is structural: contracts, roles, submissions and **mutual work reviews** recorded against real projects. |

---

## 13. Status and roadmap

**Open today:** Authors & Writers (Authors Den, Pitch Board, Writers' Audition
Arena) and Content Creators (Creators Den, four-role relay, VCS, Arena,
channels, analytics).

**On the blueprint:** Singers & Vocalists · DJs & Producers · Visual Artists ·
Storytellers & Podcasters · Nexet in Trading · Nexet in Architecture · Nexet for
Connection · Nexet in Therapy / Grief · Generative Dating · Finding Soul Mates ·
Nexet in Memory · Nexet Keyboard · Tour / Holiday / Vacation · Nexet for
Education · The Open Orchestra · Blender, Ableton/Logic, Figma and Notion/Docs
plugins.

**Deliberately future scope** in the current dens includes multiple hires per
open role, compensation and bidding beyond the contract lock, document uploads
on a writing audition, live spectator mode, editable briefs after publish, and
three-or-more-author group projects.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **House** | The whole platform. |
| **Den** | A studio for one craft, with its own roles and tools. |
| **Room** | One door in the house — a den, a plugin, or a room for a profession or a human need. |
| **Common ground** | The five shared things that let collaborators from different backgrounds work together: one artifact, one vocabulary of roles, one lifecycle, one record, one field. |
| **Open role** | A public call for a specific contribution — a writing role in the Authors Den, or a Video / Audio / Script / Thumbnail role in the Creators Den. |
| **Seed** | A frozen passage plus a brief, published as an invitation to collaborate. |
| **Frozen brief** | The immutable snapshot respondents answer. |
| **Continuation** | A respondent's answer to a seed. |
| **Clone / fork** | The respondent's private copy of a frozen seed. |
| **Submission / pull request** | The work sent back for the creator's review. |
| **Contract** | The lock created when a creator accepts a collaborator. |
| **Shared project** | The synchronised project that exists in both collaborators' studios after acceptance. |
| **Audition** | A writer's or creator's answer to an **open role**. |
| **Arena** | The board where open roles and seed pitches live. |
| **Captain** | The owner of a Creators Den project — the only person who can post roles and decide on auditions. |
| **Timeline version / commit** | A snapshot of a video project's timeline with a message. |
| **Leg** | One stage of the four-role video relay. |
| **Checkout / import** | Taking a video project out to an external editing tool and pushing the result back as a new version and submission. |
| **Content-addressed media** | Storing media by its content hash, so identical footage is stored once and never re-uploaded. |
| **Provenance / genealogy** | The permanent record of who contributed what, and in what order. |

---

## 15. Where to read more

| Document | What it covers |
|---|---|
| `DEVELOPMENT.md` | Developer guide: what Nexet is, the app map, ports, and how to run it. |
| `START-APP.md` | Step-by-step local setup for every app, database and optional service. |
| `FEATURES.md` | Working notes on the seed → clone → submit → merge behaviour. |
| `NEXET_COLLABORATION_IMPLEMENTATION_PLAN.md` | The collaboration engine's implementation plan. |
| `AUTHOR-DEN-AUDITION-ARENA-PLAN.md` | The Writers' Audition Arena, as built. |
| `CREATOR-DEN-AUDITION-ARENA-PLAN.md` | The Creators Den open-role / audition system. |
| `CREATOR-DEN-VCS-DESIGN.md` | The external-first "GitHub for video" design. |
| `CREATOR-DEN-CHANNELS-ANALYTICS-PLAN.md` | Channels, CMS and analytics. |
| `WHOP-SUBSCRIPTIONS.md` | Billing, renewals, refunds and access revocation. |
| `artifacts/creators-den/WORKSPACE-REFERENCE.md` | The reference-app tool catalogue for the four video roles. |

---

*Nexet — a platform for creative connection.*
