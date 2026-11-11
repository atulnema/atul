#!/usr/bin/env python3
"""Sample exact colours from a frame PNG.

  colors.py FRAME.png --at 540,1360            hex at a point (median of a small patch)
  colors.py FRAME.png --box x,y,w,h            palette of a region, with shares
  colors.py FRAME.png --box x,y,w,h --text     background + true text colour of a text block

Antialiasing blends text edges with the background, so the most common "text" pixel is
never the real colour. --text takes the pixels furthest from the background instead.
"""

from __future__ import annotations

import argparse

import numpy as np
from PIL import Image

from _common import die, parse_box, rgb_to_hex


def load(path: str) -> np.ndarray:
    try:
        return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)
    except OSError as exc:
        die(f"cannot open {path}: {exc}")


def kmeans(pixels: np.ndarray, k: int, rounds: int = 25) -> tuple[np.ndarray, np.ndarray]:
    """Small deterministic k-means. Returns (centres, share of pixels per centre)."""
    rng = np.random.default_rng(7)
    if len(pixels) > 60000:
        pixels = pixels[rng.choice(len(pixels), 60000, replace=False)]
    centres = [pixels[rng.integers(len(pixels))]]
    for _ in range(1, k):
        dist = np.min([np.sum((pixels - c) ** 2, axis=1) for c in centres], axis=0)
        if dist.sum() == 0:
            break
        centres.append(pixels[rng.choice(len(pixels), p=dist / dist.sum())])
    centres = np.array(centres)
    for _ in range(rounds):
        labels = np.argmin(((pixels[:, None, :] - centres[None]) ** 2).sum(axis=2), axis=1)
        new = np.array(
            [pixels[labels == i].mean(axis=0) if np.any(labels == i) else centres[i] for i in range(len(centres))]
        )
        if np.allclose(new, centres, atol=0.05):
            break
        centres = new
    labels = np.argmin(((pixels[:, None, :] - centres[None]) ** 2).sum(axis=2), axis=1)
    share = np.bincount(labels, minlength=len(centres)) / len(pixels)
    order = np.argsort(-share)
    return centres[order], share[order]


def text_colours(region: np.ndarray) -> tuple[np.ndarray, np.ndarray, float]:
    """Background = dominant colour. Text = median of the pixels furthest from it."""
    pixels = region.reshape(-1, 3)
    quant = (pixels // 8).astype(np.int64)
    keys = quant[:, 0] * 1024 + quant[:, 1] * 32 + quant[:, 2]
    top = np.bincount(keys).argmax()
    background = np.median(pixels[keys == top], axis=0)
    dist = np.sqrt(((pixels - background) ** 2).sum(axis=1))
    if dist.max() < 12:
        die("region is one flat colour: no text found in this box")
    core = pixels[dist >= np.percentile(dist[dist > dist.max() * 0.5], 60)]
    return background, np.median(core, axis=0), float(dist.max())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("image")
    parser.add_argument("--at", help="x,y point to sample")
    parser.add_argument("--radius", type=int, default=2, help="patch radius for --at (default 2)")
    parser.add_argument("--box", help="x,y,w,h region")
    parser.add_argument("--k", type=int, default=5, help="palette size (default 5)")
    parser.add_argument("--text", action="store_true", help="report background and text colour")
    args = parser.parse_args()

    img = load(args.image)
    h, w = img.shape[:2]

    if args.at:
        try:
            x, y = (int(v) for v in args.at.split(","))
        except ValueError:
            die("--at must be x,y")
        if not (0 <= x < w and 0 <= y < h):
            die(f"point {x},{y} is outside the {w}x{h} image")
        r = args.radius
        patch = img[max(0, y - r) : y + r + 1, max(0, x - r) : x + r + 1].reshape(-1, 3)
        spread = float(patch.std(axis=0).max())
        print(f"{rgb_to_hex(np.median(patch, axis=0))}  at {x},{y} (patch spread {spread:.1f})")
        if spread > 6:
            print("  note: patch is not flat. Sample further from edges, or use --box ... --text.")
        return

    x0, y0, x1, y1 = parse_box(args.box, w, h)
    region = img[y0:y1, x0:x1]

    if args.text:
        background, text, contrast = text_colours(region)
        print(f"background  {rgb_to_hex(background)}")
        print(f"text        {rgb_to_hex(text)}")
        print(f"contrast    {contrast:.0f} (RGB distance)")
        return

    centres, share = kmeans(region.reshape(-1, 3), args.k)
    print(f"palette of {x1 - x0}x{y1 - y0} region at {x0},{y0}")
    for colour, part in zip(centres, share):
        print(f"  {rgb_to_hex(colour)}  {part * 100:5.1f}%")


if __name__ == "__main__":
    main()
