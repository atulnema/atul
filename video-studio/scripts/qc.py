#!/usr/bin/env python3
"""Pre-post check for a rendered video.

  qc.py out/draft.mp4 [--every 2]

1. Contact sheet with one frame every 2 seconds, to read the whole edit at a glance.
2. Single-frame glitches: anything that shows or vanishes for exactly one frame and then
   snaps back. Found by comparing each frame with its neighbours, block by block, so a
   small caption flicker counts as much as a full-frame flash.
3. Pops: part of the picture that changes completely from one frame to the next and then
   holds, with no animation in or out. Some are intended (captions switching words), so
   these are listed for review. Use --ignore x,y,w,h to leave the caption box out.
4. Loudness against -14 LUFS.

Hard cuts are listed with the pops but are not a fault. Exit code 1 if a single-frame
glitch is found or loudness is off target.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

from _common import probe, read_frames, rel, stem, work_dir

SCRIPTS = Path(__file__).resolve().parent
ANALYSIS_WIDTH = 180
BLOCK = 6


def blocks(gray: np.ndarray) -> np.ndarray:
    h, w = gray.shape
    h, w = h - h % BLOCK, w - w % BLOCK
    return gray[:h, :w].astype(np.float32).reshape(h // BLOCK, BLOCK, w // BLOCK, BLOCK).mean(axis=(1, 3))


def analyse(video: str, level: float, min_blocks: int, ignore: list[str]):
    """Returns (single-frame glitches, abrupt pops, hard cuts)."""
    meta = probe(video)
    scale = meta["width"] / ANALYSIS_WIDTH
    frames = [blocks(gray) for _, _, gray in read_frames(video, width=ANALYSIS_WIDTH, gray=True)]
    if len(frames) < 4:
        return [], [], []
    stack = np.stack(frames)
    fps = meta["fps"]
    watch = np.ones(stack.shape[1:], dtype=bool)
    for box in ignore:
        x, y, w, h = (float(v) / scale / BLOCK for v in box.split(","))
        watch[max(0, int(y)) : int(np.ceil(y + h)), max(0, int(x)) : int(np.ceil(x + w))] = False

    def describe(index: int, hit: np.ndarray) -> dict:
        ys, xs = np.nonzero(hit)
        return {
            "frame": index,
            "t": round(index / fps, 3),
            "area_percent": round(float(hit.mean() * 100), 1),
            "box": [int(xs.min() * BLOCK * scale), int(ys.min() * BLOCK * scale),
                    int((xs.max() - xs.min() + 1) * BLOCK * scale), int((ys.max() - ys.min() + 1) * BLOCK * scale)],
        }

    step = np.abs(np.diff(stack, axis=0))  # step[i] = change from frame i to i + 1
    glitches, pops, cuts = [], [], []
    glitch_frames = set()
    for i in range(1, len(stack) - 1):
        # A one-frame glitch differs from BOTH neighbours while the neighbours agree.
        score = np.minimum(step[i - 1], step[i]) - np.abs(stack[i + 1] - stack[i - 1])
        hit = (score > level) & watch
        if hit.sum() >= min_blocks:
            glitches.append(describe(i, hit))
            glitch_frames.update((i, i + 1))
    for i in range(1, len(step) - 1):
        if i + 1 in glitch_frames:
            continue
        # A pop is a big change with stillness on both sides of it.
        quiet = np.maximum(step[i - 1], step[i + 1])
        hit = (step[i] > level * 1.6) & (step[i] > quiet * 4 + 2)
        if hit.mean() > 0.5 or (step[i] > level).mean() > 0.6:
            cuts.append({"frame": i + 1, "t": round((i + 1) / fps, 3)})
            continue
        hit &= watch
        if hit.sum() >= min_blocks * 2:
            pops.append(describe(i + 1, hit))
    return glitches, pops, cuts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("video")
    parser.add_argument("--every", type=float, default=2.0, help="seconds between contact-sheet frames (default 2)")
    parser.add_argument("--level", type=float, default=14.0, help="glitch sensitivity, lower finds more (default 14)")
    parser.add_argument("--min-blocks", type=int, default=3, help="smallest glitch, in analysis blocks (default 3)")
    parser.add_argument("--ignore", action="append", default=[], help="x,y,w,h to leave out, e.g. the caption box")
    parser.add_argument("--target", type=float, default=-14.0, help="loudness target in LUFS")
    args = parser.parse_args()

    meta = probe(args.video)
    name = f"qc_{stem(args.video)}"
    print(f"{args.video}: {meta['width']}x{meta['height']} @ {meta['fps']:.3f} fps, {meta['duration']:.2f} s\n")

    print(f"1. contact sheet, one frame every {args.every:g} s")
    subprocess.run([sys.executable, str(SCRIPTS / "frames.py"), "sheets", args.video,
                    "--fps", f"{1 / args.every:.6f}", "--name", name], check=True)

    print("\n2. single-frame glitches")
    pops, abrupt, cuts = analyse(args.video, args.level, args.min_blocks, args.ignore)
    if not pops:
        print("  none found")
    for pop in pops[:25]:
        x, y, w, h = pop["box"]
        print(f"  frame {pop['frame']} at {pop['t']:.3f} s: {pop['area_percent']}% of the frame"
              f" flickers for one frame, around x {x}-{x + w}, y {y}-{y + h}")
    if len(pops) > 25:
        print(f"  ... and {len(pops) - 25} more (see the report)")
    if pops:
        times = " ".join(f"-t {p['t']}" for p in pops[:6])
        print(f"  look at them: python3 scripts/frames.py grab {args.video} {times}")

    print("\n3. pops (appear or vanish between two frames, no animation)")
    if not abrupt:
        print("  none found")
    for pop in abrupt[:25]:
        x, y, w, h = pop["box"]
        print(f"  frame {pop['frame']} at {pop['t']:.3f} s: {pop['area_percent']}% of the frame"
              f" changes at once, around x {x}-{x + w}, y {y}-{y + h}")
    if len(abrupt) > 25:
        print(f"  ... and {len(abrupt) - 25} more (see the report). Captions? Add --ignore x,y,w,h")
    print(f"  hard cuts: {len(cuts)}" + (" at " + ", ".join(f"{c['t']:.2f}s" for c in cuts[:20]) if cuts else ""))

    print("\n4. loudness")
    loud_ok = True
    if meta["has_audio"]:
        loud_ok = subprocess.run([sys.executable, str(SCRIPTS / "loudness.py"), args.video,
                                  "--target", str(args.target)]).returncode == 0
    else:
        print("  no audio track")
        loud_ok = False

    report = work_dir(name) / "report.json"
    report.write_text(json.dumps({"video": args.video, "glitches": pops, "pops": abrupt, "cuts": cuts,
                                  "loudness_ok": loud_ok}, indent=2))
    print(f"\nreport: {rel(report)}")
    ok = not pops and loud_ok
    print("READY TO POST" if ok else "NOT READY: fix the items above and run again")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
