# CVoice.ai — 45-second reel

Vertical 1080x1920 promo reel built with Remotion. The voiceover is generated locally with open-source TTS, and the music bed and SFX are synthesized in code, so there are no licensing questions on the audio.

## How it's put together

| Step | What happens | File |
|---|---|---|
| 1. Script | Each line of the script is one segment, with a caption version and a TTS version (English words spelled in Devanagari so the Hindi voice pronounces them naturally) plus the pause after it | `audio-src/segments.json` |
| 2. Voice | Microsoft neural Hindi voice `hi-IN-MadhurNeural` (+17% rate, +3 Hz pitch). Each scene is spoken in one pass so the delivery flows, and word-boundary events give exact line timings. The older open-source Chatterbox path is kept in `gen_vo.py` | `audio-src/gen_edge.py` |
| 3. Mix | Scene clips are trimmed, loudness-matched and placed with the pauses from step 1; then a 124 BPM bed and frame-synced SFX are synthesized and mixed | `audio-src/assemble.py --edge` |
| 4. Timeline | Step 3 also writes the frame-accurate timeline (scenes, segments, word timings, caption groups) that the video reads | `src/timeline.json` |
| 5. Video | 14 scenes, one visual metaphor per beat, custom whip / zoom / iris / blur / flash transitions | `src/Main.tsx`, `src/scenes/*` |

## Re-running

```bash
# voice (needs edge-tts + librosa; network access to speech.platform.bing.com)
python audio-src/gen_edge.py "$PWD/audio-src" +17% +3Hz all
python audio-src/assemble.py "$PWD" --edge

# video
npx remotion studio            # preview
npx remotion render CVoiceReel out/cvoice-reel.mp4
```

To change a line, edit `segments.json`, regenerate its scene with
`python audio-src/gen_edge.py <dir> +17% +3Hz <scene-id>`, then rerun `assemble.py --edge`. All scene timing follows automatically.
