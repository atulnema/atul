import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// The whole reel is cut to a 128 BPM track: 8 bars = 32 beats = 15 seconds.
export const BPM = 128;
export const BEAT = 60 / BPM;
export const BEATS_PER_SCENE = 8;

/** Current position inside the scene, measured in beats. */
export const useBeat = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps / BEAT;
};

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  linear: (x: number) => x,
};

/** 0 → 1 between two beats, clamped. */
export const tw = (b: number, from: number, to: number, e: (x: number) => number = ease.out) =>
  interpolate(b, [from, to], [0, 1], {
    easing: e,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const mix = (p: number, a: number, b: number) => a + (b - a) * p;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Deterministic pseudo-random in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Diagonal-edged wipe as a clip-path. p: 0 hidden → 1 fully shown. */
export const wipe = (dir: "left" | "right" | "up" | "down", p: number, slant = 10) => {
  const q = mix(p, -slant, 100 + slant);
  switch (dir) {
    case "right": // reveals from the left edge towards the right
      return `polygon(0% 0%, ${q + slant}% 0%, ${q - slant}% 100%, 0% 100%)`;
    case "left":
      return `polygon(${100 - q - slant}% 0%, 100% 0%, 100% 100%, ${100 - q + slant}% 100%)`;
    case "down":
      return `polygon(0% 0%, 100% 0%, 100% ${q - slant}%, 0% ${q + slant}%)`;
    case "up":
      return `polygon(0% ${100 - q + slant}%, 100% ${100 - q - slant}%, 100% 100%, 0% 100%)`;
  }
};
