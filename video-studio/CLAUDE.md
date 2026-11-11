# Video studio: working notes for Claude

This folder turns one reference reel into a reusable editing style, then edits the
user's own clip in that style. The workflow is the five prompts in `PROMPTS.md`.

## The rule

Measure, don't eyeball. Every number in a style's `tokens.ts` must trace back to a row
in its `STYLE.md`, and every row to a script run on the reel's pixels. If something
cannot be measured, say so in STYLE.md instead of guessing.

## Which script answers which question

Run from `video-studio/`. Each script prints its usage with `--help`.

| Question | Script |
| --- | --- |
| What happens in the reel, beat by beat? | `scripts/frames.py sheets input/reel.mp4` (read the sheets in `work/reel/sheets/`) |
| I need a frame to measure from | `scripts/frames.py grab input/reel.mp4 -t 2.0` (lossless PNG) |
| What colour is this? | `scripts/colors.py FRAME --at x,y` or `--box x,y,w,h --text` |
| Where is this text, how big, how spaced? | `scripts/measure_text.py FRAME --box x,y,w,h` |
| Which font, at what size? | `scripts/fetch_font.py "Family"` then `scripts/font_match.py FRAME --box ... --text "word"` |
| How long is this animation, what easing? | `scripts/motion.py input/reel.mp4 --start a --end b --box ... --fg "#hex"` |
| How long is this blur transition? | `scripts/motion.py input/reel.mp4 --start a --end b` (read the `blur` line) |
| What is the grade? | `scripts/grade.py measure input/reel.mp4 --exclude <graphics>` |
| Build and check the LUT | `scripts/grade.py lut` then `scripts/grade.py compare` |
| Does my rebuild match the reel? | `npx remotion still Rebuild ...` then `scripts/compare.py ORIGINAL REBUILT --box ... --fg "#hex"` |
| Cut pauses, bake the LUT | `scripts/cut.py input/me.mp4 --lut src/styles/<name>/look.cube` |
| Captions | `node scripts/transcribe.mjs public/footage/me.mp4` |
| Is it ready to post? | `scripts/qc.py out/draft.mp4 --ignore <caption box>` |
| Loudness | `scripts/loudness.py FILE` (add `--fix OUT` to normalise to -14 LUFS) |

## Things that go wrong

- Measure from `grab` PNGs only. Contact sheets are scaled JPEGs.
- Boxes are `x,y,w,h` in the video's own pixels. A box for text should hold the text and
  its background, nothing else.
- `motion.py --fg` tracks a colour. If it warns that the ink touches the box edge, the
  footage shares that colour: lower `--tol` or tighten `--box`.
- A font score under about 0.6 means the real font is not among the candidates. Fetch
  more candidates before settling.
- Measure the grade on footage only: pass `--exclude` for every caption box and title,
  and `--range` to stay off full-screen cards.
- Transcribe the file `cut.py` wrote, never the original, or caption times will not
  match the edit.
- The canvas is the reel's resolution, so measured pixels are used as they are. Drafts
  render with `--scale=0.5`; 4K finals from a 1080-wide canvas with `--scale=2`.
- Lengths in tokens are pixels on the canvas. Durations are seconds, converted with the
  footage's frame rate, so do not store frame counts.

## Remotion

- `src/styles/<name>/tokens.ts` holds a style's numbers; register it in `src/styles/index.ts`.
- `src/components/` are style-driven pieces: Title, Captions, Label, Card, WhipBlur, Footage.
- `src/compositions/Edit.tsx` is rewritten per video. One `<Sequence>` per graphic with
  hard-coded `from` and `durationInFrames`, one graphic on screen at a time, each starting
  on the frame of the word that names it.
- Animate with `useCurrentFrame()` and `interpolate()` only. CSS transitions do not render.
- Fonts load from `public/fonts/` through `useStyleFonts`; use the exact file that
  `font_match.py` scored.
- If a render fails trying to download a browser, set `REMOTION_BROWSER` to an installed
  Chrome or chrome-headless-shell binary.

## Always

- Show the user evidence: the contact sheet, the before / after / original grade, the
  compare output. Do not report a match that `compare.py` has not passed.
- Render a half-size draft and run `qc.py` before any full-size render.
- Follow the house rules at the end of `PROMPTS.md` (credit, licences, AI disclosure).
