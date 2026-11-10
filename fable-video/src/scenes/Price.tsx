import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { BlurIn, CameraPush, clamp, SceneLabel, useEnter } from "../lib/motion";

const PriceCard: React.FC<{
  label: string;
  oldPrice: string;
  newPrice: string;
  delay: number;
}> = ({ label, oldPrice, newPrice, delay }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(delay, { damping: 200, stiffness: 90 });
  const strike = interpolate(frame, [delay + 26, delay + 40], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const oldShift = interpolate(frame, [delay + 40, delay + 55], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const drop = useEnter(delay + 44, { damping: 10, stiffness: 150 });

  return (
    <div
      style={{
        width: 680,
        padding: "56px 64px",
        borderRadius: 36,
        border: `2px solid ${COLORS.line}`,
        background: "linear-gradient(160deg, rgba(243,238,227,0.07), rgba(243,238,227,0.015))",
        transform: `translateY(${(1 - enter) * 160}px) rotateX(${(1 - enter) * 30}deg)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 32,
          letterSpacing: "0.14em",
          color: COLORS.muted,
        }}
      >
        {label}
      </div>
      <div style={{ position: "relative", height: 240, marginTop: 20 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontFamily: FONTS.serif,
            fontWeight: 600,
            fontSize: 190,
            lineHeight: 1,
            color: COLORS.muted,
            transform: `translate(${oldShift * 440}px, ${oldShift * 14}px) scale(${1 - oldShift * 0.55})`,
            transformOrigin: "left top",
            opacity: 1 - oldShift * 0.45,
          }}
        >
          {oldPrice}
          <div
            style={{
              position: "absolute",
              left: -10,
              top: "52%",
              height: 10,
              width: `calc(${strike}% + 20px)`,
              background: COLORS.clay,
              borderRadius: 5,
              transform: "rotate(-8deg)",
              opacity: strike > 0 ? 1 : 0,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontFamily: FONTS.serif,
            fontWeight: 700,
            fontSize: 196,
            lineHeight: 1,
            color: COLORS.cream,
            transform: `translateY(${(1 - drop) * -140}px) scale(${0.6 + drop * 0.4})`,
            transformOrigin: "left top",
            opacity: Math.min(1, drop * 2),
            textShadow: `0 0 60px rgba(242,179,107,0.5)`,
          }}
        >
          {newPrice}
        </div>
      </div>
      <div style={{ fontFamily: FONTS.sans, fontSize: 40, color: COLORS.muted }}>
        per million tokens
      </div>
    </div>
  );
};

export const Price: React.FC = () => {
  return (
    <CameraPush to={1.04}>
      <SceneLabel index="04" label="Pricing" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          perspective: 1400,
        }}
      >
        <div style={{ display: "flex", gap: 80, marginTop: 40 }}>
          <PriceCard label="INPUT" oldPrice="$10" newPrice="$8" delay={4} />
          <PriceCard label="OUTPUT" oldPrice="$50" newPrice="$40" delay={12} />
        </div>
        <div style={{ marginTop: 64 }}>
          <BlurIn delay={82} scale={0.6} y={20}>
            <div
              style={{
                padding: "20px 48px",
                borderRadius: 999,
                background: COLORS.clay,
                color: COLORS.ink,
                fontFamily: FONTS.sans,
                fontWeight: 700,
                fontSize: 52,
                boxShadow: `0 0 60px rgba(217,119,87,0.55)`,
              }}
            >
              20% lower than Claude Fable 5.1
            </div>
          </BlurIn>
        </div>
      </AbsoluteFill>
    </CameraPush>
  );
};
