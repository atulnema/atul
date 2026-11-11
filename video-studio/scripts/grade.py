#!/usr/bin/env python3
"""Measure a colour grade and build a LUT that moves your footage onto it.

  grade.py measure VIDEO [--exclude x,y,w,h ...] [--range 2-9]
  grade.py lut REEL CLIP --out look.cube [--strength 1.0] [--exclude ...] [--no-skin-lift]
  grade.py compare CLIP REEL --lut look.cube [--clip-t 3] [--reel-t 5]

measure  black and white points, tone curve, tint of shadows / mids / highlights,
         saturation, and which hues the footage uses.
lut      a 33-point .cube: tone curve match, tint match per brightness level, saturation
         match, hues the reel never uses pulled back, then a skin check that lifts the
         grade if faces end up darker than in the reel.
compare  before / after / the original reel, side by side.

Measure the reel's FOOTAGE, not its graphics: pass --exclude for caption boxes and
titles, and --range to stay on shots without full-screen cards.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from _common import die, probe, read_frames, rel, rgb_to_hex, run, stem, work_dir

LUT_SIZE = 33
SAMPLE_WIDTH = 320
HUE_BINS = 36
HUE_NAMES = ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "azure", "blue", "violet", "magenta", "rose"]


def to_ycc(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return y, (b - y) / 1.8556, (r - y) / 1.5748


def to_rgb(y: np.ndarray, cb: np.ndarray, cr: np.ndarray) -> np.ndarray:
    r = y + 1.5748 * cr
    b = y + 1.8556 * cb
    g = (y - 0.2126 * r - 0.0722 * b) / 0.7152
    return np.stack([r, g, b], axis=-1)


def hue_of(cb: np.ndarray, cr: np.ndarray) -> np.ndarray:
    """Hue angle in degrees with red near 0, matching HSV closely enough to name hues."""
    rgb = to_rgb(np.full_like(cb, 0.5), cb, cr)
    mx, mn = rgb.max(axis=-1), rgb.min(axis=-1)
    span = np.where(mx - mn < 1e-9, 1.0, mx - mn)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.where(mx == r, ((g - b) / span) % 6, np.where(mx == g, (b - r) / span + 2, (r - g) / span + 4))
    return (hue * 60) % 360


def skin_mask(rgb: np.ndarray) -> np.ndarray:
    y, cb, cr = to_ycc(rgb)
    cb8, cr8 = cb * 224 + 128, cr * 224 + 128
    return (cb8 > 77) & (cb8 < 127) & (cr8 > 135) & (cr8 < 173) & (y > 0.15) & (y < 0.95)


def sample_pixels(video: str, excludes: list[str], time_range: str | None, frames: int = 32) -> np.ndarray:
    meta = probe(video)
    start, end = 0.0, meta["duration"]
    if time_range:
        try:
            a, b = time_range.split("-")
            start, end = float(a), float(b)
        except ValueError:
            die("--range must look like 2-9 (seconds)")
    span = max(end - start, 0.1)
    scale = SAMPLE_WIDTH / meta["width"]
    keep = None
    out = []
    for _, _, frame in read_frames(video, fps=min(frames / span, meta["fps"]), width=SAMPLE_WIDTH, start=start, end=end):
        if keep is None:
            keep = np.ones(frame.shape[:2], dtype=bool)
            for box in excludes:
                try:
                    x, y, w, h = (float(v) * scale for v in box.split(","))
                except ValueError:
                    die(f"--exclude must be x,y,w,h, got '{box}'")
                keep[max(0, int(y)) : int(y + h) + 1, max(0, int(x)) : int(x + w) + 1] = False
            if not keep.any():
                die("--exclude boxes cover the whole frame")
        out.append(frame[keep])
    if not out:
        die(f"no frames decoded from {video}")
    return np.concatenate(out).astype(np.float64) / 255


def hue_weights(cb: np.ndarray, cr: np.ndarray) -> np.ndarray:
    chroma = np.hypot(cb, cr)
    weights, _ = np.histogram(hue_of(cb, cr), bins=HUE_BINS, range=(0, 360), weights=chroma)
    kernel = np.array([0.25, 0.5, 0.25])
    padded = np.concatenate([weights[-1:], weights, weights[:1]])
    weights = np.convolve(padded, kernel, mode="valid")
    return weights / max(weights.max(), 1e-9)


def stats(pixels: np.ndarray) -> dict:
    y, cb, cr = to_ycc(pixels)
    result = {
        "black_point": round(float(np.percentile(y, 0.5)), 4),
        "white_point": round(float(np.percentile(y, 99.5)), 4),
        "tone_curve": {f"p{p}": round(float(np.percentile(y, p)), 4) for p in (5, 10, 25, 50, 75, 90, 95)},
        "saturation": round(float(np.hypot(cb, cr).mean()), 4),
    }
    for name, mask in (("shadows", y < 0.25), ("mids", (y >= 0.25) & (y < 0.7)), ("highlights", y >= 0.7)):
        if mask.sum() < 50:
            result[name] = None
            continue
        mean = pixels[mask].mean(axis=0)
        grey = float(y[mask].mean())
        result[name] = {
            "share": round(float(mask.mean()), 3),
            "colour": rgb_to_hex(mean * 255),
            "tint_rgb": [round(float(v - grey), 4) for v in mean],
        }
    weights = hue_weights(cb, cr)
    twelve = weights.reshape(12, 3).sum(axis=1)
    twelve = twelve / max(twelve.sum(), 1e-9)
    result["hues"] = {name: round(float(v), 3) for name, v in zip(HUE_NAMES, twelve)}
    skin = skin_mask(pixels)
    result["skin"] = (
        {"share": round(float(skin.mean()), 3), "luma": round(float(np.median(y[skin])), 4)}
        if skin.mean() > 0.01
        else None
    )
    return result


def describe_tint(tint: list[float]) -> str:
    """Name the tint by its hue and how strong it is."""
    r, g, b = tint
    strength = max(tint) - min(tint)
    if strength < 0.012:
        return "neutral"
    grey = np.array([0.5 + r, 0.5 + g, 0.5 + b])
    _, cb, cr = to_ycc(grey)
    name = HUE_NAMES[int(((float(hue_of(np.array(cb), np.array(cr))) + 15) % 360) // 30)]
    amount = "slight" if strength < 0.04 else "clear" if strength < 0.1 else "strong"
    return f"{amount} {name}"


def print_stats(title: str, s: dict) -> None:
    print(title)
    print(f"  black point {s['black_point']:.3f}   white point {s['white_point']:.3f}   (0 = black, 1 = white)")
    print("  tone curve  " + "  ".join(f"{k} {v:.3f}" for k, v in s["tone_curve"].items()))
    for band in ("shadows", "mids", "highlights"):
        info = s[band]
        if info is None:
            print(f"  {band:<10}  (almost none)")
            continue
        tint = "  ".join(f"{c}{v:+.3f}" for c, v in zip("RGB", info["tint_rgb"]))
        print(f"  {band:<10}  {info['colour']}  tint {tint}  -> {describe_tint(info['tint_rgb'])}  ({info['share'] * 100:.0f}% of pixels)")
    print(f"  saturation  {s['saturation']:.4f}")
    used = sorted(s["hues"].items(), key=lambda kv: -kv[1])
    print("  hues used   " + ", ".join(f"{k} {v * 100:.0f}%" for k, v in used if v >= 0.03))
    absent = [k for k, v in s["hues"].items() if v < 0.01]
    if absent:
        print("  hues absent " + ", ".join(absent))
    if s["skin"]:
        print(f"  skin        median luma {s['skin']['luma']:.3f} ({s['skin']['share'] * 100:.0f}% of pixels look like skin)")
    else:
        print("  skin        not enough skin-toned pixels to measure")


def smooth(values: np.ndarray, width: int) -> np.ndarray:
    kernel = np.hanning(width * 2 + 1)
    kernel /= kernel.sum()
    padded = np.pad(values, width, mode="edge")
    return np.convolve(padded, kernel, mode="valid")


def chroma_by_luma(y: np.ndarray, c: np.ndarray, fallback: float) -> np.ndarray:
    """Mean chroma at each of 64 brightness levels, filled where a level has no pixels."""
    idx = np.clip((y * 64).astype(int), 0, 63)
    total = np.bincount(idx, weights=c, minlength=64)
    count = np.bincount(idx, minlength=64)
    have = count >= 30
    if not have.any():
        return np.full(64, fallback)
    levels = np.arange(64)
    return smooth(np.interp(levels, levels[have], total[have] / count[have]), 4)


def build_lut(ref: np.ndarray, src: np.ndarray, strength: float, skin_lift: bool, hue_gate: bool):
    ry, rcb, rcr = to_ycc(ref)
    sy, scb, scr = to_ycc(src)

    # 1. Tone: match the brightness distribution, percentile for percentile.
    q = np.linspace(0, 100, 257)
    src_q, ref_q = np.percentile(sy, q), np.percentile(ry, q)
    src_q = np.maximum.accumulate(src_q + np.arange(257) * 1e-7)
    grid = np.linspace(0, 1, 256)
    tone = smooth(np.interp(grid, src_q, ref_q), 6)
    tone = np.maximum.accumulate(tone)

    # 2. Tint per brightness level, and overall saturation.
    levels = (np.arange(64) + 0.5) / 64
    src_cb, src_cr = chroma_by_luma(sy, scb, scb.mean()), chroma_by_luma(sy, scr, scr.mean())
    ref_cb, ref_cr = chroma_by_luma(ry, rcb, rcb.mean()), chroma_by_luma(ry, rcr, rcr.mean())
    src_spread = np.hypot(scb - np.interp(sy, levels, src_cb), scr - np.interp(sy, levels, src_cr)).mean()
    ref_spread = np.hypot(rcb - np.interp(ry, levels, ref_cb), rcr - np.interp(ry, levels, ref_cr)).mean()
    sat = float(np.clip(ref_spread / max(src_spread, 1e-6), 0.5, 1.6))
    ref_hues = hue_weights(rcb, rcr)

    def apply(rgb: np.ndarray, gamma: float = 1.0) -> np.ndarray:
        y, cb, cr = to_ycc(rgb)
        y2 = np.interp(y, grid, tone) ** gamma
        cb2 = (cb - np.interp(y, levels, src_cb)) * sat + np.interp(y2, levels, ref_cb)
        cr2 = (cr - np.interp(y, levels, src_cr)) * sat + np.interp(y2, levels, ref_cr)
        if hue_gate:
            # 3. Hues the reel barely uses get pulled toward grey instead of standing out.
            presence = ref_hues[np.clip((hue_of(cb2, cr2) / 360 * HUE_BINS).astype(int), 0, HUE_BINS - 1)]
            keep = 0.35 + 0.65 * np.clip((presence - 0.03) / 0.2, 0, 1)
            centre_cb, centre_cr = np.interp(y2, levels, ref_cb), np.interp(y2, levels, ref_cr)
            cb2 = centre_cb + (cb2 - centre_cb) * keep
            cr2 = centre_cr + (cr2 - centre_cr) * keep
        graded = np.clip(to_rgb(y2, cb2, cr2), 0, 1)
        return np.clip(rgb + (graded - rgb) * strength, 0, 1)

    # 4. Skin check: if faces land darker than the reel's, lift the whole curve.
    gamma, note = 1.0, "no skin to compare"
    src_skin, ref_skin = skin_mask(src), skin_mask(ref)
    if src_skin.mean() > 0.01 and ref_skin.mean() > 0.01:
        skin_pixels = src[src_skin]
        original = float(np.median(sy[src_skin]))
        # At partial strength the skin target moves partway too, never below the original.
        target = max(original, original + (float(np.median(ry[ref_skin])) - original) * strength)
        before = float(np.median(to_ycc(apply(skin_pixels))[0]))
        note = f"skin luma {before:.3f} after grade, target {target:.3f}: ok"
        if skin_lift and before < target - 0.02:
            lo, hi = 0.55, 1.0
            for _ in range(18):
                gamma = (lo + hi) / 2
                if float(np.median(to_ycc(apply(skin_pixels, gamma))[0])) < target:
                    hi = gamma
                else:
                    lo = gamma
            after = float(np.median(to_ycc(apply(skin_pixels, gamma))[0]))
            note = f"skin luma {before:.3f} was darker than the target {target:.3f}: lifted to {after:.3f} (gamma {gamma:.2f})"
        elif before < target - 0.02:
            note = f"skin luma {before:.3f} is darker than the target {target:.3f} (lift disabled)"

    axis = np.linspace(0, 1, LUT_SIZE)
    b, g, r = np.meshgrid(axis, axis, axis, indexing="ij")  # red changes fastest in a .cube
    table = apply(np.stack([r, g, b], axis=-1).reshape(-1, 3), gamma)
    return table, {"saturation_scale": round(sat, 3), "gamma": round(gamma, 3), "skin": note}, lambda px: apply(px, gamma)


def write_cube(table: np.ndarray, path: Path, title: str) -> None:
    lines = [f'TITLE "{title}"', f"LUT_3D_SIZE {LUT_SIZE}", "DOMAIN_MIN 0.0 0.0 0.0", "DOMAIN_MAX 1.0 1.0 1.0", ""]
    lines += [f"{r:.6f} {g:.6f} {b:.6f}" for r, g, b in table]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n")


def cmd_measure(args) -> None:
    pixels = sample_pixels(args.video, args.exclude, args.range)
    result = stats(pixels)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print_stats(f"grade of {args.video} ({len(pixels):,} pixels sampled)", result)
    out = work_dir(stem(args.video)) / "grade.json"
    out.write_text(json.dumps(result, indent=2))
    if not args.json:
        print(f"saved {rel(out)}")


def cmd_lut(args) -> None:
    if not 0 < args.strength <= 1:
        die("--strength must be above 0 and at most 1")
    ref = sample_pixels(args.reel, args.exclude, args.range)
    src = sample_pixels(args.clip, [], None)
    table, info, apply = build_lut(ref, src, args.strength, not args.no_skin_lift, not args.no_hue_gate)
    out = Path(args.out)
    write_cube(table, out, f"{stem(args.clip)} to {stem(args.reel)} at {args.strength:g}")
    before, after, target = stats(src), stats(apply(src)), stats(ref)
    print(f"wrote {rel(out)}  ({LUT_SIZE}^3 points, strength {args.strength:g})")
    print(f"  saturation x{info['saturation_scale']}   {info['skin']}")
    print("\n               your clip   graded     reel")
    rows = [("black point", "black_point"), ("white point", "white_point"), ("saturation", "saturation")]
    for label, key in rows:
        print(f"  {label:<12} {before[key]:>8.3f} {after[key]:>8.3f} {target[key]:>8.3f}")
    for p in ("p10", "p25", "p50", "p75", "p90"):
        print(f"  tone {p:<7} {before['tone_curve'][p]:>8.3f} {after['tone_curve'][p]:>8.3f} {target['tone_curve'][p]:>8.3f}")
    for band in ("shadows", "mids", "highlights"):
        cells = [s[band]["colour"] if s[band] else "   -   " for s in (before, after, target)]
        print(f"  {band:<12} {cells[0]:>8} {cells[1]:>8} {cells[2]:>8}")
    if args.strength == 1 and abs(after["tone_curve"]["p50"] - before["tone_curve"]["p50"]) > 0.15:
        print("\n  the reel's room is much brighter or darker than yours. Try --strength 0.5.")


def frame_at(video: str, t: float, lut: str | None, height: int) -> Image.Image:
    meta = probe(video)
    t = min(max(t, 0), max(meta["duration"] - 0.05, 0))
    filters = []
    if lut:
        filters.append(f"lut3d=file='{lut}'")
    filters.append(f"scale=-2:{height}")
    tmp = work_dir("grade") / "_frame.png"
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", video, "-an", "-frames:v", "1",
         "-vf", ",".join(filters), str(tmp)])
    img = Image.open(tmp).convert("RGB")
    img.load()
    tmp.unlink()
    return img


def cmd_compare(args) -> None:
    if not Path(args.lut).exists():
        die(f"LUT not found: {args.lut}")
    clip_t = args.clip_t if args.clip_t is not None else probe(args.clip)["duration"] / 2
    reel_t = args.reel_t if args.reel_t is not None else probe(args.reel)["duration"] / 2
    tiles = [
        ("before", frame_at(args.clip, clip_t, None, args.height)),
        ("after", frame_at(args.clip, clip_t, args.lut, args.height)),
        ("original reel", frame_at(args.reel, reel_t, None, args.height)),
    ]
    font = ImageFont.load_default(size=22)
    sheet = Image.new("RGB", (sum(img.width for _, img in tiles) + 16, args.height), "#000000")
    draw = ImageDraw.Draw(sheet)
    x = 0
    for label, img in tiles:
        sheet.paste(img, (x, 0))
        box = draw.textbbox((x + 12, 10), label, font=font)
        draw.rectangle((box[0] - 6, box[1] - 4, box[2] + 6, box[3] + 4), fill="#000000")
        draw.text((x + 12, 10), label, font=font, fill="#FFFFFF")
        x += img.width + 8
    out = Path(args.out) if args.out else work_dir("grade") / f"{stem(args.clip)}_vs_{stem(args.reel)}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    print(f"before / after / original: {rel(out)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("measure", help="measure a video's grade")
    p.add_argument("video")
    p.add_argument("--exclude", action="append", default=[], help="x,y,w,h of graphics to ignore (repeatable)")
    p.add_argument("--range", help="seconds to sample, like 2-9")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_measure)

    p = sub.add_parser("lut", help="build a .cube that moves CLIP onto REEL's look")
    p.add_argument("reel")
    p.add_argument("clip")
    p.add_argument("--out", required=True, help="path of the .cube file")
    p.add_argument("--strength", type=float, default=1.0, help="0-1; use 0.5 when the rooms differ a lot")
    p.add_argument("--exclude", action="append", default=[], help="graphics in the reel to ignore")
    p.add_argument("--range", help="seconds of the reel to sample")
    p.add_argument("--no-skin-lift", action="store_true")
    p.add_argument("--no-hue-gate", action="store_true", help="keep hues the reel does not use")
    p.set_defaults(func=cmd_lut)

    p = sub.add_parser("compare", help="before / after / original, side by side")
    p.add_argument("clip")
    p.add_argument("reel")
    p.add_argument("--lut", required=True)
    p.add_argument("--clip-t", type=float, help="time in your clip (default: middle)")
    p.add_argument("--reel-t", type=float, help="time in the reel (default: middle)")
    p.add_argument("--height", type=int, default=960)
    p.add_argument("--out")
    p.set_defaults(func=cmd_compare)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
