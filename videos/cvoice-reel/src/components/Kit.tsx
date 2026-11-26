import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE, FONT, GRAD, TL, lerp, noise, ramp, spr } from "../lib";

// ---------- animated background ----------
const ACCENTS: Record<string, [string, string]> = {
  hook: ["#FF3B4E", "#7C5CFF"],
  stop: ["#FF3B4E", "#FF3B4E"],
  save: ["#2BD67B", "#22D3EE"],
  tease: ["#7C5CFF", "#FFC83D"],
  logo: ["#7C5CFF", "#22D3EE"],
  features: ["#7C5CFF", "#22D3EE"],
  process: ["#22D3EE", "#7C5CFF"],
  clone: ["#7C5CFF", "#C6FF3D"],
  styles: ["#FF5CC8", "#7C5CFF"],
  dubbing: ["#22D3EE", "#7C5CFF"],
  buildup: ["#3A2A88", "#1A1240"],
  demo: ["#C6FF3D", "#7C5CFF"],
  url: ["#7C5CFF", "#22D3EE"],
  cta: ["#C6FF3D", "#22D3EE"],
};

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const sc = TL.scenes.find((s) => f >= s.s && f < s.e) ?? TL.scenes[0];
  const [a, b] = ACCENTS[sc.id] ?? ACCENTS.logo;
  const local = f - sc.s;
  const glow = ramp(local, 0, 14);
  const dark = sc.id === "buildup" ? 0.45 : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          left: -420 + Math.sin(f / 70) * 90,
          top: -260 + Math.cos(f / 90) * 80,
          background: `radial-gradient(circle, ${a} 0%, transparent 62%)`,
          opacity: (0.32 + 0.12 * glow) * dark,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          right: -560 + Math.cos(f / 80) * 100,
          bottom: -380 + Math.sin(f / 60) * 90,
          background: `radial-gradient(circle, ${b} 0%, transparent 62%)`,
          opacity: 0.28 * dark,
        }}
      />
      {/* dotted grid */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.11) 1.6px, transparent 1.8px)",
          backgroundSize: "54px 54px",
          backgroundPosition: `0px ${(f * 0.6) % 54}px`,
          maskImage: "radial-gradient(ellipse at 50% 42%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 42%, black 20%, transparent 75%)",
          opacity: 0.7,
        }}
      />
      {/* floating particles */}
      {new Array(18).fill(0).map((_, i) => {
        const x = noise(i + 1) * 1080;
        const speed = 0.6 + noise(i + 30) * 1.4;
        const y = 1920 - ((f * speed + noise(i + 7) * 1920) % 2100);
        const s = 3 + noise(i + 50) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.violet : "#fff",
              opacity: 0.35,
              boxShadow: `0 0 ${s * 3}px currentColor`,
            }}
          />
        );
      })}
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- film grain on top ----------
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`;

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: GRAIN,
        backgroundPosition: `${noise(f) * 300}px ${noise(f + 99) * 300}px`,
        opacity: 0.07,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

// ---------- waveform ----------
export const Waveform: React.FC<{
  f: number;
  bars?: number;
  width?: number;
  height?: number;
  color?: string;
  energy?: number; // 0..1
  seed?: number;
  gap?: number;
}> = ({ f, bars = 28, width = 700, height = 220, color = GRAD, energy = 1, seed = 1, gap = 8 }) => {
  const bw = (width - gap * (bars - 1)) / bars;
  return (
    <div style={{ display: "flex", alignItems: "center", gap, width, height }}>
      {new Array(bars).fill(0).map((_, i) => {
        const env = Math.sin((i / (bars - 1)) * Math.PI) * 0.75 + 0.25;
        const wob =
          0.5 +
          0.5 *
            Math.sin(f * 0.42 + i * 0.9 + seed) *
            Math.cos(f * 0.17 + i * 0.37 + seed * 2);
        const h = Math.max(bw, height * env * (0.25 + 0.75 * wob) * energy);
        return (
          <div
            key={i}
            style={{
              width: bw,
              height: h,
              borderRadius: bw,
              background: color,
              boxShadow: "0 0 18px rgba(124,92,255,0.45)",
            }}
          />
        );
      })}
    </div>
  );
};

// ---------- glass card ----------
export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  glow?: number;
}> = ({ style, children, glow = 0 }) => (
  <div
    style={{
      background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
      border: `2px solid ${glow > 0 ? `rgba(198,255,61,${0.25 + 0.6 * glow})` : C.line}`,
      borderRadius: 40,
      boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 ${60 * glow}px rgba(198,255,61,${0.35 * glow})`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- pill / chip ----------
export const Chip: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  bg?: string;
  color?: string;
}> = ({ children, style, bg = "rgba(255,255,255,0.1)", color = C.ink }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 34px",
      borderRadius: 999,
      background: bg,
      color,
      border: `2px solid ${C.line}`,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 44,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- rolling odometer ----------
export const Odometer: React.FC<{
  value: number;
  size?: number;
  color?: string;
  prefix?: string;
}> = ({ value, size = 150, color = C.ink, prefix = "₹" }) => {
  const str = Math.max(0, Math.floor(value)).toLocaleString("en-IN");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        color,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: -2,
      }}
    >
      <span style={{ marginRight: 12, opacity: 0.85 }}>{prefix}</span>
      {str.split("").map((ch, i) => {
        if (ch === ",") return <span key={i} style={{ width: size * 0.3 }}>,</span>;
        // real odometer column: 0-9 stacked, rolled continuously
        const place = str.replace(/,/g, "").length - str.slice(0, i + 1).replace(/,/g, "").length;
        const v = Math.max(0, value);
        const unit = Math.pow(10, place);
        const base = Math.floor(v / unit) % 10;
        const below = (v % unit) / unit; // progress of the lower columns
        const col = place === 0 ? v % 10 : base + Math.max(0, (below - 0.9) * 10);
        const lh = size * 1.2;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              height: lh,
              overflow: "hidden",
              width: size * 0.64,
              textAlign: "center",
            }}
          >
            <span style={{ display: "block", translate: `0 ${-col * lh}px` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
                <span key={k} style={{ display: "block", height: lh, lineHeight: `${lh}px` }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ---------- mystery box ----------
export const MysteryBox: React.FC<{
  f: number;
  size?: number;
  lidOpen?: number; // 0..1
  locked?: boolean;
  wiggle?: number;
  rays?: number;
}> = ({ f, size = 420, lidOpen = 0, locked = true, wiggle = 0.3, rays = 0 }) => {
  const rot = Math.sin(f * 0.5) * 4 * wiggle + Math.sin(f * 1.7) * 2 * wiggle * wiggle;
  return (
    <div style={{ position: "relative", width: size, height: size, rotate: `${rot}deg` }}>
      {rays > 0 && (
        <div
          style={{
            position: "absolute",
            left: -size * 0.6,
            top: -size * 0.8,
            width: size * 2.2,
            height: size * 1.6,
            background: `conic-gradient(from 180deg at 50% 70%, transparent 0deg, rgba(198,255,61,${0.5 * rays}) 18deg, transparent 36deg, rgba(34,211,238,${0.45 * rays}) 60deg, transparent 80deg, rgba(198,255,61,${0.5 * rays}) 110deg, transparent 130deg, rgba(124,92,255,${0.5 * rays}) 150deg, transparent 180deg, transparent 360deg)`,
            filter: "blur(6px)",
            rotate: "180deg",
            opacity: rays,
          }}
        />
      )}
      {/* body */}
      <div
        style={{
          position: "absolute",
          left: size * 0.08,
          top: size * 0.38,
          width: size * 0.84,
          height: size * 0.6,
          borderRadius: size * 0.06,
          background: `linear-gradient(160deg, ${C.violet}, #4B2FD9)`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55), inset 0 -20px 40px rgba(0,0,0,0.25)",
        }}
      />
      {/* ribbon vertical */}
      <div
        style={{
          position: "absolute",
          left: size * 0.44,
          top: size * 0.38,
          width: size * 0.12,
          height: size * 0.6,
          background: C.lime,
        }}
      />
      {/* lid */}
      <div
        style={{
          position: "absolute",
          left: size * 0.02,
          top: size * 0.24,
          width: size * 0.96,
          height: size * 0.18,
          borderRadius: size * 0.05,
          background: `linear-gradient(160deg, #9A80FF, ${C.violet})`,
          translate: `0 ${-lidOpen * size * 0.9}px`,
          rotate: `${lidOpen * -28}deg`,
          opacity: 1 - lidOpen * 0.6,
          boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: size * 0.42,
            top: 0,
            width: size * 0.12,
            height: "100%",
            background: C.lime,
          }}
        />
        {/* bow */}
        <div
          style={{
            position: "absolute",
            left: size * 0.3,
            top: -size * 0.12,
            width: size * 0.36,
            height: size * 0.14,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: size * 0.16,
              height: size * 0.14,
              borderRadius: "50% 50% 10% 50%",
              border: `${size * 0.035}px solid ${C.lime}`,
              rotate: "-20deg",
            }}
          />
          <div
            style={{
              width: size * 0.16,
              height: size * 0.14,
              borderRadius: "50% 50% 50% 10%",
              border: `${size * 0.035}px solid ${C.lime}`,
              rotate: "20deg",
            }}
          />
        </div>
      </div>
      {locked && (
        <div
          style={{
            position: "absolute",
            left: size * 0.36,
            top: size * 0.5,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: "50%",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 0 6px ${C.lime}`,
          }}
        >
          <svg width={size * 0.16} height={size * 0.16} viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth={2.4} strokeLinecap="round">
            <rect x="4" y="11" width="16" height="10" rx="2.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ---------- captions ----------
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const g = TL.groups.find((gr) => f >= gr.s && f < gr.e);
  if (!g) return null;
  const enter = spr(f, g.s, { damping: 14, stiffness: 260 });
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1360,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "4px 30px",
        scale: String(lerp(enter, 0.82, 1)),
        opacity: enter,
        translate: `0 ${lerp(enter, 30, 0)}px`,
      }}
    >
      {g.words.map((w, i) => {
        const active = f >= w.s - 2;
        const now = f >= w.s - 2 && f < w.e;
        const pop = spr(f, w.s - 2, { damping: 10, stiffness: 320 });
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 76,
              lineHeight: 1.25,
              color: now || w.hl ? C.lime : active ? C.ink : "rgba(245,245,250,0.45)",
              textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
              WebkitTextStroke: "2px rgba(0,0,0,0.65)",
              paintOrder: "stroke fill",
              display: "inline-block",
              scale: String(now ? lerp(pop, 0.92, 1.04) : 1),
              transformOrigin: "50% 60%",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- top progress bar with gift at the end ----------
export const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const p = f / TL.duration;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 110, height: 10 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(255,255,255,0.12)" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${p * 100}%`,
          borderRadius: 10,
          background: GRAD,
          boxShadow: `0 0 18px ${C.cyan}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -14,
          top: -15,
          width: 40,
          height: 40,
          borderRadius: 12,
          background: C.lime,
          rotate: `${Math.sin(f * 0.3) * 8}deg`,
          boxShadow: `0 0 20px ${C.lime}`,
          opacity: interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: EASE.soft }),
        }}
      >
        <div style={{ position: "absolute", left: 16, top: 0, width: 8, height: 40, background: "#3A2A88" }} />
        <div style={{ position: "absolute", left: 0, top: 16, width: 40, height: 8, background: "#3A2A88" }} />
      </div>
    </div>
  );
};

// ---------- headline (word stagger rise) ----------
export const Rise: React.FC<{
  f: number;
  text: string;
  start?: number;
  size?: number;
  color?: string;
  stagger?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ f, text, start = 0, size = 96, color = C.ink, stagger = 4, weight = 800, style }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: `0 ${size * 0.28}px`,
      fontFamily: FONT,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.15,
      color,
      textAlign: "center",
      ...style,
    }}
  >
    {text.split(" ").map((w, i) => {
      const p = ramp(f, start + i * stagger, start + i * stagger + 12);
      return (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12 }}>
          <span style={{ display: "inline-block", translate: `0 ${lerp(p, size * 1.1, 0)}px`, opacity: p }}>{w}</span>
        </span>
      );
    })}
  </div>
);
