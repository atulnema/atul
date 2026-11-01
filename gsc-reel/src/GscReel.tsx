import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  staticFile,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BG = "#0b1020";
const BLUE = "#4285f4";
const GREEN = "#34a853";
const YELLOW = "#fbbc05";
const RED = "#ea4335";
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

const useIn = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

const fadeOut = (frame: number, dur: number, len = 10) =>
  interpolate(frame, [dur - len, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 600], [0, 360]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + Math.sin(frame / 60) * 15}% ${
          25 + Math.cos(frame / 70) * 10
        }%, #1b2a6b 0%, ${BG} 55%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${shift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const Word: React.FC<{ children: string; delay: number; color?: string; size?: number }> = ({
  children,
  delay,
  color = "#fff",
  size = 120,
}) => {
  const p = useIn(delay);
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: 26,
        fontSize: size,
        fontWeight: 900,
        color,
        transform: `translateY(${(1 - p) * 80}px) scale(${0.7 + 0.3 * p})`,
        opacity: p,
      }}
    >
      {children}
    </span>
  );
};

const Center: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        fontFamily: FONT,
        opacity: fadeOut(frame, dur),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Scene 1: hook with falling traffic line
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = [0, 0.15, 0.1, 0.35, 0.3, 0.6, 0.75, 1];
  const W = 880;
  const H = 360;
  const prog = interpolate(frame, [20, 100], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const path = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * W} ${v * H}`)
    .join(" ");
  return (
    <Center dur={120}>
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 60, lineHeight: 1.05 }}>
          <Word delay={0}>Your</Word>
          <Word delay={4}>site</Word>
          <br />
          <Word delay={8}>is</Word>
          <Word delay={12} color={RED}>
            losing
          </Word>
          <br />
          <Word delay={16} color={RED}>
            traffic
          </Word>
        </div>
        <svg width={W} height={H + 20} style={{ overflow: "visible" }}>
          <path
            d={path}
            fill="none"
            stroke={RED}
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - prog}
          />
        </svg>
        <div
          style={{
            marginTop: 40,
            fontSize: 56,
            color: "#9aa4c7",
            fontWeight: 600,
            opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          and you'd never know.
        </div>
      </div>
    </Center>
  );
};

// Scene 2: the reveal
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useIn(0, 12);
  const letters = ["G", "o", "o", "g", "l", "e"];
  const colors = [BLUE, RED, YELLOW, BLUE, GREEN, RED];
  return (
    <Center dur={150}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 150, fontWeight: 900, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
          {letters.map((l, i) => (
            <span key={i} style={{ color: colors[i] }}>
              {l}
            </span>
          ))}
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.05,
            transform: `translateY(${(1 - useIn(8)) * 60}px)`,
            opacity: useIn(8),
          }}
        >
          Search Console
        </div>
        <div style={{ marginTop: 50, display: "inline-block" }}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              color: BG,
              background: GREEN,
              borderRadius: 100,
              padding: "18px 64px",
              transform: `scale(${useIn(30)})`,
              boxShadow: `0 0 ${30 + Math.sin(frame / 6) * 15}px ${GREEN}`,
            }}
          >
            100% FREE
          </div>
        </div>
        <div style={{ marginTop: 60, fontSize: 56, color: "#9aa4c7", fontWeight: 600, opacity: useIn(50) }}>
          See what people search
          <br />
          before they find you
        </div>
      </div>
    </Center>
  );
};

// Scene 3: insight cards
const Card: React.FC<{ delay: number; color: string; title: string; sub: string; icon: string }> = ({
  delay,
  color,
  title,
  sub,
  icon,
}) => {
  const p = useIn(delay);
  return (
    <div
      style={{
        width: 900,
        display: "flex",
        alignItems: "center",
        gap: 40,
        padding: "44px 50px",
        borderRadius: 40,
        background: "rgba(255,255,255,0.07)",
        border: `3px solid ${color}`,
        transform: `translateX(${(1 - p) * 1000}px)`,
        opacity: p,
        marginBottom: 44,
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 30,
          background: color,
          color: BG,
          fontSize: 76,
          fontWeight: 900,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 62, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 42, fontWeight: 500, color: "#9aa4c7", marginTop: 10 }}>{sub}</div>
      </div>
    </div>
  );
};

const Insights: React.FC = () => (
  <Center dur={120}>
    <div>
      <div style={{ fontSize: 84, fontWeight: 900, color: "#fff", marginBottom: 70, textAlign: "center" }}>
        You'll finally see
      </div>
      <Card delay={8} color={RED} icon="!" title="Pages not indexed" sub="Google can't find them" />
      <Card delay={22} color={YELLOW} icon="↗" title="Almost-rank keywords" sub="Position 8 to 20 = quick wins" />
      <Card delay={36} color={BLUE} icon="%" title="Click-through rate" sub="Fix weak titles, win clicks" />
    </div>
  </Center>
);

// Scene 4: 3 steps
const Step: React.FC<{ n: number; text: string; delay: number; color: string }> = ({
  n,
  text,
  delay,
  color,
}) => {
  const p = useIn(delay);
  const check = interpolate(useCurrentFrame(), [delay + 25, delay + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        marginBottom: 70,
        transform: `scale(${0.8 + 0.2 * p})`,
        opacity: p,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          background: color,
          color: BG,
          fontSize: 90,
          fontWeight: 900,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", flex: 1 }}>{text}</div>
      <svg width={90} height={90} viewBox="0 0 24 24">
        <path
          d="M4 13 L10 19 L20 6"
          fill="none"
          stroke={GREEN}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - check}
        />
      </svg>
    </div>
  );
};

const Steps: React.FC = () => (
  <Center dur={150}>
    <div style={{ width: 900 }}>
      <div style={{ fontSize: 84, fontWeight: 900, color: YELLOW, marginBottom: 80, textAlign: "center" }}>
        Set up in 3 steps
      </div>
      <Step n={1} text="Verify your site" delay={10} color={BLUE} />
      <Step n={2} text="Submit sitemap" delay={45} color={GREEN} />
      <Step n={3} text="Check performance" delay={80} color={YELLOW} />
    </div>
  </Center>
);

// Scene 5: CTA
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useIn(0, 10);
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, textAlign: "center" }}
    >
      <div style={{ transform: `scale(${0.5 + 0.5 * p})`, opacity: p }}>
        <div style={{ fontSize: 140, fontWeight: 900, color: "#fff", lineHeight: 1.05 }}>
          Do it
          <br />
          <span style={{ color: GREEN }}>today.</span>
        </div>
        <div
          style={{
            marginTop: 70,
            display: "inline-block",
            fontSize: 60,
            fontWeight: 800,
            color: BG,
            background: "#fff",
            borderRadius: 100,
            padding: "22px 60px",
            transform: `scale(${1 + Math.sin(frame / 5) * 0.03})`,
          }}
        >
          search.google.com/search-console
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type ReelProps = { hasVoice: boolean; hasMusic: boolean };

export const GscReel: React.FC<ReelProps> = ({ hasVoice, hasMusic }) => (
  <AbsoluteFill style={{ background: BG }}>
    {hasMusic ? <Audio src={staticFile("music.mp3")} volume={0.22} /> : null}
    {hasVoice ? <Audio src={staticFile("voiceover.mp3")} volume={1} /> : null}
    <Background />
    <Sequence from={0} durationInFrames={120}>
      <Hook />
    </Sequence>
    <Sequence from={120} durationInFrames={150}>
      <Reveal />
    </Sequence>
    <Sequence from={270} durationInFrames={120}>
      <Insights />
    </Sequence>
    <Sequence from={390} durationInFrames={150}>
      <Steps />
    </Sequence>
    <Sequence from={540} durationInFrames={60}>
      <Cta />
    </Sequence>
  </AbsoluteFill>
);
