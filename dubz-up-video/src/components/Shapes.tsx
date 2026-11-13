import React from "react";
import { beat, pop, wiggle } from "../lib/anim";
import { C } from "../theme";

export type ShapeKind = "star" | "burst" | "squiggle" | "plus" | "donut" | "tri" | "spark" | "dot";

const starPoints = (n: number, inner: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 46 : 46 * inner;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`);
  }
  return pts.join(" ");
};

export const Shape: React.FC<{ kind: ShapeKind; size: number; color: string; stroke?: number }> = ({
  kind,
  size,
  color,
  stroke = 6,
}) => {
  // Stroke widths are given in output pixels, so convert to the 100-unit viewBox.
  const sw = (stroke * 100) / size;
  const common = { stroke: C.ink, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  let body: React.ReactNode;
  switch (kind) {
    case "star":
      body = <polygon points={starPoints(5, 0.48)} fill={color} {...common} />;
      break;
    case "burst":
      body = <polygon points={starPoints(12, 0.74)} fill={color} {...common} />;
      break;
    case "spark":
      body = (
        <path
          d="M50 4 Q56 44 96 50 Q56 56 50 96 Q44 56 4 50 Q44 44 50 4 Z"
          fill={color}
          {...common}
        />
      );
      break;
    case "plus":
      body = (
        <path
          d="M38 6 H62 V38 H94 V62 H62 V94 H38 V62 H6 V38 H38 Z"
          fill={color}
          {...common}
        />
      );
      break;
    case "donut":
      body = (
        <>
          <circle cx="50" cy="50" r="34" fill="none" stroke={C.ink} strokeWidth={24 + sw * 2} />
          <circle cx="50" cy="50" r="34" fill="none" stroke={color} strokeWidth={24} />
        </>
      );
      break;
    case "tri":
      body = <polygon points="50,10 92,86 8,86" fill={color} {...common} />;
      break;
    case "dot":
      body = <circle cx="50" cy="50" r="40" fill={color} {...common} />;
      break;
    case "squiggle":
    default: {
      const d = "M6 50 Q17 22 28 50 T50 50 T72 50 T94 50";
      body = (
        <>
          <path d={d} fill="none" stroke={C.ink} strokeWidth={14 + sw * 2} strokeLinecap="round" />
          <path d={d} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
        </>
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", display: "block" }}>
      {body}
    </svg>
  );
};

export type DecorItem = {
  kind: ShapeKind;
  x: number;
  y: number;
  size: number;
  color: string;
  rot?: number;
};

/** Floating background shapes: they pop in, drift, spin slowly and nod on the beat. */
export const Decor: React.FC<{ frame: number; items: DecorItem[]; delay?: number; drift?: number }> = ({
  frame,
  items,
  delay = 2,
  drift = 16,
}) => (
  <>
    {items.map((it, i) => {
      const p = pop(frame, delay + i * 2);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: it.x - it.size / 2,
            top: it.y - it.size / 2,
            translate: `${wiggle(frame, i + 1) * drift}px ${wiggle(frame, i + 40) * drift}px`,
            rotate: `${(it.rot ?? 0) + wiggle(frame, i + 80, 0.03) * 14 + frame * (i % 2 ? 0.25 : -0.2)}deg`,
            scale: String(p * (1 + beat(frame) * 0.07)),
          }}
        >
          <Shape kind={it.kind} size={it.size} color={it.color} />
        </div>
      );
    })}
  </>
);

/** A soft dotted print texture that drifts slowly. */
export const Dots: React.FC<{ frame: number; color?: string; opacity?: number }> = ({
  frame,
  color = C.ink,
  opacity = 0.08,
}) => (
  <div
    style={{
      position: "absolute",
      inset: -60,
      opacity,
      backgroundImage: `radial-gradient(${color} 3px, transparent 3.6px)`,
      backgroundSize: "44px 44px",
      translate: `${(frame * 0.35) % 44}px ${(frame * 0.2) % 44}px`,
    }}
  />
);

type Particle = { color: string; kind: 0 | 1 | 2 };

/** A burst of confetti from one point, with drag and gravity. */
export const Confetti: React.FC<{
  frame: number;
  at: number;
  x: number;
  y: number;
  count?: number;
  power?: number;
  colors?: string[];
}> = ({ frame, at, x, y, count = 44, power = 1, colors = [C.pink, C.blue, C.mint, C.orange, C.purple, C.cream] }) => {
  const t = frame - at;
  if (t < 0) return null;
  const rand = (n: number) => {
    const v = Math.sin(n * 91.7 + at * 13.3) * 43758.5453;
    return v - Math.floor(v);
  };
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const a = rand(i) * Math.PI * 2;
        const speed = (26 + rand(i + 100) * 44) * power;
        const k = 0.11;
        const travel = (1 - Math.exp(-t * k)) / k;
        const px = x + Math.cos(a) * speed * travel;
        const py = y + Math.sin(a) * speed * travel * 0.8 - 6 * travel + 0.42 * t * t;
        const s = 16 + rand(i + 200) * 26;
        const part: Particle = { color: colors[i % colors.length], kind: (i % 3) as 0 | 1 | 2 };
        const grow = Math.min(1, t / 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - s / 2,
              top: py - s / 2,
              width: part.kind === 1 ? s * 1.5 : s,
              height: part.kind === 1 ? s * 0.6 : s,
              backgroundColor: part.color,
              border: `4px solid ${C.ink}`,
              borderRadius: part.kind === 0 ? "50%" : 5,
              boxSizing: "border-box",
              rotate: `${rand(i + 300) * 360 + t * (rand(i + 400) * 30 - 15)}deg`,
              scale: String(grow),
            }}
          />
        );
      })}
    </>
  );
};
