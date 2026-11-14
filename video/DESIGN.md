# RE:STACK demo — design spec

## Visual system

- **Idea:** an archival card catalogue seen through a contemporary interface. Warm paper, hard ink rules, offset shadows, dot grids, small mono labels, and one italic editorial gesture.
- **Palette:** paper `#f3f2e9`; light paper `#fbfaf5`; ink `#20211d`; lime `#c8ee78`; violet `#b7a1ed`; peach `#f2ae8e`; sky `#9bc9e5`; butter `#edd375`.
- **Type:** local Inter 400/700 for functional titles, EB Garamond 400 italic for the human/editorial counterpoint, JetBrains Mono 400 for labels. No runtime font fetch.
- **Canvas:** 1920×1080. Product footage is a real 1600×900 Chrome capture, enlarged to 1728×972 with a 96×54 outer frame. Caption cards stay at least 96px from canvas edges; video body copy is 28px or larger.
- **Motion:** `waterfall-entry` for the opening headline; `spring-pop-entrance` for stacked cards, caption cards, and closing features. One paused GSAP timeline per composition, explicit from/to states, transforms and opacity only. No ambient loop, audio-reactive motion, or decorative particle system.

## Scenes

1. **Title (0–5s):** warm paper field, RE:STACK identity, “Old cards. New connections.”, stacked violet/lime/paper cards. A crisp, staggered arrival.
2. **Live workspace (5–50.1s):** the complete 45.08s real screen recording (`data-media-start="0"`) with six timed editorial caption cards. The footage demonstrates authoring, autosave/reload, links/backlinks, command search, graph exploration, and JSON export. No mock UI replaces the application.
3. **Closing (50.1–57.1s):** dark ink field, “Keep the stack. Lose the silo.”, three accurate feature chips: Local-first / Connected / Portable.

## Audio and claims

A single English narration track runs across the full 57.1 seconds, timed to the on-screen captions; it uses Edge TTS voice `en-US-AndrewMultilingualNeural`, rate +6%, pitch -2Hz, normalized to -16 LUFS. There is no music or sound effects. The narration is local audio, not a network request. No deployment, Kiro, award, or submission claims appear in the video. The only historical/product framing is HyperCard-inspired resurrection and the actual working feature set.
