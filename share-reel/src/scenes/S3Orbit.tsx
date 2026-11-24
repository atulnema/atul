import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, H, INTER, MONTSERRAT, W, clamp, easeIn, easeInOut, easeOut, glass } from "../theme";
import { GlossyComment, GlossyHeart, GlossyPlane } from "../Icons";

// 0:12 - 0:15 (local 0-90). 3D orbit over an isometric phone; shares fly out.
const TAP = 18;
const AVATARS = [
  { x: 150, y: 470, c: C.cyan, n: "R" },
  { x: 330, y: 330, c: "#ff4fd8", n: "A" },
  { x: 540, y: 270, c: C.green, n: "K" },
  { x: 750, y: 330, c: C.yellow, n: "S" },
  { x: 930, y: 470, c: "#9b7bff", n: "M" },
];
const ORIGIN = { x: 600, y: 900 };

const Phone: React.FC<{ f: number }> = ({ f }) => {
  const tapped = f >= TAP;
  const ripple = f - TAP;
  return (
    <div
      style={{
        width: 420,
        height: 860,
        borderRadius: 64,
        background: "#0b0d10",
        border: "10px solid #1c1f24",
        boxShadow: "0 0 0 2px #2c3138, 0 80px 120px rgba(0,0,0,0.7)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 30%, #ff9a5a 0%, #b83a7a 40%, #2a1650 80%, #0b0d10 100%)",
          opacity: 0.85,
        }}
      />
      <div style={{ position: "absolute", left: 28, bottom: 60, fontFamily: INTER, color: "#fff", fontSize: 24, fontWeight: 600 }}>
        @yourhandle · Follow
      </div>
      <div style={{ position: "absolute", right: 22, bottom: 120, display: "flex", flexDirection: "column", gap: 34, alignItems: "center" }}>
        <GlossyHeart size={64} id="ph" glow={0.3} />
        <GlossyComment size={64} id="pc" glow={0.3} />
        <div style={{ position: "relative", scale: tapped ? String(interpolate(ripple, [0, 4, 10], [1, 1.35, 1.1], clamp)) : "1" }}>
          <GlossyPlane size={64} id="pp" glow={tapped ? 1.6 : 0.4} />
          {ripple >= 0 && ripple < 16 && (
            <div
              style={{
                position: "absolute",
                left: -8,
                top: -8,
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: `3px solid ${C.cyan}`,
                scale: String(1 + ripple * 0.25),
                opacity: 1 - ripple / 16,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const S3Orbit: React.FC = () => {
  const f = useCurrentFrame();
  const inO = interpolate(f, [0, 8], [1, 0], clamp); // from the tunnel white
  const orbit = interpolate(f, [0, 90], [-46, -22], { ...clamp, easing: easeInOut });
  const tiltX = interpolate(f, [0, 90], [58, 50], clamp);
  const lift = Math.sin(f / 14) * 10;
  const graph = interpolate(f, [TAP + 10, TAP + 50], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [82, 90], [1, 0.4], { ...clamp, easing: easeIn });
  const outO = interpolate(f, [84, 90], [1, 0], clamp);
  const pill = interpolate(f, [30, 40], [0, 1], { ...clamp, easing: easeOut });

  // background spike graph points (normalised)
  const pts = [0.05, 0.08, 0.06, 0.1, 0.09, 0.14, 0.12, 0.2, 0.32, 0.55, 0.85, 1.0];
  const gx = (i: number) => 40 + (i / (pts.length - 1)) * 1000;
  const gy = (v: number) => 1280 - v * 760 * graph;
  const line = pts.map((v, i) => `${i ? "L" : "M"} ${gx(i)} ${gy(v)}`).join(" ");
  const area = `${line} L ${gx(pts.length - 1)} 1280 L ${gx(0)} 1280 Z`;

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0c1a24 0%, #05070b 70%)", scale: String(out), opacity: outO }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.55 }}>
        <defs>
          <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.green} stopOpacity="0.55" />
            <stop offset="1" stopColor={C.green} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ga)" />
        <path d={line} fill="none" stroke={C.green} strokeWidth={6} style={{ filter: `drop-shadow(0 0 14px ${C.green})` }} />
      </svg>

      <div style={{ position: "absolute", left: 540 - 210, top: 900 - 430 + lift, perspective: 1800 }}>
        <div style={{ transform: `rotateX(${tiltX}deg) rotateZ(${orbit}deg)`, transformStyle: "preserve-3d" }}>
          <Phone f={f} />
        </div>
      </div>

      <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
        {AVATARS.map((a, i) => {
          const t0 = TAP + 2 + i * 2;
          const p = interpolate(f, [t0, t0 + 14], [0, 1], { ...clamp, easing: easeOut });
          const cx = (ORIGIN.x + a.x) / 2;
          const cy = Math.min(ORIGIN.y, a.y) - 260;
          const d = `M ${ORIGIN.x} ${ORIGIN.y} Q ${cx} ${cy} ${a.x} ${a.y}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={a.c} strokeWidth={4} strokeOpacity={0.35} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
              <path
                d={d}
                fill="none"
                stroke={a.c}
                strokeWidth={9}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="0.12 1"
                strokeDashoffset={0.12 - p * 1.12}
                opacity={p < 1 ? 1 : 0}
                style={{ filter: `drop-shadow(0 0 12px ${a.c})` }}
              />
            </g>
          );
        })}
      </svg>

      {AVATARS.map((a, i) => {
        const arrive = TAP + 16 + i * 2;
        const s = interpolate(f, [arrive - 4, arrive + 2, arrive + 7], [0, 1.2, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: a.x - 56,
              top: a.y - 56,
              width: 112,
              height: 112,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, #ffffff55, ${a.c}aa 45%, #0b0d10 100%)`,
              border: `3px solid ${a.c}`,
              boxShadow: `0 0 34px ${a.c}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 46,
              color: "#fff",
              scale: String(s),
            }}
          >
            {a.n}
          </div>
        );
      })}

      <AbsoluteFill style={{ top: 1330, height: "auto", alignItems: "center" }}>
        <div
          style={{
            ...glass,
            borderRadius: 999,
            padding: "26px 50px",
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 58,
            color: "#fff",
            letterSpacing: "0.01em",
            opacity: pill,
            translate: `0px ${(1 - pill) * 40}px`,
          }}
        >
          ALGORITHM SIGNAL = <span style={{ color: C.green }}>SHARES</span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#fff", opacity: inO }} />
    </AbsoluteFill>
  );
};
