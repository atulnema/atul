"""Map each script segment to its start/end time in a supplied voiceover.

Uses Whisper word timestamps (user/asr_words.json) and an ordered list of
anchor words: the first and last spoken word of every segment as Whisper
wrote it. Searches forward only, so repeated words resolve in order.
Writes user/segments_times.json  {seg_id: [start, end]}.
"""
import json, os, sys

BASE = sys.argv[1]
words = json.load(open(os.path.join(BASE, "user", "asr_words.json")))
ANCHORS = [
    ("h1", "बाई,", "रहो,"), ("h2", "रुग", "जाओ!"), ("h3", "ये", "है!"), ("h4", "और", "बतानगा!"),
    ("m1", "नाम", ".ai"), ("m2", "यहां", "है,"), ("f1", "AI", "-Speech,"), ("f2", "Voice", "Cloning,"),
    ("f3", "Voice", "Changer"), ("f4", "और", "dubbing"), ("m3", "जैसे", "Features."),
    ("m4", "बस", "डालो,"), ("m5", "और", "दो!"), ("m6", "अपनी", "करो,"), ("m7", "आलग", "करो,"),
    ("m8", "और", "बनाउ!"), ("r1", "लेकिन", "है!"), ("r2", "इसका", "demo,"), ("r3", "बिना", "up"),
    ("r4", "और", "के"), ("r5", "try", "हो!"), ("c1", "तो", "की?"), ("c2", "वेबसाइत", ".ai"),
    ("c3", "सेव", "है!"),
]
cur, out = 0, {}
for sid, a, b in ANCHORS:
    i = next(k for k in range(cur, len(words)) if words[k][2] == a)
    j = next(k for k in range(i, len(words)) if words[k][2] == b)
    out[sid] = [words[i][0], words[j][1]]
    cur = j + 1
json.dump(out, open(os.path.join(BASE, "user", "segments_times.json"), "w"), indent=1)
for k, v in out.items():
    print(f"{k:3s} {v[0]:6.2f} - {v[1]:6.2f}")
