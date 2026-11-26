import { Easing, interpolate, spring } from "remotion";
import timeline from "./timeline.json";

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  bg: "#07070D",
  ink: "#F5F5FA",
  dim: "rgba(245,245,250,0.62)",
  violet: "#7C5CFF",
  cyan: "#22D3EE",
  lime: "#C6FF3D",
  red: "#FF3B4E",
  gold: "#FFC83D",
  card: "rgba(255,255,255,0.06)",
  line: "rgba(255,255,255,0.14)",
};

export const GRAD = `linear-gradient(135deg, ${C.violet} 0%, ${C.cyan} 100%)`;

export const FONT = "Poppins, sans-serif";
export const MONO = "JetBrains Mono, monospace";

// Named motion presets (no linear easing anywhere).
export const EASE = {
  soft: Easing.bezier(0.16, 1, 0.3, 1), // soft enter
  snap: Easing.bezier(0.7, 0, 0.2, 1), // snap / whip
  punch: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot punch
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress between frames a and b. */
export const ramp = (f: number, a: number, b: number, ease = EASE.soft) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

export const lerp = (p: number, a: number, b: number) => a + (b - a) * p;

export const spr = (
  f: number,
  start: number,
  cfg: { damping?: number; stiffness?: number; mass?: number } = {},
) =>
  spring({
    frame: f - start,
    fps: FPS,
    config: { damping: 11, stiffness: 170, mass: 0.6, ...cfg },
  });

/** Single decaying shake, returns px offset. */
export const shake = (f: number, start: number, len = 12, amp = 22) => {
  const t = f - start;
  if (t < 0 || t > len) return 0;
  return Math.sin(t * 2.6) * amp * (1 - t / len);
};

// ---------- timeline ----------
export type Seg = { s: number; e: number; cap: string };
export type SceneT = { id: string; s: number; e: number; trans: string };
export type Word = { w: string; s: number; e: number; seg: string; hl?: boolean };

export const TL = timeline as unknown as {
  fps: number;
  duration: number;
  segs: Record<string, Seg>;
  scenes: SceneT[];
  words: Word[];
  groups: { s: number; e: number; words: Word[] }[];
};

export type SceneProps = {
  /** frame relative to this scene's start (can be slightly negative during transition in) */
  f: number;
  /** scene length in frames */
  dur: number;
  /** segment times relative to scene start */
  seg: (id: string) => { s: number; e: number };
};

export const noise = (x: number) => {
  const s = Math.sin(x * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
