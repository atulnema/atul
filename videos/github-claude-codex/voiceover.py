# Builds voice.wav: one Kokoro TTS line per scene, placed at the scene's start time.
# Usage: python3 voiceover.py <model_dir> <out_wav> [voice]
import sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

model_dir, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
k = Kokoro(f"{model_dir}/kokoro-v1.0.onnx", f"{model_dir}/voices-v1.0.bin")

TOTAL = 30.0
# (start, latest end, text) -- end is when the scene starts fading out
LINES = [
    (0.25, 3.5,  "Here's how to use your GitHub repo with Claude, or Codex."),
    (3.55, 9.0,  "First, connect GitHub, and choose which repos the agent can access."),
    (9.35, 15.0, "Next, pick your repo and branch, and describe the task clearly."),
    (15.35, 21.0, "The agent clones your code into a sandbox, makes the changes, and runs your tests."),
    (21.35, 26.4, "Then, review the diff, and open a pull request."),
    (26.65, 29.8, "Or just run Claude or Codex from your terminal."),
]

sr = None
track = None
for start, end, text in LINES:
    speed = 1.05
    while True:
        audio, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
        # trim leading/trailing near-silence
        idx = np.where(np.abs(audio) > 0.01)[0]
        audio = audio[max(idx[0] - int(.02 * sr), 0): idx[-1] + int(.08 * sr)]
        dur = len(audio) / sr
        if start + dur <= end or speed >= 1.35:
            break
        speed += 0.05
    if track is None:
        track = np.zeros(int(TOTAL * sr), dtype=np.float32)
    s = int(start * sr)
    n = min(len(audio), len(track) - s)
    track[s:s + n] += audio[:n]
    print(f"{start:5.2f}s  {dur:4.2f}s  speed={speed:.2f}  ends {start+dur:5.2f} (limit {end})  {text}")

track = track / max(1e-6, np.abs(track).max()) * 0.89
sf.write(out, track, sr)
print("wrote", out, sr)
