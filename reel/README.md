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

The reel renders silent. The captions are timed for a natural Hinglish read, so you can record a voiceover straight over the MP4 in any editor, or drop an audio file into `public/` and add an `<Audio>` tag in `src/Reel.tsx`.
