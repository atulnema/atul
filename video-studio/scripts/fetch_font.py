#!/usr/bin/env python3
"""Download Google Fonts families as .ttf into fonts/ so font_match.py can score them.

  fetch_font.py "Instrument Serif" "DM Mono" "Playfair Display"
  fetch_font.py "Inter" --weights 400,600,800 --italic

Only family names go to Google. Copy the winning file to public/fonts/ and point the
style tokens at it so Remotion renders with the exact file that was scored.
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

from _common import ROOT, rel

CSS_API = "https://fonts.googleapis.com/css2"
BLOCK = re.compile(r"@font-face\s*{(.*?)}", re.S)


def get(url: str) -> bytes:
    # A plain client name makes the API answer with TrueType files instead of WOFF2.
    request = urllib.request.Request(url, headers={"User-Agent": "font-fetch/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def fetch(family: str, weights: list[str], italic: bool) -> int:
    styles = [0, 1] if italic else [0]
    tuples = ";".join(f"{i},{w}" for i in styles for w in sorted(weights, key=int))
    attempts = [f"{family}:ital,wght@{tuples}"]
    if italic:
        attempts.append(f"{family}:ital@0;1")
    attempts.append(family)
    css = None
    for spec in attempts:
        try:
            css = get(f"{CSS_API}?family={urllib.parse.quote(spec, safe=':@,;')}").decode()
            break
        except urllib.error.HTTPError:
            continue
        except urllib.error.URLError as exc:
            print(f"  network error for '{family}': {exc.reason}", file=sys.stderr)
            return 0
    if css is None:
        print(f"  '{family}' not found on Google Fonts (check the spelling)", file=sys.stderr)
        return 0

    out_dir = ROOT / "fonts"
    out_dir.mkdir(exist_ok=True)
    saved = 0
    for block in BLOCK.findall(css):
        url = re.search(r"url\((https://[^)]+)\)", block)
        if not url:
            continue
        weight = re.search(r"font-weight:\s*(\d+)", block)
        style = re.search(r"font-style:\s*(\w+)", block)
        suffix = "Italic" if style and style.group(1) == "italic" else ""
        ext = url.group(1).rsplit(".", 1)[-1].lower()
        if ext not in ("ttf", "otf"):
            continue
        name = f"{family.replace(' ', '')}-{weight.group(1) if weight else '400'}{suffix}.{ext}"
        path = out_dir / name
        path.write_bytes(get(url.group(1)))
        print(f"  {rel(path)}")
        saved += 1
    if saved == 0:
        print(f"  no TrueType files offered for '{family}'", file=sys.stderr)
    return saved


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("families", nargs="+")
    parser.add_argument("--weights", default="400,700", help="comma list (default 400,700)")
    parser.add_argument("--italic", action="store_true", help="also fetch italics")
    args = parser.parse_args()

    total = 0
    for family in args.families:
        print(family)
        total += fetch(family, args.weights.split(","), args.italic)
    print(f"{total} file(s) saved")
    sys.exit(0 if total else 1)


if __name__ == "__main__":
    main()
