// Frame renderer. Drives headless Chrome (via puppeteer) to deterministically
// seek each slide's GSAP timeline frame by frame and screenshot it.
// Usage:
//   node render.js --qa              -> one settled-frame PNG per slide (fast QA)
//   node render.js                   -> full frame sequences for every slide
//   node render.js --only=00-cover   -> restrict to slides whose filename contains this
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = __dirname;
const SLIDES_DIR = path.join(ROOT, "slides");
const OUTPUT_DIR = path.join(ROOT, "output");
const CONCURRENCY = 1;
const MAX_RETRIES = 2;

const args = process.argv.slice(2);
const QA = args.includes("--qa");
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

function listSlides() {
  return fs
    .readdirSync(SLIDES_DIR)
    .filter((f) => f.endsWith(".html"))
    .filter((f) => !ONLY || f.includes(ONLY))
    .sort();
}

async function renderSlideFrames(browser, slideFile) {
  const slideName = slideFile.replace(/\.html$/, "");
  const fileUrl = "file://" + path.join(SLIDES_DIR, slideFile) + "?render=1";

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  await page.goto(fileUrl, { waitUntil: "load" });
  await page.waitForFunction("window.__renderReady === true");
  const totalFrames = await page.evaluate(() => window.__TOTAL_FRAMES);

  if (QA) {
    const qaDir = path.join(OUTPUT_DIR, "qa");
    fs.mkdirSync(qaDir, { recursive: true });
    await page.evaluate((f) => window.__seekFrame(f), totalFrames - 1);
    await page.screenshot({ path: path.join(qaDir, `${slideName}.png`) });
    await page.close();
    console.log(`[qa] ${slideName} (${totalFrames} frames total)`);
    return;
  }

  const frameDir = path.join(OUTPUT_DIR, "frames", slideName);
  fs.mkdirSync(frameDir, { recursive: true });

  const missing = [];
  for (let f = 0; f < totalFrames; f++) {
    const framePath = path.join(frameDir, `frame-${String(f).padStart(4, "0")}.png`);
    try {
      await page.evaluate((ff) => window.__seekFrame(ff), f);
      await page.screenshot({ path: framePath });
    } catch (err) {
      missing.push(f);
    }
  }
  await page.close();

  // Retry pass for any frames that failed to capture.
  for (let attempt = 0; attempt < MAX_RETRIES && missing.length; attempt++) {
    const retryPage = await browser.newPage();
    await retryPage.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await retryPage.goto(fileUrl, { waitUntil: "load" });
    await retryPage.waitForFunction("window.__renderReady === true");
    for (let i = missing.length - 1; i >= 0; i--) {
      const f = missing[i];
      const framePath = path.join(frameDir, `frame-${String(f).padStart(4, "0")}.png`);
      try {
        await retryPage.evaluate((ff) => window.__seekFrame(ff), f);
        await retryPage.screenshot({ path: framePath });
        missing.splice(i, 1);
      } catch (err) {
        /* still missing, will retry again or report at the end */
      }
    }
    await retryPage.close();
  }

  if (missing.length) {
    console.error(`[render] ${slideName}: FAILED to capture frames ${missing.join(",")}`);
  } else {
    console.log(`[render] ${slideName}: ${totalFrames} frames OK`);
  }

  return { slideName, totalFrames, missing };
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const slideFiles = listSlides();
  const results = [];

  // Low-parallelism pool.
  let idx = 0;
  async function worker() {
    while (idx < slideFiles.length) {
      const file = slideFiles[idx++];
      const result = await renderSlideFrames(browser, file);
      if (result) results.push(result);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await browser.close();

  const failed = results.filter((r) => r.missing && r.missing.length);
  if (failed.length) {
    console.error(`render.js: ${failed.length} slide(s) had unrecoverable missing frames`);
    process.exit(1);
  }
}

main();
