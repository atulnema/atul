#!/usr/bin/env bash
# video-to-skill.sh <url-or-file> [skill-name]
#
# Downloads a video, grabs frames, transcribes the audio, stores both in
# .claude/skills/<name>/, then deletes the video. The video is removed on every
# exit path (success, error, Ctrl-C) via the EXIT trap.
#
# Env overrides:
#   FRAME_EVERY=10     seconds between frames (default 10)
#   MAX_FRAMES=30      hard cap on frames kept
#   WHISPER_MODEL=base tiny|base|small|medium|large-v3
#   SKILLS_DIR=.claude/skills
set -euo pipefail

SRC="${1:?usage: video-to-skill.sh <url-or-file> [skill-name]}"
FRAME_EVERY="${FRAME_EVERY:-10}"
MAX_FRAMES="${MAX_FRAMES:-30}"
WHISPER_MODEL="${WHISPER_MODEL:-base}"
SKILLS_DIR="${SKILLS_DIR:-.claude/skills}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing dependency: $1 ($2)" >&2; exit 1; }; }
need ffmpeg "apt install ffmpeg / brew install ffmpeg"
need python3 "needed for transcription"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; echo "cleanup: temp dir (including the video) deleted" >&2; }
trap cleanup EXIT

# 1. Get the video -----------------------------------------------------------
if [[ -f "$SRC" ]]; then
  cp -- "$SRC" "$TMP/video.mp4"
  TITLE="$(basename "${SRC%.*}")"
else
  need yt-dlp "pip install yt-dlp"
  echo "downloading..." >&2
  yt-dlp -q --no-warnings --no-playlist -f "bv*[height<=720]+ba/b[height<=720]/b" \
    --merge-output-format mp4 -o "$TMP/video.%(ext)s" "$SRC"
  TITLE="$(yt-dlp --no-warnings --no-playlist --print title "$SRC" | head -1)"
fi
VIDEO="$(ls "$TMP"/video.* | head -1)"

# 2. Name the skill ----------------------------------------------------------
slug() { echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g' | cut -c1-48; }
NAME="${2:-$(slug "$TITLE")}"
[[ -n "$NAME" ]] || NAME="video-skill-$(date +%s)"
OUT="$SKILLS_DIR/$NAME"
mkdir -p "$OUT/frames"

# 3. Frames ------------------------------------------------------------------
echo "grabbing frames every ${FRAME_EVERY}s (max $MAX_FRAMES)..." >&2
ffmpeg -v error -y -i "$VIDEO" -vf "fps=1/${FRAME_EVERY},scale='min(1024,iw)':-2" \
  -frames:v "$MAX_FRAMES" -q:v 4 "$OUT/frames/frame-%03d.jpg"

# 4. Transcript --------------------------------------------------------------
echo "transcribing (whisper: $WHISPER_MODEL)..." >&2
ffmpeg -v error -y -i "$VIDEO" -vn -ac 1 -ar 16000 "$TMP/audio.wav"
if command -v whisper >/dev/null 2>&1; then
  whisper "$TMP/audio.wav" --model "$WHISPER_MODEL" --output_format txt \
    --output_dir "$TMP" --verbose False >/dev/null
  mv "$TMP/audio.txt" "$OUT/transcript.txt"
else
  python3 -I - "$TMP/audio.wav" "$OUT/transcript.txt" "$WHISPER_MODEL" <<'PY'
import sys
try:
    from faster_whisper import WhisperModel
except ImportError:
    sys.exit("no transcriber found: pip install faster-whisper  (or openai-whisper)")
wav, out, model = sys.argv[1:4]
segs, _ = WhisperModel(model, compute_type="int8").transcribe(wav)
with open(out, "w") as f:
    for s in segs:
        f.write(f"[{int(s.start)//60:02d}:{int(s.start)%60:02d}] {s.text.strip()}\n")
PY
fi

# 5. Metadata for the skill author ------------------------------------------
{
  echo "source: $SRC"
  echo "title: $TITLE"
  echo "frames: $(ls "$OUT/frames" | wc -l) (one every ${FRAME_EVERY}s)"
  echo "transcript_words: $(wc -w < "$OUT/transcript.txt")"
} > "$OUT/source.txt"

# 6. Delete the video (the trap also wipes $TMP) -----------------------------
rm -f "$VIDEO"

echo "$OUT"
