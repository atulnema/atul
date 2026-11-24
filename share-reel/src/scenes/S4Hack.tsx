import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, MONTSERRAT, captionText, clamp, easeOut } from "../theme";
import { CaptionBlock } from "../Common";

// 0:15 - 0:21 (local 0-180). Micro-zoom beat cuts (camera lives in Main),
// holographic badge and bouncy "PLAYFULLY INSULT THEM".
const BADGE = 20;
const WORDS = [
  { t: "PLAYFULLY", c: C.yellow, at: 96 },
  { t: "INSULT", c: C.white, at: 106 },
  { t: "THEM", c: C.yellow, at: 114 },
];

export const S4Hack: React.FC = () => {
  const f = useCurrentFrame();
  const bs = interpolate(f, [BADGE, BADGE + 4, BADGE + 8], [1.5, 0.94, 1], clamp);
  const bo = interpolate(f, [BADGE, BADGE + 2], [0, 1], clamp);
  const lock = interpolate(f, [BADGE + 3, BADGE + 8], [40, 0], { ...clamp, easing: easeOut });
  const sheen = interpolate(f, [BADGE + 6, BADGE + 30], [-120, 220], clamp);
  const out = interpolate(f, [160, 172], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ top: 230, height: "auto", alignItems: "center", opacity: bo, scale: String(bs) }}>
        <div style={{ position: "relative", padding: "26px 56px" }}>
          {/* click-lock brackets */}
          {[-1, 1].map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                [side < 0 ? "left" : "right"]: -lock,
                width: 34,
                border: `5px solid ${C.amber}`,
                [side < 0 ? "borderRight" : "borderLeft"]: "none",
                borderRadius: side < 0 ? "18px 0 0 18px" : "0 18px 18px 0",
                boxShadow: `0 0 24px ${C.amber}`,
              }}
            />
          ))}
          <div
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 76,
              letterSpacing: "0.04em",
              backgroundImage: `linear-gradient(100deg, ${C.amber} 0%, #ffe2a8 ${sheen - 20}%, #ffffff ${sheen}%, #ffe2a8 ${sheen + 20}%, ${C.amber} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 0 18px rgba(255,179,71,0.75))`,
            }}
          >
            THE BIGGEST HACK
          </div>
          {/* holographic scanlines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(0deg, rgba(255,179,71,0.12) 0 2px, transparent 2px 6px)",
              borderRadius: 18,
            }}
          />
        </div>
      </AbsoluteFill>

      <CaptionBlock y={1200}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 28, maxWidth: 920 }}>
        {WORDS.map((w, i) => {
          const s = interpolate(f, [w.at, w.at + 4, w.at + 8, w.at + 12], [0, 1.3, 0.92, 1], clamp);
          const y = interpolate(f, [w.at, w.at + 6], [60, 0], { ...clamp, easing: easeOut });
          return (
            <div
              key={i}
              style={{
                ...captionText,
                fontSize: i === 0 ? 124 : 108,
                width: i === 0 ? "100%" : undefined,
                color: w.c,
                scale: String(s),
                translate: `0px ${y}px`,
                rotate: `${(i - 1) * -2}deg`,
              }}
            >
              {w.t}
            </div>
          );
        })}
        </div>
      </CaptionBlock>
    </AbsoluteFill>
  );
};
