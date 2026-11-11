"""Shared helpers for the measurement scripts. Needs ffmpeg/ffprobe, Pillow, numpy."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "work"


def die(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    proc = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if check and proc.returncode != 0:
        tail = "\n".join(proc.stderr.strip().splitlines()[-12:])
        die(f"{cmd[0]} failed:\n{tail}")
    return proc


def probe(path: str | os.PathLike) -> dict:
    """Display size (rotation applied), fps, duration and audio presence."""
    path = str(path)
    if not Path(path).exists():
        die(f"file not found: {path}")
    out = run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path]
    ).stdout
    info = json.loads(out)
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    if video is None:
        die(f"no video stream in {path}")
    w, h = int(video["width"]), int(video["height"])
    rotation = 0
    for side in video.get("side_data_list", []):
        if "rotation" in side:
            rotation = int(side["rotation"])
    if "rotate" in video.get("tags", {}):
        rotation = int(video["tags"]["rotate"])
    if abs(rotation) % 180 == 90:
        w, h = h, w
    num, den = (video.get("avg_frame_rate") or video["r_frame_rate"]).split("/")
    fps = float(num) / float(den) if float(den) else 0.0
    if fps <= 0:
        num, den = video["r_frame_rate"].split("/")
        fps = float(num) / float(den)
    duration = float(video.get("duration") or info["format"].get("duration") or 0)
    return {
        "path": path,
        "width": w,
        "height": h,
        "fps": fps,
        "duration": duration,
        "has_audio": any(s["codec_type"] == "audio" for s in info["streams"]),
    }


def read_frames(
    path: str | os.PathLike,
    *,
    fps: float | None = None,
    width: int | None = None,
    start: float | None = None,
    end: float | None = None,
    gray: bool = False,
):
    """Yield (index, time_seconds, array) for decoded frames.

    Frames are uint8, shape (h, w) for gray or (h, w, 3) RGB. `fps=None` keeps the
    source frame rate, so timings can be read frame by frame.
    """
    meta = probe(path)
    out_fps = fps or meta["fps"]
    w = width or meta["width"]
    w -= w % 2
    h = round(meta["height"] * w / meta["width"])
    h -= h % 2
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.4f}"]
    if end is not None:
        cmd += ["-t", f"{end - (start or 0):.4f}"]
    # When sampling below the source rate, round up so each output frame is the source
    # frame AT its timestamp. The default rounding picks one half an interval later,
    # which would mislabel contact sheets.
    rounding = ":round=up" if out_fps < meta["fps"] - 1e-6 else ""
    filters = [f"fps={out_fps:.6f}{rounding}", f"scale={w}:{h}:flags=area"]
    cmd += ["-i", str(path), "-an", "-vf", ",".join(filters)]
    cmd += ["-pix_fmt", "gray" if gray else "rgb24", "-f", "rawvideo", "-"]
    channels = 1 if gray else 3
    size = w * h * channels
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    index = 0
    try:
        while True:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                break
            arr = np.frombuffer(buf, dtype=np.uint8)
            arr = arr.reshape((h, w) if gray else (h, w, 3))
            yield index, (start or 0) + index / out_fps, arr
            index += 1
    finally:
        proc.stdout.close()
        proc.kill()
        proc.wait()


def parse_box(text: str | None, width: int, height: int) -> tuple[int, int, int, int]:
    """'x,y,w,h' in pixels -> clamped (x0, y0, x1, y1). None means the full frame."""
    if not text:
        return 0, 0, width, height
    try:
        x, y, w, h = (int(round(float(v))) for v in text.split(","))
    except ValueError:
        die(f"box must be x,y,w,h in pixels, got '{text}'")
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(width, x + w), min(height, y + h)
    if x1 <= x0 or y1 <= y0:
        die(f"box {text} is outside the {width}x{height} frame")
    return x0, y0, x1, y1


def hex_to_rgb(text: str) -> np.ndarray:
    text = text.strip().lstrip("#")
    if len(text) == 3:
        text = "".join(c * 2 for c in text)
    if len(text) != 6:
        die(f"colour must be a hex value like #1C351F, got '{text}'")
    return np.array([int(text[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)


def rgb_to_hex(rgb) -> str:
    r, g, b = (int(round(float(v))) for v in rgb)
    return f"#{max(0, min(255, r)):02X}{max(0, min(255, g)):02X}{max(0, min(255, b)):02X}"


def luma(rgb: np.ndarray) -> np.ndarray:
    """Rec.709 luma on the encoded values. Input and output share the same scale."""
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def work_dir(name: str, *parts: str) -> Path:
    path = WORK.joinpath(name, *parts)
    path.mkdir(parents=True, exist_ok=True)
    return path


def stem(path: str | os.PathLike) -> str:
    return Path(path).stem


def rel(path: Path) -> str:
    try:
        return str(Path(path).resolve().relative_to(Path.cwd()))
    except ValueError:
        return str(path)
