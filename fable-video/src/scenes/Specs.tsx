import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import {
  BlurIn,
  CameraPush,
  clamp,
  MaskLine,
  SceneLabel,
  useEnter,
} from "../lib/motion";

const bigSerif: React.CSSProperties = {
  fontFamily: FONTS.serif,
  fontWeight: 600,
  fontSize: 150,
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
  color: COLORS.cream,
};

export const Capability: React.FC = () => {
  const frame = useCurrentFrame();
  const underline = interpolate(frame, [38, 62], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <CameraPush to={1.05}>
      <SceneLabel index="01" label="Capability" />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
        <MaskLine delay={4}>
          <div style={{ ...bigSerif, position: "relative", display: "inline-block" }}>
            The most capable
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: -4,
                height: 10,
                width: `${underline}%`,
                background: COLORS.clay,
                borderRadius: 6,
                boxShadow: `0 0 30px ${COLORS.clay}`,
              }}
            />
          </div>
        </MaskLine>
        <MaskLine delay={11}>
          <div style={{ ...bigSerif, fontStyle: "italic", fontWeight: 400, color: COLORS.muted }}>
            widely released
          </div>
        </MaskLine>
        <MaskLine delay={18}>
          <div style={{ ...bigSerif, color: COLORS.clay }}>Claude model.</div>
        </MaskLine>
      </AbsoluteFill>
    </CameraPush>
  );
};

export const ContextWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [12, 78], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const value = Math.round(progress * 1_000_000);
  const pop = useEnter(78, { damping: 9, stiffness: 160 });
  const popScale = frame >= 78 ? 1 + Math.sin(Math.min(pop, 1) * Math.PI) * 0.06 : 1;
  const glow = interpolate(frame, [76, 84, 110], [0, 1, 0.35], clamp);

  return (
    <CameraPush to={1.05}>
      <SceneLabel index="02" label="Context window" />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
      >
        <BlurIn delay={0} scale={0.85} blur={24}>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 230,
              letterSpacing: "-0.04em",
              fontVariantNumeric: "tabular-nums",
              color: COLORS.cream,
              transform: `scale(${popScale})`,
              textShadow: `0 0 ${60 * glow}px rgba(242,179,107,${0.8 * glow})`,
            }}
          >
            {value.toLocaleString("en-US")}
          </div>
        </BlurIn>
        <BlurIn delay={8}>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontStyle: "italic",
              fontSize: 76,
              color: COLORS.amber,
              marginTop: -10,
            }}
          >
            tokens of context
          </div>
        </BlurIn>
        <div
          style={{
            marginTop: 60,
            width: 1300,
            height: 14,
            borderRadius: 999,
            background: "rgba(243,238,227,0.08)",
            overflow: "visible",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${COLORS.clay}, ${COLORS.amber})`,
              boxShadow: `0 0 30px ${COLORS.clay}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${progress * 100}%`,
              top: "50%",
              width: 34,
              height: 34,
              marginLeft: -17,
              marginTop: -17,
              borderRadius: "50%",
              background: COLORS.cream,
              boxShadow: `0 0 40px ${COLORS.amber}`,
              opacity: progress > 0 ? 1 : 0,
            }}
          />
        </div>
        <div style={{ marginTop: 56 }}>
          <BlurIn delay={84}>
            <div style={{ fontFamily: FONTS.sans, fontSize: 52, color: COLORS.muted }}>
              Room for an entire codebase in one prompt.
            </div>
          </BlurIn>
        </div>
      </AbsoluteFill>
    </CameraPush>
  );
};

const STREAM_ROWS = new Array(16).fill(0).map((_, i) => ({
  width: 30 + random(`w${i}`) * 60,
  start: i * 4 + random(`st${i}`) * 3,
}));

export const MaxOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useEnter(4, { damping: 13, stiffness: 140 });
  const scale = interpolate(p, [0, 1], [2.4, 1]);
  const blur = Math.max(0, (1 - p) * 40);

  return (
    <AbsoluteFill>
      <SceneLabel index="03" label="Max output" />
      <AbsoluteFill
        style={{
          padding: "250px 160px",
          flexDirection: "column",
          gap: 26,
          opacity: 0.16,
        }}
      >
        {STREAM_ROWS.map((r, i) => {
          const w = interpolate(frame, [r.start, r.start + 22], [0, r.width], {
            ...clamp,
            easing: Easing.out(Easing.quad),
          });
          return (
            <div
              key={i}
              style={{
                height: 16,
                width: `${w}%`,
                borderRadius: 8,
                background: i % 3 === 0 ? COLORS.clay : COLORS.cream,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <CameraPush to={1.06}>
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          <div
            style={{
              fontFamily: FONTS.serif,
              fontWeight: 700,
              fontSize: 380,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: COLORS.cream,
              transform: `scale(${scale})`,
              filter: `blur(${blur}px)`,
              opacity: Math.min(1, p * 1.5),
              textShadow: `0 20px 80px rgba(217,119,87,0.45)`,
            }}
          >
            128K
          </div>
          <BlurIn delay={20}>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontWeight: 500,
                fontSize: 60,
                color: COLORS.muted,
                marginTop: 10,
              }}
            >
              output tokens in a{" "}
              <span style={{ color: COLORS.amber }}>single response</span>
            </div>
          </BlurIn>
        </AbsoluteFill>
      </CameraPush>
    </AbsoluteFill>
  );
};
