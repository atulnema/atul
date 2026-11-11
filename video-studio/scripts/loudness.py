#!/usr/bin/env python3
"""Check loudness against a target, and fix it.

  loudness.py out/final.mp4                     measure (target -14 LUFS, peak at most -1 dBTP)
  loudness.py out/draft.mp4 --fix out/fixed.mp4 two-pass normalise; the picture is copied untouched

Exit code 1 means the file is off target, so this can gate a render.
"""

from __future__ import annotations

import argparse
import json
import re
import sys

from _common import die, probe, rel, run


def measure(path: str, target: float, peak: float) -> dict:
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-map", "0:a:0", "-af",
               f"loudnorm=I={target}:TP={peak}:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    match = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", err, re.S)
    if not match:
        die("could not read the loudness measurement")
    return json.loads(match.group(0))


def report(path: str, target: float, peak: float, tolerance: float) -> tuple[dict, bool]:
    data = measure(path, target, peak)
    loud, true_peak = float(data["input_i"]), float(data["input_tp"])
    ok = abs(loud - target) <= tolerance and true_peak <= peak + 0.1
    print(f"{path}")
    print(f"  integrated  {loud:6.1f} LUFS   (target {target:g}, {loud - target:+.1f})")
    print(f"  true peak   {true_peak:6.1f} dBTP   (limit {peak:g})")
    print(f"  range       {float(data['input_lra']):6.1f} LU")
    print("  PASS" if ok else "  OFF TARGET")
    return data, ok


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("file")
    parser.add_argument("--target", type=float, default=-14.0, help="integrated LUFS (default -14)")
    parser.add_argument("--peak", type=float, default=-1.0, help="true peak ceiling in dBTP (default -1)")
    parser.add_argument("--tolerance", type=float, default=1.0, help="allowed error in LU (default 1)")
    parser.add_argument("--fix", metavar="OUT", help="write a normalised copy")
    args = parser.parse_args()

    meta = probe(args.file)
    if not meta["has_audio"]:
        die("no audio track")
    data, ok = report(args.file, args.target, args.peak, args.tolerance)
    if not args.fix:
        sys.exit(0 if ok else 1)

    # A plain gain change keeps the dynamics. It is only safe if the peak stays under the
    # ceiling; otherwise loudnorm's second pass limits the peaks as well.
    gain = args.target - float(data["input_i"])
    if float(data["input_tp"]) + gain <= args.peak:
        audio_filter = f"volume={gain:.2f}dB"
        method = f"gain {gain:+.1f} dB"
    else:
        audio_filter = (
            f"loudnorm=I={args.target}:TP={args.peak}:LRA=11:measured_I={data['input_i']}"
            f":measured_TP={data['input_tp']}:measured_LRA={data['input_lra']}"
            f":measured_thresh={data['input_thresh']}:offset={data['target_offset']}:linear=true,"
            "aresample=48000"
        )
        method = "loudnorm with peak limiting"
    run(["ffmpeg", "-v", "error", "-y", "-i", args.file, "-map", "0:v?", "-map", "0:a:0", "-c:v", "copy",
         "-af", audio_filter, "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", args.fix])
    print(f"\nnormalised with {method} -> {rel(args.fix)}")
    _, ok = report(args.fix, args.target, args.peak, args.tolerance)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
