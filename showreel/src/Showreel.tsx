import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEAT } from "./lib/anim";
import { Grain, Hud, Vignette } from "./components/Overlays";
import { C } from "./lib/theme";
import { Close } from "./scenes/Close";
import { Engine } from "./scenes/Engine";
import { Open } from "./scenes/Open";
import { Services } from "./scenes/Services";

// 15 seconds at 60 fps. Four scenes of two bars each, cut to a 128 BPM track.
// Beats where the track lands an impact: the drop, the second drop, the end card.
const HITS: [number, number][] = [
  [4, 16],
  [24, 12],
  [28, 22],
];

export const Showreel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = frame / fps / BEAT;
  // Decaying camera shake on each impact.
  let sx = 0;
  let sy = 0;
  for (const [at, amp] of HITS) {
    const t = beat - at;
    if (t >= 0 && t < 1) {
      const decay = Math.exp(-t * 6) * amp;
      sx += Math.sin(t * 46) * decay;
      sy += Math.cos(t * 39) * decay * 0.8;
    }
  }
  const shaking = Math.abs(sx) + Math.abs(sy) > 0.2;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill
        style={{ translate: `${sx}px ${sy}px`, scale: shaking ? "1.025" : "1" }}
      >
        <Series>
          <Series.Sequence name="Open — mark + belief" durationInFrames={225}>
            <Open />
          </Series.Sequence>
          <Series.Sequence name="Services" durationInFrames={225}>
            <Services />
          </Series.Sequence>
          <Series.Sequence
            name="Engine — capabilities + process"
            durationInFrames={225}
          >
            <Engine />
          </Series.Sequence>
          <Series.Sequence
            name="Close — promise + end card"
            durationInFrames={225}
          >
            <Close />
          </Series.Sequence>
        </Series>
      </AbsoluteFill>
      <Hud />
      <Vignette />
      <Grain />
      <Audio name="Soundtrack" src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
