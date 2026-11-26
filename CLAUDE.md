# Notes for Claude

## Voiceovers: use VoiceStudio, not ElevenLabs

For any Hindi or English voiceover, generate it with **VoiceStudio**
(https://github.com/debpalash/VoiceStudio), running locally. Do not use the
ElevenLabs connector or API for voiceovers.

### Setting it up in a cloud session

The container is rebuilt for each session, so VoiceStudio has to be installed again:

```bash
cd /home/user
git clone https://github.com/debpalash/VoiceStudio.git
cd VoiceStudio
bun install && (cd electron && bun install)
bun run setup:api          # Python env; CPU PyTorch when there is no GPU
bun run dev:api            # backend on http://localhost:3900 (run in background, long timeout)
curl -s http://localhost:3900/health
```

- **Network:** the lockfile pulls PyTorch wheels from `download.pytorch.org` and
  `download-r2.pytorch.org`. Model weights come from `huggingface.co`. Use the
  personal cloud environment **VoiceStudio**, which allows the PyTorch hosts. If
  Hugging Face is blocked, propose adding it.
- **Model:** the default engine is `k2-fsa/OmniVoice`, about 2.4 GB, installed with
  `POST /models/install {"repo_id": "k2-fsa/OmniVoice"}`. Its weights are
  **CC-BY-NC (non-commercial only)**. Before a voiceover meant for paid or
  client work, check the model's license in `GET /models` and use an engine
  that allows commercial use.
- **API:** the endpoints are listed at `http://localhost:3900/openapi.json`. The
  backend also serves an MCP server at `/mcp`.
- Background processes in a cloud session stop after their time limit. Restart
  the backend if `/health` stops answering.
