import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, F, shadow, shadowSm } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Spring from 0 to 1 starting at `delay` frames. */
export const useSpring = (delay = 0, damping = 14, stiffness = 140, mass = 0.8) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass } });
};

export const ease = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], { ...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1) });

/** Pop-in transform: scale + rise + blur, driven by a 0..1 progress. */
export const popStyle = (p: number, rise = 40, fromScale = 0.86): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.4),
  transform: `translateY(${(1 - p) * rise}px) scale(${fromScale + (1 - fromScale) * p})`,
  filter: `blur(${Math.max(0, (1 - p) * 10)}px)`,
});

export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  small?: boolean;
}> = ({ style, children, small }) => (
  <div
    style={{
      background: C.card,
      borderRadius: small ? 28 : 40,
      boxShadow: small ? shadowSm : shadow,
      border: `1.5px solid ${C.line}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.crimson,
  bg = C.crimsonSoft,
  style,
}) => (
  <span
    style={{
      fontFamily: F.sans,
      fontWeight: 800,
      fontSize: 20,
      letterSpacing: 3,
      textTransform: "uppercase",
      color,
      background: bg,
      padding: "8px 16px",
      borderRadius: 999,
      display: "inline-block",
      ...style,
    }}
  >
    {children}
  </span>
);

/** Brand mark for the AI agent: a crimson 8-point spark. */
export const Spark: React.FC<{ size: number; color?: string; rotate?: number }> = ({ size, color = C.crimson, rotate = 0 }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `rotate(${rotate}deg)` }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={-5} y={-46} width={10} height={40} rx={5} fill={color} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={9} fill={color} />
  </svg>
);

export const Check: React.FC<{ size: number; bg?: string }> = ({ size, bg = C.green }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: bg,
      display: "grid",
      placeItems: "center",
      boxShadow: "0 8px 20px rgba(31,164,99,0.35)",
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
      <path d="M4 12.5 L9.5 18 L20 6.5" stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const Lock: React.FC<{ size: number; open?: number; color?: string }> = ({ size, open = 0, color = C.gray2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M7.5 10 V7.5 a4.5 4.5 0 0 1 9 0 V10"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      transform={`translate(0 ${-open * 3}) rotate(${open * -20} 16.5 10)`}
    />
    <rect x={5} y={10} width={14} height={10} rx={3} fill="none" stroke={color} strokeWidth={2} />
    <circle cx={12} cy={15} r={1.4} fill={color} />
  </svg>
);

/** Typewriter: returns the substring visible at `frame` (chars per frame). */
export const typed = (text: string, frame: number, start: number, cps = 1.1) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * cps)));

export const Caret: React.FC<{ color?: string; h?: number }> = ({ color = C.crimson, h = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: 4,
        height: h,
        background: color,
        marginLeft: 4,
        verticalAlign: "middle",
        opacity: Math.floor(frame / 8) % 2 ? 0.15 : 1,
        borderRadius: 2,
      }}
    />
  );
};

export const MiniFace: React.FC<{ size: number; hue: string }> = ({ size, hue }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: `linear-gradient(140deg, ${hue}, #ffffff 160%)`,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
    }}
  >
    <div style={{ width: size * 0.36, height: size * 0.36, borderRadius: size, background: "rgba(255,255,255,0.75)", marginTop: -size * 0.1 }} />
  </div>
);
