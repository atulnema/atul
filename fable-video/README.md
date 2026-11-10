# Claude Fable 5.2 launch video

A 38-second, 1920×1080 motion piece announcing Claude Fable 5.2, built with [Remotion](https://www.remotion.dev).

## Storyboard

| # | Scene | What moves |
|---|-------|-----------|
| 0 | Cold open | Terminal typewriter: "Something new just went live." A light line charges across the frame |
| 1 | Title reveal | Flash, double shockwave, 70-particle burst, camera shake, letters blur in one by one, light sweep, pulsing "Now live" pill |
| 2 | Capability | Lines rise out of a mask: "The most capable / widely released / Claude model." Underline draws in |
| 3 | Context window | Counter runs 0 to 1,000,000 with a glowing progress bar, then pops |
| 4 | Max output | "128K" slams in from 2.4× scale with motion blur over streaming text bars |
| 5 | Pricing | Cards tilt up in 3D, old prices get struck and pushed aside, new prices drop in: $8 / $40 per million tokens |
| 6 | Reasoning | Live neural-network field, "Thinking is always on.", effort slider sweeps low → max |
| 7 | Agentic | Six-step timeline (Plan → Ship) checks off as a glowing line travels across |
| 8 | Outro | `model: "claude-fable-5-2"` types out, card lifts away, title lockup with light sweep, fade to black |

A shared background (drifting warm glows, parallax dot grid, floating dust, film grain) runs under every scene, so cuts feel like one continuous world.

## Facts on screen

- Anthropic's most capable widely released model
- 1M-token context window, 128K max output tokens
- $8 input / $40 output per million tokens, down from $10 / $50 on Claude Fable 5.1 (20% lower)
- Thinking is always on; effort levels low, medium, high, xhigh, max
- Built for demanding reasoning and long-horizon agentic work
- Model ID: `claude-fable-5-2`

## Run it

```bash
npm install
npm run dev                 # open Remotion Studio to preview and tweak
npx remotion render FableLaunch out/claude-fable-5-2-launch.mp4
```

In a sandbox without Remotion's Chrome download, add `--browser-executable=<path to chrome-headless-shell>`.

## Where things live

- `src/Composition.tsx`: scene order, durations, transitions
- `src/Background.tsx`: the persistent animated backdrop
- `src/lib/motion.tsx`: reusable motion primitives (`BlurIn`, `SplitChars`, `MaskLine`, `CameraPush`, `LightSweep`, `Shockwave`)
- `src/lib/theme.ts`: colors and fonts (Fraunces is bundled in `public/fonts`, under the SIL Open Font License)
- `src/scenes/`: one file per group of scenes
