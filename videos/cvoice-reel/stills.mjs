import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const out = process.argv[2];
const frames = process.argv.slice(3).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell";
const comp = await selectComposition({ serveUrl, id: "CVoiceReel", browserExecutable });
for (const f of frames) {
  await renderStill({ serveUrl, composition: comp, frame: f, output: `${out}/f${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, browserExecutable });
  console.log("still", f);
}
