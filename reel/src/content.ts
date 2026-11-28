// Everything you'd want to tweak lives here: copy, numbers, timings.
// Numbers mirror lib/site.ts in the website. Swap them for real client results before posting.

export const FPS = 30;

export const BRAND = {
  handle: "@alphastrix_",
  kicker: "// ALPHASTRIX DIGITAL · GROWTH",
  ctaWord: "GROWTH",
};

export const NUMBERS = {
  projects: 120,
  roas: 3.4,
  organicGrowth: 250,
  retention: 98,
  cplDrop: 38,
  followers: 85000,
  speedScore: 98,
};

// Scene timeline, in frames at 30fps.
export const SCENES = [
  { id: "hook", from: 0, dur: 135, pill: "0 / 4 SERVICES", dots: 0 },
  { id: "proof", from: 135, dur: 120, pill: "0 / 4 SERVICES", dots: 0 },
  { id: "team", from: 255, dur: 75, pill: "0 / 4 SERVICES", dots: 0 },
  { id: "seo", from: 330, dur: 135, pill: "01 / 04 · SEO", dots: 1 },
  { id: "ads", from: 465, dur: 135, pill: "02 / 04 · ADS", dots: 2 },
  { id: "web", from: 600, dur: 135, pill: "03 / 04 · WEB", dots: 3 },
  { id: "social", from: 735, dur: 135, pill: "04 / 04 · SOCIAL", dots: 4 },
  { id: "auto", from: 870, dur: 120, pill: "AUTOPILOT", dots: 4 },
  { id: "cta", from: 990, dur: 180, pill: "4 / 4 ✓", dots: 4 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_FRAMES = 1170;
export const OUTRO_START = 1110; // dim + handle card

// Word-by-word captions. Times in seconds. A leading * marks a highlighted word.
// Timed for a natural Hinglish voiceover pace, so you can record VO straight over it.
export const CAPTIONS: { t0: number; t1: number; text: string }[] = [
  { t0: 0.15, t1: 1.5, text: "Agency hire mat karo," },
  { t0: 1.5, t1: 2.9, text: "jab tak ye *4 *cheezein" },
  { t0: 2.9, t1: 4.4, text: "nahi dekhi." },

  { t0: 4.6, t1: 5.9, text: "*Alphastrix ne ab tak" },
  { t0: 5.9, t1: 7.2, text: "*120 se zyada projects" },
  { t0: 7.2, t1: 8.4, text: "deliver kiye hain." },

  { t0: 8.55, t1: 9.4, text: "Aapki poori" },
  { t0: 9.4, t1: 10.95, text: "*marketing *team, ek jagah." },

  { t0: 11.1, t1: 12.2, text: "Pehli, *SEO." },
  { t0: 12.2, t1: 13.6, text: "Google pe *page *one" },
  { t0: 13.6, t1: 15.4, text: "tak, bina ads ke." },

  { t0: 15.6, t1: 16.7, text: "Doosri, *ads." },
  { t0: 16.7, t1: 18.2, text: "Har rupee ka hisaab," },
  { t0: 18.2, t1: 19.9, text: "*3.4x average ROAS." },

  { t0: 20.1, t1: 21.3, text: "Teesri, *website." },
  { t0: 21.3, t1: 22.8, text: "Fast, sundar, aur" },
  { t0: 22.8, t1: 24.4, text: "*leads laane wali." },

  { t0: 24.6, t1: 26.2, text: "Chauthi, *brand aur *social." },
  { t0: 26.2, t1: 27.5, text: "Log follow karein," },
  { t0: 27.5, t1: 28.9, text: "aur *yaad rakhein." },

  { t0: 29.1, t1: 30.3, text: "Ye sab alag alag" },
  { t0: 30.3, t1: 31.6, text: "manage karna *mushkil hai." },
  { t0: 31.6, t1: 32.9, text: "*Alphastrix sab chala deta hai." },

  { t0: 33.1, t1: 34.6, text: "Comment karo *GROWTH," },
  { t0: 34.6, t1: 35.8, text: "free audit seedha" },
  { t0: 35.8, t1: 36.9, text: "aapke *DM mein." },
];
