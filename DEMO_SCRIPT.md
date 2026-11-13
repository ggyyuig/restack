# RE:STACK — Demo Video

**Composition runtime:** 57.1 seconds  
**Hard limit:** under 3 minutes  
**Format:** 1920 × 1080, 16:9, silent with English on-screen captions  
**Status:** Real application footage recorded; local HyperFrames composition included; final MP4 rendered and verified. Public YouTube upload remains pending.  
**Final video file:** [video/renders/restack-demo.mp4](video/renders/restack-demo.mp4) — also mirrored at [https://restack-demo.nyc.boxd.sh/restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4)  
**YouTube URL:** **[TODO: add only after the real YouTube upload is publicly accessible]**

## What the video demonstrates

The footage is a real Chrome session of the current application, not a mockup. A fresh browser context starts with the sanitized example workspace. The recording creates and edits a card, adds a connection, reveals the derived backlink, reloads to demonstrate persistence, uses keyboard search, explores the constellation, and exports JSON.

No narration or music is used. Large captions explain each action while leaving the interface visible. The video makes no Kiro, deployment, submission, or award claims.

## Timeline

| Time | Visible action | Caption / title |
| --- | --- | --- |
| 0:00–0:05.0 | Animated archival card stack | **Old cards. New connections.** |
| 0:05.0–0:10.3 | Example card deck | **A place for ideas to begin.** |
| 0:10.4–0:19.0 | Create a card, write, tag, and autosave | **Write. Tag. Keep your flow.** |
| 0:19.4–0:27.4 | Add a link and reveal its backlink | **Links become trails.** |
| 0:27.6–0:32.8 | Reload, then use Ctrl/Cmd + K search | **Your whole stack, one key away.** |
| 0:32.8–0:43.8 | Focus the constellation and reopen a card | **Step back. Find a connection.** |
| 0:44.0–0:50.0 | Export the workspace | **Portable by design.** |
| 0:50.1–0:57.1 | Closing summary | **One thought per card. A few good connections.** |

## Reproduce the capture

From the repository root:

```bash
npm ci
npm run dev
```

In another terminal, with the app available at `http://127.0.0.1:5173`:

```bash
npx playwright install ffmpeg
node video/scripts/capture-demo.mjs
```

The capture script writes `video/assets/restack-screen.webm` and `video/capture-timings.json`. It uses Playwright's installed Chrome channel at 1600 × 900. Inspect the script before rerunning it; it operates in a fresh browser context and does not use an existing personal profile.

## Validate and preview the composition

```bash
cd video
npm run check
npx hyperframes preview --background
```

Review the actual Studio URL printed by the CLI. The composition is deterministic and uses only local footage and bundled fonts. Its source and design notes are in `video/index.html`, `video/compositions/`, `video/DESIGN.md`, and `video/STORYBOARD.md`.

After explicit review approval, render with `npm run render`. Do not treat a successful check as a substitute for visual review.

## Publishing checklist

- [x] Review the title, representative frames, full preview, and closing in Studio.
- [x] Render the final MP4 and verify its duration, resolution, playback, and visual integrity.
- [x] Confirm every visible interaction matches the current application.
- [x] Confirm the video contains no private cards, downloads, browser data, or unsupported claims.
- [ ] Upload the actual video to YouTube as a public or unlisted judges-accessible video, as permitted by the current rules.
- [ ] Test the URL in a logged-out/private browser and keep the runtime below three minutes.
- [ ] Replace the YouTube URL placeholder above and in [README.md](README.md) and [SUBMISSION.md](SUBMISSION.md).
