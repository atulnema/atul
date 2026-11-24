import { Easing, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// Fonts are self-hosted in /public/fonts so renders never depend on the network.
const face = (family: string, weight: string) =>
  loadFont({ family, url: staticFile(`fonts/${family}-${weight}.woff2`), weight, format: "woff2" });
["600", "800", "900"].forEach((w) => face("Montserrat", w));
["400", "500", "600", "700"].forEach((w) => face("Inter", w));

export const MONTSERRAT = "Montserrat, Inter, sans-serif";
export const INTER = "Inter, sans-serif";
/** System colour-emoji fonts; Linux render boxes ship Noto Color Emoji. */
export const EMOJI = "'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji'";

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 45 * FPS; // 1350 frames

/** 124 BPM -> one beat every 14.516 frames at 30fps. */
export const BPM = 124;
export const BEAT = (FPS * 60) / BPM;
/** Frame of the n-th beat, rounded to the nearest frame. */
export const b = (n: number) => Math.round(n * BEAT);

export const C = {
  ink: "#05070b",
  navy: "#0b1016",
  teal: "#3fd3e0",
  tealDeep: "#0e2e36",
  amber: "#ffb347",
  cyan: "#3de8ff",
  yellow: "#ffe14d",
  red: "#ff2d55",
  green: "#19e68c",
  gold: "#f5c451",
  white: "#ffffff",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Linear-clamped progress 0..1 between two frames, with an optional easing. */
export const prog = (
  f: number,
  a: number,
  z: number,
  ease: (t: number) => number = easeOut,
) => interpolate(f, [a, z], [0, 1], { ...clamp, easing: ease });

export type Seg = {
  from: number;
  to: number;
  v0: number;
  v1: number;
  ease?: (t: number) => number;
};

/**
 * Piecewise "camera track". Each segment owns [from, to). Outside every
 * segment the value of the most recent segment end is held, so hard cuts
 * are frame-exact (no one-frame tween between neighbouring segments).
 */
export const track = (f: number, segs: Seg[], initial: number) => {
  let v = initial;
  for (const s of segs) {
    if (f < s.from) break;
    if (f < s.to) {
      return interpolate(f, [s.from, s.to], [s.v0, s.v1], {
        ...clamp,
        easing: s.ease ?? easeOut,
      });
    }
    v = s.v1;
  }
  return v;
};

/** Sum of exponentially decaying pulses fired at the given frames. */
export const pulses = (f: number, hits: number[], decay = 3, peak = 1) =>
  hits.reduce((acc, h) => (f >= h ? acc + peak * Math.exp(-(f - h) / decay) : acc), 0);

export const glass = {
  background: "rgba(255,255,255,0.08)",
  border: "1.5px solid rgba(255,255,255,0.22)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow:
    "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.28)",
} as const;

export const captionText = {
  fontFamily: MONTSERRAT,
  fontWeight: 900,
  textTransform: "uppercase",
  color: C.white,
  letterSpacing: "-0.01em",
  lineHeight: 1.02,
  textShadow: "0 6px 28px rgba(0,0,0,0.65)",
} as const;
