# edge-tts-mcp (patched)

Local copy of [eraincc/edge-tts-mcp](https://github.com/eraincc/edge-tts-mcp) — an MCP server that turns text into speech using Microsoft Edge's free TTS voices. No API key needed.

## Tools

- `list_voice` — lists every available voice (use the `ShortName`, e.g. `en-US-AriaNeural`, `hi-IN-SwaraNeural`)
- `tts` — converts text to an MP3 (and optional `.srt` subtitles) and returns the file path

## What changed from upstream

Upstream doesn't run today, so this copy fixes four things:

1. **MCP SDK pinned below 2.0.** Upstream allows `mcp>=1.9.3`, which now installs 2.x, where `FastMCP` was renamed. The server crashed on startup.
2. **edge-tts upgraded to 7.2+.** Upstream pins `7.0.2`, which Microsoft now rejects with a 403.
3. **Proxy support.** edge-tts uses aiohttp, which ignores `HTTPS_PROXY`. The server now passes `EDGE_TTS_PROXY` or `HTTPS_PROXY` through explicitly, so it works behind a proxy (including Claude Code cloud sessions).
4. **Sensible output folder.** Audio goes to `./output/tts/` (override with `EDGE_TTS_OUTPUT_DIR`) instead of inside the Python package directory.

## Running it

It's registered in the repo's `.mcp.json`, so Claude Code picks it up automatically. To run by hand:

```bash
uv run --project mcp-servers/edge-tts-mcp edge_tts_mcp
```

Needs network access to `speech.platform.bing.com`.

License: see `LICENSE` (same as upstream).
