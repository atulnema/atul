import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  SpringConfig,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./theme";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const useEnter = (delay = 0, config: Partial<SpringConfig> = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 120, ...config },
  });
};

/** Blur + rise + fade in, driven by a springy entrance. */
export const BlurIn: React.FC<{
  delay?: number;
  y?: number;
  x?: number;
  blur?: number;
  scale?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 40, x = 0, blur = 18, scale = 1, children, style }) => {
  const p = useEnter(delay);
  const opacity = interpolate(p, [0, 0.6], [0, 1], clamp);
  return (
    <div
      style={{
        display: "inline-block",
        opacity,
        transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px) scale(${
          scale + (1 - scale) * p
        })`,
        filter: `blur(${Math.max(0, (1 - p) * blur)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Splits a string into characters that blur in one after another. */
export const SplitChars: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  y?: number;
  blur?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 3, y = 120, blur = 30, style }) => {
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => (
        <BlurIn key={i} delay={delay + i * stagger} y={y} blur={blur}>
          {ch}
        </BlurIn>
      ))}
    </span>
  );
};

/** A line of text that slides up from behind a hard mask. */
export const MaskLine: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const p = useEnter(delay, { damping: 200, stiffness: 90 });
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`,
          transformOrigin: "left bottom",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Slow "camera" push-in for the whole scene. */
export const CameraPush: React.FC<{
  from?: number;
  to?: number;
  children: React.ReactNode;
}> = ({ from = 1, to = 1.06, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [from, to], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>
  );
};

/** Small mono label in the top-left corner: "02 / Context window". */
export const SceneLabel: React.FC<{ index: string; label: string }> = ({
  index,
  label,
}) => {
  const frame = useCurrentFrame();
  const lineW = interpolate(frame, [0, 22], [0, 90], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 160,
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: FONTS.mono,
        fontSize: 32,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: COLORS.muted,
      }}
    >
      <BlurIn delay={2} x={-20} y={0} blur={8}>
        <span style={{ color: COLORS.clay }}>{index}</span>
      </BlurIn>
      <div style={{ width: lineW, height: 2, background: COLORS.clay }} />
      <BlurIn delay={8} x={-20} y={0} blur={8}>
        {label}
      </BlurIn>
    </div>
  );
};

/** Diagonal light band that sweeps across text once. */
export const LightSweep: React.FC<{
  start: number;
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start, duration = 35, children, style }) => {
  const frame = useCurrentFrame();
  const pos = interpolate(frame, [start, start + duration], [130, -30], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(105deg, transparent 42%, rgba(255,250,240,0.95) 50%, transparent 58%)",
        backgroundSize: "250% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        pointerEvents: "none",
        ...style,
        color: "transparent",
      }}
    >
      {children}
    </div>
  );
};

/** Expanding ring that fires once from the frame center. */
export const Shockwave: React.FC<{ at?: number; color?: string }> = ({
  at = 0,
  color = COLORS.clay,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 45], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (frame < at) return null;
  const size = t * 2400;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${4 - t * 3}px solid ${color}`,
          opacity: 1 - t,
          boxShadow: `0 0 80px ${color}`,
        }}
      />
    </AbsoluteFill>
  );
};
