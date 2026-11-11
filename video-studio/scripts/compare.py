#!/usr/bin/env python3
"""Put a rebuilt frame next to the real one and measure the difference.

  compare.py ORIGINAL.png REBUILT.png [--box x,y,w,h] [--fg "#F5EEE1"] [--tolerance 3]

With --fg it finds that colour's ink box in both images and reports how many pixels each
edge is off, the size difference, and the single shift that would line them up. Without
it, it reports raw pixel difference inside the box. Exits 1 when anything is further
off than --tolerance, so it can gate a rebuild loop.

Writes original | rebuilt | difference to work/compare/.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from _common import die, hex_to_rgb, parse_box, rel, work_dir


def ink_box(mask: np.ndarray):
    ys, xs = np.nonzero(mask)
    if len(xs) < 4:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def best_shift(a: np.ndarray, b: np.ndarray, reach: int = 16) -> tuple[int, int, float]:
    """Shift of b (dx, dy) that overlaps a best, and the IoU at that shift."""
    a = a.astype(np.float64)
    b = b.astype(np.float64)
    best = (0, 0, -1.0)
    for dy in range(-reach, reach + 1):
        for dx in range(-reach, reach + 1):
            moved = np.roll(np.roll(b, dy, axis=0), dx, axis=1)
            union = np.maximum(a, moved).sum()
            score = np.minimum(a, moved).sum() / union if union else 0.0
            if score > best[2] + 1e-9:
                best = (dx, dy, float(score))
    return best


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("original")
    parser.add_argument("rebuilt")
    parser.add_argument("--box", help="x,y,w,h region to compare, in the original's pixels")
    parser.add_argument("--fg", help="hex colour of the element to line up")
    parser.add_argument("--tol", type=float, default=48, help="colour tolerance for --fg (default 48)")
    parser.add_argument("--tolerance", type=float, default=3, help="allowed error in px (default 3)")
    parser.add_argument("--out")
    args = parser.parse_args()

    original = Image.open(args.original).convert("RGB")
    rebuilt = Image.open(args.rebuilt).convert("RGB")
    if rebuilt.size != original.size:
        ratio_a = original.width / original.height
        ratio_b = rebuilt.width / rebuilt.height
        if abs(ratio_a - ratio_b) > 0.01:
            die(f"different shapes: original {original.size}, rebuilt {rebuilt.size}")
        print(f"note: rebuilt is {rebuilt.size}, scaled to {original.size} for comparison")
        rebuilt = rebuilt.resize(original.size, Image.LANCZOS)

    a = np.asarray(original, dtype=np.float64)
    b = np.asarray(rebuilt, dtype=np.float64)
    h, w = a.shape[:2]
    x0, y0, x1, y1 = parse_box(args.box, w, h)
    ra, rb = a[y0:y1, x0:x1], b[y0:y1, x0:x1]

    diff = np.abs(ra - rb).mean(axis=2)
    print(f"region {x1 - x0}x{y1 - y0} at {x0},{y0}")
    print(f"pixel difference   mean {diff.mean():.2f} / 255, {np.mean(diff > 24) * 100:.2f}% of pixels clearly differ")

    failed = False
    if args.fg:
        fg = hex_to_rgb(args.fg)
        ma = np.sqrt(((ra - fg) ** 2).sum(axis=2)) <= args.tol
        mb = np.sqrt(((rb - fg) ** 2).sum(axis=2)) <= args.tol
        box_a, box_b = ink_box(ma), ink_box(mb)
        if box_a is None:
            die(f"colour {args.fg} not found in the original: check the hex or raise --tol")
        if box_b is None:
            print(f"FAIL  colour {args.fg} not found in the rebuilt frame: wrong colour or element missing")
            sys.exit(1)
        names = ("left", "top", "right", "bottom")
        deltas = [vb - va for va, vb in zip(box_a, box_b)]
        print("edge        original  rebuilt   off by")
        for name, va, vb, d, origin in zip(names, box_a, box_b, deltas, (x0, y0, x0, y0)):
            flag = "" if abs(d) <= args.tolerance else "  <-- fix"
            print(f"  {name:<8} {va + origin:>8} {vb + origin:>8} {d:>+7} px{flag}")
        wa, ha = box_a[2] - box_a[0], box_a[3] - box_a[1]
        wb, hb = box_b[2] - box_b[0], box_b[3] - box_b[1]
        print(f"size        {wa}x{ha}  vs  {wb}x{hb}   ({wb - wa:+} x {hb - ha:+} px, scale {wb / wa:.3f} wide, {hb / ha:.3f} tall)")
        dx, dy, iou = best_shift(ma, mb)
        print(f"overlap     {iou:.3f} IoU after shifting the rebuilt by ({dx:+}, {dy:+}) px")
        colour_a = ra[ma].mean(axis=0)
        colour_b = rb[mb].mean(axis=0)
        colour_gap = float(np.abs(colour_a - colour_b).max())
        print(f"colour      off by up to {colour_gap:.1f} / 255 per channel")
        failed = max(abs(d) for d in deltas) > args.tolerance or colour_gap > 10
        hints = []
        if abs(wb / wa - 1) > 0.01 and abs((wb / wa) - (hb / ha)) < 0.02:
            hints.append(f"scale the font size by {wa / wb:.3f}")
        elif abs(wb - wa) > args.tolerance and abs(hb - ha) <= args.tolerance:
            hints.append("height matches but width does not: wrong letter spacing, weight or font")
        if abs(dx) > args.tolerance or abs(dy) > args.tolerance:
            hints.append(f"move it by ({dx:+}, {dy:+}) px")
        if hints and failed:
            print("try         " + "; ".join(hints))
    else:
        failed = diff.mean() > 6
        print("tip: pass --fg with the element's colour to get edge offsets in px")

    out = Path(args.out) if args.out else work_dir("compare") / f"{Path(args.rebuilt).stem}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    heat = np.zeros_like(ra)
    heat[..., 0] = np.clip(diff * 4, 0, 255)
    heat[..., 1] = np.clip(ra.mean(axis=2) * 0.25, 0, 255)
    heat[..., 2] = heat[..., 1]
    sheet = np.concatenate([ra, np.full((ra.shape[0], 6, 3), 255.0), rb, np.full((ra.shape[0], 6, 3), 255.0), heat], axis=1)
    Image.fromarray(sheet.astype(np.uint8)).save(out)
    print(f"original | rebuilt | difference: {rel(out)}")
    print("FAIL: outside tolerance" if failed else f"PASS: within {args.tolerance:g} px")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
