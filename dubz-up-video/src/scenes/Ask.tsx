import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { Logo } from "../components/Logo";
import { Confetti, Decor, DecorItem, Dots } from "../components/Shapes";
import { Pill, Sticker, StickerText } from "../components/Sticker";
import { content } from "../content";
import { EASE, hit, pop, tween } from "../lib/anim";
import { BEAT, C, FONT, HEIGHT, WIDTH } from "../theme";

const T = content.ask;

const DECOR: DecorItem[] = [
  { kind: "star", x: 200, y: 200, size: 120, color: C.yellow, rot: -10 },
  { kind: "squiggle", x: 1720, y: 210, size: 150, color: C.cream, rot: 12 },
  { kind: "donut", x: 1740, y: 880, size: 100, color: C.mint },
  { kind: "plus", x: 190, y: 880, size: 84, color: C.blue },
  { kind: "spark", x: 230, y: 540, size: 60, color: C.cream },
  { kind: "tri", x: 1710, y: 550, size: 64, color: C.orange, rot: 18 },
];

export const Ask: React.FC = () => {
  const frame = useCurrentFrame();
  const slam = pop(frame, BEAT, { damping: 10, stiffness: 210 });
  const away = tween(frame, 37, 45, 0, 1, EASE.in);
  const card = pop(frame, 45, { damping: 10, stiffness: 170 });
  const land = 4 * BEAT;

  return (
    <AbsoluteFill style={{ backgroundColor: C.pink }}>
      <Dots frame={frame} color={C.cream} opacity={0.14} />
      <Decor frame={frame} items={DECOR} delay={4} />

      {frame < 45 ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            scale: String(1 - away),
            rotate: `${away * -10}deg`,
          }}
        >
          <Kinetic
            text={T.lines[0]}
            frame={frame}
            delay={1}
            stagger={3}
            style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 200, letterSpacing: "-0.03em", color: C.cream }}
          />
          <div
            style={{
              marginTop: 24,
              opacity: frame >= BEAT ? 1 : 0,
              scale: String(1.9 - 0.9 * slam),
              rotate: `${-3 + (1 - slam) * 10}deg`,
              translate: `${Math.sin(frame * 2.7) * 12 * hit(frame, BEAT, 4)}px 0`,
            }}
          >
            <StickerText size={236} color={C.yellow} stroke={18} shadow={14}>
              {T.lines[1]}
            </StickerText>
          </div>
        </AbsoluteFill>
      ) : (
        <>
          <Confetti
            frame={frame}
            at={land}
            x={WIDTH / 2}
            y={HEIGHT / 2 - 90}
            count={60}
            power={1.3}
            colors={[C.yellow, C.cream, C.blue, C.mint, C.orange, C.purple]}
          />
          <Kinetic
            text={T.lines.join(" ")}
            frame={frame}
            delay={62}
            stagger={2}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 128,
              justifyContent: "center",
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 64,
              color: C.cream,
            }}
          />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: "0 -36px" }}>
            <div
              style={{
                scale: String(card * (1 + hit(frame, land, 4) * 0.05)),
                rotate: `${-2 + (1 - card) * -14}deg`,
              }}
            >
              <Sticker
                color={C.cream}
                radius={70}
                shadow={20}
                stroke={9}
                style={{ padding: "74px 84px 80px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Logo size={210} frame={frame} delay={47} />
              </Sticker>
            </div>
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 790,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
            }}
          >
            <div style={{ scale: String(pop(frame, 70)), rotate: "-2deg" }}>
              <Pill color={C.ink} fg={C.cream} size={62} shadow={0} padX={46} padY={26}>
                {T.round}
              </Pill>
            </div>
            <div style={{ scale: String(pop(frame, 76)), rotate: `${3 + Math.sin(frame * 0.18) * 2}deg` }}>
              <Pill color={C.yellow} size={62} shadow={11} padX={42} padY={26}>
                {T.cta}
                <svg width="58" height="44" viewBox="0 0 58 44" style={{ translate: `${Math.sin(frame * 0.3) * 5}px 0` }}>
                  <path d="M4 22 H48 M32 6 L50 22 L32 38" fill="none" stroke={C.ink} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Pill>
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
