import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { Background, Captions, Grain, Progress } from "./components/Kit";
import { Hook, Save, Stop, Tease } from "./scenes/Intro";
import { CloneScene, Dubbing, Features, Logo, Process, Styles } from "./scenes/Product";
import { Buildup, Cta, Demo, UrlScene } from "./scenes/Finale";
import { EASE, SceneProps, TL, lerp, ramp } from "./lib";

const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  stop: Stop,
  save: Save,
  tease: Tease,
  logo: Logo,
  features: Features,
  process: Process,
  clone: CloneScene,
  styles: Styles,
  dubbing: Dubbing,
  buildup: Buildup,
  demo: Demo,
  url: UrlScene,
  cta: Cta,
};

const T = 12; // transition length in frames
const HALF = T / 2;

type Trans = "cut" | "flash" | "whipUp" | "whipLeft" | "whipRight" | "zoom" | "iris" | "blur";

/** Style for a scene entering (p: 0→1) or exiting (q: 0→1) with a given transition. */
const enterStyle = (tr: Trans, p: number): React.CSSProperties => {
  const blurAmt = Math.sin(p * Math.PI) * 22;
  switch (tr) {
    case "whipUp":
      return { translate: `0 ${lerp(p, 1920, 0)}px`, filter: `blur(${blurAmt}px)` };
    case "whipLeft":
      return { translate: `${lerp(p, 1080, 0)}px 0`, filter: `blur(${blurAmt}px)` };
    case "whipRight":
      return { translate: `${lerp(p, -1080, 0)}px 0`, filter: `blur(${blurAmt}px)` };
    case "zoom":
      return { scale: String(lerp(p, 0.55, 1)), opacity: p, filter: `blur(${(1 - p) * 20}px)` };
    case "iris":
      return { clipPath: `circle(${lerp(p, 0, 120)}% at 50% 33%)` };
    case "blur":
      return { opacity: p, filter: `blur(${(1 - p) * 34}px)`, scale: String(lerp(p, 1.08, 1)) };
    case "flash":
    case "cut":
    default:
      return { opacity: p >= 0.5 ? 1 : 0, scale: String(p >= 0.5 ? lerp(ramp(p, 0.5, 1), 1.12, 1) : 1) };
  }
};

const exitStyle = (tr: Trans, q: number): React.CSSProperties => {
  const blurAmt = Math.sin(q * Math.PI) * 22;
  switch (tr) {
    case "whipUp":
      return { translate: `0 ${lerp(q, 0, -1920)}px`, filter: `blur(${blurAmt}px)` };
    case "whipLeft":
      return { translate: `${lerp(q, 0, -1080)}px 0`, filter: `blur(${blurAmt}px)` };
    case "whipRight":
      return { translate: `${lerp(q, 0, 1080)}px 0`, filter: `blur(${blurAmt}px)` };
    case "zoom":
      return { scale: String(lerp(q, 1, 2.4)), opacity: 1 - q, filter: `blur(${q * 16}px)` };
    case "iris":
      return { scale: String(lerp(q, 1, 0.9)), opacity: q >= 0.98 ? 0 : 1 };
    case "blur":
      return { opacity: 1 - q, filter: `blur(${q * 34}px)` };
    case "flash":
    case "cut":
    default:
      return { opacity: q >= 0.5 ? 0 : 1 };
  }
};

const SceneWrap: React.FC<{ idx: number; from: number }> = ({ idx, from }) => {
  const local = useCurrentFrame();
  const g = local + from;
  const sc = TL.scenes[idx];
  const next = TL.scenes[idx + 1];
  const Comp = SCENES[sc.id];
  const pIn = idx === 0 ? 1 : ramp(g, sc.s - HALF, sc.s + HALF, EASE.snap);
  const qOut = next ? ramp(g, next.s - HALF, next.s + HALF, EASE.snap) : 0;
  const inS = enterStyle(sc.trans as Trans, pIn);
  const outS = next ? exitStyle(next.trans as Trans, qOut) : {};
  const seg = (id: string) => {
    const s = TL.segs[id];
    return { s: s.s - sc.s, e: s.e - sc.s };
  };
  return (
    <AbsoluteFill style={{ ...inS }}>
      <AbsoluteFill style={{ ...outS }}>
        <Comp f={g - sc.s} dur={sc.e - sc.s} seg={seg} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FlashOverlay: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  let color = "#fff";
  for (const sc of TL.scenes) {
    if (sc.trans === "flash") {
      const v = interpolate(f, [sc.s - 1, sc.s, sc.s + 7], [0, 0.9, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      if (v > o) {
        o = v;
        color = sc.id === "stop" ? "#FF3B4E" : "#fff";
      }
    }
  }
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070D" }}>
      <Background />
      {TL.scenes.map((sc, i) => {
        const next = TL.scenes[i + 1];
        const from = i === 0 ? 0 : sc.s - HALF;
        const to = next ? next.s + HALF : TL.duration;
        return (
          <Sequence key={sc.id} from={from} durationInFrames={to - from} name={sc.id}>
            <SceneWrap idx={i} from={from} />
          </Sequence>
        );
      })}
      <FlashOverlay />
      <Captions />
      <Progress />
      <Grain />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
