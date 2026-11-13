# Contributing to RE:STACK

Thank you for helping make personal, connected software more approachable. Contributions should preserve RE:STACK's local-first behavior, readable data format, accessibility, and small dependency surface.

## Before you start

- Search the project's [issue tracker](https://github.com/ggyyuig/restack/issues) before opening duplicate work.
- For a feature, storage-format change, new dependency, or visual redesign, describe the problem and proposed trade-offs before implementing it.
- Do not include private workspace exports in issues, tests, screenshots, or commits. Create small sanitized fixtures instead.
- Be respectful and constructive. Assume that people use their stacks for material that matters to them.

## Development setup

Use a Node.js release supported by Vite 7; Node.js 22.12+ is recommended.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The development server uses a strict port, so stop anything already using port 5173 rather than assuming Vite will choose another one.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Re-run tests while editing |
| `npm run build` | Run the TypeScript build and create production assets |
| `npm run preview` | Preview the production build on port 4173 |
| `npm run check` | Run tests, then build |

Run `npm run check` before requesting review. Report the actual result; never paste an unexecuted pass into documentation or a pull request.

## Code map

- `src/App.tsx`: application state, view composition, import/export, and global shortcuts
- `src/components/CardEditor.tsx`: card editing, tags, links, backlinks, and deletion
- `src/components/Graph.tsx`: SVG graph layout and interaction
- `src/components/SearchDialog.tsx`: global search and keyboard navigation
- `src/lib/model.ts`: pure card/workspace operations, search, seed data, and JSON v1 parsing
- `src/lib/storage.ts`: guarded browser persistence and the storage key
- `src/styles.css`: visual system and responsive layouts
- `tests/`: Vitest test files (`*.test.ts`)

Keep card rules in pure model functions where practical. Keep browser APIs at the application/storage edges so they can be tested with small adapters rather than hidden throughout components.

## Implementation guidelines

### TypeScript and React

- Preserve strict TypeScript settings, including unused-local and unused-parameter checks.
- Prefer explicit domain types (`Card`, `Workspace`, `CardDraft`) over untyped objects or unsafe assertions.
- Make updates immutable. Reuse pure model operations instead of duplicating link or normalization rules in components.
- Keep controls semantic and labelled. Preserve visible focus, keyboard operation, and useful empty states.
- Avoid new dependencies when browser APIs, React, or existing utilities solve the problem cleanly.

### Local-first and privacy

- Do not add analytics, remote card storage, required accounts, or silent network synchronization.
- Keep `localStorage` access guarded: browsers can deny access or exhaust quota, and the UI must not pretend those edits were saved.
- The storage key is `restack.workspace.v1`. Changing it without a migration makes existing workspaces appear to disappear.
- Do not describe local storage as a backup. Preserve obvious export and import paths.
- Offline asset caching and installability are separate concerns; do not claim PWA behavior unless it is implemented and tested.

### Data compatibility

The current exchange format is **JSON v1** with this top-level shape:

```ts
interface Workspace {
  version: 1;
  cards: Card[];
}
```

- Preserve support for valid existing v1 exports.
- If the schema changes, introduce an explicit new version and a tested migration path rather than silently changing v1 semantics.
- Maintain validation for malformed JSON, unsupported versions, invalid or duplicate IDs, invalid fields, excessive workspace sizes, and broken links.
- Preserve normalization behavior for tags, accents, dates, card text, and link targets.
- Current model limits include 1,000 imported cards, a 2 MB import-file guard, 180-character titles, 30,000-character bodies, and eight normalized tags per card. Treat changes as compatibility decisions, not incidental constants.

## Tests and review checklist

Add or update focused tests for behavior changes. Model and storage tests should cover both successful paths and malformed/hostile inputs. `fast-check` is available for property-based tests where invariants are clearer than hand-picked examples.

For UI-affecting work, manually check the relevant items in a real browser:

- [ ] Create, edit, delete, and reload a card; verify persistence and storage-failure messaging.
- [ ] File tags, filter collections, use each sort mode, and clear filters.
- [ ] Add/remove links, follow backlinks, and confirm deleted-card references are cleaned up.
- [ ] Search by title, body, tag, and linked-card title; navigate results by keyboard.
- [ ] Focus/open graph nodes, trace hover relationships, and use zoom controls.
- [ ] Export a real file and re-import it; verify the confirmation step and workspace contents.
- [ ] Reject invalid JSON, unsupported versions, duplicate IDs, invalid fields, and files over 2 MB without replacing the current stack.
- [ ] Restore the demo only after its confirmation prompt.
- [ ] Exercise `N`, `Ctrl+K`/`Cmd+K`, arrows, `Enter`, `Escape`, and `Tab` navigation.
- [ ] Check desktop and narrow/mobile layouts, including navigation, dialogs, and the graph.
- [ ] Run `npm run check` against the final change set.

## Commits and pull requests

1. Create a focused branch from the current default branch.
2. Keep each commit scoped and explain **why** as well as what changed.
3. Include tests for behavior changes and documentation for user-visible or compatibility changes.
4. In the pull request, list the commands actually run, their results, manual browser coverage, and any remaining limitations.
5. Include before/after screenshots for visual changes, using only sanitized example data.
6. Do not claim a deployment, video upload, submission, or award unless the linked artifact independently verifies it.

### Competition-material integrity

RE:STACK currently has **not used Kiro**, so the competition's mandatory Kiro condition remains unmet. Do not create retrospective `.kiro` evidence or write Kiro usage claims that did not happen. The project owner may add such materials only after genuine use, with an accurate description and verifiable artifacts.

## Reporting bugs

Include:

- the revision or commit tested;
- browser, operating system, and viewport;
- exact reproduction steps and expected vs. actual behavior;
- whether browser storage was available;
- console errors with private values removed; and
- a minimal sanitized JSON fixture only when necessary to reproduce an import issue.

Do not attach a complete personal stack or secrets.

## License

By contributing, you agree that your contributions are distributed under the repository's [MIT License](LICENSE).
