import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, H, INTER, MONTSERRAT, W, clamp, easeOut } from "./theme";

/** Glass shards + glowing particles exploding from a point. */
export const Shatter: React.FC<{
  x: number;
  y: number;
  at: number;
  seed: string;
  tint: string;
  count?: number;
}> = ({ x, y, at, seed, tint, count = 30 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 40) return null;
  const items = new Array(count).fill(0).map((_, i) => {
    const ang = random(`${seed}a${i}`) * Math.PI * 2;
    const spd = 14 + random(`${seed}s${i}`) * 30;
    const px = x + Math.cos(ang) * spd * f * (1 - f / 90);
    const py = y + Math.sin(ang) * spd * f * (1 - f / 90) + 0.9 * f * f;
    const rot = random(`${seed}r${i}`) * 360 + f * (random(`${seed}w${i}`) - 0.5) * 40;
    const sz = 14 + random(`${seed}z${i}`) * 34;
    const o = interpolate(f, [0, 4, 30, 40], [0, 1, 0.8, 0], clamp);
    const isGlass = i % 3 === 0;
    return (
      <polygon
        key={i}
        points={`0,${-sz} ${sz * 0.7},${sz * 0.6} ${-sz * 0.5},${sz * 0.4}`}
        transform={`translate(${px} ${py}) rotate(${rot})`}
        fill={isGlass ? "rgba(255,255,255,0.55)" : tint}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={1}
        opacity={o}
      />
    );
  });
  const sparks = new Array(40).fill(0).map((_, i) => {
    const ang = random(`${seed}pa${i}`) * Math.PI * 2;
    const spd = 20 + random(`${seed}ps${i}`) * 40;
    const d = spd * f * (1 - f / 80);
    const o = interpolate(f, [0, 3, 24], [0, 1, 0], clamp);
    return (
      <circle
        key={`p${i}`}
        cx={x + Math.cos(ang) * d}
        cy={y + Math.sin(ang) * d}
        r={2 + random(`${seed}pr${i}`) * 4}
        fill={i % 2 ? "#fff" : tint}
        opacity={o}
      />
    );
  });
  const flash = interpolate(f, [0, 2, 10], [0, 0.9, 0], clamp);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <circle cx={x} cy={y} r={60 + f * 18} fill="none" stroke="#fff" strokeWidth={4} opacity={flash} />
      <g style={{ filter: `drop-shadow(0 0 10px ${tint})` }}>{items}</g>
      {sparks}
    </svg>
  );
};

/** Keyword caption centred on a baseline y. */
export const CaptionBlock: React.FC<{
  y: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ y, children, style }) => (
  <AbsoluteFill style={{ top: y, height: "auto", alignItems: "center", padding: "0 80px" }}>
    <div style={{ textAlign: "center", ...style }}>{children}</div>
  </AbsoluteFill>
);

/** Spring-in for a single word / element. */
export const usePop = (start: number, overshoot = 1.18, dur = 10) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [start, start + dur * 0.55, start + dur], [0, overshoot, 1], clamp);
  const o = interpolate(f, [start, start + 3], [0, 1], clamp);
  return { s, o, visible: f >= start };
};

export type Line = { from: number; to: number; text: string };

/** Karaoke-style VO subtitle - words light up across the line's duration. */
export const Subtitles: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const f = useCurrentFrame();
  const line = lines.find((l) => f >= l.from && f < l.to);
  if (!line) return null;
  const words = line.text.split(" ");
  const span = (line.to - line.from) * 0.82;
  const inO = interpolate(f, [line.from, line.from + 5, line.to - 4, line.to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ top: 1545, height: "auto", alignItems: "center", padding: "0 90px", opacity: inO }}>
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 36,
          lineHeight: 1.28,
          textAlign: "center",
          color: C.white,
          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
          background: "rgba(5,7,11,0.42)",
          padding: "14px 26px",
          borderRadius: 22,
        }}
      >
        {words.map((w, i) => {
          const t = line.from + (i / words.length) * span;
          return (
            <span key={i} style={{ opacity: f >= t ? 1 : 0.38 }}>
              {w}{" "}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Animated film grain + vignette, always on top. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
};

/** Bold slam text: scales down from 1.6 with a short decaying shake. */
export const Slam: React.FC<{ at: number; children: React.ReactNode; size?: number }> = ({ at, children, size = 104 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const s = interpolate(f, [0, 5, 9], [1.7, 0.96, 1], { ...clamp, easing: easeOut });
  const shake = f < 12 ? Math.sin(f * 2.6) * (12 - f) * 1.4 : 0;
  return (
    <div
      style={{
        fontFamily: MONTSERRAT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color: C.white,
        textTransform: "uppercase",
        textShadow: "0 8px 30px rgba(0,0,0,0.7)",
        scale: String(s),
        translate: `${shake}px ${shake * 0.4}px`,
        opacity: interpolate(f, [0, 2], [0, 1], clamp),
      }}
    >
      {children}
    </div>
  );
};
