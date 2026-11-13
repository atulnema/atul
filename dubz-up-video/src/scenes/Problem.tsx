import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { Decor, DecorItem, Dots } from "../components/Shapes";
import { Sticker } from "../components/Sticker";
import { content } from "../content";
import { hit, pop, tween } from "../lib/anim";
import { BEAT, C, FONT } from "../theme";

const T = content.problem;

const DECOR: DecorItem[] = [
  { kind: "squiggle", x: 170, y: 150, size: 130, color: C.yellow, rot: -10 },
  { kind: "spark", x: 1760, y: 170, size: 90, color: C.pink },
  { kind: "donut", x: 1790, y: 960, size: 90, color: C.mint },
  { kind: "plus", x: 120, y: 960, size: 70, color: C.orange },
];

const Clock: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width="210" height="210" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
    <circle cx="108" cy="108" r="84" fill={C.ink} />
    <circle cx="100" cy="100" r="84" fill={C.cream} stroke={C.ink} strokeWidth="8" />
    {[0, 90, 180, 270].map((a) => (
      <rect key={a} x="96" y="26" width="8" height="18" rx="4" fill={C.ink} transform={`rotate(${a} 100 100)`} />
    ))}
    <rect x="94" y="52" width="12" height="54" rx="6" fill={C.ink} transform={`rotate(${frame * 2.2} 100 100)`} />
    <rect x="96" y="36" width="8" height="70" rx="4" fill={C.pink} transform={`rotate(${frame * 26} 100 100)`} />
    <circle cx="100" cy="100" r="10" fill={C.ink} />
  </svg>
);

const Coins: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width="230" height="210" viewBox="0 0 220 200" style={{ overflow: "visible" }}>
    {[0, 1, 2, 3].map((i) => {
      const p = pop(frame, 4 + i * 4);
      return (
        <g key={i} transform={`translate(0 ${-i * 30 - (1 - p) * 160})`} opacity={p > 0 ? 1 : 0}>
          <ellipse cx="88" cy="168" rx="70" ry="24" fill={C.ink} />
          <rect x="18" y="146" width="140" height="22" fill={C.orange} stroke={C.ink} strokeWidth="7" />
          <ellipse cx="88" cy="146" rx="70" ry="24" fill={C.yellow} stroke={C.ink} strokeWidth="7" />
        </g>
      );
    })}
    {[0, 1, 2].map((i) => {
      const t = (frame + i * 14) % 42;
      return (
        <text
          key={i}
          x={166 + i * 16 + Math.sin(t * 0.3 + i) * 8}
          y={120 - t * 3}
          fontFamily={FONT.display}
          fontWeight="800"
          fontSize={46}
          fill={C.ink}
          opacity={t < 4 ? t / 4 : Math.max(0, 1 - (t - 26) / 14)}
        >
          $
        </text>
      );
    })}
  </svg>
);

const Robot: React.FC<{ frame: number }> = ({ frame }) => {
  const step = Math.floor(frame / 3);
  const pts = new Array(9)
    .fill(0)
    .map((_, i) => `${62 + i * 9.5},${(i + step) % 2 ? 132 : 146}`)
    .join(" ");
  return (
    <svg width="210" height="210" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <rect x="92" y="14" width="8" height="30" fill={C.ink} />
      <circle cx="96" cy="14" r="11" fill={C.yellow} stroke={C.ink} strokeWidth="7" opacity={step % 4 < 2 ? 1 : 0.35} />
      <rect x="34" y="48" width="140" height="130" rx="26" fill={C.ink} />
      <rect x="26" y="40" width="140" height="130" rx="26" fill={C.cream} stroke={C.ink} strokeWidth="8" />
      <rect x="54" y="76" width="26" height="26" rx="5" fill={C.ink} />
      <rect x="112" y="76" width="26" height="26" rx="5" fill={C.ink} />
      <polyline points={pts} fill="none" stroke={C.pink} strokeWidth="7" strokeLinejoin="miter" />
    </svg>
  );
};

const CARDS = [
  { color: C.yellow, rot: -4, Icon: Clock },
  { color: C.mint, rot: 2.5, Icon: Coins },
  { color: C.pink, rot: -3, Icon: Robot },
];

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const crack = pop(frame, 20, { damping: 7, stiffness: 220 });
  return (
    <AbsoluteFill style={{ backgroundColor: C.blue }}>
      <Dots frame={frame} color={C.cream} opacity={0.1} />
      <Decor frame={frame} items={DECOR} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 96,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 44,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 164,
          letterSpacing: "-0.03em",
          color: C.cream,
        }}
      >
        <Kinetic text={`${T.title[0]} ${T.title[1]}`} frame={frame} delay={1} stagger={3} />
        <div
          style={{
            transformOrigin: "0% 100%",
            rotate: `${crack * 7}deg`,
            translate: `${Math.sin(frame * 2.8) * 10 * hit(frame, 20, 4)}px ${crack * 16}px`,
            color: C.yellow,
          }}
        >
          <Kinetic text={T.title[2]} frame={frame} delay={8} />
        </div>
      </div>
      {CARDS.map((card, i) => {
        const at = 2 * BEAT + i * BEAT;
        const p = pop(frame, at, { damping: 11, stiffness: 200 });
        const fall = tween(frame, 92 + i * 3, 110 + i * 3, 0, 1, (t) => t * t);
        const { Icon } = card;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 140 + i * 560,
              top: 372,
              opacity: frame >= at ? 1 : 0,
              scale: String(1.7 - 0.7 * p),
              rotate: `${card.rot + (1 - p) * (i % 2 ? 24 : -24) + fall * (i === 1 ? -30 : 26 * (i ? 1 : -1))}deg`,
              translate: `0 ${fall * 1100 + Math.sin(frame * 0.14 + i * 2) * 6}px`,
            }}
          >
            <Sticker
              color={card.color}
              radius={44}
              shadow={16}
              stroke={8}
              style={{
                width: 520,
                height: 540,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "30px 24px 36px",
              }}
            >
              <Icon frame={Math.max(0, frame - at)} />
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 88,
                  letterSpacing: "-0.03em",
                  color: C.ink,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  marginTop: 16,
                }}
              >
                {T.cards[i].title}
              </div>
              <div
                style={{
                  fontFamily: FONT.body,
                  fontWeight: 700,
                  fontSize: 44,
                  lineHeight: 1.12,
                  color: C.ink,
                  textAlign: "center",
                  textWrap: "balance",
                  marginTop: 10,
                }}
              >
                {T.cards[i].sub}
              </div>
            </Sticker>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
