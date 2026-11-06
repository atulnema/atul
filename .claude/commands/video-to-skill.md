---
description: Turn a video link into a Claude skill (download, frames, transcript), then delete the video
argument-hint: <video-url> [skill-name]
allowed-tools: Bash(scripts/video-to-skill.sh:*), Read, Write
---

Turn this video into a reusable skill: $ARGUMENTS

1. Run `scripts/video-to-skill.sh $ARGUMENTS`. It downloads the video, saves frames and a
   transcript into `.claude/skills/<name>/`, and deletes the video itself. The last line it
   prints is the skill directory. If it fails, show the error and stop. Do not retry with
   a different tool.
2. Read `source.txt`, `transcript.txt`, and the frames in that directory. Look at the frames
   that matter (UI states, code on screen, diagrams), not necessarily all of them.
3. Write `SKILL.md` in that directory:
   - YAML frontmatter with `name` (the directory name) and a `description` that says what
     the skill does and when to use it, specific enough to trigger correctly.
   - Body: the procedure or knowledge from the video as clear steps, in your own words.
     Include exact commands, code, and settings shown on screen. Drop filler and tangents.
   - Reference any frames worth keeping as `frames/frame-NNN.jpg`; delete the frames you
     don't reference.
4. Confirm no video file remains in the skill directory or the temp dir, then give me the
   skill name, the path, and a two-line summary of what it teaches.
