# CVoice.ai — 45-second reel

Vertical 1080x1920 promo reel built with Remotion. The voiceover is generated locally with open-source TTS, and the music bed and SFX are synthesized in code, so there are no licensing questions on the audio.

## How it's put together

| Step | What happens | File |
|---|---|---|
| 1. Script | Each line of the script is one segment, with a caption version and a TTS version (English words spelled in Devanagari so the Hindi voice pronounces them naturally) plus the pause after it | `audio-src/segments.json` |
| 2. Voice | Chatterbox Multilingual (Hindi, high expressiveness) renders two takes per line, using a Kokoro `hm_omega` clip (`audio-src/voice_ref.wav`) as the voice reference | `audio-src/gen_vo.py` |
| 3. Pick + mix | Whisper scores each take against the script and keeps the cleaner one; lines are trimmed, loudness-matched and placed with the pauses from step 1; then a 124 BPM bed and frame-synced SFX are synthesized and mixed | `audio-src/assemble.py` |
| 4. Timeline | Step 3 also writes the frame-accurate timeline (scenes, segments, word timings, caption groups) that the video reads | `src/timeline.json` |
| 5. Video | 14 scenes, one visual metaphor per beat, custom whip / zoom / iris / blur / flash transitions | `src/Main.tsx`, `src/scenes/*` |

## Re-running

```bash
# voice (needs a Python 3.11 venv with chatterbox-tts, kokoro, faster-whisper)
python audio-src/gen_vo.py "$PWD/audio-src" "$PWD/audio-src/voice_ref.wav"
python audio-src/assemble.py "$PWD"

# video
npx remotion studio            # preview
npx remotion render CVoiceReel out/cvoice-reel.mp4
```

To change a line, edit `segments.json`, regenerate just that line with
`python audio-src/gen_vo.py <dir> <ref.wav> <segment-id>`, then rerun `assemble.py`. All scene timing follows automatically.
