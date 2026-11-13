import { Easing, interpolate, spring } from "remotion";
import { BEAT, FPS } from "../theme";

export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

type SpringOpts = { damping?: number; stiffness?: number; mass?: number };

/** Bouncy 0 -> 1 with overshoot. The workhorse of the whole film. */
export const pop = (frame: number, delay = 0, o: SpringOpts = {}) =>
  spring({
    frame: frame - delay,
    fps: FPS,
    config: { damping: o.damping ?? 10, stiffness: o.stiffness ?? 180, mass: o.mass ?? 0.7 },
  });

/** Smooth 0 -> 1 with no overshoot. */
export const glide = (frame: number, delay = 0, dur = 18) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 200 }, durationInFrames: dur });

export const tween = (
  frame: number,
  from: number,
  to: number,
  a = 0,
  b = 1,
  easing: (t: number) => number = EASE.out,
) => interpolate(frame, [from, to], [a, b], { ...CL, easing });

/** 1 on every beat, decaying to ~0 before the next one. */
export const beat = (frame: number) => {
  const p = (((frame % BEAT) + BEAT) % BEAT) / BEAT;
  return Math.exp(-p * 4.5);
};

/** A decaying kick that starts at `at`. Used for bumps, shakes and flashes. */
export const hit = (frame: number, at: number, decay = 4) =>
  frame < at ? 0 : Math.exp(-(frame - at) / decay);

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth pseudo-random drift in -1..1. */
export const wiggle = (frame: number, seed: number, speed = 0.06) =>
  Math.sin(frame * speed + seed * 12.9898) * 0.6 +
  Math.sin(frame * speed * 1.73 + seed * 78.233) * 0.4;

/** Speech-like mouth opening in 0..1. */
export const talk = (frame: number, seed = 0) =>
  Math.min(
    1,
    Math.abs(Math.sin(frame * 0.85 + seed * 3.1) * 0.65 + Math.sin(frame * 0.37 + seed * 7.7) * 0.5),
  );
