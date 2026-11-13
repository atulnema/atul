# Dubz Up pitch film

A 32 second, 1920x1080 motion graphics pitch for Dubz Up, built in code with [Remotion](https://www.remotion.dev). Everything on screen is drawn with React, SVG and CSS. The soundtrack is synthesised by a Node script, so there are no stock assets and nothing to license apart from Remotion itself.

## Run it

```bash
npm install
npm run dev      # generates the soundtrack, then opens Remotion Studio
npm run render   # writes out/dubz-up-pitch.mp4
```

In a sandbox with no internet access, Remotion cannot download its own browser. Point it at a local headless Chrome instead:

```bash
REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render
```

## Story

The film runs at 120 BPM. One bar is two seconds, which is 60 frames, and every scene is a whole number of bars so each cut lands on a downbeat.

| Time | Scene | What happens |
| --- | --- | --- |
| 0s | Hook | "The world speaks 7,000+ languages. Your video speaks one." |
| 4s | Problem | Dubbing is slow, pricey and off-brand |
| 8s | Reveal | Logo sting and the three-part promise |
| 12s | How it works | Drop a video, clone the voice, pick languages, publish |
| 20s | Market | TAM, SAM and SOM |
| 24s | Traction | Growth chart, headline stats, business model |
| 28s | Ask | "Every voice. Everywhere." and the round |

## Before you show this to anyone

Dubz Up is presented here as an AI dubbing product, and **the market sizes and traction figures are placeholders**. They were written for the storyboard and are not real data. While they are in place, the market and traction scenes carry a small "Illustrative figures" tag.

All copy and every number live in `src/content.ts`. Put your own figures in, then set `showIllustrativeNote` to `false`.

## Where things are

```
src/content.ts        every word and number in the film
src/theme.ts          colours, fonts, scene lengths
src/Main.tsx          scene order, wipes between scenes, soundtrack
src/scenes/           one file per scene
src/components/       stickers, kinetic type, speech bubbles, the host avatar, logo, wipes
src/lib/anim.ts       spring, easing and beat helpers
scripts/make-audio.mjs  the soundtrack synthesiser
```

Each scene is also registered as its own composition, so it can be previewed or rendered alone, for example `npx remotion render HowItWorks out/how.mp4`.

To change the pacing, edit `SCENES` in `src/theme.ts`. If you change the scene lengths, move the matching cues in `scripts/make-audio.mjs` too, since the sound effects are placed by hand against the picture.
