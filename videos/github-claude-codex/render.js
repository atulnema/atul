// Usage: node render.js [outfile.mp4] [--stills]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30, DURATION = 30;
const out = process.argv[2] || path.join(__dirname, 'out.mp4');
const stills = process.argv.includes('--stills');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'scene.html'));
  await page.evaluate(() => document.fonts.ready);

  if (stills) {
    for (const t of [1.8, 4.0, 7.5, 12.5, 14.0, 20.5, 25.0, 29.0]) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(__dirname, `still_${t}.png`) });
    }
    await browser.close();
    return;
  }

  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'ignore', 'inherit'] });

  const total = FPS * DURATION;
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out);
})();
