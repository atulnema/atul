# The five prompts

The method is from the free guide "How I make Claude copy any creator's editing style" by
@theabhaychopra. These are the same five steps, reworded to use this folder's scripts and
paths. Paste them one at a time into Claude Code, opened in `video-studio/`.

Before you start, put two files in `input/`:

- `input/reel.mp4`: one reel whose editing you love
- `input/me.mp4`: your own clip (a talking-head video is the easiest start)

Replace `paper` below with a short name for the style.

---

## 1. Study the reel

```
Here is a reel I love: input/reel.mp4. Study its editing style thoroughly. Measure it,
don't eyeball it. Use the scripts in scripts/ for every number.

1. Make contact sheets at 3 frames a second and read every beat.
2. Grab lossless frames of each kind of graphic, then sample the exact hex colours of
   the text, boxes and backgrounds.
3. Measure every text element from the pixels: size, position, alignment, letter spacing.
4. Identify the fonts by score: fetch 5 to 10 candidate fonts, run font_match.py on a
   cropped word, and pick the winner by its number, not by how it looks.
5. Time every animation and transition frame by frame with motion.py: how long, which
   easing, what moves.
6. Measure the colour grade from the footage only, excluding the graphics.

Copy src/styles/_template to src/styles/paper and write everything up in its STYLE.md,
with real numbers in every table and the evidence for each.
```

## 2. Build the pieces to those numbers

```
Fill src/styles/paper/tokens.ts from STYLE.md and register the style in
src/styles/index.ts. Copy the winning font files to public/fonts/. If the reel has a
graphic the existing components can't express, build a new component for it.

Then rebuild 3 to 4 frames of the original reel with the Rebuild composition and put
each one next to the real frame with compare.py. Fix anything more than 3 px off and
run it again. Keep going until every frame passes, and log the results in the Rebuild
check table of STYLE.md.
```

## 3. Match the colour grade

```
Build a LUT that moves input/me.mp4 onto the reel's look: grade.py lut, excluding the
reel's graphics, saved as src/styles/paper/look.cube. Keep skin natural: if my face ends
up darker than in the reel, lift it. Show me before / after / the original side by side.
```

If the reel's room is much brighter or darker than yours, ask for half strength:
`Rebuild the LUT at --strength 0.5.`

## 4. Edit your video in the style

```
Now edit input/me.mp4 in the paper style.

1. cut.py: remove every pause longer than 0.12 s and bake in the LUT.
2. transcribe.mjs on the cut file for word-level captions.
3. Rewrite src/compositions/Edit.tsx: captions in the style, and graphics that each come
   in on the word that names them, one graphic at a time.
4. Add a quiet music bed and small sound hits if I have put any in public/audio/, and
   mix to -14 LUFS.

Render a half-size draft and show me a frame every 2 seconds.
```

## 5. Check before you post

```
Before I post: run qc.py on the draft. Look at the contact sheet, list anything that pops
in or vanishes in a single frame, check the loudness, and fix what's off. Then render
the final in 4K and run qc.py on that too.
```

---

## Next video, same style

A saved style is `src/styles/<name>/` (tokens, STYLE.md, LUT) plus its fonts in
`public/fonts/`. For the next video you only need prompt 4, and prompt 3 again if the
new clip was shot in different light.

## House rules

- Credit the original creator on screen and in your caption whenever you show their reel.
- An editing style is fonts, colours, layout and timing. Do not reuse a creator's footage,
  music, logo or name as if it were yours.
- Check font licences before posting commercial work. Google Fonts are free to use; a
  commercial font needs its own licence even if a free lookalike scored well.
- Show AI-made voice or video as AI-made, and clone only your own voice and face.
