#!/usr/bin/env python3
"""Measure a text element from the pixels of a frame PNG.

  measure_text.py FRAME.png --box x,y,w,h [--fg "#F5EEE1"] [--json]

Reports, in frame pixels: the ink box of the whole block, every line (top, bottom, left,
right, height, width), line pitch, alignment, and the gaps between glyphs. Give a box
that holds the text and its background only. Without --fg the text colour is detected.

Ink height is not font size. Get the font size from font_match.py, which fits it.
"""

from __future__ import annotations

import argparse
import json

import numpy as np
from PIL import Image

from _common import die, hex_to_rgb, parse_box, rgb_to_hex
from colors import text_colours


def ink_mask(region: np.ndarray, fg: np.ndarray, bg: np.ndarray | None = None) -> np.ndarray:
    """Soft text coverage, 0..1, from each pixel's colour distance to the text colour.

    The cut-off adapts to the background: it sits halfway between the text colour and the
    nearest colour the background actually reaches, so text over footage or a gradient is
    separated as cleanly as text on a flat box. `bg` is accepted for callers that have it
    but the background is read from the pixels.
    """
    dist = np.sqrt(((region - fg) ** 2).sum(axis=2))
    hist = np.bincount(np.minimum(dist, 441).astype(int).ravel(), minlength=442).astype(np.float64)
    hist = np.convolve(hist, np.ones(5) / 5, mode="same")
    floor = 8
    beyond = hist[floor:]
    if beyond.max() <= 0:
        die("the box holds only the text colour: widen it to include some background")
    nearest_bg = floor + int(np.argmax(beyond >= beyond.max() * 0.25))
    cutoff = max(floor, nearest_bg / 2)
    return np.clip(1 - dist / (2 * cutoff), 0, 1)


def runs(flags: np.ndarray, min_gap: int = 1) -> list[tuple[int, int]]:
    """[start, end) runs of True, merging runs split by gaps shorter than min_gap."""
    out: list[list[int]] = []
    start = None
    for i, on in enumerate(flags):
        if on and start is None:
            start = i
        elif not on and start is not None:
            out.append([start, i])
            start = None
    if start is not None:
        out.append([start, len(flags)])
    merged: list[list[int]] = []
    for run in out:
        if merged and run[0] - merged[-1][1] < min_gap:
            merged[-1][1] = run[1]
        else:
            merged.append(run)
    return [(a, b) for a, b in merged]


def measure(image_path: str, box: str | None, fg_hex: str | None) -> dict:
    img = np.asarray(Image.open(image_path).convert("RGB"), dtype=np.float64)
    h, w = img.shape[:2]
    x0, y0, x1, y1 = parse_box(box, w, h)
    region = img[y0:y1, x0:x1]
    bg, fg, _ = text_colours(region)
    if fg_hex:
        fg = hex_to_rgb(fg_hex)
    solid = ink_mask(region, fg, bg) > 0.5
    if not solid.any():
        die("no text pixels found in the box")

    line_rows = runs(solid.any(axis=1), min_gap=2)
    lines = []
    for top, bottom in line_rows:
        cols = solid[top:bottom].any(axis=0)
        xs = np.flatnonzero(cols)
        glyphs = runs(cols)
        gaps = [b[0] - a[1] for a, b in zip(glyphs, glyphs[1:])]
        # Gaps split into two groups: between letters and between words.
        word_gap = None
        letter_gaps = gaps
        if len(gaps) >= 3:
            ordered = sorted(gaps)
            jumps = [b - a for a, b in zip(ordered, ordered[1:])]
            biggest = int(np.argmax(jumps))
            if jumps[biggest] >= max(3, 0.8 * ordered[biggest]):
                letter_gaps = ordered[: biggest + 1]
                word_gap = float(np.mean(ordered[biggest + 1 :]))
        lines.append(
            {
                "top": y0 + top,
                "bottom": y0 + bottom,
                "height": bottom - top,
                "left": x0 + int(xs[0]),
                "right": x0 + int(xs[-1]) + 1,
                "width": int(xs[-1]) + 1 - int(xs[0]),
                "centre_x": round(x0 + (int(xs[0]) + int(xs[-1]) + 1) / 2, 1),
                "glyph_runs": len(glyphs),
                "letter_gap_px": round(float(np.mean(letter_gaps)), 2) if letter_gaps else None,
                "word_gap_px": round(word_gap, 2) if word_gap else None,
            }
        )

    lefts = [ln["left"] for ln in lines]
    rights = [ln["right"] for ln in lines]
    centres = [ln["centre_x"] for ln in lines]
    block = {
        "left": min(lefts),
        "top": lines[0]["top"],
        "right": max(rights),
        "bottom": lines[-1]["bottom"],
    }
    block["width"] = block["right"] - block["left"]
    block["height"] = block["bottom"] - block["top"]
    block["centre_x"] = round((block["left"] + block["right"]) / 2, 1)

    if len(lines) > 1:
        spread = {"left": np.ptp(lefts), "centre": np.ptp(centres), "right": np.ptp(rights)}
        widths_equal = np.ptp([ln["width"] for ln in lines]) <= 3
        alignment = "justified (every line the same width)" if widths_equal else min(spread, key=spread.get)
    else:
        offset = block["centre_x"] - w / 2
        alignment = "centre of frame" if abs(offset) <= 3 else f"single line, {offset:+.0f}px from frame centre"

    pitch = [b["top"] - a["top"] for a, b in zip(lines, lines[1:])]
    return {
        "frame": {"width": w, "height": h},
        "text_colour": rgb_to_hex(fg),
        "background_colour": rgb_to_hex(bg),
        "block": block,
        "alignment": alignment,
        "line_pitch_px": pitch,
        "lines": lines,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("image")
    parser.add_argument("--box", help="x,y,w,h around the text (default: whole frame)")
    parser.add_argument("--fg", help="text colour hex (default: detected)")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    result = measure(args.image, args.box, args.fg)
    if args.json:
        print(json.dumps(result, indent=2))
        return

    block = result["block"]
    frame = result["frame"]
    print(f"text {result['text_colour']} on {result['background_colour']}")
    print(
        f"block  x {block['left']}-{block['right']} ({block['width']} px)"
        f"  y {block['top']}-{block['bottom']} ({block['height']} px)"
        f"  centre x {block['centre_x']} (frame centre {frame['width'] / 2:g})"
    )
    print(f"alignment  {result['alignment']}")
    if result["line_pitch_px"]:
        print(f"line pitch {result['line_pitch_px']} px")
    print("line   top bottom height   left  right  width  letter-gap  word-gap")
    for i, ln in enumerate(result["lines"], 1):
        letter = f"{ln['letter_gap_px']:.2f}" if ln["letter_gap_px"] is not None else "-"
        word = f"{ln['word_gap_px']:.2f}" if ln["word_gap_px"] is not None else "-"
        print(
            f"{i:>4} {ln['top']:>5} {ln['bottom']:>6} {ln['height']:>6} {ln['left']:>6} {ln['right']:>6}"
            f" {ln['width']:>6} {letter:>11} {word:>9}"
        )


if __name__ == "__main__":
    main()
