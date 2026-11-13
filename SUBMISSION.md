# RE:STACK — Submission Working Draft

> **Status: draft, not a submitted entry.** This document separates implemented features from unfinished delivery work. It does not claim an uploaded video, an award, or Kiro usage.

## Entry summary

| Field | Current value |
| --- | --- |
| Project | RE:STACK |
| Tagline | A local-first HyperCard revival for connected thinking. |
| Intended primary category | **Resurrection** |
| Additional visual fit | **Costume Contest** — a possible category choice, not an award or placement claim |
| Team / authors | **[TODO: project owner must supply real names and roles]** |
| Canonical repository | **[TODO: add the real public repository URL]** |
| Public demo | **[https://restack-demo.nyc.boxd.sh/](https://restack-demo.nyc.boxd.sh/)** — static production build; HTTP 200 and 5-card deck verified in Chrome on 2026-11-13 |
| Demo video | **57.1-second silent captioned MP4 rendered and verified (1920 × 1080, 30 fps, H.264, 6.7 MB): [restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4).** YouTube upload and public YouTube URL remain pending. |
| Submission URL / ID | **[TODO: add only after the entry is actually submitted]** |

## Short pitch

RE:STACK revives the generous spirit of HyperCard as a modern, private workspace for connected thought. Every idea gets a card; cards gain tags and meaningful links; backlinks and a living constellation reveal relationships that a flat notebook hides. It runs as a React + TypeScript + Vite web app with no application backend, and every workspace can be carried away as readable JSON.

## The resurrection

HyperCard, introduced in 1987, made personal software feel approachable: a stack could hold text, media, and links without requiring a database or an account. RE:STACK keeps the recognizable unit—the card—and reconnects it to contemporary local-first note-taking.

The result is not a pixel-for-pixel emulator. It is a modern interpretation built around three durable ideas:

1. **Small things are composable.** A single thought is easier to write, find, and connect than an intimidating blank document.
2. **Links are part of thinking.** Outgoing connections and derived backlinks make context navigable in both directions.
3. **Personal software should be portable.** Local persistence and readable JSON keep the workspace independent of a hosted account.

## Implemented experience

- Create, edit, delete, and color-code cards with automatic local persistence.
- Add normalized tags, filter collections, and sort the deck by update time, creation time, or title.
- Search card titles, bodies, tags, and linked-card titles from an inline filter or global keyboard search.
- Create directed card-to-card links and navigate automatically calculated backlinks.
- Explore an SVG constellation with focus, hover tracing, zoom, and editor access. The graph displays up to 25 recently edited cards.
- Import and export validated JSON v1 workspaces, with confirmation before replacement.
- Start from or restore a five-card example workspace.
- Use responsive navigation and keyboard controls for common actions.

## Design notes

The interface combines archive-inspired labels, an editorial deck, compact monospaced details, and bright card accents with a modern responsive layout. The constellation makes the connection model visible rather than hiding it behind a hierarchy. Plain-text editing keeps the card itself fast and approachable.

These choices are intended to evoke the accessibility and playfulness of early personal software without reproducing a specific historical screen or claiming affiliation with the original HyperCard authors.

## Technical implementation

| Layer | Implementation |
| --- | --- |
| UI | React 19, React DOM, TypeScript, semantic controls, inline SVG |
| Build | Vite 7; strict TypeScript project |
| State | React state with pure workspace/card operations |
| Persistence | Browser `localStorage` under `restack.workspace.v1` |
| Exchange format | Versioned JSON (`version: 1`) with validation and normalized links |
| Backend | None |
| Account / cloud sync / tracking | None |
| Tests | Vitest + fast-check unit/property tests; Playwright Chrome workflows; results recorded below |

### Data and deployment boundaries

- Browser data is specific to a browser profile and origin; there is no cross-device synchronization.
- Export is the user's backup and migration path. Clearing site data can remove the only local copy.
- The application is not currently described as an installable PWA, and no offline cold-start asset-cache guarantee is claimed.
- A production build can be created with `npm run build`; the verified public demo is a static build of that output, with all data stored locally in the visitor’s browser.

## Engineering considerations

These are observable design constraints, not invented anecdotes about the development process:

- **Backlinks without duplicate state:** Only outgoing links are stored. Backlinks are derived from the workspace, so reciprocal edits do not require synchronizing two copies of the same fact.
- **Safe deletion and import:** Deleting a card removes references to it. Import validates card IDs and drops self-links or links to missing cards.
- **Local failure handling:** Storage reads, writes, and removal are guarded because privacy settings or quota limits can make browser storage unavailable.
- **Graph readability:** The view intentionally limits itself to 25 recent cards rather than pretending that an unbounded hairball is useful.

### First-person retrospective — owner input required

- **Challenges:** [TODO: replace with the owner's actual challenges and trade-offs.]
- **What I learned:** [TODO: replace with first-hand lessons from real development.]
- **Accomplishments:** [TODO: optionally add a first-person account; implemented functionality is listed above.]

No personal development story has been fabricated for this draft.

## Mandatory Kiro requirement — currently unmet

**This project has not used Kiro. It therefore does not currently satisfy the competition's mandatory Kiro-usage requirement.**

- No Kiro-assisted implementation or Kiro workflow is claimed.
- This documentation does not provide or validate `.kiro` evidence.
- **[TODO for the project owner only: if Kiro is genuinely used, preserve the actual `.kiro` materials and write an accurate account of how they were used.]**
- **[TODO: verify the current official rules and every required evidence path before submitting.]**
- If genuine Kiro use does not occur, the mandatory requirement remains unmet; the honest options are to use it genuinely or not submit an entry that requires it.

## Verification record

Verified on **2026-11-13** against the source snapshot in the initial commit. Re-run these checks after any subsequent code change.

| Check | Command / procedure | Recorded result |
| --- | --- | --- |
| Automated tests | `npm test` | **PASS — 23/23 tests in 2 files**, including fast-check properties |
| Tests + production build | `npm run check` | **PASS — strict TypeScript and Vite build** |
| Complete verification | `npm run check:all` | **PASS — unit/property suite, production build, and 3/3 Playwright workflows** |
| Real-browser workflows | `npm run test:ui` in installed Chrome | **PASS — create/edit/link/reload/search/graph; JSON export/import; mobile navigation/editor** |
| Responsive check | Playwright desktop plus 390 × 844 mobile viewport | **PASS — screenshots reviewed; no blocking layout issue found** |
| Persistence and exchange | Browser test reload plus real JSON download/import | **PASS — version 1 workspace survived the tested round trips** |
| Public deployment | `https://restack-demo.nyc.boxd.sh/` in real Chrome | **PASS — HTTP 200, title “RE:STACK — Ideas, connected.”, five-card example deck loaded** |
| Demo composition | `cd video && npm run check` | **PASS — no lint/runtime/layout/motion/contrast errors; representative snapshots reviewed. Intentional silent-film notice remains.** |
| Final video file | Render and inspect the reviewed composition | **PASS — `video/renders/restack-demo.mp4`; 57.100 s, 1920 × 1080, 30 fps, H.264, 6.7 MB; public mirror returns HTTP 200 and plays in Chrome; representative rendered frames reviewed** |

## Delivery checklist

- [ ] Add the real team/author names and canonical public repository URL.
- [x] Run the complete verification record against the source snapshot and record truthful results.
- [ ] Confirm the primary and any secondary categories in the current official rules.
- [ ] Resolve the mandatory Kiro requirement only through genuine use; add actual evidence and an accurate write-up if applicable.
- [x] Deploy a production build, verify the public URL in a fresh browser, and replace the public-demo placeholder. Live at https://restack-demo.nyc.boxd.sh/.
- [x] Review the captured 57.1-second composition in Studio using [DEMO_SCRIPT.md](DEMO_SCRIPT.md), then render and inspect the final MP4.
- [ ] Upload the silent captioned video to YouTube, verify public visibility and duration, and replace the video placeholder.
- [ ] Confirm that the exported/imported demo workspace contains no private information.
- [ ] Review the final entry for unsupported claims, broken links, and placeholder text that should now be resolved.
- [ ] Actually submit the entry before the deadline; add the confirmation URL or ID only afterward.

## Planned next steps

These are roadmap items, not implemented features:

- Add explicit migration coverage if a future workspace format moves beyond JSON v1.
- Evaluate accessible offline asset caching and installability without weakening the local-first model.
- Improve large-graph navigation beyond the current 25-node presentation limit.
- Expand browser-level accessibility and multi-viewport regression coverage.
