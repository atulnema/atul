import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import {
  BlurIn,
  CameraPush,
  clamp,
  LightSweep,
  MaskLine,
  SceneLabel,
  Shockwave,
  SplitChars,
  useEnter,
} from "../lib/motion";
import { LivePill } from "./Intro";

const STEPS = ["Plan", "Explore", "Build", "Test", "Fix", "Ship"];
const SPAN = 1500;

const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={44} height={44} viewBox="0 0 44 44">
    <path
      d="M11 23 L19 31 L34 14"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={40}
      strokeDashoffset={40 * (1 - progress)}
    />
  </svg>
);

export const Agentic: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [30, 120], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const step = SPAN / (STEPS.length - 1);

  return (
    <CameraPush to={1.05}>
      <SceneLabel index="06" label="Agentic" />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
      >
        <MaskLine delay={4}>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontWeight: 600,
              fontSize: 140,
              letterSpacing: "-0.03em",
              color: COLORS.cream,
            }}
          >
            Built for the{" "}
            <span style={{ fontStyle: "italic", color: COLORS.clay }}>long haul.</span>
          </div>
        </MaskLine>
        <div style={{ position: "relative", width: SPAN, height: 200, marginTop: 110 }}>
          <div
            style={{
              position: "absolute",
              top: 38,
              left: 0,
              width: SPAN,
              height: 4,
              background: "rgba(243,238,227,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 0,
              width: SPAN * line,
              height: 8,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${COLORS.clay}, ${COLORS.amber})`,
              boxShadow: `0 0 30px ${COLORS.amber}`,
            }}
          />
          {STEPS.map((s, i) => {
            const at = i / (STEPS.length - 1);
            const done = interpolate(line, [at - 0.02, at + 0.06], [0, 1], clamp);
            const appear = interpolate(frame, [12 + i * 3, 24 + i * 3], [0, 1], clamp);
            return (
              <div
                key={s}
                style={{
                  position: "absolute",
                  left: i * step - 40,
                  top: 0,
                  width: 80,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 30}px)`,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: `3px solid ${done > 0 ? COLORS.amber : "rgba(243,238,227,0.3)"}`,
                    background: done > 0 ? COLORS.amber : COLORS.ink,
                    transform: `scale(${1 + Math.sin(done * Math.PI) * 0.3})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: done > 0 ? `0 0 40px ${COLORS.amber}` : "none",
                  }}
                >
                  <Check progress={done} />
                </div>
                <div
                  style={{
                    marginTop: 26,
                    fontFamily: FONTS.sans,
                    fontWeight: 600,
                    fontSize: 44,
                    whiteSpace: "nowrap",
                    color: done > 0.5 ? COLORS.cream : COLORS.muted,
                  }}
                >
                  {s}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 50 }}>
          <BlurIn delay={110}>
            <div style={{ fontFamily: FONTS.sans, fontSize: 52, color: COLORS.muted }}>
              Hard, multi-step work. Carried start to finish.
            </div>
          </BlurIn>
        </div>
      </AbsoluteFill>
    </CameraPush>
  );
};

const CODE_KEY = "model";
const CODE_VAL = '"claude-fable-5-2"';
const CODE_LEN = CODE_KEY.length + 2 + CODE_VAL.length;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = Math.floor(interpolate(frame, [6, 44], [0, CODE_LEN], clamp));
  const keyPart = CODE_KEY.slice(0, typed);
  const colon = typed > CODE_KEY.length ? ": " : "";
  const valPart = CODE_VAL.slice(0, Math.max(0, typed - CODE_KEY.length - 2));
  const lift = useEnter(58, { damping: 200, stiffness: 80 });
  const fadeOut = interpolate(frame, [168, 195], [0, 1], clamp);
  const cardIn = useEnter(0, { damping: 200 });

  const titleStyle: React.CSSProperties = {
    fontFamily: FONTS.serif,
    fontWeight: 600,
    fontSize: 210,
    lineHeight: 1,
    letterSpacing: "-0.035em",
    color: COLORS.cream,
  };

  return (
    <AbsoluteFill>
      <Shockwave at={62} />
      <CameraPush to={1.06}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              transform: `translateY(${lift * -290}px) scale(${1 - lift * 0.42})`,
              opacity: cardIn,
              padding: "36px 60px",
              borderRadius: 28,
              border: `2px solid ${COLORS.line}`,
              background: "rgba(243,238,227,0.05)",
              fontFamily: FONTS.mono,
              fontSize: 72,
              color: COLORS.cream,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: COLORS.muted }}>{keyPart}</span>
            <span style={{ color: COLORS.muted }}>{colon}</span>
            <span style={{ color: COLORS.amber }}>{valPart}</span>
            <span
              style={{
                display: "inline-block",
                width: 30,
                height: 70,
                marginLeft: 6,
                transform: "translateY(12px)",
                background: COLORS.clay,
                opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
              }}
            />
          </div>
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            paddingTop: 140,
          }}
        >
          <div style={{ position: "relative" }}>
            <SplitChars text="Claude Fable 5.2" delay={62} stagger={2} y={90} style={titleStyle} />
            <LightSweep start={112} duration={40} style={titleStyle}>
              Claude Fable 5.2
            </LightSweep>
          </div>
          <div style={{ marginTop: 56 }}>
            <LivePill delay={96} />
          </div>
        </AbsoluteFill>
      </CameraPush>
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
