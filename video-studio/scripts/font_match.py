#!/usr/bin/env python3
"""Identify a font by score, not by eye.

  font_match.py FRAME.png --box x,y,w,h --text "editor" [--fonts fonts/] [--tracking]

Crop one word from a frame, render the same word in every candidate font at the size
that gives the same ink height, and score the overlap (soft IoU, 0 to 1). Candidates
are every .ttf/.otf in fonts/ plus the Latin system fonts. Add more with fetch_font.py.

The best row also gives the font size in px, so this is where sizes come from.
A score under about 0.6 means the real font is not among the candidates yet.
"""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from _common import ROOT, die, hex_to_rgb, parse_box, rel, work_dir
from colors import text_colours
from measure_text import ink_mask

SKIP = re.compile(r"unifont|wqy|ipag|ipaex|emoji|opensymbol|symbola|dingbat|loma", re.I)
PROBE_SIZE = 240


def candidate_fonts(extra_dirs: list[str], system: bool) -> list[Path]:
    found: dict[str, Path] = {}
    dirs = [ROOT / "fonts", ROOT / "public" / "fonts"] + [Path(d) for d in extra_dirs]
    for folder in dirs:
        if folder.is_dir():
            for path in sorted(folder.rglob("*")):
                if path.suffix.lower() in (".ttf", ".otf"):
                    found[path.name] = path
    if system:
        try:
            listing = subprocess.run(
                ["fc-list", "--format", "%{file}\n"], capture_output=True, text=True
            ).stdout
        except FileNotFoundError:
            listing = ""
        for line in sorted(set(listing.splitlines())):
            path = Path(line.strip())
            if path.suffix.lower() in (".ttf", ".otf") and not SKIP.search(path.name):
                found.setdefault(path.name, path)
    return list(found.values())


def render(font_path: Path, text: str, size: float, tracking: float = 0.0) -> np.ndarray | None:
    """Ink coverage (0..1) of `text`, cropped tight to the ink."""
    try:
        font = ImageFont.truetype(str(font_path), max(4, round(size)))
    except OSError:
        return None
    advance = font.getlength(text) + tracking * len(text)
    canvas = Image.new("L", (int(advance + size * 2), int(size * 3)), 0)
    draw = ImageDraw.Draw(canvas)
    x, y = size, size
    if tracking == 0:
        draw.text((x, y), text, font=font, fill=255)
    else:
        for ch in text:
            draw.text((x, y), ch, font=font, fill=255)
            x += font.getlength(ch) + tracking
    arr = np.asarray(canvas, dtype=np.float64) / 255
    ys, xs = np.nonzero(arr > 0.5)
    if len(xs) == 0:
        return None
    return arr[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]


def overlap(target: np.ndarray, cand: np.ndarray) -> float:
    """Soft IoU with both masks pinned top-left, best of small shifts."""
    h = max(target.shape[0], cand.shape[0]) + 4
    w = max(target.shape[1], cand.shape[1]) + 4
    a = np.zeros((h, w))
    a[2 : 2 + target.shape[0], 2 : 2 + target.shape[1]] = target
    best = 0.0
    for dy in (0, 1, 2, 3, 4):
        for dx in (0, 1, 2, 3, 4):
            b = np.zeros((h, w))
            b[dy : dy + cand.shape[0], dx : dx + cand.shape[1]] = cand
            union = np.maximum(a, b).sum()
            if union > 0:
                best = max(best, float(np.minimum(a, b).sum() / union))
    return best


def fit(font_path: Path, text: str, target: np.ndarray, tracking_values: list[float]):
    probe = render(font_path, text, PROBE_SIZE)
    if probe is None:
        return None
    size = PROBE_SIZE * target.shape[0] / probe.shape[0]
    best = None
    for tracking in tracking_values:
        for candidate_size in sorted({round(size) + d for d in (-1, 0, 1)}):
            cand = render(font_path, text, candidate_size, tracking)
            if cand is None:
                continue
            score = overlap(target, cand)
            if best is None or score > best["score"]:
                best = {
                    "score": score,
                    "size": round(candidate_size),
                    "tracking": tracking,
                    "width_ratio": cand.shape[1] / target.shape[1],
                    "mask": cand,
                }
    return best


def comparison_sheet(target: np.ndarray, results: list[dict], path: Path) -> None:
    """Target in red, candidate in green: matching ink shows yellow."""
    label = ImageFont.load_default()
    rows = []
    for item in results:
        cand = item["mask"]
        h = max(target.shape[0], cand.shape[0]) + 8
        w = max(target.shape[1], cand.shape[1]) + 8
        rgb = np.zeros((h, w, 3))
        rgb[4 : 4 + target.shape[0], 4 : 4 + target.shape[1], 0] = target
        rgb[4 : 4 + cand.shape[0], 4 : 4 + cand.shape[1], 1] = cand
        tile = Image.fromarray((rgb * 255).astype(np.uint8))
        row = Image.new("RGB", (max(w, 520), h + 16), "#000000")
        row.paste(tile, (0, 16))
        ImageDraw.Draw(row).text((4, 2), f"{item['score']:.3f}  {item['name']}", font=label, fill="#FFFFFF")
        rows.append(row)
    sheet = Image.new("RGB", (max(r.width for r in rows), sum(r.height for r in rows)), "#000000")
    y = 0
    for row in rows:
        sheet.paste(row, (0, y))
        y += row.height
    sheet.save(path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("image", help="frame PNG (or an already cropped word)")
    parser.add_argument("--box", help="x,y,w,h around ONE line of text")
    parser.add_argument("--text", required=True, help="the exact characters inside the box")
    parser.add_argument("--fg", help="text colour hex (default: detected)")
    parser.add_argument("--fonts", action="append", default=[], help="extra font folder (repeatable)")
    parser.add_argument("--no-system", action="store_true", help="skip system fonts")
    parser.add_argument("--tracking", action="store_true", help="also fit letter spacing, -2 to +8 px")
    parser.add_argument("--top", type=int, default=10)
    parser.add_argument("--out", help="comparison image path")
    args = parser.parse_args()

    img = np.asarray(Image.open(args.image).convert("RGB"), dtype=np.float64)
    h, w = img.shape[:2]
    x0, y0, x1, y1 = parse_box(args.box, w, h)
    region = img[y0:y1, x0:x1]
    bg, fg, _ = text_colours(region)
    if args.fg:
        fg = hex_to_rgb(args.fg)
    mask = ink_mask(region, fg, bg)
    ys, xs = np.nonzero(mask > 0.5)
    if len(xs) == 0:
        die("no text pixels found in the box")
    target = mask[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]

    fonts = candidate_fonts(args.fonts, not args.no_system)
    if not fonts:
        die("no candidate fonts. Put .ttf/.otf files in fonts/ or run fetch_font.py")
    tracking_values = [float(v) for v in range(-2, 9)] if args.tracking else [0.0]

    results = []
    for path in fonts:
        result = fit(path, args.text, target, tracking_values)
        if result:
            result["name"] = path.name
            results.append(result)
    results.sort(key=lambda r: -r["score"])
    top = results[: args.top]

    print(f"target ink {target.shape[1]}x{target.shape[0]} px, {len(results)} candidate fonts, text '{args.text}'")
    print("score  size  tracking  width  font")
    for item in top:
        print(
            f"{item['score']:.3f} {item['size']:>4}px {item['tracking']:>+7.1f}px"
            f" {item['width_ratio'] * 100:>5.0f}%  {item['name']}"
        )
    if top:
        verdict = "confident" if top[0]["score"] >= 0.75 else "plausible" if top[0]["score"] >= 0.6 else "weak"
        print(f"best: {top[0]['name']} at {top[0]['size']}px ({verdict} match)")
        if top[0]["score"] < 0.6:
            print("  the real font is probably not among the candidates. Fetch more and rerun.")

    slug = re.sub(r"\W+", "_", args.text).strip("_") or "text"
    out = Path(args.out) if args.out else work_dir("fontmatch") / f"{slug}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    comparison_sheet(target, top[:6], out)
    print(f"overlay (red = reel, green = candidate, yellow = match): {rel(out)}")


if __name__ == "__main__":
    main()
