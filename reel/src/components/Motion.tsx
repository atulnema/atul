import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { f, useReel, useScene } from "../timing";
import { clamp } from "./ui";

/**
 * Scene transitions. Each scene gets a different enter/exit so the reel never
 * repeats the same move twice in a row.
 */
export const TRANSITIONS = ["rise", "slideL", "zoom", "slideR", "flip", "wipe", "drop", "iris"] as const;
export type Transition = (typeof TRANSITIONS)[number];

const style = (t: Transition, p: number, e: number): React.CSSProperties => {
  // p: enter progress 0..1 (spring, may overshoot), e: exit progress 0..1
  switch (t) {
    case "slideL":
      return { transform: `translateX(${(1 - p) * -1150 + e * 1150}px)` };
    case "slideR":
      return { transform: `translateX(${(1 - p) * 1150 - e * 1150}px)` };
    case "zoom":
      return {
        transform: `scale(${interpolate(p, [0, 1], [0.55, 1]) * (1 + e * 0.35)})`,
        opacity: Math.min(1, p * 1.5) * (1 - e),
        filter: `blur(${e * 14}px)`,
      };
    case "flip":
      return {
        transform: `perspective(1600px) rotateY(${(1 - p) * -75 + e * 75}deg)`,
        opacity: Math.min(1, p * 2) * (1 - e),
      };
    case "wipe":
      return { clipPath: `inset(${(1 - Math.min(1, p)) * 100}% 0 ${e * 100}% 0)` };
    case "drop":
      return { transform: `translateY(${(1 - p) * -1000 + e * 1300}px) rotate(${(1 - p) * -6 + e * 8}deg)` };
    case "iris":
      return { clipPath: `circle(${Math.max(0, p) * 75 * (1 - e)}% at 50% 48%)` };
    case "rise":
    default:
      return {
        transform: `translateY(${(1 - p) * 140 - e * 90}px)`,
        opacity: Math.min(1, p * 1.4) * (1 - e),
        filter: `blur(${(1 - Math.min(1, p)) * 10 + e * 12}px)`,
      };
  }
};

export const SceneMotion: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { timing } = useReel();
  const { from, dur } = useScene();
  const t = TRANSITIONS[index % TRANSITIONS.length];
  const bouncy = t === "drop" || t === "zoom";
  const p = spring({ frame, fps, config: { damping: bouncy ? 11 : 16, stiffness: 150, mass: 0.8 } });
  const e = interpolate(frame, [dur - 10, dur], [0, 1], clamp);

  // slow camera drift, alternating direction per scene
  const dir = index % 2 ? -1 : 1;
  const drift = 1 + (frame / Math.max(1, dur)) * 0.035;
  const panY = dir * (frame / Math.max(1, dur)) * 14;

  // a small punch on every highlighted word in this scene
  let punch = 0;
  for (const w of timing.words) {
    if (w.scene !== index || !w.emph) continue;
    const d = frame - (f(w.start) - from);
    if (d >= 0 && d <= 9) punch = Math.max(punch, Math.sin((d / 9) * Math.PI) * 0.04);
  }

  return (
    <AbsoluteFill style={{ transformOrigin: "50% 45%", transform: `scale(${drift + punch}) translateY(${panY}px)` }}>
      <AbsoluteFill style={{ transformOrigin: "50% 45%", ...style(t, p, e) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
