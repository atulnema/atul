# Using a GitHub repo with Claude or Codex (30-second video)

`github-repo-claude-codex-30s.mp4`: 1920×1080, 30 fps, 30 seconds, no audio.

## Scenes

| Time | Scene |
| --- | --- |
| 0–3s | Title |
| 3–9s | Step 01: Connect GitHub (claude.ai/code or chatgpt.com/codex) |
| 9–15s | Step 02: Pick the repo and branch, then describe the task |
| 15–21s | Step 03: The agent clones the repo, edits the code and runs tests |
| 21–26s | Step 04: Review the diff and open a pull request |
| 26–30s | Terminal option: `claude` or `codex` inside the repo |

## Voiceover script

> Want Claude or Codex working on your GitHub repo? Here's how.
> First, connect GitHub and choose which repos the agent can access.
> Next, pick your repo and branch, and describe the task clearly.
> The agent clones your code into a sandbox, makes the changes and runs your tests.
> Then review the diff and open a pull request.
> Prefer the terminal? Just cd into your repo and run claude, or codex.

## Re-rendering

The video is an HTML animation (`scene.html`) captured frame by frame with Playwright and encoded with ffmpeg.

```bash
node render.js out.mp4            # full video
node render.js x --stills         # preview stills only
```

Requires Node, Playwright with Chromium, and ffmpeg. Edit text, colors or timings in `scene.html`.
