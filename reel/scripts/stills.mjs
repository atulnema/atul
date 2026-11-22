// Renders a contact sheet of frames for review.
//   node scripts/stills.mjs [scale] [mid|frames...]
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const root = path.resolve(import.meta.dirname, "..");
const timing = JSON.parse(fs.readFileSync(path.join(root, `src/reels/${(process.env.COMP ?? "Payment").toLowerCase()}/timing.json`), "utf8"));
const args = process.argv.slice(2);
const scale = Number(args[0] ?? 0.3);
let frames = args.slice(1).map(Number).filter((n) => !Number.isNaN(n));
if (!frames.length) {
  // two frames per scene: 40% and 85% through
  frames = timing.scenes.flatMap((s, i) => {
    const next = timing.scenes[i + 1];
    const a = Math.round(s.start * 30), b = next ? Math.round(next.start * 30) : Math.round(timing.duration * 30);
    return [Math.round(a + (b - a) * 0.35), Math.round(a + (b - a) * 0.85)];
  });
}
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "Payment", browserExecutable: process.env.REMOTION_CHROME });
const dir = path.join(root, "out/stills");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
let i = 0;
for (const frame of frames) {
  const file = path.join(dir, `${String(i++).padStart(3, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output: file, scale, browserExecutable: process.env.REMOTION_CHROME });
}
const cols = Math.min(6, frames.length);
execFileSync("ffmpeg", ["-v", "error", "-y", "-pattern_type", "glob", "-i", path.join(dir, "*.png"), "-vf", `tile=${cols}x${Math.ceil(frames.length / cols)}:padding=6:color=white`, path.join(root, "out/sheet.jpg")]);
console.log("frames", frames.join(","), "-> out/sheet.jpg");
