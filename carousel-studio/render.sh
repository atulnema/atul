#!/usr/bin/env bash
# Full render: screenshot every frame of every slide (render.js), then
# ffmpeg-encode each slide's frame sequence into its own MP4.
set -euo pipefail

cd "$(dirname "$0")"

ONLY_ARG=""
if [[ "${1:-}" == --only=* ]]; then
  ONLY_ARG="$1"
fi

echo "== Rendering frames (headless Chrome) =="
node render.js $ONLY_ARG

echo "== Encoding MP4s (ffmpeg) =="
FPS=30
for frame_dir in output/frames/*/; do
  slide_name="$(basename "$frame_dir")"
  if [[ -n "$ONLY_ARG" && "$slide_name" != *"${ONLY_ARG#--only=}"* ]]; then
    continue
  fi

  frame_count=$(find "$frame_dir" -name 'frame-*.png' | wc -l)
  echo "-- $slide_name: $frame_count frames"

  ffmpeg -y -loglevel error \
    -framerate "$FPS" \
    -i "${frame_dir}frame-%04d.png" \
    -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 18 \
    -vf "fps=${FPS},format=yuv420p" \
    "output/${slide_name}.mp4"

  echo "   -> output/${slide_name}.mp4"
done

echo "== Done =="
