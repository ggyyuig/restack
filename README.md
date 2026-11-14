# RE:STACK

**A local-first HyperCard revival for connected thinking.**

RE:STACK turns notes into a small, navigable network of ideas. Inspired by HyperCard's personal, linkable stacks, it combines a tactile card deck with full-text search, bidirectional navigation, and an interactive constellation view—without an account or an application backend.

> **Project status:** Working source project with automated tests, a live public demo, and a rendered 57.1-second demo video published on YouTube: **[https://youtu.be/Ptbfcr416iY](https://youtu.be/Ptbfcr416iY)**. See [SUBMISSION.md](SUBMISSION.md) for the honest submission checklist.

## Highlights

- **Card CRUD:** Create, edit, color-code, and delete plain-text cards. Changes are saved automatically when browser storage is available.
- **Tags and collections:** Add comma-separated tags, filter the deck, and sort by recent edit, creation date, or title.
- **Connections and backlinks:** Add directed links between cards and navigate automatically derived backlinks from the destination card.
- **Local full-text search:** Search titles, bodies, tags, and linked-card titles. Use the inline deck filter or the keyboard-friendly search dialog.
- **Constellation view:** Explore an SVG relationship graph, hover to trace neighbors, click to focus, double-click to open, and zoom the map. For readability, the graph shows up to the 25 most recently edited cards.
- **Portable JSON v1:** Export a readable workspace snapshot or import one after validation and confirmation.
- **Example workspace:** Start with five connected cards that explain the project and its interaction model. Restore this demo from the sidebar when needed.
- **Responsive and keyboard support:** Use the deck on narrow screens and navigate core workflows without a mouse.

## Quick start

### Prerequisites

- A current Node.js release supported by Vite 7 (Node.js 22.12+ is recommended)
- npm

### Install and run

```bash
npm ci
npm run dev
```

Vite uses **http://localhost:5173** and requires that port to be available.

### Verify and build

```bash
npm test           # 23 unit/property tests
npm run test:watch
npm run build      # Strict TypeScript + production bundle
npm run preview    # Serve that bundle at http://localhost:4173
npm run test:ui    # 3 Playwright workflows in installed Chrome
npm run check:all  # Unit/property tests, build, and browser tests
```

The browser tests start Vite automatically. They use the installed Chrome channel; set `CHROME_PATH` if Chrome is in a nonstandard location. On 2026-11-13, the complete `npm run check:all` sequence passed: **23/23 tests and 3/3 browser workflows**, including a 390 × 844 mobile viewport.

### Demo video source

The `video/` directory contains a 57.1-second HyperFrames composition built from a real Chrome recording, plus its rendered MP4: **[video/renders/restack-demo.mp4](video/renders/restack-demo.mp4)** (1920 × 1080, 30 fps, H.264, 6.7 MB, deliberately silent with English captions). A public mirror is available at **[https://restack-demo.nyc.boxd.sh/restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4)**. See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the timeline and reproduction steps.

```bash
cd video
npm run check
npx hyperframes preview --background
```

The final MP4 has been rendered and visually checked from representative frames against the full Studio preview. It is published publicly on YouTube at **[https://youtu.be/Ptbfcr416iY](https://youtu.be/Ptbfcr416iY)**.

## A two-minute tour

1. Open the example deck and select **New card** (or press `N`).
2. Add a title and plain-text body. Enter comma-separated tags and press `Enter` to file them.
3. In **Connections**, find another card and connect it. Open the destination card to see the new entry under **Referenced by**.
4. Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS), type a query, use the arrow keys, and press `Enter` to open a result.
5. Switch to **Constellation** to inspect the network. Click a node to focus it; double-click a node (or focus it and press `Enter`) to edit it.
6. Select **Export stack** to download `restack-YYYY-MM-DD.json`. Keep this file as your portable backup.

## Keyboard controls

| Key | Action |
| --- | --- |
| `N` | Create a card when not typing in a form field |
| `Ctrl+K` / `Cmd+K` | Open or close global search |
| `↑` / `↓` | Move through global-search results |
| `Enter` | Open the active search result or focused graph node |
| `Escape` | Close the editor, search, or mobile navigation |
| `Tab` / `Shift+Tab` | Move through native interactive controls |

## Data, privacy, and backup

RE:STACK has **no application backend, account system, cloud sync, or tracking service**. Workspace state is held in React and persisted to browser `localStorage` under the key `restack.workspace.v1`.

Important consequences:

- Data is local to the current browser profile and origin. It does not automatically follow you to another browser, device, port, or hostname.
- Clearing site data can delete the stack. **Export JSON regularly; local storage is not a backup service.**
- If storage is blocked or full, the interface reports that storage is unavailable. In-memory editing can continue, but those changes may not survive a reload.
- Card operations do not need an API. This is not currently documented as an installable PWA, and no guarantee is made that application assets will be available after every network-independent cold start.
- Import replaces the current workspace only after confirmation. Export first if you need to preserve the current stack.

### JSON v1 shape

```json
{
  "version": 1,
  "cards": [
    {
      "id": "welcome",
      "title": "A small studio for big ideas.",
      "body": "Every thought gets a card.",
      "tags": ["start here"],
      "links": ["hypercard"],
      "accent": "lime",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-06T12:00:00.000Z"
    }
  ]
}
```

The importer validates JSON structure, version, IDs, card fields, and links. Current limits include 1,000 cards per imported workspace, an import file no larger than 2,000,000 bytes, 180 characters per title, 30,000 characters per body, and eight normalized tags per card. Invalid or self-referential links are removed during parsing. See [src/lib/model.ts](src/lib/model.ts) for the authoritative rules.

## Technology and structure

- React 19 + React DOM
- TypeScript in strict mode
- Vite 7
- Vitest + fast-check for tests
- Browser `localStorage`, Blob downloads, and SVG; no server runtime

```text
src/
├── App.tsx                    Application state and workspace views
├── components/
│   ├── CardEditor.tsx        Editing, tags, links, and backlinks
│   ├── Graph.tsx             Interactive SVG constellation
│   ├── Icon.tsx              Inline interface icons
│   └── SearchDialog.tsx      Keyboard-friendly global search
├── lib/
│   ├── model.ts              Card operations, search, JSON, and seed data
│   └── storage.ts            Defensive local persistence
├── main.tsx                   React entry point
└── styles.css                 Responsive visual system
```

## Project links and placeholders

| Resource | Current status |
| --- | --- |
| Canonical repository | **[https://github.com/ggyyuig/restack](https://github.com/ggyyuig/restack)** — public, MIT licensed |
| Public demo | **[https://restack-demo.nyc.boxd.sh/](https://restack-demo.nyc.boxd.sh/)** — deployed static build, verified in Chrome on 2026-11-13 |
| Demo video | **Rendered, verified, and public:** [YouTube — RE:STACK demo](https://youtu.be/Ptbfcr416iY) (57.1 s, 1920 × 1080, 30 fps, 6.7 MB). Public mirror: [restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4). |
| Competition entry | **Draft; submission has not been confirmed.** |

The intended primary competition category is **Resurrection**. The visual direction may also fit **Costume Contest**, but no finalist status, category placement, or award is claimed.

### Mandatory Kiro requirement

**RE:STACK has not used Kiro and therefore does not currently satisfy the competition's mandatory Kiro-usage requirement.** No Kiro-assisted development, `.kiro` evidence, or Kiro write-up is claimed. Only the project owner may add such evidence and narrative after genuine Kiro use; those materials must describe what actually happened.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) for development and data-compatibility guidelines. The planned video run-through is in [DEMO_SCRIPT.md](DEMO_SCRIPT.md).

RE:STACK is available under the [MIT License](LICENSE).
