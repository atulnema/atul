# Alphastrix Digital — Showreel

A 15-second motion graphics showreel, built in code with [Remotion](https://www.remotion.dev).
1920×1080, 60 fps, cut to an original 128 BPM soundtrack (8 bars = exactly 15 seconds).

## Structure

| Time | Scene | What happens |
| --- | --- | --- |
| 0.0 – 3.75s | `Open` | The mark is drafted on a blueprint and inked, the camera punches through it, then "We build brands that grow." one word per beat |
| 3.75 – 7.5s | `Services` | SEO & Content, Performance Ads, Web Design & Build, Brand & Social. Two beats each, each with its own UI animation |
| 7.5 – 11.25s | `Engine` | A 3D wall of capabilities, then the process as a growth curve that goes vertical |
| 11.25 – 15.0s | `Close` | "Strategy and execution under one roof", implosion, end card |

```
src/
  Showreel.tsx      the full 900-frame timeline
  Root.tsx          composition registry (each scene is also previewable on its own)
  scenes/           one file per scene
  components/       mark, per-character type reveal, grain, HUD, grid
  lib/theme.ts      brand colours and fonts (same tokens as the website)
  lib/anim.ts       beat clock, easings, wipes
scripts/
  make_music.py     synthesises the soundtrack (numpy + scipy) into public/music.wav
```

Timing is written in beats, not frames, so every move lands on the music. `useBeat()` returns the position inside a scene; `tw(b, from, to, ease)` is a clamped 0 → 1 tween between two beats.

## Commands

```bash
npm i                 # install
npm run dev           # open Remotion Studio and scrub the timeline
npx remotion render Showreel out/alphastrix-showreel.mp4 --crf=16
python3 scripts/make_music.py   # regenerate the soundtrack (needs numpy, scipy)
```

If Remotion cannot download its own headless browser (sandboxes, CI), point it at any Chrome binary:

```bash
REMOTION_BROWSER=/path/to/chrome-headless-shell npx remotion render Showreel out/alphastrix-showreel.mp4
```

## Notes

- Copy comes from `lib/site.ts` in the website. Placeholder stats, case studies and testimonials are deliberately not used.
- Fonts (Inter Tight, Instrument Serif, JetBrains Mono) are bundled in `public/fonts` under the SIL Open Font License.
- Remotion is free for individuals and companies of up to three people. Larger teams need a [company license](https://www.remotion.dev/docs/license).
