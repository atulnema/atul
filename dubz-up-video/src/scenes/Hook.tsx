import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Bubble } from "../components/Bubble";
import { Kinetic } from "../components/Kinetic";
import { Decor, DecorItem, Dots } from "../components/Shapes";
import { StickerText } from "../components/Sticker";
import { content } from "../content";
import { EASE, hit, pop, tween, wiggle } from "../lib/anim";
import { C, FONT, HEIGHT, WIDTH } from "../theme";

const T = content.hook;

// Where each "hello" sits around the headline: centre x, centre y, width, colours, tilt.
const SPOTS = [
  { x: 300, y: 200, w: 250, c: C.pink, fg: C.cream, r: -8, tail: "left" },
  { x: 770, y: 150, w: 320, c: C.blue, fg: C.cream, r: 4, tail: "right" },
  { x: 1250, y: 165, w: 290, c: C.yellow, fg: C.ink, r: -5, tail: "left" },
  { x: 1640, y: 290, w: 400, c: C.mint, fg: C.ink, r: 7, tail: "right" },
  { x: 1660, y: 600, w: 400, c: C.purple, fg: C.cream, r: -4, tail: "right" },
  { x: 1540, y: 850, w: 280, c: C.orange, fg: C.ink, r: 6, tail: "left" },
  { x: 1110, y: 905, w: 220, c: C.pink, fg: C.cream, r: -6, tail: "right" },
  { x: 690, y: 895, w: 240, c: C.blue, fg: C.cream, r: 5, tail: "left" },
  { x: 300, y: 820, w: 220, c: C.yellow, fg: C.ink, r: -7, tail: "left" },
  { x: 250, y: 530, w: 260, c: C.mint, fg: C.ink, r: 5, tail: "left" },
] as const;

const STARS: DecorItem[] = [
  { kind: "spark", x: 290, y: 250, size: 120, color: C.pink },
  { kind: "spark", x: 1660, y: 210, size: 84, color: C.cream },
  { kind: "donut", x: 1690, y: 850, size: 120, color: C.mint },
  { kind: "plus", x: 250, y: 850, size: 100, color: C.blue },
  { kind: "squiggle", x: 330, y: 560, size: 130, color: C.orange, rot: -14 },
  { kind: "dot", x: 1560, y: 660, size: 50, color: C.pink },
];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(tween(frame, 4, 38, 0, T.count, Easing.out(Easing.poly(5))));
  const plus = pop(frame, 38);
  const square = (t: number) => t * t;
  const irisLead = tween(frame, 47, 56, 0, 1, square);
  const iris = tween(frame, 50, 59, 0, 1, square);
  const slam = pop(frame, 68, { damping: 11, stiffness: 210 });

  return (
    <AbsoluteFill style={{ backgroundColor: frame >= 60 ? C.ink : C.cream }}>
      {frame < 60 ? (
        <>
          <Dots frame={frame} />
          {SPOTS.map((s, i) => {
            const p = pop(frame, 2 + i * 3);
            const dx = s.x - WIDTH / 2;
            const dy = s.y - HEIGHT / 2;
            const len = Math.hypot(dx, dy);
            const away = tween(frame, 46 + i * 0.4, 58, 0, 1, EASE.in) * 900;
            const h = 116;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: s.x - s.w / 2,
                  top: s.y - h / 2,
                  transformOrigin: s.tail === "left" ? "20% 100%" : "80% 100%",
                  translate: `${(dx / len) * away + wiggle(frame, i) * 8}px ${(dy / len) * away + wiggle(frame, i + 30) * 8}px`,
                  rotate: `${s.r + (1 - p) * 30 + wiggle(frame, i + 60, 0.09) * 2}deg`,
                  scale: String(p),
                }}
              >
                <Bubble w={s.w} h={h} color={s.c} fg={s.fg} tail={s.tail} size={56}>
                  {T.hellos[i]}
                </Bubble>
              </div>
            );
          })}
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Kinetic
              text={T.lead}
              frame={frame}
              delay={1}
              style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.02em" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                margin: "6px 0 18px",
                scale: String(pop(frame, 3) * (1 + hit(frame, 38, 3) * 0.1)),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <StickerText size={300} color={C.pink} stroke={18} shadow={14}>
                {count.toLocaleString("en-US")}
              </StickerText>
              <div style={{ scale: String(plus), rotate: `${(1 - plus) * -90}deg`, marginLeft: 8 }}>
                <StickerText size={300} color={C.yellow} stroke={18} shadow={14}>
                  +
                </StickerText>
              </div>
            </div>
            <Kinetic
              text={T.unit}
              frame={frame}
              delay={9}
              style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.02em" }}
            />
          </AbsoluteFill>
          {[
            { p: irisLead, c: C.pink },
            { p: iris, c: C.ink },
          ].map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: WIDTH / 2 - 1150 * l.p,
                top: HEIGHT / 2 - 1150 * l.p,
                width: 2300 * l.p,
                height: 2300 * l.p,
                borderRadius: "50%",
                backgroundColor: l.c,
              }}
            />
          ))}
        </>
      ) : (
        <>
          <Dots frame={frame} color={C.cream} opacity={0.06} />
          <div
            style={{
              position: "absolute",
              left: WIDTH / 2 - 520,
              top: 640 - 520,
              width: 1040,
              height: 1040,
              borderRadius: "50%",
              backgroundColor: C.deep,
              scale: String(pop(frame, 62, { damping: 14 })),
            }}
          />
          <Decor frame={frame} items={STARS} delay={70} drift={10} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Kinetic
              text={T.turn}
              frame={frame}
              delay={61}
              stagger={2}
              style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 112, color: C.cream, letterSpacing: "-0.02em" }}
            />
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 430,
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                color: C.yellow,
                opacity: frame >= 68 ? 1 : 0,
                scale: String(2.3 - 1.3 * slam),
                translate: `${Math.sin(frame * 2.6) * 14 * hit(frame, 68, 4)}px 0`,
                marginTop: -10,
              }}
            >
              {T.punch}
            </div>
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 1350,
              top: 420,
              transformOrigin: "20% 100%",
              scale: String(pop(frame, 78)),
              rotate: `${8 + Math.sin(frame * 0.12) * 4}deg`,
              translate: `0 ${Math.sin(frame * 0.1) * 8}px`,
            }}
          >
            <Bubble w={250} h={120} color={C.cream} size={60}>
              {T.lonely}
            </Bubble>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
