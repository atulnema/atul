import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { BlurIn, CameraPush, clamp, MaskLine, SceneLabel, useEnter } from "../lib/motion";

const NODES = new Array(22).fill(0).map((_, i) => ({
  x: 80 + random(`nx${i}`) * 1760,
  y: 80 + random(`ny${i}`) * 920,
}));
const EDGES: [number, number, number][] = [];
NODES.forEach((a, i) =>
  NODES.forEach((b, j) => {
    if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 430) {
      EDGES.push([i, j, random(`e${i}-${j}`)]);
    }
  }),
);

const NeuralField: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.38 }}>
      {EDGES.map(([i, j, r], k) => {
        const a = NODES[i];
        const b = NODES[j];
        const draw = interpolate(frame, [r * 30, r * 30 + 30], [0, 1], clamp);
        const t = (frame * (0.008 + r * 0.012) + r) % 1;
        return (
          <g key={k}>
            <line
              x1={a.x}
              y1={a.y}
              x2={a.x + (b.x - a.x) * draw}
              y2={a.y + (b.y - a.y) * draw}
              stroke={COLORS.cream}
              strokeOpacity={0.25}
              strokeWidth={1.5}
            />
            {draw >= 1 && (
              <circle
                cx={a.x + (b.x - a.x) * t}
                cy={a.y + (b.y - a.y) * t}
                r={4}
                fill={COLORS.amber}
              />
            )}
          </g>
        );
      })}
      {NODES.map((n, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame / 8 + i);
        return (
          <circle key={i} cx={n.x} cy={n.y} r={6 + pulse * 4} fill={COLORS.clay} fillOpacity={0.8} />
        );
      })}
    </svg>
  );
};

const LEVELS = ["low", "medium", "high", "xhigh", "max"];
const TRACK = 1200;

const EffortSlider: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useEnter(30, { damping: 200 });
  const pos = interpolate(frame, [48, 125], [0, LEVELS.length - 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const step = TRACK / (LEVELS.length - 1);
  return (
    <div
      style={{
        position: "relative",
        width: TRACK,
        height: 140,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 40}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          width: TRACK,
          height: 8,
          borderRadius: 4,
          background: "rgba(243,238,227,0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          width: pos * step,
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(90deg, ${COLORS.clay}, ${COLORS.amber})`,
          boxShadow: `0 0 24px ${COLORS.clay}`,
        }}
      />
      {LEVELS.map((lvl, i) => {
        const lit = interpolate(pos, [i - 0.3, i], [0, 1], clamp);
        return (
          <div key={lvl} style={{ position: "absolute", left: i * step, top: 0 }}>
            <div
              style={{
                position: "absolute",
                top: 22,
                left: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: lit > 0.5 ? COLORS.amber : "rgba(243,238,227,0.25)",
                transform: `scale(${1 + lit * 0.2})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 76,
                transform: "translateX(-50%)",
                fontFamily: FONTS.mono,
                fontSize: 36,
                color: lit > 0.5 ? COLORS.cream : COLORS.muted,
                opacity: 0.5 + lit * 0.5,
              }}
            >
              {lvl}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: pos * step - 30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: COLORS.cream,
          boxShadow: `0 0 0 10px rgba(242,179,107,0.25), 0 0 50px ${COLORS.amber}`,
        }}
      />
    </div>
  );
};

export const Reasoning: React.FC = () => {
  return (
    <AbsoluteFill>
      <NeuralField />
      <SceneLabel index="05" label="Reasoning" />
      <CameraPush to={1.04}>
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          <MaskLine delay={4}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontWeight: 600,
                fontSize: 150,
                letterSpacing: "-0.03em",
                color: COLORS.cream,
                textAlign: "center",
              }}
            >
              Thinking is{" "}
              <span style={{ fontStyle: "italic", color: COLORS.clay }}>always on.</span>
            </div>
          </MaskLine>
          <div style={{ marginTop: 30, marginBottom: 70 }}>
            <BlurIn delay={18}>
              <div style={{ fontFamily: FONTS.sans, fontSize: 56, color: COLORS.muted }}>
                You choose how hard it works.
              </div>
            </BlurIn>
          </div>
          <EffortSlider />
        </AbsoluteFill>
      </CameraPush>
    </AbsoluteFill>
  );
};
