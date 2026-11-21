# Using a GitHub repo with Claude or Codex (30-second video)

| File | What it is |
| --- | --- |
| `github-repo-claude-codex-30s.mp4` | Final video with voiceover, background music and UI sound effects |
| `github-repo-claude-codex-30s-silent.mp4` | Same video with no audio, for dubbing your own voiceover |

Both are 1920×1080, 30 fps, 30 seconds. The final mix is about -15 LUFS with peaks under -1 dBFS.

## Scenes

| Time | Scene |
| --- | --- |
| 0–3s | Title |
| 3–9s | Step 01: Connect GitHub (claude.ai/code or chatgpt.com/codex) |
| 9–15s | Step 02: Pick the repo and branch, then describe the task |
| 15–21s | Step 03: The agent clones the repo, edits the code and runs tests |
| 21–26s | Step 04: Review the diff and open a pull request |
| 26–30s | Terminal option: `claude` or `codex` inside the repo |

## Voiceover script

Each line starts when its scene appears.

| Starts at | Line |
| --- | --- |
| 0.25s | Here's how to use your GitHub repo with Claude, or Codex. |
| 3.55s | First, connect GitHub, and choose which repos the agent can access. |
| 9.35s | Next, pick your repo and branch, and describe the task clearly. |
| 15.35s | The agent clones your code into a sandbox, makes the changes, and runs your tests. |
| 21.35s | Then, review the diff, and open a pull request. |
| 26.65s | Or just run Claude or Codex from your terminal. |

## Audio

- **Voice:** generated with [Kokoro](https://github.com/hexgrad/kokoro) (Apache-2.0) via `kokoro-onnx`, voice `af_heart`. See `voiceover.py`.
- **Music and sound effects:** original, synthesized in code with numpy in `music.py`. No samples or licensed tracks are used.

## Re-rendering

The video is an HTML animation (`scene.html`) captured frame by frame with Playwright and encoded with ffmpeg.

```bash
# 1. Video (silent)
node render.js silent.mp4             # full video
node render.js x --stills             # preview stills only

# 2. Voiceover (needs: pip install kokoro-onnx soundfile, plus kokoro-v1.0.onnx
#    and voices-v1.0.bin from the kokoro-onnx GitHub releases)
python3 voiceover.py <model_dir> voice.wav af_heart

# 3. Music and sound effects
python3 music.py .

# 4. Mix and combine
ffmpeg -i silent.mp4 -i voice.wav -i music.wav -i sfx.wav -filter_complex "\
[1:a]aresample=44100,aformat=channel_layouts=stereo,highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=100:makeup=1,volume=8dB,asplit=2[v][vsc];\
[2:a]volume=-11.5dB[m];[m][vsc]sidechaincompress=threshold=0.035:ratio=5:attack=30:release=500[mduck];\
[3:a]volume=-1dB[s];\
[v][mduck][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.84:attack=5:release=50:level=false[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 30 -movflags +faststart final.mp4
```

Requires Node, Playwright with Chromium, ffmpeg and Python 3 with numpy. Edit text, colors or timings in `scene.html`, and the spoken lines in `voiceover.py`. To try another voice, pass a different Kokoro voice name, such as `am_michael`.
