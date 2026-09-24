// One-off script: renders 5 placeholder avatar poses to transparent PNGs.
// Replace these with the real Gemini-generated cutouts later — nothing
// downstream (gen.js, slide templates) needs to change, since they just
// reference assets/pose-<name>-cutout.png by filename.
const path = require("path");
const puppeteer = require("puppeteer");

const ACCENT = "#2d6cff";
const BODY = "#2a2e3d";
const SKIN = "#d9a877";

function svgFor(pose) {
  const arms = {
    casual: `
      <rect x="118" y="220" width="44" height="190" rx="22" fill="${BODY}"/>
      <rect x="338" y="220" width="44" height="190" rx="22" fill="${BODY}"/>`,
    pointing: `
      <rect x="118" y="220" width="44" height="190" rx="22" fill="${BODY}"/>
      <rect x="330" y="190" width="170" height="44" rx="22" fill="${BODY}" transform="rotate(-18 330 212)"/>`,
    victory: `
      <rect x="118" y="220" width="44" height="190" rx="22" fill="${BODY}"/>
      <rect x="330" y="40" width="44" height="200" rx="22" fill="${BODY}" transform="rotate(8 352 140)"/>
      <circle cx="352" cy="50" r="30" fill="${ACCENT}"/>`,
    "arms-crossed": `
      <rect x="150" y="250" width="200" height="46" rx="23" fill="${BODY}"/>
      <rect x="150" y="300" width="200" height="46" rx="23" fill="${BODY}"/>`,
    phone: `
      <rect x="118" y="220" width="44" height="190" rx="22" fill="${BODY}"/>
      <rect x="320" y="160" width="44" height="180" rx="22" fill="${BODY}" transform="rotate(-35 342 250)"/>
      <rect x="370" y="120" width="60" height="100" rx="10" fill="#11131c"/>
      <rect x="378" y="132" width="44" height="76" rx="4" fill="${ACCENT}" opacity="0.5"/>`,
  };

  return `
<svg width="500" height="760" viewBox="0 0 500 760" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="250" cy="740" rx="130" ry="16" fill="#000000" opacity="0.12"/>
  <rect x="170" y="240" width="160" height="280" rx="60" fill="${BODY}"/>
  <rect x="60" y="0" width="0" height="0"/>
  ${arms[pose]}
  <rect x="190" y="480" width="50" height="220" rx="24" fill="${BODY}"/>
  <rect x="260" y="480" width="50" height="220" rx="24" fill="${BODY}"/>
  <rect x="180" y="680" width="70" height="36" rx="14" fill="${ACCENT}"/>
  <rect x="250" y="680" width="70" height="36" rx="14" fill="${ACCENT}"/>
  <circle cx="250" cy="140" r="100" fill="${SKIN}"/>
  <path d="M150 110 a100 100 0 0 1 200 0 v10 q-100 -40 -200 0 z" fill="#1c1410"/>
  <rect x="165" y="150" width="170" height="14" rx="7" fill="${BODY}" opacity="0.85"/>
  <circle cx="205" cy="150" r="26" fill="none" stroke="${BODY}" stroke-width="6"/>
  <circle cx="295" cy="150" r="26" fill="none" stroke="${BODY}" stroke-width="6"/>
</svg>`;
}

const POSES = ["casual", "pointing", "victory", "arms-crossed", "phone"];

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  for (const pose of POSES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 760, deviceScaleFactor: 2 });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${svgFor(pose)}</body></html>`
    );
    const outPath = path.join(__dirname, `pose-${pose}-cutout.png`);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log("wrote", outPath);
    await page.close();
  }
  await browser.close();
})();
