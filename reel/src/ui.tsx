import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SHADOW } from "./theme";

/* ---------- animation helpers ---------- */

export const pop = (f: number, fps: number, delay = 0, damping = 13) =>
  spring({ frame: f - delay, fps, config: { damping, stiffness: 180, mass: 0.7 } });

export const lerp = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
  easing: (t: number) => number = Easing.out(Easing.cubic),
) => interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

export const popIn = (p: number, y = 40): React.CSSProperties => ({
  opacity: Math.min(1, Math.max(0, p * 1.5)),
  transform: `translateY(${(1 - p) * y}px) scale(${0.9 + 0.1 * p})`,
});

export const typed = (text: string, f: number, start: number, cps = 1.4) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((f - start) * cps))));

export const Caret: React.FC<{ color?: string; h?: number }> = ({ color = C.violet, h = 34 }) => {
  const f = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: h,
        marginLeft: 3,
        verticalAlign: "middle",
        background: color,
        opacity: Math.floor(f / 12) % 2 === 0 ? 1 : 0,
      }}
    />
  );
};

/* ---------- scene shell: entrance is per-element, exit is shared ---------- */

export const SceneExit: React.FC<{ dur: number; children: React.ReactNode; exit?: boolean }> = ({
  dur,
  children,
  exit = true,
}) => {
  const f = useCurrentFrame();
  const t = exit ? lerp(f, dur - 6, dur, 0, 1, Easing.in(Easing.cubic)) : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 1 - t,
        filter: t > 0 ? `blur(${t * 10}px)` : undefined,
        transform: `scale(${1 - t * 0.03})`,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- headline ---------- */

export const Headline: React.FC<{
  l1: string;
  l2: string;
  c2?: string;
  s1?: number;
  s2?: number;
  delay?: number;
}> = ({ l1, l2, c2 = C.violetText, s1 = 88, s2 = 88, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = (text: string, size: number, color: string, d: number) => {
    const p = pop(f, fps, delay + d, 14);
    return (
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.0,
          letterSpacing: "-0.035em",
          color,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          opacity: Math.min(1, p * 1.5),
          transform: `translateY(${(1 - p) * 30}px)`,
          filter: `blur(${Math.max(0, (1 - p) * 12)}px)`,
        }}
      >
        {text}
      </div>
    );
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 292,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {line(l1, s1, C.ink, 0)}
      {line(l2, s2, c2, 4)}
    </div>
  );
};

/* ---------- containers ---------- */

export const Stage: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  top,
  children,
  style,
}) => <div style={{ position: "absolute", top, left: 80, right: 80, ...style }}>{children}</div>;

export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  dark?: boolean;
}> = ({ children, style, dark }) => (
  <div
    style={{
      background: dark ? C.ink : `linear-gradient(180deg, ${C.card} 0%, ${C.card2} 100%)`,
      borderRadius: 40,
      border: dark ? "1px solid rgba(255,255,255,0.06)" : `1px solid ${C.line}`,
      boxShadow: dark
        ? "0 40px 80px -24px rgba(11,11,16,0.55), 0 10px 24px -8px rgba(11,11,16,0.35)"
        : SHADOW,
      padding: 44,
      position: "relative",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties }> = ({
  children,
  size = 26,
  color = C.ink,
  weight = 500,
  style,
}) => (
  <span style={{ fontFamily: F.mono, fontSize: size, color, fontWeight: weight, letterSpacing: "0.01em", ...style }}>
    {children}
  </span>
);

export const Bar: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({
  w,
  h = 16,
  color = C.mute2,
  style,
}) => <div style={{ width: w, height: h, borderRadius: h, background: color, ...style }} />;

/* ---------- step tag: (1) /seo-content ---------- */

export const StepTag: React.FC<{ n: number; slug: string; top: number; delay?: number }> = ({ n, slug, top, delay = 6 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        display: "flex",
        alignItems: "center",
        gap: 16,
        ...popIn(p, 20),
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          background: C.violet,
          color: C.white,
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <Mono size={30} color={C.violetText} weight={700}>
        /{slug}
      </Mono>
    </div>
  );
};

/* ---------- brand marks ---------- */

export const LogoMark: React.FC<{ size: number; radius?: number }> = ({ size, radius }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius ?? size * 0.26,
      background: `linear-gradient(145deg, ${C.ink2} 0%, ${C.ink} 100%)`,
      boxShadow: "0 14px 30px -10px rgba(11,11,16,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width={size * 0.66} height={size * 0.66} viewBox="5 5 22 22">
      <path d="M16 5 27 27H21L16 17 11 27H5L16 5Z" fill={C.lime} />
      <path d="M16 5 27 27H21L16 17Z" fill={C.violet} opacity={0.9} />
    </svg>
  </div>
);

export const IGGlyph: React.FC<{ size: number; mono?: string }> = ({ size, mono }) => {
  const id = `ig-${size}-${mono ?? "c"}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <defs>
        <radialGradient id={id} cx="0.3" cy="1.05" r="1.25">
          <stop offset="0" stopColor="#FFD776" />
          <stop offset="0.3" stopColor="#F77737" />
          <stop offset="0.6" stopColor="#E1306C" />
          <stop offset="1" stopColor="#7C3AED" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill={mono ? "none" : `url(#${id})`} stroke={mono} strokeWidth={mono ? 3.5 : 0} />
      <rect x="12" y="12" width="24" height="24" rx="7.5" fill="none" stroke={mono ?? "#fff"} strokeWidth="3.5" />
      <circle cx="24" cy="24" r="5.6" fill="none" stroke={mono ?? "#fff"} strokeWidth="3.5" />
      <circle cx="32.4" cy="15.6" r="2.1" fill={mono ?? "#fff"} />
    </svg>
  );
};

/* Bobbing brand mascot: the logo tile with a little wave. */
export const Mascot: React.FC<{ delay?: number; x?: number; y: number; size?: number }> = ({
  delay = 0,
  x = 820,
  y,
  size = 150,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay, 10);
  const bob = Math.sin((f - delay) / 9) * 7;
  const tilt = Math.sin((f - delay) / 13) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        transform: `scale(${p}) rotate(${tilt - (1 - p) * 30}deg)`,
        transformOrigin: "50% 100%",
        zIndex: 20,
      }}
    >
      <LogoMark size={size} />
    </div>
  );
};

export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = C.ink, color = C.white, size = 26, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: `${size * 0.45}px ${size * 0.85}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: F.sans,
      fontWeight: 800,
      fontSize: size,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
