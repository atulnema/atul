import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile, useCurrentFrame } from "remotion";
import "./fonts";
import { Wipe, WipeKind } from "./components/Wipe";
import { Ask } from "./scenes/Ask";
import { Hook } from "./scenes/Hook";
import { HowItWorks } from "./scenes/HowItWorks";
import { Market } from "./scenes/Market";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { Traction } from "./scenes/Traction";
import { C, SCENES } from "./theme";

// Each wipe ends in the next scene's background colour, so the cut is hidden.
const cut = (...lengths: number[]) => lengths.reduce((a, b) => a + b, 0);
const S = SCENES;
const WIPES: { at: number; kind: WipeKind; colors: string[] }[] = [
  { at: cut(S.hook), kind: "diagonal", colors: [C.pink, C.yellow, C.blue] },
  { at: cut(S.hook, S.problem), kind: "iris", colors: [C.pink, C.cream, C.yellow] },
  { at: cut(S.hook, S.problem, S.reveal), kind: "shutters", colors: [C.pink, C.blue, C.cream] },
  { at: cut(S.hook, S.problem, S.reveal, S.how), kind: "corner", colors: [C.mint, C.pink, C.ink] },
  { at: cut(S.hook, S.problem, S.reveal, S.how, S.market), kind: "sweep", colors: [C.yellow, C.pink, C.mint] },
  { at: cut(S.hook, S.problem, S.reveal, S.how, S.market, S.traction), kind: "iris", colors: [C.yellow, C.cream, C.pink] },
];

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream }}>
      <Series>
        <Series.Sequence name="Hook" durationInFrames={S.hook}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence name="Problem" durationInFrames={S.problem}>
          <Problem />
        </Series.Sequence>
        <Series.Sequence name="Reveal" durationInFrames={S.reveal}>
          <Reveal />
        </Series.Sequence>
        <Series.Sequence name="How it works" durationInFrames={S.how}>
          <HowItWorks />
        </Series.Sequence>
        <Series.Sequence name="Market" durationInFrames={S.market}>
          <Market />
        </Series.Sequence>
        <Series.Sequence name="Traction" durationInFrames={S.traction}>
          <Traction />
        </Series.Sequence>
        <Series.Sequence name="Ask" durationInFrames={S.ask}>
          <Ask />
        </Series.Sequence>
      </Series>
      {WIPES.map((w) => (
        <Wipe key={w.at} frame={frame} {...w} />
      ))}
      <Audio src={staticFile("audio/soundtrack.wav")} />
    </AbsoluteFill>
  );
};
