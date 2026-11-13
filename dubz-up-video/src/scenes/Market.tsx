import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { Decor, DecorItem, Dots } from "../components/Shapes";
import { content } from "../content";
import { beat, hit, pop, tween } from "../lib/anim";
import { BEAT, C, FONT } from "../theme";

const T = content.market;

const CX = 1400;
const BASE = 950;
const RADII = [370, 242, 132];
const FILL = [C.blue, C.pink, C.yellow];
const TEXT = [C.cream, C.cream, C.ink];
const VALUE_SIZE = [112, 92, 62];
const KEY_SIZE = [34, 30, 24];
const LABEL_SIZE = [32, 28, 24];
const LABEL_TOP = [40, 30, 44];

const DECOR: DecorItem[] = [
  { kind: "spark", x: 960, y: 160, size: 70, color: C.yellow },
  { kind: "donut", x: 1820, y: 150, size: 80, color: C.mint },
  { kind: "plus", x: 880, y: 900, size: 64, color: C.pink },
];

export const Note: React.FC<{ color: string; frame: number; delay?: number }> = ({ color, frame, delay = 20 }) =>
  content.showIllustrativeNote ? (
    <div
      style={{
        border: `3px solid ${color}`,
        borderRadius: 999,
        padding: "8px 22px",
        fontFamily: FONT.body,
        fontWeight: 700,
        fontSize: 26,
        color,
        opacity: 0.75 * tween(frame, delay, delay + 8),
        whiteSpace: "nowrap",
      }}
    >
      {content.illustrativeNote}
    </div>
  ) : null;

export const Market: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Dots frame={frame} color={C.cream} opacity={0.06} />
      {/* sound waves radiating from the market */}
      {[0, 1, 2].map((k) => {
        const phase = ((frame * 2.2 + k * 60) % 180) / 180;
        const r = RADII[0] + phase * 300;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: CX - r,
              top: BASE - RADII[0] - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `5px solid ${C.cream}`,
              boxSizing: "border-box",
              opacity: frame < BEAT ? 0 : (1 - phase) * 0.3,
            }}
          />
        );
      })}
      <Decor frame={frame} items={DECOR} delay={4} />

      <div style={{ position: "absolute", left: 130, top: 282 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 110, letterSpacing: "-0.03em", color: C.cream }}>
          <Kinetic text={T.title[0]} frame={frame} delay={1} />
          <Kinetic text={T.title[1]} frame={frame} delay={5} style={{ color: C.yellow }} />
        </div>
        <Kinetic
          text={T.sub}
          frame={frame}
          delay={12}
          stagger={1}
          style={{ marginTop: 34, fontFamily: FONT.body, fontWeight: 700, fontSize: 46, color: C.cream }}
        />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 130, marginTop: 50 }}>
          {new Array(14).fill(0).map((_, i) => {
            const level = 0.25 + 0.75 * Math.abs(Math.sin(frame * 0.28 + i * 0.9) * Math.cos(frame * 0.11 + i * 2.3));
            return (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 130 * level * pop(frame, 16 + i, { damping: 12 }) * (0.8 + beat(frame) * 0.2),
                  borderRadius: 12,
                  backgroundColor: [C.pink, C.yellow, C.mint, C.blue][i % 4],
                }}
              />
            );
          })}
        </div>
      </div>

      {T.rings.map((ring, i) => {
        const at = BEAT * (i + 1);
        const p = pop(frame, at, { damping: 9, stiffness: 170 });
        const R = RADII[i];
        const value = Math.round(ring.value * tween(frame, at, at + 14));
        return (
          <div
            key={ring.key}
            style={{
              position: "absolute",
              left: CX - R,
              top: BASE - R * 2,
              width: R * 2,
              height: R * 2,
              borderRadius: "50%",
              backgroundColor: FILL[i],
              border: `8px solid ${C.ink}`,
              boxShadow: `0 0 0 6px ${C.cream}`,
              boxSizing: "border-box",
              transformOrigin: "50% 100%",
              scale: String(p * (1 + hit(frame, at, 3) * 0.04) * (1 + (frame >= 4 * BEAT ? beat(frame) * 0.022 : 0))),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: LABEL_TOP[i],
              color: TEXT[i],
            }}
          >
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: KEY_SIZE[i], lineHeight: 1.1, letterSpacing: "0.12em" }}>
              {ring.key}
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: VALUE_SIZE[i],
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {ring.prefix}
              {value}
              {ring.suffix}
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: LABEL_SIZE[i], lineHeight: 1.1, marginTop: 4 }}>
              {ring.label}
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 130, top: 940 }}>
        <Note color={C.cream} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
