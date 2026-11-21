// Generates the voiceover with ElevenLabs and writes word-level timing.
//
//   node scripts/voice.mjs --voice <voice_id> [--model eleven_multilingual_v2]
//   node scripts/voice.mjs --estimate     (no API call: fake timing for layout work)
//   node scripts/voice.mjs --audio my_take.mp3   (align your own MP3 recording to the script, 1:1 words)
//
// The API key is read from ELEVENLABS_API_KEY (sent as the xi-api-key header).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = JSON.parse(fs.readFileSync(path.join(root, "src/script.json"), "utf8"));

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const estimate = args.includes("--estimate");
const voiceId = arg("voice");
const model = arg("model", "eleven_multilingual_v2");
const speed = Number(arg("speed", "1.05"));

// ---- Build the token list (caption word <-> spoken text) -------------------
const tokens = [];
let text = "";
script.scenes.forEach((scene, sceneIndex) => {
  for (const raw of scene.words.trim().split(/\s+/)) {
    const [capRaw, ttsRaw] = raw.split("|");
    const emph = capRaw.startsWith("*");
    const cap = emph ? capRaw.slice(1) : capRaw;
    const tts = ttsRaw.replace(/_/g, " ");
    if (text.length) text += " ";
    tokens.push({ cap, emph, scene: sceneIndex, from: text.length, to: text.length + tts.length });
    text += tts;
  }
});

const outTiming = path.join(root, "src/timing.json");
const outAudio = path.join(root, "public/voice.mp3");

function writeTiming(words, duration, hasAudio) {
  const scenes = script.scenes.map((s, i) => {
    const w = words.filter((x) => x.scene === i);
    return { id: s.id, start: w[0].start, end: w[w.length - 1].end };
  });
  fs.writeFileSync(
    outTiming,
    JSON.stringify({ hasAudio, duration, scenes, words }, null, 1) + "\n",
  );
  console.log(`timing: ${words.length} words, ${duration.toFixed(2)}s, audio=${hasAudio}`);
}

if (estimate) {
  let t = 0.3;
  const words = tokens.map((tk) => {
    const len = 0.18 + tk.cap.length * 0.045;
    const w = { cap: tk.cap, emph: tk.emph, scene: tk.scene, start: +t.toFixed(3), end: +(t + len).toFixed(3) };
    t += len + (/[.,:?]$/.test(tk.cap) ? 0.28 : 0.04);
    return w;
  });
  writeTiming(words, t + 0.8, false);
  process.exit(0);
}

// ---- Own recording: transcribe with word timestamps, map 1:1 onto the script --
const audioIn = arg("audio");
if (audioIn) {
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(audioIn)], { type: "audio/mpeg" }), "voice.mp3");
  form.append("model_id", "scribe_v1");
  form.append("language_code", arg("lang", "hin"));
  form.append("timestamps_granularity", "word");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "proxy-injected" },
    body: form,
  });
  if (!r.ok) {
    console.error(r.status, await r.text());
    process.exit(1);
  }
  const stt = await r.json();
  const heard = stt.words.filter((w) => w.type === "word");
  if (heard.length !== tokens.length) {
    console.error(`Recording has ${heard.length} words, script has ${tokens.length}. They must match 1:1.`);
    console.error("Heard:", stt.text);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(outAudio), { recursive: true });
  fs.copyFileSync(audioIn, outAudio);
  const words = tokens.map((tk, i) => ({ cap: tk.cap, emph: tk.emph, scene: tk.scene, start: heard[i].start, end: heard[i].end }));
  writeTiming(words, heard[heard.length - 1].end + 0.9, true);
  console.log(`aligned ${audioIn} -> ${outAudio}`);
  process.exit(0);
}

if (!voiceId) {
  console.error("Missing --voice <voice_id> (or --audio <file.mp3> to align your own recording)");
  process.exit(1);
}

const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "proxy-injected",
    },
    body: JSON.stringify({
      text,
      model_id: model,
      language_code: model.startsWith("eleven_multilingual_v2") ? undefined : "hi",
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed },
    }),
  },
);
if (!res.ok) {
  console.error(res.status, await res.text());
  process.exit(1);
}
const data = await res.json();
fs.mkdirSync(path.dirname(outAudio), { recursive: true });
fs.writeFileSync(outAudio, Buffer.from(data.audio_base64, "base64"));

// alignment.characters are pieces of the input text, in order. Map each piece
// back to its offset in `text` so tokens can look up their start/end times.
const al = data.alignment;
const starts = new Array(text.length + 1).fill(null);
const ends = new Array(text.length + 1).fill(null);
let off = 0;
al.characters.forEach((ch, i) => {
  for (let k = 0; k < ch.length; k++) {
    starts[off + k] = al.character_start_times_seconds[i];
    ends[off + k] = al.character_end_times_seconds[i];
  }
  off += ch.length;
});
if (off !== text.length) console.warn(`alignment length ${off} != text length ${text.length}`);

const words = tokens.map((tk) => {
  let s = null;
  let e = null;
  for (let k = tk.from; k < tk.to; k++) {
    if (s === null && starts[k] !== null) s = starts[k];
    if (ends[k] !== null) e = ends[k];
  }
  return { cap: tk.cap, emph: tk.emph, scene: tk.scene, start: s ?? 0, end: e ?? s ?? 0 };
});
const duration = Math.max(...al.character_end_times_seconds) + 0.9;
writeTiming(words, duration, true);
console.log(`audio: ${outAudio}`);
