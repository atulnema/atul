import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, MONTSERRAT, captionText, clamp, easeOut } from "../theme";
import { CaptionBlock } from "../Common";

// 0:33 - 0:38 (local 0-150).
// GiantText is passed into the Plate as its midground, so it sits between the
// set and the presenter - the 2.5D "text behind the shoulders" effect.
const LINES = ["MAKE", "THEM", "FEEL", "SMART"];

export const GiantText: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ top: 250, alignItems: "center", perspective: 1400 }}>
      {LINES.map((l, i) => {
        const t0 = 6 + i * 7;
        const p = interpolate(f, [t0, t0 + 16], [0, 1], { ...clamp, easing: easeOut });
        const drift = (f - t0) * (i % 2 ? -0.9 : 0.9);
        const isSmart = l === "SMART";
        return (
          <div
            key={l}
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 270,
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              color: isSmart ? "rgba(245,196,81,0.32)" : "rgba(255,255,255,0.14)",
              WebkitTextStroke: isSmart ? `3px rgba(245,196,81,0.7)` : "2px rgba(255,255,255,0.35)",
              opacity: p,
              translate: `${(1 - p) * (i % 2 ? 300 : -300) + drift}px 0px`,
              transform: `rotateY(${(1 - p) * (i % 2 ? -40 : 40)}deg)`,
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CAP = [
  { w: "CUSTOMER", at: 14 },
  { w: "KO", at: 24 },
  { w: "SMART", at: 34 },
  { w: "KAISE", at: 50 },
  { w: "FEEL", at: 58 },
  { w: "KARAU?", at: 66 },
];

export const S7Smart: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [120, 132], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <CaptionBlock y={1180}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 26, rowGap: 8, maxWidth: 920, alignItems: "center" }}>
          {CAP.map(({ w, at }) => {
            const s = interpolate(f, [at, at + 4, at + 8], [0, 1.2, 1], clamp);
            const smart = w === "SMART";
            const sweep = interpolate(f, [at + 6, at + 26], [-60, 160], clamp);
            return (
              <div
                key={w}
                style={{
                  ...captionText,
                  fontSize: 92,
                  margin: smart ? "0 64px" : 0,
                  scale: String(s * (smart ? interpolate(f, [at + 6, at + 12], [1, 1.35], { ...clamp, easing: easeOut }) : 1)),
                  ...(smart
                    ? {
                        backgroundImage: `linear-gradient(100deg, ${C.gold} 0%, ${C.gold} ${sweep - 25}%, #fffbe8 ${sweep}%, ${C.gold} ${sweep + 25}%, #c99522 100%)`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "none",
                        filter: "drop-shadow(0 0 24px rgba(245,196,81,0.65))",
                      }
                    : {}),
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
      </CaptionBlock>
    </AbsoluteFill>
  );
};
