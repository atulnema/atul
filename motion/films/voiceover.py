#!/usr/bin/env python3
"""Generate the GA4-for-SEO voiceover with Kokoro (Apache-2.0, runs offline) and write
the sentence timings the film syncs to.

    pip install kokoro-onnx soundfile
    # model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
    python motion/films/voiceover.py --model kokoro-v1.0.fp16.onnx --voices voices-v1.0.bin

Each sentence is synthesised on its own, so its start and end times are exact. The film
then estimates positions inside a sentence from character counts.

Swapping in a different voice (an ElevenLabs export, a human read): replace ga4-seo.vo.wav
and keep the sentence gaps, or re-run with --voice.
"""
import argparse, json, re
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
SR = 24000

# One entry per scene, one string per sentence. Captions show this text exactly.
SCRIPT = [
    ("hook", ["Your SEO is working.", "But can you prove it?", "Here's how to use Google Analytics 4 for SEO."]),
    ("gsc", ["Step one. Link Search Console.",
             "In Admin, open Product links, connect your property, and publish the Search Console reports.",
             "Now you can see the exact queries bringing people in."]),
    ("organic", ["Step two. Open Traffic acquisition, and filter to Organic Search."]),
    ("landing", ["Step three. The Landing page report shows your top search pages."]),
    ("engage", ["Step four. Watch engagement rate.", "A page that ranks but doesn't engage needs a rewrite."]),
    ("keyevents", ["Step five. Mark form submissions as key events, to see which pages bring leads."]),
    ("cta", ["Want this set up for your site?", "Talk to Alphastrix Digital."]),
]

# What the voice says when the caption spelling would be misread.
SAY = [(r"\bSEO\b", "S E O"), (r"\bAlphastrix\b", "Alpha-strix")]

LEAD, GAP, TAIL, END_HOLD = 0.30, 0.22, 0.42, 1.0   # seconds


def spoken(text):
    for pat, rep in SAY:
        text = re.sub(pat, rep, text)
    return text


def trim(audio, thresh=0.012, pad=0.04):
    idx = np.where(np.abs(audio) > thresh)[0]
    if not len(idx):
        return audio
    a, b = max(0, idx[0] - int(pad * SR)), min(len(audio), idx[-1] + int(pad * SR))
    return audio[a:b]


def voice_style(k, spec):
    """'hm_omega' or a blend like 'hm_omega:0.7,bm_george:0.3'."""
    if ":" not in spec:
        return spec
    parts = [p.split(":") for p in spec.split(",")]
    return sum(k.get_voice_style(name) * float(w) for name, w in parts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--voice", default="hm_omega")
    ap.add_argument("--lang", default="en-gb")
    ap.add_argument("--speed", type=float, default=1.1)
    ap.add_argument("--out", default=str(HERE / "ga4-seo.vo.wav"))
    ap.add_argument("--timing", default=str(HERE / "ga4-seo.timing.js"))
    args = ap.parse_args()

    from kokoro_onnx import Kokoro
    k = Kokoro(args.model, args.voices)
    style = voice_style(k, args.voice)

    t, track, scenes = 0.0, [], []
    for si, (sid, lines) in enumerate(SCRIPT):
        start = t
        t += LEAD
        out_lines = []
        for li, text in enumerate(lines):
            audio, sr = k.create(spoken(text), voice=style, speed=args.speed, lang=args.lang)
            assert sr == SR
            audio = trim(np.asarray(audio, dtype=np.float32))
            track.append((t, audio))
            d = len(audio) / SR
            out_lines.append({"text": text, "start": round(t, 3), "end": round(t + d, 3)})
            t += d + (GAP if li < len(lines) - 1 else 0)
        t += END_HOLD if si == len(SCRIPT) - 1 else TAIL
        scenes.append({"id": sid, "start": round(start, 3), "end": round(t, 3), "lines": out_lines})

    mix = np.zeros(int(t * SR) + 1, dtype=np.float32)
    for at, a in track:
        i = int(at * SR)
        mix[i:i + len(a)] += a
    peak = np.abs(mix).max() or 1
    mix *= 0.89 / peak                                  # about -1 dBFS
    sf.write(args.out, mix, SR, subtype="PCM_16")
    Path(args.timing).write_text("window.FILM_TIMING = " + json.dumps({"total": round(t, 3), "voice": args.voice, "scenes": scenes}, indent=1) + ";\n")
    print(f"{args.out}: {t:.2f}s with voice {args.voice}")


if __name__ == "__main__":
    main()
