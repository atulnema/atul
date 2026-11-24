import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, MONTSERRAT, clamp, easeOut, glass } from "../theme";
import { Bulb } from "../Icons";

// 0:27 - 0:33 (local 0-180). Spotlight dim + vertigo (both in Main/Plate),
// frosted card with a pulsing bulb, wide-tracked "THE REAL QUESTION".
const CARD = 24;
const TITLE = "THE REAL QUESTION";

export const S6Question: React.FC = () => {
  const f = useCurrentFrame();
  const card = interpolate(f, [CARD, CARD + 18], [0, 1], { ...clamp, easing: easeOut });
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  const out = interpolate(f, [168, 180], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          ...glass,
          background: "rgba(10,14,20,0.45)",
          position: "absolute",
          left: 660,
          top: 1010,
          width: 300,
          padding: "34px 0 30px",
          borderRadius: 36,
          textAlign: "center",
          opacity: card,
          translate: `${(1 - card) * 260}px ${Math.sin(f / 16) * 6}px`,
          rotate: `${(1 - card) * 8}deg`,
        }}
      >
        <Bulb size={130} pulse={pulse} />
        <div style={{ fontFamily: MONTSERRAT, fontWeight: 800, fontSize: 26, letterSpacing: "0.2em", color: "rgba(255,255,255,0.8)", marginTop: 14 }}>
          THINK
        </div>
      </div>

      <AbsoluteFill style={{ top: 1300, height: "auto", alignItems: "center" }}>
        <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 56, color: C.white, letterSpacing: interpolate(f, [8, 60], [0.06, 0.2], { ...clamp, easing: easeOut }) + "em", textShadow: "0 0 30px rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
          {TITLE.split("").map((ch, i) => (
            <span key={i} style={{ opacity: interpolate(f, [8 + i * 1.5, 14 + i * 1.5], [0, 1], clamp) }}>
              {ch}
            </span>
          ))}
        </div>
        <div style={{ width: interpolate(f, [30, 60], [0, 520], { ...clamp, easing: easeOut }), height: 2, background: "rgba(255,255,255,0.6)", marginTop: 22 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
