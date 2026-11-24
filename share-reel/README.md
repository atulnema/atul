# Share Reel: "Make Them Feel Smart"

A 45-second, 9:16 Hinglish creator reel built from the Opus 5.5 master prompt. This project is the **motion-graphics layer** of that reel, built in Remotion and timed to the frame against a 124 BPM grid.

The presenter is a backlit stand-in for now. Drop in the real footage and every camera move, caption and effect plays on top of it.

## Why this is split into two jobs

The master prompt asks one AI video model for 45 seconds of continuous footage, Hinglish lip-sync, readable kinetic typography, UI mockups and a working odometer, all in one generation. No current generator can deliver that reliably:

- **Clip length.** Most top models cap out at roughly 5–10 seconds per generation. A 45s single shot will either be refused or drift badly.
- **Text.** Generated on-screen text gets garbled. "EGO BOOST ≠ GROWTH" rendered inside a model is a coin flip.
- **Timing.** Beat-locked cuts at specific frames can't be prompted. They have to be edited.

So the reliable pipeline is:

1. **Generate clean presenter plates.** Short clips of the presenter only, with no text and no graphics (prompts below).
2. **Composite in this project.** Every caption, icon, transition and beat hit lives here as code, editable to the frame.

## Commands

```bash
npm i
npm run dev            # Remotion Studio preview
npm run render         # out/share-reel-preview.mp4 (with VO subtitles)
npm run render:clean   # out/share-reel-clean.mp4 (no burned-in VO subtitles)
```

On a Linux box without its own Chrome, point Remotion at a local headless shell:

```bash
npx remotion render ShareReel out/share-reel-preview.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell
```

Fonts (Montserrat, Inter) are self-hosted in `public/fonts`, so renders never depend on the network. The 😂 in the chat bubble uses the system colour-emoji font.

## Voiceover (ElevenLabs)

The VO is generated with ElevenLabs' free premade voice **Brian** on the `eleven_multilingual_v2` model. Hindi is written in Devanagari and English stays in Latin script, so each language is pronounced natively instead of romanised Hindi read with an English accent. The romanised Hinglish you see in the subtitles is kept separately in `generate-voiceover.ts`.

```bash
ELEVENLABS_API_KEY=your_key node --experimental-strip-types generate-voiceover.ts
# behind an HTTPS proxy, also set NODE_USE_ENV_PROXY=1
```

- Writes `public/voiceover/<line>.mp3` and `src/voiceover.json`. Each line's start time is set in `VO_START` in `src/Main.tsx`.
- **Safe to re-run.** Lines that already have an MP3 are skipped, so credits only go to missing lines. Delete an MP3 to regenerate it.
- New lines also save word timestamps, and the subtitle highlighting follows them.
- To change the voice, set `VOICE_ID=...`. Free-plan API keys can only use premade voices. An Indian-accented library voice or a clone of your own voice needs a paid plan.

**Current status:** lines 01–08 are generated. Lines 09–11 ("Mere customer ko…", "Bas yeh ek psychology…", "…very, very, very quickly") are still missing because the free monthly quota ran out. Their subtitles still show. Re-run the script once credits reset or are topped up (about 190 credits), then re-render.

## Dropping in real footage

1. Cut the presenter takes into one 45-second, 1080×1920, 30fps file that follows the timeline below.
2. Save it as `public/presenter.mp4`.
3. Set `presenterSrc: "presenter.mp4"` in `src/Root.tsx` (or in the Studio props panel).

Every crash zoom, micro-zoom, whip, vertigo push and split-screen crop in `src/Main.tsx` then applies to your footage.

**Two things still need work once real footage lands:**

- **Text behind the shoulders (0:33).** The 2.5D "MAKE THEM FEEL SMART" layer only sits behind the stand-in, because the stand-in is drawn in layers. Real footage needs a subject matte (rotoscope or an AI background remover) passed in as a second video and layered above `GiantText`.
- **Cafe B-roll (0:21).** The bottom half of the split-screen is a drawn cafe scene with a phone forwarding a reel. Swap the `Cafe` component in `src/scenes/S5Chat.tsx` for a `<Video>` of the real B-roll.

## Timeline (30fps, 1350 frames)

| Time | Frames | Scene | File |
|---|---|---|---|
| 0:00–0:07 | 0–210 | Crash-zoom hook, Like/Comment icons, red strikethrough, glass shatter, EGO BOOST ≠ GROWTH, mask wipe + whip-zoom out | `S1Likes.tsx` |
| 0:07–0:12 | 210–360 | Air tap, glossy paper plane with light rays, yellow brush on SHARE, dolly through the icon | `S2Plane.tsx` |
| 0:12–0:15 | 360–450 | Isometric phone orbit, 5 neon share trails to avatars, green spike graph, glass pill | `S3Orbit.tsx` |
| 0:15–0:21 | 450–630 | Reverse crash to the eyes, 100→106→112% micro-zoom cuts, holographic THE BIGGEST HACK badge, bouncy PLAYFULLY INSULT THEM | `S4Hack.tsx` |
| 0:21–0:27 | 612–822 | Split-screen slide-up, cafe B-roll, spring-physics DM bubble with typing dots, word glow and blue ticks, whip-pan exit | `S5Chat.tsx` |
| 0:27–0:33 | 810–990 | 25% background dim, vertigo dolly, frosted bulb card, wide-tracked THE REAL QUESTION | `S6Question.tsx` |
| 0:33–0:38 | 990–1140 | Giant parallax text behind the presenter, word-by-word caption with 1.35× gold SMART, riser plunge into a white flash | `S7Smart.tsx` |
| 0:38–0:45 | 1140–1350 | 3D profile card with mechanical odometer 0→100,000, notification cascade, 0.4s flash-cut montage, pull-back, 0 → 100K lockup, VERY. VERY. VERY. QUICKLY. on the beat, cut to black | `S8Payoff.tsx` |

Camera moves, flashes, chromatic-aberration hits and the whip blur are all in `src/Main.tsx` as plain data arrays, so retiming means editing numbers, not hunting through components.

## Presenter plate prompts (image-to-video)

Generate one reference still of the presenter first, then run every clip below as **image-to-video from that still** so his face, shirt and set stay consistent. Add this suffix to every prompt:

> Vertical 9:16. Clean plate: no on-screen text, no captions, no graphics, no logos. Shot on Sony FX3, 35mm f/1.4, shallow depth of field, warm tungsten Rembrandt key, navy-teal rim light, vertical amber-to-cyan LED tube camera-left, soft bokeh bookshelf, matte-black podcast mic in the lower foreground, subtle 16mm grain, gentle handheld drift.

**Reference still**
> Charismatic Indian male digital strategist, early 30s, sharp features, well-groomed short beard, tailored matte-black crew-neck t-shirt, minimal silver watch, seated in a moody high-end creator studio, medium shot, looking into the lens with quiet confidence.

| Clip | Length | Prompt | Line he speaks |
|---|---|---|---|
| A | 7s | Medium shot. He leans toward the lens with his index finger raised, high-conviction delivery, expressive eyebrows. At 3.5s he swipes his right hand horizontally across the frame. | "Koi bhi content likes aur comments ke liye mat banao, kyunki ye sirf ego boost karte hain, growth nahi." |
| B | 5s | Tight medium close-up. He taps the air in front of his chest with one finger, eyes following the tap, then looks back to the lens with a raised eyebrow. | "Content sirf isliye banao ki ye dusre ko bheja jaye. Kyu?" |
| C | 3s | Close-up on his eyes and face, a sharp, knowing look into the lens. | "Kyunki algorithm ka sabse bada signal sirf 'Shares' hai." |
| D | 6s | Medium close-up. A conspiratorial smirk toward the lens, leaning in slightly as if sharing a secret. | "Aur iska sabse bada hack pata hai kya hai? Apni audience ko aisa mauka do ki woh video bhej kar saamne wale ko playfully insult kar sake..." |
| E | 6s | Medium shot. He grins and points downward toward the bottom of the frame, playful energy. | "...jaise: 'Abe tu kitna dumb hai, tereko ye nahi pata!'" |
| F (B-roll) | 6s | Candid, moody 35mm shot of a young Indian man in a dimly lit cafe, laughing mischievously as he forwards a Reel on his smartphone, warm pendant-light bokeh. | none |
| G | 6s | Slow push-in, medium close-up. Calmer and more deliberate. The background is slightly darker and the key light isolates his face. | "Toh asli sawaal jo aapko khud se poochna chahiye, woh ye hai..." |
| H | 5s | Medium shot. He opens both palms toward the lens with intense conviction. | "'Mere customer ko main kaise smart feel karau, taaki woh dusre logon ko mera content share kare?'" |
| I | 7s | Medium shot. A confident nod, then he points straight into the lens with a knowing smile and holds it. | "Bas yeh ek psychology crack kar lo, and you will go 0 to 100k very, very, very quickly." |

**Lip-sync tip:** lip-sync each clip to its slice of the generated VO in `public/voiceover/` (or a real recorded take). Generated Hinglish speech and accent are still the weakest link in most models, and one continuous human read keeps the energy consistent across cuts.

## SFX and music cue sheet

124 BPM: one beat = 0.484s = 14.5 frames. Every hit below sits on, or within one frame of, the beat grid.

| Time | Frame | Cue |
|---|---|---|
| 0:00.5 | 15 | Kick + whoosh: crash-zoom punch-in |
| 0:00.6 | 19 | Two UI pops: Like/Comment icons |
| 0:01.5 | 44 | Snare + slash: red strikethrough |
| 0:03.4 | 102 | Glass shatter + whoosh: hand swipe |
| 0:03.9 | 116 | Sub-bass hit: EGO BOOST ≠ GROWTH slam |
| 0:06.8 | 203 | Whoosh: mask wipe + whip-zoom out |
| 0:07.5 | 224 | Soft chime: plane materialises |
| 0:09.3 | 280 | Brush swipe: SHARE highlight |
| 0:11.5 | 345 | Riser into whoosh: tunnel through plane |
| 0:12.6 | 378 | iOS tap: share button |
| 0:13.1 | 394 | 5 fast zips: share trails |
| 0:15.0 | 450 | Snare: reverse crash zoom |
| 0:15.7 | 470 | Mechanical click-lock: THE BIGGEST HACK |
| 0:16.0 / 0:16.5 / 0:18.5 / 0:19.0 | 480 / 495 / 555 / 570 | Kick: micro-zoom cuts |
| 0:18.2–0:18.8 | 546–564 | Bouncy pops: PLAYFULLY INSULT THEM |
| 0:20.5 | 615 | Whoosh up: split-screen slide |
| 0:21.4 | 642 | Bubble pop: chat bubble + typing |
| 0:22.2 | 667 | Typing resolves: message text glows in |
| 0:24.3 | 728 | Tap + whoosh: "Send" in the B-roll phone |
| 0:25.1 | 752 | Double-tick ping |
| 0:27.0 | 810 | Whip-pan + deep sub-bass drop; music strips to pulsing sub |
| 0:27.8 | 834 | Glass slide: bulb card |
| 0:33.0 | 990 | Low boom: giant text |
| 0:37.2 | 1116 | Riser accelerates |
| 0:38.0 | 1140 | Beat drop + white flash |
| 0:38.2–0:40.6 | 1146–1218 | Odometer ticks accelerating, slam + glow burst at 1218 |
| 0:41.0–0:42.6 | 1230–1278 | Kick on every 0.4s montage cut |
| 0:43.1 / 0:43.5 / 0:44.0 / 0:44.5 | 1292 / 1306 / 1321 / 1336 | Kick per word: VERY. VERY. VERY. QUICKLY. |
| 0:44.9 | 1346 | Final kick, cut to black |
