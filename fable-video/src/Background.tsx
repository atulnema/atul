import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { COLORS } from "./lib/theme";

const DUST = new Array(46).fill(0).map((_, i) => ({
  x: random(`dx${i}`) * 100,
  y: random(`dy${i}`) * 100,
  r: 1.5 + random(`dr${i}`) * 3,
  speed: 0.04 + random(`ds${i}`) * 0.12,
  phase: random(`dp${i}`) * Math.PI * 2,
}));

/** Persistent living backdrop shared by every scene. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const b1x = 28 + Math.sin(t * 0.4) * 12;
  const b1y = 32 + Math.cos(t * 0.3) * 10;
  const b2x = 74 + Math.cos(t * 0.35) * 10;
  const b2y = 70 + Math.sin(t * 0.5) * 8;
  const mask = "radial-gradient(ellipse at center, black 25%, transparent 75%)";

  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${b1x}% ${b1y}%, rgba(217,119,87,0.24), transparent 42%),
                       radial-gradient(circle at ${b2x}% ${b2y}%, rgba(242,179,107,0.13), transparent 48%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(243,238,227,0.09) 1.6px, transparent 1.6px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `${-frame * 0.35}px ${-frame * 0.18}px`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      {DUST.map((d, i) => {
        const y = (d.y - frame * d.speed + 200) % 110 - 5;
        const x = d.x + Math.sin(t * 0.6 + d.phase) * 1.2;
        const twinkle = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.5 + d.phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: d.r,
              height: d.r,
              borderRadius: "50%",
              background: COLORS.amber,
              opacity: twinkle,
              boxShadow: `0 0 ${d.r * 4}px ${COLORS.amber}`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={2}
              seed={frame % 12}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
