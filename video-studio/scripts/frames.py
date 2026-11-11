#!/usr/bin/env python3
"""Pull frames out of a video.

  frames.py sheets VIDEO [--fps 3]      contact sheets, every frame labelled with its time
  frames.py grab VIDEO -t 1.5 -t 2.0    lossless full-size PNGs at exact times
  frames.py info VIDEO                  size, fps, duration

Contact sheets are for seeing every beat. Measure from `grab` PNGs, never from sheets:
sheet thumbnails are scaled and JPEG-compressed.
"""

from __future__ import annotations

import argparse
import math

from PIL import Image, ImageDraw, ImageFont

from _common import die, probe, read_frames, rel, run, stem, work_dir

LABEL_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def label_font(size: int):
    try:
        return ImageFont.truetype(LABEL_FONT, size)
    except OSError:
        return ImageFont.load_default()


def sheets(args) -> None:
    meta = probe(args.video)
    name = args.name or stem(args.video)
    out = work_dir(name, "sheets")
    for old in out.glob("sheet_*.jpg"):
        old.unlink()
    thumb_w = args.thumb
    per_sheet = args.cols * args.rows
    font = label_font(max(12, thumb_w // 16))
    cells, count, sheet_no = [], 0, 0

    def flush() -> None:
        nonlocal cells, sheet_no
        if not cells:
            return
        th = cells[0][1].height
        rows = math.ceil(len(cells) / args.cols)
        sheet = Image.new("RGB", (args.cols * thumb_w, rows * th), "#101010")
        draw = ImageDraw.Draw(sheet)
        for i, (text, img) in enumerate(cells):
            x, y = (i % args.cols) * thumb_w, (i // args.cols) * th
            sheet.paste(img, (x, y))
            box = draw.textbbox((x + 4, y + 4), text, font=font)
            draw.rectangle((box[0] - 3, box[1] - 2, box[2] + 3, box[3] + 2), fill="#000000")
            draw.text((x + 4, y + 4), text, font=font, fill="#FFE066")
        sheet_no += 1
        first, last = cells[0][0].split()[0], cells[-1][0].split()[0]
        path = out / f"sheet_{sheet_no:03d}_{first}-{last}.jpg"
        sheet.save(path, quality=88)
        print(f"  {rel(path)}")
        cells = []

    print(
        f"{meta['width']}x{meta['height']} @ {meta['fps']:.3f} fps, {meta['duration']:.2f} s"
        f" -> {args.fps:g} frames per second, {per_sheet} per sheet"
    )
    for _, t, frame in read_frames(args.video, fps=args.fps, width=thumb_w):
        source_frame = round(t * meta["fps"])
        cells.append((f"{t:.2f}s f{source_frame}", Image.fromarray(frame)))
        count += 1
        if len(cells) == per_sheet:
            flush()
    flush()
    if count == 0:
        die("no frames decoded")
    print(f"{count} frames on {sheet_no} sheet(s) in {rel(out)}")


def grab(args) -> None:
    meta = probe(args.video)
    name = args.name or stem(args.video)
    out = work_dir(name, "grabs")
    times = list(args.time or [])
    times += [f / meta["fps"] for f in (args.frame or [])]
    if not times:
        die("give at least one -t SECONDS or -f FRAME")
    for t in times:
        if t < 0 or (meta["duration"] and t > meta["duration"]):
            die(f"{t:.3f}s is outside the video (0 to {meta['duration']:.2f}s)")
        frame_no = round(t * meta["fps"])
        path = out / f"t{t:08.3f}_f{frame_no}.png"
        # Seek by frame number so the PNG is the exact frame, not the nearest keyframe.
        run(
            ["ffmpeg", "-v", "error", "-y", "-i", args.video, "-an",
             "-vf", f"select=eq(n\\,{frame_no})", "-frames:v", "1", "-fps_mode", "passthrough",
             str(path)]
        )
        if not path.exists():
            die(f"could not grab frame {frame_no}")
        print(f"  {rel(path)}  ({meta['width']}x{meta['height']}, t={t:.3f}s, frame {frame_no})")


def info(args) -> None:
    meta = probe(args.video)
    frames = round(meta["duration"] * meta["fps"])
    print(f"size      {meta['width']}x{meta['height']}")
    print(f"fps       {meta['fps']:.3f}")
    print(f"duration  {meta['duration']:.3f} s ({frames} frames)")
    print(f"audio     {'yes' if meta['has_audio'] else 'no'}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("sheets", help="contact sheets with timestamps")
    p.add_argument("video")
    p.add_argument("--fps", type=float, default=3.0, help="frames sampled per second (default 3)")
    p.add_argument("--cols", type=int, default=6)
    p.add_argument("--rows", type=int, default=3)
    p.add_argument("--thumb", type=int, default=270, help="thumbnail width in px")
    p.add_argument("--name", help="work/ subfolder (default: the file name)")
    p.set_defaults(func=sheets)

    p = sub.add_parser("grab", help="lossless PNG at exact times")
    p.add_argument("video")
    p.add_argument("-t", "--time", type=float, action="append", help="time in seconds (repeatable)")
    p.add_argument("-f", "--frame", type=int, action="append", help="source frame number (repeatable)")
    p.add_argument("--name")
    p.set_defaults(func=grab)

    p = sub.add_parser("info", help="size, fps, duration")
    p.add_argument("video")
    p.set_defaults(func=info)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
