#!/usr/bin/env python3
"""Cut the pauses out of a talking clip, and optionally grade it with a LUT.

  cut.py input/me.mp4 [--min-pause 0.12] [--lut look.cube] [--out public/footage/me.mp4]

Every silence longer than --min-pause is removed, keeping --pad seconds of air on each
side of the speech so words are not clipped. Cuts are snapped to whole video frames and
audio is cut at the same instants, so picture and sound stay in sync across any number
of cuts.

Writes the video plus a .json beside it: size, fps, duration and the kept segments.
Transcribe the OUTPUT, so caption times already sit on the edited timeline.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import tempfile
from pathlib import Path

from _common import ROOT, die, probe, rel, run, stem


def measure_threshold(path: str) -> float:
    """Loudness-relative gate, so quiet and loud recordings are treated alike."""
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-map", "0:a:0", "-af",
               "loudnorm=print_format=json", "-f", "null", "-"]).stderr
    match = re.search(r"\{[^{}]*\"input_thresh\"[^{}]*\}", err, re.S)
    if not match:
        die("could not measure loudness: is there an audio track?")
    thresh = float(json.loads(match.group(0))["input_thresh"])
    if not math.isfinite(thresh):
        die("the audio track is silent")
    return thresh


def detect_silences(path: str, noise_db: float, min_pause: float) -> list[tuple[float, float]]:
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-map", "0:a:0", "-af",
               f"silencedetect=noise={noise_db:.1f}dB:d={min_pause:.3f}", "-f", "null", "-"]).stderr
    starts = [float(v) for v in re.findall(r"silence_start: (-?[\d.]+)", err)]
    ends = [float(v) for v in re.findall(r"silence_end: (-?[\d.]+)", err)]
    return list(zip(starts, ends + [math.inf] * (len(starts) - len(ends))))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("video")
    parser.add_argument("--min-pause", type=float, default=0.12, help="cut silences longer than this (default 0.12 s)")
    parser.add_argument("--pad", type=float, default=0.04, help="air kept on each side of speech (default 0.04 s)")
    parser.add_argument("--noise", type=float, help="silence threshold in dB (default: measured from the clip)")
    parser.add_argument("--lut", help=".cube file to grade with")
    parser.add_argument("--scale", type=float, default=1.0, help="output scale, e.g. 0.5 for drafts")
    parser.add_argument("--crf", type=int, default=16, help="x264 quality (default 16)")
    parser.add_argument("--out", help="output path (default public/footage/<name>.mp4)")
    parser.add_argument("--dry-run", action="store_true", help="list the cuts without rendering")
    args = parser.parse_args()

    meta = probe(args.video)
    if not meta["has_audio"]:
        die("no audio track: nothing to detect pauses from")
    if args.lut and not Path(args.lut).exists():
        die(f"LUT not found: {args.lut}")
    fps, duration = meta["fps"], meta["duration"]
    total_frames = int(round(duration * fps))

    noise = args.noise if args.noise is not None else measure_threshold(args.video)
    silences = detect_silences(args.video, noise, args.min_pause)

    # Keep everything except the middle of each silence, in whole frames.
    keep: list[tuple[int, int]] = []
    cursor = 0
    for start, end in silences:
        end = min(end, duration)
        cut_a = 0.0 if start <= 0.01 else start + args.pad
        cut_b = duration if end >= duration - 0.01 else end - args.pad
        frame_a, frame_b = math.ceil(cut_a * fps), math.floor(cut_b * fps)
        if frame_b - frame_a < 1:
            continue
        if frame_a > cursor:
            keep.append((cursor, frame_a))
        cursor = max(cursor, frame_b)
    if cursor < total_frames:
        keep.append((cursor, total_frames))
    keep = [(a, b) for a, b in keep if b > a]
    if not keep:
        die("the whole clip reads as silence. Pass a lower --noise, for example --noise -50")

    kept_frames = sum(b - a for a, b in keep)
    removed = (total_frames - kept_frames) / fps
    print(f"{meta['width']}x{meta['height']} @ {fps:.3f} fps, {duration:.2f} s, silence below {noise:.1f} dB")
    print(f"{len(silences)} pauses over {args.min_pause:g} s -> {len(keep)} segments,"
          f" {removed:.2f} s removed, {kept_frames / fps:.2f} s left")
    if args.dry_run:
        for a, b in keep:
            print(f"  keep {a / fps:8.3f} - {b / fps:8.3f} s  ({b - a} frames)")
        return

    out = Path(args.out) if args.out else ROOT / "public" / "footage" / f"{stem(args.video)}.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)

    video_expr = "+".join(f"between(n,{a},{b - 1})" for a, b in keep)
    audio_expr = "+".join(f"between(t,{a / fps:.6f},{b / fps:.6f})*lt(t,{b / fps:.6f})" for a, b in keep)
    chain = [f"fps={fps:.6f}", f"select='{video_expr}'", f"setpts=N/({fps:.6f})/TB"]
    if args.lut:
        chain.append(f"lut3d=file='{Path(args.lut).resolve()}'")
    if args.scale != 1.0:
        chain.append(f"scale=trunc(iw*{args.scale}/2)*2:trunc(ih*{args.scale}/2)*2:flags=lanczos")
    chain.append("format=yuv420p")
    graph = (f"[0:v:0]{','.join(chain)}[v];"
             f"[0:a:0]aselect='{audio_expr}',asetpts=N/SR/TB[a]")
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as handle:
        handle.write(graph)
        script = handle.name
    try:
        run(["ffmpeg", "-v", "error", "-y", "-i", args.video, "-filter_complex_script", script,
             "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf),
             "-r", f"{fps:.6f}", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)])
    finally:
        Path(script).unlink(missing_ok=True)

    result = probe(out)
    timeline, t = [], 0.0
    for a, b in keep:
        length = (b - a) / fps
        timeline.append({"source_start": round(a / fps, 4), "source_end": round(b / fps, 4),
                         "out_start": round(t, 4), "out_end": round(t + length, 4)})
        t += length
    sidecar = out.with_suffix(".json")
    sidecar.write_text(json.dumps({
        "source": str(args.video),
        "width": result["width"],
        "height": result["height"],
        "fps": round(result["fps"], 4),
        "durationInSeconds": round(result["duration"], 4),
        "durationInFrames": int(round(result["duration"] * result["fps"])),
        "lut": args.lut,
        "minPause": args.min_pause,
        "removedSeconds": round(removed, 3),
        "segments": timeline,
    }, indent=2))
    print(f"wrote {rel(out)} ({result['width']}x{result['height']}, {result['duration']:.2f} s)")
    print(f"wrote {rel(sidecar)}")


if __name__ == "__main__":
    main()
