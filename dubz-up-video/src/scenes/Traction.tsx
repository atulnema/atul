import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { Decor, DecorItem, Dots, Shape } from "../components/Shapes";
import { Pill, Sticker } from "../components/Sticker";
import { content } from "../content";
import { beat, hit, pop, tween, EASE } from "../lib/anim";
import { BEAT, C, FONT } from "../theme";
import { Note } from "./Market";

const T = content.traction;

const BAR_W = 88;
const BAR_GAP = 44;
const PLOT_H = 350;
const BAR_COLORS = [C.blue, C.yellow, C.purple, C.orange, C.blue, C.pink];
const STAT_COLORS = [C.cream, C.yellow, C.pink];
const STAT_ROT = [2, -1.5, 2];

const DECOR: DecorItem[] = [
  { kind: "star", x: 1760, y: 170, size: 120, color: C.yellow, rot: 12 },
];

export const Traction: React.FC = () => {
  const frame = useCurrentFrame();
  const tops = T.bars.map((b, i) => ({
    x: 40 + i * (BAR_W + BAR_GAP) + BAR_W / 2,
    y: PLOT_H - b * PLOT_H - 44,
  }));
  let length = 0;
  for (let i = 1; i < tops.length; i++) {
    length += Math.hypot(tops[i].x - tops[i - 1].x, tops[i].y - tops[i - 1].y);
  }
  const draw = tween(frame, 26, 46, 0, 1, EASE.inOut);
  const tip = tops[tops.length - 1];
  const prev = tops[tops.length - 2];
  const angle = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI;

  return (
    <AbsoluteFill style={{ backgroundColor: C.mint }}>
      <Dots frame={frame} opacity={0.1} />
      <Decor frame={frame} items={DECOR} delay={6} />
      <Kinetic
        text={T.title}
        frame={frame}
        delay={1}
        style={{
          position: "absolute",
          left: 130,
          top: 110,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: "-0.03em",
          color: C.ink,
        }}
      />

      {/* chart */}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 312,
          scale: String(pop(frame, 3, { damping: 13 })),
          rotate: `${(1 - pop(frame, 3, { damping: 13 })) * -6}deg`,
          transformOrigin: "30% 100%",
        }}
      >
        <Sticker color={C.white} radius={44} shadow={16} stroke={8} style={{ width: 900, height: 620, padding: "34px 44px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: C.ink }}>{T.chartTitle}</div>
            <div
              style={{
                border: `5px solid ${C.ink}`,
                borderRadius: 999,
                padding: "4px 18px",
                fontFamily: FONT.body,
                fontWeight: 700,
                fontSize: 28,
                color: C.ink,
                backgroundColor: C.foam,
              }}
            >
              {T.chartTag}
            </div>
          </div>
          <div style={{ position: "relative", width: 796, height: PLOT_H, marginTop: 70, borderBottom: `7px solid ${C.ink}` }}>
            {T.bars.map((b, i) => {
              const p = pop(frame, 8 + i * 3, { damping: 8, stiffness: 200 });
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 40 + i * (BAR_W + BAR_GAP),
                    bottom: 0,
                    width: BAR_W,
                    height: Math.max(0, b * PLOT_H * p * (1 + beat(frame) * 0.025)),
                    backgroundColor: BAR_COLORS[i],
                    border: `6px solid ${C.ink}`,
                    borderBottom: "none",
                    borderRadius: "18px 18px 0 0",
                    boxSizing: "border-box",
                  }}
                />
              );
            })}
            <svg width={796} height={PLOT_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <polyline
                points={tops.map((t) => `${t.x},${t.y}`).join(" ")}
                fill="none"
                stroke={C.ink}
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={length}
                strokeDashoffset={length * (1 - draw)}
                opacity={frame >= 26 ? 1 : 0}
              />
              <g transform={`translate(${tip.x} ${tip.y}) rotate(${angle}) scale(${pop(frame, 45)})`}>
                <path d="M-6 -24 L34 0 L-6 24 Z" fill={C.pink} stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
              </g>
            </svg>
            {T.months.map((m, i) => (
              <div
                key={m}
                style={{
                  position: "absolute",
                  left: 40 + i * (BAR_W + BAR_GAP),
                  top: PLOT_H + 16,
                  width: BAR_W,
                  textAlign: "center",
                  fontFamily: FONT.body,
                  fontWeight: 700,
                  fontSize: 30,
                  color: C.ink,
                }}
              >
                {m}
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                left: 30,
                top: 10,
                opacity: frame >= 5 * BEAT ? 1 : 0,
                scale: String(1.6 - 0.6 * pop(frame, 5 * BEAT, { damping: 9, stiffness: 200 })),
                rotate: "-7deg",
              }}
            >
              <Pill color={C.yellow} size={54} shadow={9}>
                {T.growth}
              </Pill>
            </div>
          </div>
        </Sticker>
      </div>

      {/* stats */}
      {T.stats.map((stat, i) => {
        const at = 2 * BEAT + i * BEAT;
        const p = pop(frame, at, { damping: 10, stiffness: 200 });
        const value = "text" in stat ? stat.text : Math.round(stat.value * tween(frame, at, at + 16)).toLocaleString("en-US");
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 1110,
              top: 312 + i * 222,
              opacity: frame >= at ? 1 : 0,
              scale: String((1.5 - 0.5 * p) * (1 + hit(frame, at + 16, 3) * 0.03)),
              rotate: `${STAT_ROT[i] + (1 - p) * (i % 2 ? -14 : 14)}deg`,
            }}
          >
            <Sticker
              color={STAT_COLORS[i]}
              radius={38}
              shadow={13}
              stroke={8}
              style={{
                width: 680,
                height: 190,
                padding: "0 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: i === 2 ? C.cream : C.ink,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 92,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </div>
              <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 36, lineHeight: 1.15, marginTop: 6 }}>{stat.label}</div>
            </Sticker>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1590, top: 120, scale: String(pop(frame, 20)), rotate: `${frame * 0.8}deg` }}>
        <Shape kind="spark" size={56} color={C.cream} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 968 }}>
        <Note color={C.ink} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
