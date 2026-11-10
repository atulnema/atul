import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import {
  BlurIn,
  CameraPush,
  clamp,
  LightSweep,
  Shockwave,
  SplitChars,
} from "../lib/motion";

const TEASE = "Something new just went live.";

export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = Math.floor(interpolate(frame, [8, 54], [0, TEASE.length], clamp));
  const cursorOn = Math.floor(frame / 8) % 2 === 0 || frame < 54;
  const flashW = interpolate(frame, [62, 84], [0, 1700], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  return (
    <CameraPush to={1.1}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 68,
            color: COLORS.cream,
            letterSpacing: "-0.01em",
          }}
        >
          <span style={{ color: COLORS.clay }}>{"> "}</span>
          {TEASE.slice(0, shown)}
          <span
            style={{
              display: "inline-block",
              width: 34,
              height: 70,
              marginLeft: 6,
              transform: "translateY(12px)",
              background: COLORS.clay,
              opacity: cursorOn ? 1 : 0,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            marginTop: 90,
            width: flashW,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${COLORS.amber}, transparent)`,
            boxShadow: `0 0 40px ${COLORS.amber}`,
          }}
        />
      </AbsoluteFill>
    </CameraPush>
  );
};

const BURST = new Array(70).fill(0).map((_, i) => ({
  angle: random(`a${i}`) * Math.PI * 2,
  dist: 250 + random(`d${i}`) * 750,
  size: 3 + random(`s${i}`) * 7,
  amber: random(`c${i}`) > 0.5,
}));

const PulseDot: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = (frame % 36) / 36;
  return (
    <span style={{ position: "relative", width: 22, height: 22, display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#7BD88F",
          transform: `scale(${1 + cycle * 1.8})`,
          opacity: 0.6 * (1 - cycle),
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#7BD88F",
          boxShadow: "0 0 20px #7BD88F",
        }}
      />
    </span>
  );
};

export const LivePill: React.FC<{ delay: number }> = ({ delay }) => (
  <BlurIn delay={delay} y={30} scale={0.7}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "18px 40px",
        borderRadius: 999,
        border: `2px solid ${COLORS.line}`,
        background: "rgba(243,238,227,0.05)",
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: 44,
        color: COLORS.cream,
        letterSpacing: "0.02em",
      }}
    >
      <PulseDot />
      Now live
    </div>
  </BlurIn>
);

export const TitleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame < 14 ? (14 - frame) * 1.4 : 0;
  const sx = (random(`sx${frame}`) - 0.5) * shake;
  const sy = (random(`sy${frame}`) - 0.5) * shake;
  const burstT = interpolate(frame, [0, 55], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.exp),
  });
  const flash = interpolate(frame, [0, 10], [0.55, 0], clamp);

  const titleStyle: React.CSSProperties = {
    fontFamily: FONTS.serif,
    fontWeight: 600,
    fontSize: 300,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    color: COLORS.cream,
  };

  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <AbsoluteFill style={{ background: COLORS.amber, opacity: flash }} />
      <Shockwave at={0} />
      <Shockwave at={6} color={COLORS.amber} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {BURST.map((p, i) => {
          const d = p.dist * burstT;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.amber ? COLORS.amber : COLORS.clay,
                transform: `translate(${Math.cos(p.angle) * d}px, ${Math.sin(p.angle) * d}px)`,
                opacity: interpolate(frame, [20, 75], [1, 0], clamp),
                boxShadow: `0 0 12px ${p.amber ? COLORS.amber : COLORS.clay}`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <CameraPush to={1.07}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <BlurIn delay={4} y={-40} blur={12}>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: 600,
                fontSize: 52,
                letterSpacing: "0.6em",
                marginRight: "-0.6em",
                color: COLORS.muted,
              }}
            >
              CLAUDE
            </div>
          </BlurIn>
          <div style={{ position: "relative" }}>
            <SplitChars text="Fable 5.2" delay={10} stagger={3} style={titleStyle} />
            <LightSweep start={62} style={titleStyle}>
              Fable 5.2
            </LightSweep>
          </div>
          <div style={{ marginTop: 20 }}>
            <LivePill delay={52} />
          </div>
        </AbsoluteFill>
      </CameraPush>
    </AbsoluteFill>
  );
};
