#!/usr/bin/env python3
"""Time an animation or transition frame by frame.

  motion.py VIDEO --start 1.0 --end 2.2 [--box x,y,w,h] [--fg "#F5EEE1"]

Decodes every source frame in the window and reports, per frame:
  change  how much the region changed since the previous frame (0-255)
  sharp   fine edge energy of the region
  blur    0 = sharp, 1 = fully blurred, read at three scales so ramps can be timed
  cover/x/y (with --fg)  how much of that colour is on screen and where its ink box sits

Then it summarises what moved: start, end, duration in frames and seconds, the distance
travelled, the easing curve that fits best, and for blurs the in / hold / out times.
"""

from __future__ import annotations

import argparse
import csv

import numpy as np

from _common import die, hex_to_rgb, parse_box, probe, read_frames, rel, stem, work_dir

EASINGS = {
    "linear": lambda t: t,
    "ease-out quad": lambda t: 1 - (1 - t) ** 2,
    "ease-out cubic": lambda t: 1 - (1 - t) ** 3,
    "ease-out quart": lambda t: 1 - (1 - t) ** 4,
    "ease-out expo": lambda t: np.where(t >= 1, 1.0, 1 - 2.0 ** (-10 * t)),
    "ease-in quad": lambda t: t**2,
    "ease-in cubic": lambda t: t**3,
    "ease-in-out cubic": lambda t: np.where(t < 0.5, 4 * t**3, 1 - (-2 * t + 2) ** 3 / 2),
    "ease-out back": lambda t: 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
}
BEZIER = {
    "linear": "linear",
    "ease-out quad": "bezier(0.5, 1, 0.89, 1)",
    "ease-out cubic": "bezier(0.33, 1, 0.68, 1)",
    "ease-out quart": "bezier(0.25, 1, 0.5, 1)",
    "ease-out expo": "bezier(0.16, 1, 0.3, 1)",
    "ease-in quad": "bezier(0.11, 0, 0.5, 0)",
    "ease-in cubic": "bezier(0.32, 0, 0.67, 0)",
    "ease-in-out cubic": "bezier(0.65, 0, 0.35, 1)",
    "ease-out back": "bezier(0.34, 1.56, 0.64, 1)",
}


SCALES = (2, 8, 24, 48)


def sharpness(gray: np.ndarray) -> list[float]:
    """Edge energy from fine to coarse scale. Fine detail dies with the slightest blur;
    the coarse scales keep falling as the blur grows, which is what lets the ramp in and
    out of a blur be timed."""
    out = []
    for scale in SCALES:
        h, w = (gray.shape[0] // scale) * scale, (gray.shape[1] // scale) * scale
        if h < scale * 4 or w < scale * 4:
            out.append(0.0)
            continue
        g = gray[:h, :w].reshape(h // scale, scale, w // scale, scale).mean(axis=(1, 3))
        out.append(float((np.diff(g, axis=0) ** 2).mean() + (np.diff(g, axis=1) ** 2).mean()))
    return out


def ink_extent(mask: np.ndarray):
    """Edges of the element, ignoring stray pixels: a row or column counts only if it
    holds at least a tenth of the ink of the fullest one."""
    rows, cols = mask.sum(axis=1), mask.sum(axis=0)
    if rows.max() < 3 or cols.max() < 3:
        return None
    ys = np.flatnonzero(rows >= rows.max() * 0.1)
    xs = np.flatnonzero(cols >= cols.max() * 0.1)
    return int(xs[0]), int(ys[0]), int(xs[-1]) + 1, int(ys[-1]) + 1


def despeckle(mask: np.ndarray, grow: int = 0) -> np.ndarray:
    """Drop isolated pixels (keep a pixel only if its 4 neighbours are set), then
    restore the outline. With `grow`, widen the result by that many pixels instead."""
    core = mask.copy()
    core[1:, :] &= mask[:-1, :]
    core[:-1, :] &= mask[1:, :]
    core[:, 1:] &= mask[:, :-1]
    core[:, :-1] &= mask[:, 1:]
    out = core.copy()
    for _ in range(1 + grow):
        wide = out.copy()
        wide[1:, :] |= out[:-1, :]
        wide[:-1, :] |= out[1:, :]
        wide[:, 1:] |= out[:, :-1]
        wide[:, :-1] |= out[:, 1:]
        out = wide
    return out if grow else out & mask


def active_span(values: np.ndarray, threshold: float) -> tuple[int, int] | None:
    idx = np.flatnonzero(values > threshold)
    return (int(idx[0]), int(idx[-1])) if len(idx) else None


def fit_easing(progress: np.ndarray) -> tuple[str, float]:
    t = np.linspace(0, 1, len(progress))
    errors = {name: float(np.sqrt(np.mean((fn(t) - progress) ** 2))) for name, fn in EASINGS.items()}
    best = min(errors, key=errors.get)
    return best, errors[best]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("video")
    parser.add_argument("--start", type=float, required=True, help="window start, seconds")
    parser.add_argument("--end", type=float, required=True, help="window end, seconds")
    parser.add_argument("--box", help="x,y,w,h region to watch (default: whole frame)")
    parser.add_argument("--fg", help="hex colour of the element to track")
    parser.add_argument("--tol", type=float, default=48, help="colour tolerance for --fg (default 48)")
    parser.add_argument("--quiet", action="store_true", help="summary only, no per-frame table")
    args = parser.parse_args()

    meta = probe(args.video)
    if args.end <= args.start:
        die("--end must be after --start")
    fps = meta["fps"]
    x0, y0, x1, y1 = parse_box(args.box, meta["width"], meta["height"])
    fg = hex_to_rgb(args.fg) if args.fg else None

    rows, prev, masks = [], None, []
    for _, t, frame in read_frames(args.video, start=args.start, end=args.end):
        region = frame[y0:y1, x0:x1].astype(np.float64)
        gray = region @ np.array([0.2126, 0.7152, 0.0722])
        rows.append({
            "frame": round(t * fps),
            "t": round(t, 4),
            "change": 0.0 if prev is None else float(np.abs(gray - prev).mean()),
            "sharp": sharpness(gray),
        })
        prev = gray
        if fg is not None:
            masks.append(np.sqrt(((region - fg) ** 2).sum(axis=2)) <= args.tol)

    background_note = None
    if masks:
        cover = np.array([m.mean() for m in masks])
        # Footage that happens to share the colour is not the element. If the element is
        # absent at one end of the window, whatever matches there is background.
        for edge, label in ((0, "first"), (-1, "last")):
            if cover[edge] < cover.max() * 0.35 and cover[edge] > 0:
                ignore = despeckle(masks[edge], grow=3)
                masks = [m & ~ignore for m in masks]
                background_note = f"ignored footage matching {args.fg} in the {label} frame"
                break
        for row, mask in zip(rows, masks):
            mask = despeckle(mask)
            row["cover"] = float(mask.mean())
            extent = ink_extent(mask) if mask.sum() >= 12 else None
            if extent:
                row.update(left=x0 + extent[0], top=y0 + extent[1],
                           right=x0 + extent[2], bottom=y0 + extent[3])
    if len(rows) < 3:
        die("window too short: need at least 3 frames")

    # Blur level per frame: 0 = as sharp as the window's ends, 1 = all edge energy gone.
    energy = np.array([r["sharp"] for r in rows])
    baseline = np.minimum(energy[:2].mean(axis=0), energy[-2:].mean(axis=0))
    usable = baseline > 1e-6
    blur = np.zeros(len(rows))
    if usable.any():
        blur = (1 - np.clip(energy[:, usable] / baseline[usable], 0, 1)).mean(axis=1)
    for row, level in zip(rows, blur):
        row["sharp"] = row["sharp"][0]
        row["blur"] = round(float(level), 3)

    out = work_dir(stem(args.video), "motion") / f"{args.start:.2f}-{args.end:.2f}.csv"
    fields = ["frame", "t", "change", "sharp", "blur", "cover", "left", "right", "top", "bottom"]
    with open(out, "w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, restval="")
        writer.writeheader()
        writer.writerows(rows)

    if not args.quiet:
        head = " frame      t  change     sharp   blur"
        if fg is not None:
            head += "   cover   left  right    top bottom"
        print(head)
        for row in rows:
            line = f"{row['frame']:>6} {row['t']:>6.3f} {row['change']:>7.2f} {row['sharp']:>9.1f} {row['blur']:>6.2f}"
            if fg is not None:
                line += f" {row['cover'] * 100:>6.2f}%"
                if "left" in row:
                    line += f" {row['left']:>6} {row['right']:>6} {row['top']:>6} {row['bottom']:>6}"
            print(line)
        print()

    print(f"{len(rows)} frames at {fps:.3f} fps ({1 / fps * 1000:.1f} ms each)")

    change = np.array([r["change"] for r in rows])
    span = active_span(change, max(0.6, change.max() * 0.08))
    if span is None:
        print("change   nothing moves in this window")
    else:
        a, b = span
        n = b - a + 1
        print(
            f"change   frames {rows[a]['frame']}-{rows[b]['frame']}"
            f" ({rows[a]['t']:.3f}s to {rows[b]['t'] + 1 / fps:.3f}s): {n} frames = {n / fps:.3f} s"
        )

    peak = float(blur.max())
    if peak >= 0.3:
        active = np.flatnonzero(blur > peak * 0.1)
        held = np.flatnonzero(blur >= peak * 0.95)
        first, last = int(active[0]), int(active[-1])
        hold_a, hold_b = int(held[0]), int(held[-1])
        t_in, t_hold, t_out = hold_a - first, hold_b - hold_a + 1, last - hold_b
        print(
            f"blur     frames {rows[first]['frame']}-{rows[last]['frame']}:"
            f" in {t_in} f ({t_in / fps:.2f} s), hold {t_hold} f ({t_hold / fps:.2f} s),"
            f" out {t_out} f ({t_out / fps:.2f} s)"
        )
    else:
        print("blur     none (no dip in sharpness that recovers inside this window)")

    if fg is not None:
        if background_note:
            print(f"track    {background_note}")
        touching = [r for r in rows if "top" in r and (
            r["left"] <= x0 or r["top"] <= y0 or r["right"] >= x1 or r["bottom"] >= y1)]
        if len(touching) > len(rows) // 3:
            print(f"track    warning: the tracked ink touches the edge of the box in {len(touching)} frames."
                  " Footage is matching this colour too: lower --tol or tighten --box.")
        tracked = [r for r in rows if "top" in r]
        cover = np.array([r.get("cover", 0.0) for r in rows])
        if not tracked:
            print(f"track    colour {args.fg} never appears: check the hex or raise --tol")
            print(f"csv      {rel(out)}")
            return
        peak = cover.max()
        rising = np.flatnonzero(cover >= peak * 0.05)
        full = np.flatnonzero(cover >= peak * 0.95)
        if full[0] > rising[0]:
            n = int(full[0] - rising[0] + 1)
            print(
                f"appear   frame {rows[rising[0]]['frame']} to {rows[full[0]]['frame']}:"
                f" {n} frames = {n / fps:.3f} s to reach full coverage"
            )
        elif rising[0] > 0:
            print(f"appear   frame {rows[rising[0]]['frame']}: fully there in one frame (no fade)")
        for axis, key in (("y", "top"), ("x", "left")):
            pos = np.array([r[key] for r in tracked], dtype=np.float64)
            travel = pos[-1] - pos[0]
            if abs(travel) < 3:
                continue
            moving = np.flatnonzero(np.abs(np.diff(pos)) > 0.5)
            a, b = int(moving[0]), int(moving[-1]) + 1
            segment = pos[a : b + 1]
            progress = (segment - segment[0]) / (segment[-1] - segment[0])
            line = (
                f"move {axis}   {segment[0]:.0f} -> {segment[-1]:.0f} px ({travel:+.0f} px) over"
                f" {b - a} frames = {(b - a) / fps:.3f} s"
            )
            if len(segment) >= 4:
                name, err = fit_easing(progress)
                line += f", easing ~ {name} [{BEZIER[name]}], fit error {err:.3f}"
            else:
                line += " (too few frames to fit an easing)"
            print(line)
    print(f"csv      {rel(out)}")


if __name__ == "__main__":
    main()
