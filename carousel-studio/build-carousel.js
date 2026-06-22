// Builds the "5 AI Tools for Solo Founders" carousel into slides/*.html.
// To make a new carousel: copy this file, swap the content below.
const fs = require("fs");
const path = require("path");
const { coverSlide, stepSlide, ctaSlide, ROOT } = require("./gen");

const SLIDES_DIR = path.join(ROOT, "slides");
fs.mkdirSync(SLIDES_DIR, { recursive: true });

const TOOLS = [
  {
    iconName: "sparkle",
    headline: "ChatGPT",
    subhead: "Draft copy, outline ideas, and debug code in seconds.",
  },
  {
    iconName: "notion",
    headline: "Notion AI",
    subhead: "Turn messy notes into docs, specs, and to-dos instantly.",
  },
  {
    iconName: "palette",
    headline: "Canva",
    subhead: "Design posts, decks, and brand assets without a designer.",
  },
  {
    iconName: "zapier",
    headline: "Zapier",
    subhead: "Connect your apps so busywork runs on autopilot.",
  },
  {
    iconName: "slides",
    headline: "Gamma",
    subhead: "Turn a rough outline into a polished deck in minutes.",
  },
];

const slides = [];

slides.push({
  name: "00-cover",
  html: coverSlide({
    eyebrow: "SOLO FOUNDER TOOLKIT",
    headline: "5 AI Tools You Actually Need",
    subhead: "The stack real founders run on in 2026",
    avatarPose: "casual",
    ringIcons: [
      { name: "sparkle", top: 60, left: 70 },
      { name: "notion", top: 60, left: 912 },
      { name: "palette", top: 400, left: 30 },
      { name: "zapier", top: 400, left: 954 },
      { name: "slides", top: 840, left: 60 },
    ],
  }),
});

TOOLS.forEach((tool, i) => {
  slides.push({
    name: `0${i + 1}-tool-${tool.headline.toLowerCase().replace(/\s+/g, "-")}`,
    html: stepSlide({
      kicker: `TOOL ${String(i + 1).padStart(2, "0")} / 0${TOOLS.length}`,
      iconName: tool.iconName,
      headline: tool.headline,
      subhead: tool.subhead,
      avatarPose: "pointing",
    }),
  });
});

slides.push({
  name: "06-cta",
  html: ctaSlide({
    eyebrow: "ONE LAST THING",
    headline: "Want the Full Toolkit?",
    subhead: "We’ll send the complete list straight to your DMs.",
    ctaText: "💬 Comment “TOOLS”",
    avatarPose: "victory",
  }),
});

for (const slide of slides) {
  const outPath = path.join(SLIDES_DIR, `${slide.name}.html`);
  fs.writeFileSync(outPath, slide.html);
  console.log("wrote", outPath);
}
