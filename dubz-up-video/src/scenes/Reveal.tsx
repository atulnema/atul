import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Logo } from "../components/Logo";
import { Confetti, Decor, DecorItem } from "../components/Shapes";
import { Pill } from "../components/Sticker";
import { content } from "../content";
import { beat, glide, pop, tween } from "../lib/anim";
import { BEAT, C, HEIGHT, WIDTH } from "../theme";

const T = content.reveal;

const DECOR: DecorItem[] = [
  { kind: "star", x: 190, y: 190, size: 120, color: C.pink, rot: -12 },
  { kind: "squiggle", x: 1730, y: 200, size: 150, color: C.blue, rot: 14 },
  { kind: "donut", x: 1760, y: 620, size: 96, color: C.mint },
  { kind: "plus", x: 170, y: 640, size: 84, color: C.purple },
  { kind: "spark", x: 760, y: 120, size: 64, color: C.cream },
  { kind: "tri", x: 1400, y: 150, size: 70, color: C.orange, rot: 20 },
];

const CHIPS = [
  { color: C.pink, fg: C.cream, rot: -3 },
  { color: C.blue, fg: C.cream, rot: 2 },
  { color: C.mint, fg: C.ink, rot: -2 },
];

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = glide(frame, 50, 16);
  return (
    <AbsoluteFill style={{ backgroundColor: C.yellow }}>
      <div
        style={{
          position: "absolute",
          left: WIDTH / 2 - 1400,
          top: HEIGHT / 2 - 1400,
          width: 2800,
          height: 2800,
          borderRadius: "50%",
          background: "repeating-conic-gradient(#FFB91F 0deg 9deg, transparent 9deg 18deg)",
          rotate: `${frame * 0.35}deg`,
          scale: String(tween(frame, 0, 14, 0, 1)),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: WIDTH / 2 - 430,
          top: HEIGHT / 2 - 430 - lift * 110,
          width: 860,
          height: 860,
          borderRadius: "50%",
          backgroundColor: C.cream,
          opacity: 0.55,
          scale: String(pop(frame, 2, { damping: 12 }) * (1 + beat(frame) * 0.03)),
        }}
      />
      <Decor frame={frame} items={DECOR} delay={6} />
      <Confetti frame={frame} at={3} x={WIDTH / 2} y={HEIGHT / 2 - 40} count={54} power={1.15} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          translate: `0 ${-lift * 130}px`,
        }}
      >
        <div style={{ position: "relative", scale: String(1 + beat(frame) * 0.025) }}>
          <div
            style={{
              position: "absolute",
              left: 20,
              top: -96,
              scale: String(pop(frame, 2)),
              rotate: "-9deg",
              transformOrigin: "0% 100%",
            }}
          >
            <Pill color={C.cream} size={52} shadow={8}>
              {T.meet}
            </Pill>
          </div>
          <Logo size={250} frame={frame} delay={4} />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 720,
          display: "flex",
          justifyContent: "center",
          gap: 34,
        }}
      >
        {T.chips.map((chip, i) => {
          const at = 4 * BEAT + i * BEAT;
          const p = pop(frame, at, { damping: 9, stiffness: 200 });
          return (
            <div
              key={i}
              style={{
                opacity: frame >= at ? 1 : 0,
                scale: String(1.6 - 0.6 * p),
                rotate: `${CHIPS[i].rot + (1 - p) * (i % 2 ? -16 : 16)}deg`,
                translate: `0 ${Math.sin(frame * 0.16 + i * 1.7) * 6}px`,
              }}
            >
              <Pill color={CHIPS[i].color} fg={CHIPS[i].fg} size={66} shadow={11} padX={44} padY={24}>
                {chip}
              </Pill>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
