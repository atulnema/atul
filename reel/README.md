# Alphastrix Digital: Instagram reel

A 39-second vertical reel (1080×1920, 30fps) built with [Remotion](https://remotion.dev). It walks through the four Alphastrix services and ends on a "Comment GROWTH" call to action.

## Commands

```bash
npm install
npm run studio   # live preview and scrubbing in the browser
npm run render   # writes out/alphastrix-reel.mp4
```

## Editing

| What | Where |
| --- | --- |
| Captions, timings, handle, CTA word, numbers | `src/content.ts` |
| Colors and fonts | `src/theme.ts` |
| Scene layouts and motion | `src/scenes.tsx` |
| Header, progress dots, captions, outro | `src/Reel.tsx` |

> **Before posting:** the numbers (120+ projects, 3.4x ROAS and so on) come from the website's placeholder stats. Swap them for real results in `src/content.ts`.

## Voiceover

`public/voiceover.wav` is the ElevenLabs narration. Scene cuts sit in its pauses, and caption timings come from its speech segments, listed in `SEGMENTS` in `src/content.ts`. If you swap in a new recording, re-measure the pauses with:

```bash
ffmpeg -i public/voiceover.wav -af silencedetect=noise=-38dB:d=0.18 -f null - 2>&1 | grep silence_
```

Then update `SEGMENTS`, the scene `from`/`dur` values and `AUTOPILOT_AT`.
