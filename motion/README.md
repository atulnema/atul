# Motion engine

A working build of prompt #34 from the Google Flow motion pack: one self-contained `motion.html` that draws eight of the sixteen master effects on Canvas. There are no dependencies and no build step, and every frame is a pure function of time.

Use it two ways:

- **As the real asset.** Render pixel-perfect, on-brand MP4 loops with exact numbers. No AI model gets to guess your figures.
- **As a reference for Flow.** Show Gemini or Flow the rendered loop, or the 4.4s still, so it can match the moves and the look.

The brand rules live in [`MOTION_FLOW.md`](./MOTION_FLOW.md).

## Preview

Open `motion/motion.html` in a browser. The bottom bar switches effect, size and token set, and lets you scrub the timeline, jump to the 4.4s audit frame, or save a PNG. Space plays and pauses; the arrow keys step one frame.

## Export

Requires Playwright (`npm i -D playwright && npx playwright install chromium`) and `ffmpeg`.

```bash
npm run motion -- --effect chart-morph --size 1080x1350          # → motion/out/chart-morph-1080x1350.mp4
npm run motion -- --all --size 1080x1920                         # every effect as a Reel
npm run motion -- --effect particle-logo --still 4.4             # PNG + 240px audit thumbnail
npm run motion -- --effect masked-type --param heroWord=RESULTS --param "subtitle=Built to rank."
npm run motion -- --effect chart-morph --param values=812,940,1102,1388,1520,1975 --verified
```

Output is H.264, yuv420p, 30fps by default (`--fps 24` also works), and loops seamlessly: frames are rendered at `i / fps` for `i < 8 × fps`, so the frame after the last one is frame 0.

## Effects

| `?effect=` | Pack # | What it does | Numbers? |
| --- | --- | --- | --- |
| `chart-morph` | 05 / 9 | Bars slim into hairlines while a monotone trend line traces the peaks; the peak gets a badge and a pulse rides the curve. | Yes |
| `dashboard-zoom` | 06 | Corner brackets lock onto one KPI tile, the rest of the dashboard dims, and the tile lifts into hero position. | Yes |
| `spring-stack` | 07 | A deck of three service cards fans out on a damped spring and floats through the hold. | No |
| `masked-type` | 09 | Liquid lime-to-violet colour rises inside a wireframe word along a wavy horizon; the subtitle slides up through a mask. | No |
| `shutter-slats` | 12 | Seven metallic-edged slats collapse in sequence to reveal the hero; a key light sweeps during the hold. | No |
| `flowing-paths` | 15 | Pulses travel Source → three Channels → Output, with a shockwave ring at each node. | No |
| `particle-logo` | 16 | About 2,400 particles spiral in to assemble the Alphastrix mark (the same paths as `app/icon.svg`), then a gleam crosses it. | No |
| `search-results` | 02 | A search pill expands, a query is typed, and three result cards rise with a hover state on the first. | Yes |

## Changing the content

Every piece of copy and data sits in the `CONTENT` object at the top of `motion.html`. Any key can be overridden from the URL or with `--param`:

- Strings: `?heroWord=RESULTS`, `?kpiFigure=1,284`, `?badge=Now booking`
- Lists: comma-separated, as in `?values=12,18,15,22,30,41` or `?channels=SEO,Email,Ads`
- Structured lists: JSON, as in `?results=[{"title":"...","sub":"...","metric":"...","unit":"..."}]`
- Hero image for shutter slats: `?image=<url>` (same-origin or CORS-enabled)

The default numbers are placeholders. Effects that show numbers carry an **Illustrative Data** tag until you pass `?verified=1` (or `--verified`). Only do that once the figures are real.

## Films

`films/` holds longer, narrated pieces built on the same drawing core. Their timing comes from the voiceover, so every visual beat lands on the spoken word.

**`ga4-seo.html`**: "How to use Google Analytics 4 for SEO", a 45-second vertical Reel (1080×1920) in seven scenes:

| Scene | Effect | Says |
| --- | --- | --- |
| Hook | Masked kinetic type | Your SEO is working. But can you prove it? |
| 1. Link Search Console | Breadcrumb path, pulse-linked nodes, glass lens on a queries table | Admin › Product links › Search Console links, then publish the reports |
| 2. Isolate organic traffic | Bar chart with a filter that dims everything but Organic Search | Traffic acquisition, filtered to Organic Search |
| 3. Find your winning pages | Landing page table under a glass lens | Engagement › Landing page |
| 4. Check engagement rate | Count-up gauges, one page working and one that needs a rewrite | GA4's engaged-session definition on screen |
| 5. Mark key events | Toggle `form_submit` to a key event, then pulses from Organic Search to a lead | Admin › Data display › Events |
| CTA | Particle logo assembly | Talk to Alphastrix Digital, @alphastrix_ |

Burned-in captions highlight the key terms, because most Reels are watched on mute. All report numbers are illustrative and labelled that way.

Rebuild it:

```bash
# 1. Voiceover + timing (Kokoro, Apache-2.0, runs offline). Voices: hm_omega, hm_psi, hf_alpha, hf_beta
python motion/films/voiceover.py --model kokoro-v1.0.fp16.onnx --voices voices-v1.0.bin --voice hm_omega
# 2. Video with audio
npm run motion -- --page motion/films/ga4-seo.html --size 1080x1920 --audio motion/films/ga4-seo.vo.wav
```

To use a different voice (an ElevenLabs export or a human read), record each sentence in `SCRIPT` inside `voiceover.py`, then rebuild `ga4-seo.vo.wav` and `ga4-seo.timing.js` with the same gaps. The visuals follow automatically.

## API (for your own render pipeline)

```js
await window.seek(4.4);     // draws the frame at 4.4s; resolves when it's on the canvas
window.motionInfo;          // { duration: 8, width, height, effect, effects, brand }
window.__motionReady;       // true once fonts and assets are loaded (in ?render mode)
```

`?render` turns off the animation loop and the UI, so the page only draws when you call `seek()`.

## Adding an effect

Add an entry to `EFFECTS` with a `name`, a `numbers` flag and a `draw(t)` function, plus an optional async `init()` for precomputation. Build timing from the shared helpers so the loop contract holds:

- `amt(t, delayIn, delayOut)` goes 0 → 1 during the move and back to 0 during the return, on the house curve.
- `env(t)` is the hold envelope, so micro-motion fades in and out instead of popping.
- `spring(t)` is the damped spring. Use it only when overshoot is the point.
- `rng(seed)` gives seeded randomness, so the same time always produces the same frame.
