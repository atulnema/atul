#!/usr/bin/env node
// Headless exporter for motion.html.
//
//   node motion/render.mjs --effect chart-morph --size 1080x1350
//   node motion/render.mjs --all --size 1080x1080 --fps 30
//   node motion/render.mjs --effect particle-logo --still 4.4      # PNG + 240px audit thumbnail
//   node motion/render.mjs --effect masked-type --param heroWord=RESULTS --param subtitle="Built to rank."
//
// Needs Playwright (npm i -D playwright && npx playwright install chromium) and ffmpeg on PATH.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let chromium;
try { ({ chromium } = require("playwright")); }
catch { console.error("Playwright not found. Run: npm i -D playwright && npx playwright install chromium"); process.exit(1); }

// ── args ──
const argv = process.argv.slice(2), opts = { size: "1080x1080", brand: "alphastrix", fps: 30, params: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i], next = () => argv[++i];
  if (a === "--effect") opts.effect = next();
  else if (a === "--size") opts.size = next();
  else if (a === "--brand") opts.brand = next();
  else if (a === "--fps") opts.fps = Number(next());
  else if (a === "--out") opts.out = next();
  else if (a === "--page") opts.page = next();
  else if (a === "--audio") opts.audio = next();
  else if (a === "--still") opts.still = Number(next());
  else if (a === "--param") opts.params.push(next());
  else if (a === "--verified") opts.params.push("verified=1");
  else if (a === "--all") opts.all = true;
  else if (a === "--help" || a === "-h") { console.log(readHelp()); process.exit(0); }
  else { console.error(`Unknown argument: ${a}`); process.exit(1); }
}
function readHelp() {
  return "Usage: node motion/render.mjs (--effect <name> | --all | --page <file.html>) [--size WxH] [--brand alphastrix|flow] [--fps 30] [--still <sec>] [--out file] [--audio file] [--param key=value] [--verified]";
}
if (!opts.effect && !opts.all) opts.effect = "chart-morph";

const [W, H] = opts.size.split("x").map(Number);
const outDir = path.join(here, "out");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("page error:", e.message));

async function load(effect) {
  const q = new URLSearchParams({ render: "", effect, size: opts.size, brand: opts.brand });
  for (const p of opts.params) { const i = p.indexOf("="); q.set(p.slice(0, i), p.slice(i + 1)); }
  const html = opts.page ? path.resolve(opts.page) : path.join(here, "motion.html");
  await page.goto(`${pathToFileURL(html).href}?${q}`);
  await page.waitForFunction(() => window.__motionReady === true, null, { timeout: 30000 });
  return page.evaluate(() => window.motionInfo);
}
const grab = (t, type = "image/png") => page.evaluate(async ([t, type]) => {
  await window.seek(t);
  return document.getElementById("c").toDataURL(type).split(",")[1];
}, [t, type]).then(b64 => Buffer.from(b64, "base64"));

async function still(effect) {
  await load(effect);
  const base = opts.out || path.join(outDir, `${effect}-${opts.size}-${opts.still}s`);
  const file = base.endsWith(".png") ? base : `${base}.png`;
  await writeFile(file, await grab(opts.still));
  // Self-audit thumbnail: is every word still readable at 240px wide?
  const thumb = file.replace(/\.png$/, "-240px.png");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-vf", "scale=240:-1:flags=lanczos", thumb]);
  console.log(`✓ ${path.relative(process.cwd(), file)}\n✓ ${path.relative(process.cwd(), thumb)}`);
}

async function video(effect) {
  const info = await load(effect);
  const file = (opts.all ? null : opts.out) || path.join(outDir, `${info.effect || effect}-${opts.size}.mp4`);
  const frames = Math.round(info.duration * opts.fps);
  const audio = opts.audio ? ["-i", path.resolve(opts.audio), "-map", "0:v", "-map", "1:a", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-t", String(info.duration)] : [];
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(opts.fps), "-i", "-", ...audio,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "medium", "-movflags", "+faststart", file],
    { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
  const started = Date.now();
  // Frame N/fps for N in [0, frames): the frame after the last one is frame 0, so the loop is seamless.
  for (let i = 0; i < frames; i++) {
    const buf = await grab(i / opts.fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % opts.fps === 0) process.stdout.write(`\r${info.effect || effect}: ${i}/${frames} frames`);
  }
  ff.stdin.end();
  await done;
  console.log(`\r✓ ${path.relative(process.cwd(), file)}  (${frames} frames, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

function run(cmd, args) {
  return new Promise((res, rej) => spawn(cmd, args, { stdio: "inherit" }).on("close", c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`)))));
}

try {
  const list = opts.all ? (await load("chart-morph")).effects : [opts.effect];
  for (const effect of list) await (Number.isFinite(opts.still) ? still(effect) : video(effect));
} finally {
  await browser.close();
}
