// Slide generator. Builds one self-contained HTML file per slide: base.css
// and gsap are inlined, so each file can be opened or screenshotted with no
// external dependencies and no dev server.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const BASE_CSS = fs.readFileSync(path.join(ROOT, "base.css"), "utf8");
const GSAP_JS = fs.readFileSync(path.join(ROOT, "vendor/gsap.min.js"), "utf8");
const HARNESS_JS = fs.readFileSync(path.join(ROOT, "render-harness.js"), "utf8");

function icon(name) {
  return fs.readFileSync(path.join(ROOT, "icons", `${name}.svg`), "utf8");
}

function avatar(pose, style) {
  return `<img class="avatar" style="${style}" src="../assets/pose-${pose}-cutout.png">`;
}

function page({ body, js, durationS = 3 }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${BASE_CSS}</style>
</head>
<body>
<div class="frame">
${body}
</div>
<script>${GSAP_JS}</script>
<script>
window.__DURATION_S = ${durationS};
${js}
</script>
<script>${HARNESS_JS}</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function coverSlide({ eyebrow, headline, subhead, ringIcons, avatarPose = "casual" }) {
  const ringHtml = ringIcons
    .map(
      ({ name, top, left }) => `
    <div class="ring-icon ring-item" style="top:${top}px;left:${left}px;">${icon(name)}</div>`
    )
    .join("");

  const body = `
  ${ringHtml}
  <div class="plate tile cover-plate" style="position:absolute;top:160px;left:100px;width:880px;height:460px;padding:64px;">
    <div class="eyebrow">${eyebrow}</div>
    <div class="headline" style="margin-top:18px;">${headline}</div>
    <div class="subhead" style="margin-top:22px;">${subhead}</div>
  </div>
  ${avatar(avatarPose, "top:585px;left:290px;z-index:5;")}`;

  const js = `
    var tl = gsap.timeline({ paused: true });
    tl.from(".cover-plate", { opacity: 0, scale: 0.85, duration: 0.6, ease: "power2.out" }, 0);
    tl.from(".ring-item", { opacity: 0, scale: 0.5, duration: 0.5, ease: "back.out(2)", stagger: 0.08 }, 0.2);
    tl.from(".avatar", { opacity: 0, y: 120, duration: 0.6, ease: "power2.out" }, 0.5);
    window.__tl = tl;
  `;

  return page({ body, js, durationS: 3 });
}

function stepSlide({ kicker, iconName, headline, subhead, avatarPose = "pointing" }) {
  const body = `
  <div class="tile step-tile" style="position:absolute;top:70px;left:70px;width:940px;height:980px;padding:80px;">
    <div class="kicker-num">${kicker}</div>
    <div class="icon-tile" style="margin-top:28px;">${icon(iconName)}</div>
    <div class="headline" style="margin-top:36px;font-size:72px;">${headline}</div>
    <div class="subhead" style="margin-top:20px;max-width:620px;">${subhead}</div>
  </div>
  ${avatar(avatarPose, "top:590px;left:580px;z-index:5;")}`;

  const js = `
    var tl = gsap.timeline({ paused: true });
    tl.from(".step-tile", { opacity: 0, y: 50, duration: 0.5, ease: "power2.out" }, 0);
    tl.from(".icon-tile", { opacity: 0, scale: 0.6, duration: 0.45, ease: "back.out(2.2)" }, 0.25);
    tl.from(".step-tile .headline", { opacity: 0, y: 24, duration: 0.4, ease: "power2.out" }, 0.4);
    tl.from(".step-tile .subhead", { opacity: 0, y: 18, duration: 0.4, ease: "power2.out" }, 0.5);
    tl.from(".avatar", { opacity: 0, x: 80, duration: 0.55, ease: "power2.out" }, 0.45);
    window.__tl = tl;
  `;

  return page({ body, js, durationS: 3 });
}

function bigStatSlide({ kicker, stat, headline, subhead }) {
  const body = `
  <div class="tile stat-tile" style="position:absolute;top:70px;left:70px;width:940px;height:980px;padding:80px;display:flex;flex-direction:column;justify-content:center;">
    <div class="kicker-num">${kicker}</div>
    <div class="big-stat" style="margin-top:20px;">${stat}</div>
    <div class="headline" style="margin-top:24px;font-size:64px;">${headline}</div>
    <div class="subhead" style="margin-top:16px;">${subhead}</div>
  </div>`;

  const js = `
    var tl = gsap.timeline({ paused: true });
    tl.from(".stat-tile", { opacity: 0, y: 50, duration: 0.5, ease: "power2.out" }, 0);
    tl.from(".big-stat", { opacity: 0, scale: 0.7, duration: 0.55, ease: "back.out(1.8)" }, 0.25);
    tl.from(".stat-tile .headline", { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" }, 0.55);
    window.__tl = tl;
  `;

  return page({ body, js, durationS: 3 });
}

function ctaSlide({ eyebrow, headline, subhead, ctaText, avatarPose = "victory" }) {
  const body = `
  <div class="plate tile cta-plate" style="position:absolute;top:90px;left:80px;width:920px;height:380px;padding:64px;">
    <div class="eyebrow">${eyebrow}</div>
    <div class="headline" style="margin-top:18px;">${headline}</div>
    <div class="subhead" style="margin-top:22px;">${subhead}</div>
  </div>
  <div class="cta-wrap" style="position:absolute;top:480px;left:0;width:1080px;text-align:center;">
    <span class="cta-pill">${ctaText}</span>
  </div>
  ${avatar(avatarPose, "top:585px;left:290px;z-index:5;")}`;

  const js = `
    var tl = gsap.timeline({ paused: true });
    tl.from(".cta-plate", { opacity: 0, scale: 0.85, duration: 0.6, ease: "power2.out" }, 0);
    tl.from(".cta-pill", { opacity: 0, scale: 0.6, duration: 0.5, ease: "back.out(2)" }, 0.4);
    tl.from(".avatar", { opacity: 0, y: 100, duration: 0.55, ease: "power2.out" }, 0.5);
    tl.to(".cta-pill", { scale: 1.06, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3 }, 1.1);
    window.__tl = tl;
  `;

  return page({ body, js, durationS: 3.5 });
}

module.exports = { coverSlide, stepSlide, bigStatSlide, ctaSlide, ROOT };
