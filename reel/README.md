# Reel: "₹15,000 Social Media Manager → AI Agent"

Vertical (1080×1920) Hinglish reel built with [Remotion](https://remotion.dev). Light, clean UI-card style with a crimson accent and an original cartoon narrator.

## Pipeline

```bash
npm install
npm run sfx                                   # ElevenLabs sound effects -> public/sfx
npm run voice -- --reel payment --voice <voice_id>      # ElevenLabs voiceover + word timestamps
npm run voice -- --reel payment --audio my_take.mp3     # align your own recording (words must match 1:1)
npm run voice -- --reel payment --estimate              # fake timing, for layout work without audio
npm run studio                                          # live preview of every reel
npm run render -- Payment out/payment.mp4               # render one reel (Agent, Payment)
```

`ELEVENLABS_API_KEY` is read from the environment (sent as the `xi-api-key` header).
Node's fetch needs `NODE_USE_ENV_PROXY=1` behind an HTTPS proxy; the npm scripts set it.

## How it fits together

| File | Role |
| --- | --- |
| `src/reels/<id>/` | One folder per reel: `script.json`, `timing.json`, `cards.tsx`, `sfx.ts`. Registered in `src/reels/index.ts`. |
| `src/reels/<id>/script.json` | The script. Each word is `caption\|tts` (Roman Hinglish on screen, Devanagari for the voice). `*` highlights a word. |
| `scripts/voice.mjs` | Calls ElevenLabs `with-timestamps`, maps every word to its start/end, writes `src/reels/<id>/timing.json` + `public/<id>/voice.mp3`. |
| `src/timing.ts` | Turns timing into scene frame ranges; `useWordFrame()` lets cards sync events to spoken words. |
| `src/reels/<id>/cards.tsx` | One animated card per scene. |
| `src/components/Chrome.tsx` | Headline, word-by-word captions, avatar rig (lip-sync from audio amplitude), mic pill. |
| `src/components/Avatar.tsx` | The cartoon narrator (SVG, blink / mouth / brow / look controls). |
| `src/reels/<id>/sfx.ts` | Sound-effect cues placed relative to the voice. |

Edit the script, re-run `npm run voice`, and every caption, headline and card animation re-syncs automatically.
