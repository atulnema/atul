// Generates short UI sound effects with ElevenLabs into public/sfx/.
//   node scripts/sfx.mjs            (skips files that already exist)
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "public/sfx");
fs.mkdirSync(dir, { recursive: true });

const SFX = {
  whoosh: ["Quick soft airy swoosh transition for a clean UI motion graphic, short, no music", 0.6],
  stamp: ["Heavy rubber stamp slammed hard on paper on a desk, single loud thud", 0.7],
  pop: ["Bright soft bubble pop user interface sound, single", 0.5],
  sparkle: ["Short magical shimmer chime sparkle, clean and modern", 1.0],
  unlock: ["Small metal padlock unlocking click, crisp, single", 0.5],
  ding: ["Pleasant success notification ding, modern app, single", 0.8],
  typing: ["Fast mechanical keyboard typing burst, a few keystrokes", 1.0],
  click: ["Single crisp mouse click", 0.5],
  impact: ["Deep cinematic bass hit impact boom, short", 1.2],
  alarm: ["Short warning alarm beep beep, two quick beeps, digital", 1.0],
};

for (const [name, [text, duration]] of Object.entries(SFX)) {
  const out = path.join(dir, `${name}.mp3`);
  if (fs.existsSync(out)) continue;
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "proxy-injected" },
    body: JSON.stringify({ text, duration_seconds: Math.max(0.5, duration), prompt_influence: 0.6 }),
  });
  if (!res.ok) {
    console.error(name, res.status, await res.text());
    continue;
  }
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("sfx", name);
}
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mp3")).map((f) => f.replace(/\.mp3$/, ""));
fs.writeFileSync(path.join(root, "src/sfx.json"), JSON.stringify({ files }, null, 1) + "\n");
console.log("sfx.json:", files.join(", "));
