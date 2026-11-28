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

// Scene timeline, in frames at 30fps. Cuts sit in the pauses of public/voiceover.wav.
export const SCENES = [
  { id: "hook", from: 0, dur: 103, pill: "0 / 4 SERVICES", dots: 0 },
  { id: "proof", from: 103, dur: 122, pill: "0 / 4 SERVICES", dots: 0 },
  { id: "team", from: 225, dur: 93, pill: "0 / 4 SERVICES", dots: 0 },
  { id: "seo", from: 318, dur: 142, pill: "01 / 04 · SEO", dots: 1 },
  { id: "ads", from: 460, dur: 170, pill: "02 / 04 · ADS", dots: 2 },
  { id: "web", from: 630, dur: 134, pill: "03 / 04 · WEB", dots: 3 },
  { id: "social", from: 764, dur: 136, pill: "04 / 04 · SOCIAL", dots: 4 },
  { id: "auto", from: 900, dur: 141, pill: "AUTOPILOT", dots: 4 },
  { id: "cta", from: 1041, dur: 159, pill: "4 / 4 ✓", dots: 4 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_FRAMES = 1200;
export const OUTRO_START = 1140; // dim + handle card, after the last word
export const AUTOPILOT_AT = 32.8; // seconds: "Alphastrix sab chala deta hai" begins

// Speech segments measured from the voiceover (silence detection), in seconds.
// A leading * marks a highlighted word. Word timings inside a segment are
// spread by syllable count, then grouped into short caption phrases.
const SEGMENTS: [number, number, string][] = [
  [0.0, 1.22, "Agency hire mat karo,"],
  [1.44, 3.08, "jab tak ye *4 *cheezein nahi dekhi."],
  [3.77, 7.09, "*Alphastrix ne ab tak *120 se zyada projects deliver kiye hain."],
  [7.94, 9.37, "Aapki poori *marketing *team,"],
  [9.79, 10.18, "ek jagah."],
  [11.0, 11.3, "Pehli,"],
  [11.68, 12.04, "*SEO."],
  [12.54, 13.96, "Google pe *page *one tak,"],
  [14.18, 15.01, "bina ads ke."],
  [15.64, 16.05, "Doosri,"],
  [16.46, 18.04, "*ads. Har rupee ka hisaab,"],
  [18.39, 20.73, "*3.4x average ROAS."],
  [21.29, 21.75, "Teesri,"],
  [22.06, 25.16, "*website. Fast, sundar, aur *leads laane wali."],
  [25.79, 27.63, "Chauthi, *brand aur *social."],
  [27.95, 29.54, "Log follow karein, aur *yaad rakhein."],
  [30.55, 32.41, "Ye sab alag alag manage karna *mushkil hai."],
  [32.8, 34.43, "*Alphastrix sab chala deta hai."],
  [34.97, 35.98, "Comment karo *GROWTH,"],
  [36.21, 37.84, "free audit seedha aapke *DM mein."],
];

export type Word = { text: string; key: boolean; t: number };
export type Phrase = { t0: number; t1: number; words: Word[] };

const weight = (w: string) => {
  const bare = w.replace(/[^A-Za-z0-9.]/g, "");
  if (/\d/.test(bare)) return bare.replace(/\D/g, "").length * 1.5;
  if (/^[A-Z]{2,3}$/.test(bare)) return bare.length; // S-E-O, D-M
  return Math.max(1, (bare.toLowerCase().match(/[aeiouy]+/g) || []).length);
};

const MAX_CHARS = 26;
const len = (ws: { text: string }[]) => ws.map((w) => w.text).join(" ").length;

// Split one spoken segment into balanced caption lines, preferring breaks after commas/periods.
const splitSegment = (ws: (Word & { end: number })[]) => {
  const total = len(ws);
  const n = Math.ceil(total / MAX_CHARS);
  if (n <= 1) return [ws];
  const breaks: number[] = [];
  for (let k = 1; k < n; k++) {
    const ideal = (k * total) / n;
    let best = -1;
    let bestScore = Infinity;
    for (let i = (breaks[breaks.length - 1] ?? -1) + 1; i < ws.length - 1; i++) {
      const score = Math.abs(len(ws.slice(0, i + 1)) - ideal) - (/[,.]$/.test(ws[i].text) ? 8 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    breaks.push(best);
  }
  const out: (Word & { end: number })[][] = [];
  let from = 0;
  for (const b of breaks) {
    out.push(ws.slice(from, b + 1));
    from = b + 1;
  }
  out.push(ws.slice(from));
  return out;
};

const buildPhrases = (): Phrase[] => {
  const groups: { ws: (Word & { end: number })[]; gapAfter: number }[] = [];
  SEGMENTS.forEach(([t0, t1, text], si) => {
    const toks = text.split(" ");
    const wts = toks.map(weight);
    const total = wts.reduce((a, b) => a + b, 0);
    let acc = 0;
    const ws = toks.map((tok, i) => {
      const t = t0 + (acc / total) * (t1 - t0);
      acc += wts[i];
      return { text: tok.replace(/^\*/, ""), key: tok.startsWith("*"), t, end: t0 + (acc / total) * (t1 - t0) };
    });
    const next = SEGMENTS[si + 1];
    const parts = splitSegment(ws);
    parts.forEach((g, gi) => groups.push({ ws: g, gapAfter: gi === parts.length - 1 ? (next ? next[0] - t1 : 99) : 0 }));
  });

  // Fold a lone short segment ("Pehli,") into the next line when the pause is short and it fits.
  const merged: typeof groups = [];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const nx = groups[i + 1];
    if (nx && g.ws.length === 1 && g.gapAfter > 0 && g.gapAfter < 0.6 && len([...g.ws, ...nx.ws]) <= MAX_CHARS) {
      merged.push({ ws: [...g.ws, ...nx.ws], gapAfter: nx.gapAfter });
      i++;
    } else merged.push(g);
  }

  return merged.map(({ ws }) => ({
    t0: ws[0].t,
    t1: ws[ws.length - 1].end,
    words: ws.map(({ text, key, t }) => ({ text, key, t })),
  }));
};

export const PHRASES = buildPhrases();
