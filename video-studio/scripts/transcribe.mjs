#!/usr/bin/env node
/**
 * Word-level captions for a clip, using Whisper.cpp on this machine. Nothing is uploaded.
 *
 *   node scripts/transcribe.mjs public/footage/me.mp4 [--model medium.en]
 *
 * Writes public/footage/me.captions.json in Remotion's Caption format. Transcribe the
 * file that scripts/cut.py produced, so the times already match the edited timeline.
 *
 * The first run downloads and builds Whisper.cpp into ./whisper.cpp (needs git, make and
 * a C++ compiler) and fetches the model, about 1.5 GB for medium.en. Use --model base.en
 * for a quick, rougher pass. Use a model without ".en" for languages other than English.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.5.5";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith("--"));
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

if (!input) {
  console.error(
    "usage: node scripts/transcribe.mjs <video or audio file> [--model medium.en] [--out file.json]",
  );
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`error: file not found: ${input}`);
  process.exit(1);
}

const model = flag("model", "medium.en");
const out = flag("out", input.replace(/\.[^.]+$/, ".captions.json"));
const whisperPath = path.join(root, "whisper.cpp");

try {
  await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
  await downloadWhisperModel({ model, folder: whisperPath });
} catch (err) {
  console.error(`error: could not set up Whisper.cpp: ${err.message}`);
  console.error(
    "It is fetched from github.com and huggingface.co. If this machine blocks those hosts,\n" +
      "run this script somewhere that allows them, or supply captions another way: any\n" +
      "word-level transcript saved in Remotion's Caption format works (see README).",
  );
  process.exit(1);
}

// Whisper.cpp wants 16 kHz mono WAV.
const wav = path.join(os.tmpdir(), `transcribe-${process.pid}.wav`);
execFileSync(
  "ffmpeg",
  ["-v", "error", "-y", "-i", input, "-vn", "-ac", "1", "-ar", "16000", wav],
  { stdio: "inherit" },
);

try {
  const whisperCppOutput = await transcribe({
    model,
    whisperPath,
    whisperCppVersion: WHISPER_VERSION,
    inputPath: wav,
    tokenLevelTimestamps: true,
  });
  const { captions } = toCaptions({ whisperCppOutput });
  fs.writeFileSync(out, JSON.stringify(captions, null, 2));
  const seconds = captions.length ? captions[captions.length - 1].endMs / 1000 : 0;
  console.log(`${captions.length} words over ${seconds.toFixed(1)} s -> ${out}`);
} finally {
  fs.rmSync(wav, { force: true });
}
