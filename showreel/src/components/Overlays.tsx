import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT } from "../lib/anim";
import { C, F } from "../lib/theme";

/** Animated film grain: fresh turbulence seed every frame. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.17) 100%)",
      pointerEvents: "none",
    }}
  />
);

const SECTIONS: [number, string][] = [
  [0, "00 — IDENT"],
  [4, "01 — BELIEF"],
  [8, "02 — SERVICES"],
  [16, "03 — CAPABILITIES"],
  [20, "04 — PROCESS"],
  [24, "05 — PROMISE"],
  [28, "ALPHASTRIX DIGITAL"],
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Slate-style corner furniture. Flips to ink on the bright colour plates. */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = frame / fps / BEAT;
  const section = [...SECTIONS].reverse().find(([from]) => beat >= from)?.[1] ?? "";
  const onBright = (beat >= 3.97 && beat < 5) || (beat >= 7.9 && beat < 8.2) || (beat >= 12.2 && beat < 16.15) || (beat >= 23.9 && beat < 24.12);
  const ink = onBright ? C.ink : C.bone;
  const text: React.CSSProperties = {
    position: "absolute",
    fontFamily: F.mono,
    fontSize: 20,
    letterSpacing: "0.16em",
    color: ink,
  };
  const corner = (x: "left" | "right", y: "top" | "bottom"): React.CSSProperties => ({
    position: "absolute",
    [x]: 36,
    [y]: 36,
    width: 18,
    height: 18,
    [`border${y === "top" ? "Top" : "Bottom"}`]: `2px solid ${ink}`,
    [`border${x === "left" ? "Left" : "Right"}`]: `2px solid ${ink}`,
  });
  const fadeIn = Math.min(1, frame / 20);
  return (
    <AbsoluteFill style={{ opacity: 0.72 * fadeIn, pointerEvents: "none" }}>
      <div style={corner("left", "top")} />
      <div style={corner("right", "top")} />
      <div style={corner("left", "bottom")} />
      <div style={corner("right", "bottom")} />
      <div style={{ ...text, left: 72, top: 34 }}>ALPHASTRIX DIGITAL</div>
      <div style={{ ...text, right: 72, top: 34 }}>SHOWREEL / 2026</div>
      <div style={{ ...text, left: 72, bottom: 34 }}>
        TC 00:{pad(Math.floor(frame / fps))}:{pad(frame % fps)}
      </div>
      <div style={{ ...text, right: 72, bottom: 34 }}>{section}</div>
    </AbsoluteFill>
  );
};

/** Faint blueprint grid with a soft radial falloff. */
export const Grid: React.FC<{ color?: string; size?: number; style?: React.CSSProperties }> = ({
  color = "rgba(242,239,233,0.06)",
  size = 72,
  style,
}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: "center",
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
      WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
      ...style,
    }}
  />
);
