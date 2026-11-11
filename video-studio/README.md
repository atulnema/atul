# Video studio

Take one reel whose editing you love, measure it, rebuild its graphics in code, and edit
your own video in that style. The method comes from @theabhaychopra's guide "How I make
Claude copy any creator's editing style"; this folder is the working setup for it.

The idea in one line: Claude does not "get inspired" by the reel. It measures colours,
fonts, sizes and timing from the pixels, builds every graphic to those numbers, checks
its copy against the original, and only then edits your video.

## What you need

- Node 20+ and Python 3.10+ with `numpy` and `Pillow` (`pip install -r requirements.txt`)
- `ffmpeg` and `ffprobe` on your PATH
- One reference reel and one clip of your own, as `.mp4`

```bash
cd video-studio
npm install
```

## How to use it

1. Put the reel at `input/reel.mp4` and your clip at `input/me.mp4`.
2. Open Claude Code in this folder.
3. Paste the prompts from [PROMPTS.md](PROMPTS.md), one at a time.

`CLAUDE.md` tells Claude which script answers which question, so the prompts stay short.

## The five steps and what runs them

| Step | What happens | Tools |
| --- | --- | --- |
| 1. Study the reel | Contact sheets, hex colours, text positions, fonts picked by score, animations timed per frame, all written to `STYLE.md` | `frames.py`, `colors.py`, `measure_text.py`, `fetch_font.py`, `font_match.py`, `motion.py`, `grade.py measure` |
| 2. Build the pieces | Numbers go into `tokens.ts`; reel frames are rebuilt and compared until they match within 3 px | `Rebuild` composition, `compare.py` |
| 3. Match the grade | A LUT that moves your clip onto the reel's look, with a skin check | `grade.py lut`, `grade.py compare` |
| 4. Edit your video | Pauses cut, LUT baked in, captions and graphics laid over | `cut.py`, `transcribe.mjs`, `Edit` composition |
| 5. Check before posting | Contact sheet, single-frame glitches, abrupt pops, loudness | `qc.py`, `loudness.py` |

## Commands

```bash
npm run dev      # Remotion Studio: preview and nudge the edit
npm run board    # render the style board (every piece of a style, in motion)
npm run draft -- --props='{"style":"paper","footage":"footage/me.mp4","captions":"footage/me.captions.json"}'
npm run final -- --props='...same props...'
npm run lint
```

`draft` renders at half size. `final` renders at 2x, which is 4K from a 1080x1920
canvas. If your reel is a different size, set `--scale` to target width / canvas width.

Every script explains itself: `python3 scripts/grade.py --help`.

## Layout

```
input/                 your reel and clip (not committed)
work/                  frames, sheets and measurements (not committed)
fonts/                 candidate fonts for scoring (not committed)
scripts/               the measuring tools
public/fonts/          the fonts a style actually uses
public/footage/        cut and graded clips, captions (not committed)
src/styles/<name>/     a saved style: tokens.ts, STYLE.md, look.cube
src/components/        Title, Captions, Label, Card, WhipBlur, Footage
src/compositions/      Edit (your video), Rebuild (frame matching), StyleBoard
```

## Saving and reusing a style

A style is its folder in `src/styles/` plus its font files in `public/fonts/`. Commit
both. The next video in that style needs only prompt 4, plus a fresh LUT (prompt 3) if
the clip was shot in different light, because a LUT maps one clip onto the look.

`src/styles/_template/` is a starting point with placeholder values. It is not a real
style.

## Good to know

- **Captions** come from Whisper.cpp running on your machine. The first run downloads and
  builds it, plus a model of about 1.5 GB (`--model base.en` is far smaller). Any
  word-level transcript works if you save it in Remotion's `Caption` format: a JSON array
  of `{ "text": " word", "startMs": 0, "endMs": 320, "timestampMs": 0, "confidence": 1 }`.
- **Your room changes the look.** If your footage will not fully match the grade, build
  the LUT at `--strength 0.5` and let the graphics carry the style.
- **Text over busy footage** is harder to measure than text on a flat box. Pick frames
  where the background behind the text is calm, and keep boxes tight.
- **The pop check lists caption changes too**, since captions switch between two frames by
  design. Pass `qc.py --ignore x,y,w,h` with the caption box to leave them out.
- **Cloud sandboxes** may block the browser download Remotion does on first render. Set
  `REMOTION_BROWSER=/path/to/chrome-headless-shell` and it uses that instead.
- **Remotion** is free for individuals and small teams; larger companies need a licence.
  See remotion.dev/license.

## House rules

Credit the original creator whenever you show their reel. Copy the craft (fonts, colours,
layout, timing), not their footage, music, logo or name. Check font licences before
commercial use. Label AI-made voice and video as AI-made, and clone only your own.
