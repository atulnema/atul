import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import voiceover from "./voiceover.json";
import { Plate } from "./Plate";
import { Grain, Line, Subtitles } from "./Common";
import { C, FPS, Seg, clamp, easeIn, easeInOut, easeOut, pulses, track } from "./theme";
import { S1Likes } from "./scenes/S1Likes";
import { S2Plane } from "./scenes/S2Plane";
import { S3Orbit } from "./scenes/S3Orbit";
import { S4Hack } from "./scenes/S4Hack";
import { S5Chat } from "./scenes/S5Chat";
import { S6Question } from "./scenes/S6Question";
import { GiantText, S7Smart } from "./scenes/S7Smart";
import { CUTS, S8Payoff } from "./scenes/S8Payoff";

export type MainProps = {
  /** File in /public with the presenter take, e.g. "presenter.mp4". */
  presenterSrc?: string;
  showSubtitles: boolean;
};

// ---------------------------------------------------------------- camera
const lin = (t: number) => t;
const step = (at: number, v: number): Seg => ({ from: at, to: at + 1, v0: v, v1: v, ease: lin });

const SCALE: Seg[] = [
  { from: 15, to: 20, v0: 1, v1: 1.25 }, // 0:00.5 crash-zoom punch-in
  { from: 20, to: 100, v0: 1.25, v1: 1.28, ease: lin },
  { from: 100, to: 106, v0: 1.28, v1: 1.2 },
  { from: 106, to: 196, v0: 1.2, v1: 1.26, ease: lin },
  { from: 196, to: 210, v0: 1.26, v1: 0.82, ease: easeIn }, // whip-zoom out
  step(210, 1.16), // cut: tight MCU
  { from: 211, to: 335, v0: 1.16, v1: 1.24, ease: lin },
  { from: 335, to: 360, v0: 1.24, v1: 2.6, ease: easeIn }, // dolly through plane
  { from: 450, to: 457, v0: 1.7, v1: 1.12 }, // 0:15 reverse crash to the eyes
  { from: 457, to: 470, v0: 1.12, v1: 1.0 },
  step(480, 1.06), // rhythmic micro-zoom cuts
  step(495, 1.12),
  step(540, 1.0),
  step(555, 1.06),
  step(570, 1.12),
  { from: 600, to: 636, v0: 1.12, v1: 1.0, ease: easeInOut },
  step(818, 1.06),
  { from: 819, to: 990, v0: 1.06, v1: 1.1, ease: lin },
  step(990, 1.12),
  { from: 991, to: 1116, v0: 1.12, v1: 1.2, ease: lin },
  { from: 1116, to: 1140, v0: 1.2, v1: 6, ease: easeIn }, // riser plunge
  step(1140, 1.22), // montage presenter cut
  step(1290, 1.35),
  { from: 1291, to: 1340, v0: 1.35, v1: 1.0 }, // final pull-back
];
const BG: Seg[] = [
  { from: 822, to: 990, v0: 1, v1: 1.28, ease: easeInOut }, // vertigo
  step(990, 1),
];
const DIM: Seg[] = [
  { from: 810, to: 830, v0: 0, v1: 0.25 },
  { from: 990, to: 1000, v0: 0.25, v1: 0.12 },
  { from: 1116, to: 1124, v0: 0.12, v1: 0 },
];
const SPLIT: Seg[] = [
  { from: 615, to: 635, v0: 0, v1: 1, ease: easeInOut },
  { from: 800, to: 812, v0: 1, v1: 0, ease: easeIn },
];

// ---------------------------------------------------------------- hits
const CA_HITS = [15, 102, 116, 203, 345, 450, 480, 495, 555, 570, 810, 1140, 1218, ...CUTS.map((c) => c + 1140), 1290, 1292, 1306, 1321, 1336];
const FLASH_SMALL = [480, 495, 555, 570, 1292];
const FLASH_CUTS = CUTS.map((c) => c + 1140);

// ---------------------------------------------------------------- voiceover
// Where each ElevenLabs line starts (seconds). Durations come from
// src/voiceover.json, written by generate-voiceover.ts.
const VO_START: Record<string, number> = {
  "01-hook": 0.1,
  "02-ego": 3.75,
  "03-share": 7.25,
  "04-signal": 12.0,
  "05-hack": 15.5,
  "06-insult": 17.6,
  "07-example": 23.0, // shown inside the chat bubble, not as a subtitle
  "08-question": 27.3,
  "09-smart": 33.0,
  "10-crack": 38.3,
  "11-payoff": 40.8,
};
const NO_SUBTITLE = new Set(["07-example", "11-payoff"]);
// Subtitle stand-ins for lines that have no audio yet (e.g. quota ran out).
const FALLBACK: Record<string, Line> = {
  "09-smart": { from: 990, to: 1136, text: "\"Mere customer ko main kaise smart feel karau, taaki woh dusre logon ko mera content share kare?\"" },
  "10-crack": { from: 1144, to: 1288, text: "Bas yeh ek psychology crack kar lo..." },
};

type VoLine = { id: string; sub: string; duration: number; words: { w: string; start: number }[] | null };
const VO_AUDIO = (voiceover.lines as VoLine[]).map((l) => ({
  ...l,
  from: Math.round(VO_START[l.id] * FPS),
  frames: Math.ceil(l.duration * FPS) + 2,
}));

const VO: Line[] = Object.keys(VO_START)
  .filter((id) => !NO_SUBTITLE.has(id))
  .map((id) => {
    const a = VO_AUDIO.find((l) => l.id === id);
    if (!a) return FALLBACK[id];
    const subWords = a.sub.split(" ");
    // Spoken words are Devanagari/English, subtitles are romanised: map by
    // relative position so highlighting tracks the real speech rhythm.
    const wordAt = a.words
      ? subWords.map((_, i) => a.from + Math.round(a.words![Math.floor((i / subWords.length) * a.words!.length)].start * FPS))
      : undefined;
    return { from: a.from, to: a.from + a.frames + 8, text: a.sub, wordAt };
  })
  .filter(Boolean) as Line[];

const RGBSplitFilter: React.FC<{ amount: number }> = ({ amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="rgb" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feOffset in="r" dx={amount} dy={0} result="r2" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feOffset in="b" dx={-amount} dy={0} result="b2" />
      <feBlend in="r2" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b2" mode="screen" />
    </filter>
  </svg>
);

const WhipFilter: React.FC<{ amount: number }> = ({ amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="whip" x="-10%" y="0%" width="120%" height="100%">
      <feGaussianBlur stdDeviation={`${amount} 0`} />
    </filter>
  </svg>
);

export const Main: React.FC<MainProps> = ({ presenterSrc, showSubtitles }) => {
  const f = useCurrentFrame();

  const scale = track(f, SCALE, 1);
  const bgScale = track(f, BG, 1);
  const dim = track(f, DIM, 0);
  const split = track(f, SPLIT, 0);

  // whip pan at 0:27 (and a lighter one riding the 0:06.8 whip-zoom)
  const whipX =
    f < 808
      ? interpolate(f, [798, 808], [0, -520], { ...clamp, easing: easeIn })
      : interpolate(f, [808, 820], [520, 0], { ...clamp, easing: easeOut });
  const whipBlur =
    interpolate(f, [196, 204, 212], [0, 40, 0], clamp) + interpolate(f, [798, 808, 820], [0, 90, 0], clamp);

  const ca = Math.min(16, pulses(f, CA_HITS, 3, 12));
  const plunge = f >= 1140 ? 0 : interpolate(f, [1116, 1140], [0, 16], { ...clamp, easing: easeIn });
  const flash =
    pulses(f, FLASH_SMALL, 3, 0.22) +
    pulses(f, FLASH_CUTS, 2.5, 0.65) +
    interpolate(f, [1126, 1140, 1154], [0, 1, 0], clamp);
  const black = f >= 1346 ? 1 : 0; // hard cut to black on the final kick

  const plateClip = split > 0 ? `inset(0 0 ${split * 55}% 0)` : undefined;

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <RGBSplitFilter amount={ca} />
      <WhipFilter amount={whipBlur} />

      <AbsoluteFill
        style={{
          translate: `${whipX}px 0px`,
          filter: whipBlur > 0.5 ? "url(#whip)" : undefined,
        }}
      >
        <AbsoluteFill style={{ filter: ca > 0.4 ? "url(#rgb)" : undefined }}>
          <AbsoluteFill style={{ clipPath: plateClip, filter: plunge > 0.3 ? `blur(${plunge}px)` : undefined }}>
            <AbsoluteFill style={{ translate: `0px ${-split * 330}px` }}>
              <Plate
                presenterSrc={presenterSrc}
                scale={scale}
                bgScale={bgScale}
                dim={dim}
                midground={
                  <Sequence from={990} durationInFrames={150} layout="none" name="Giant parallax text">
                    <GiantText />
                  </Sequence>
                }
              />
            </AbsoluteFill>
          </AbsoluteFill>

          <Sequence name="0:00 Hook + shatter" from={0} durationInFrames={210}>
            <S1Likes />
          </Sequence>
          <Sequence name="0:07 Share plane tunnel" from={210} durationInFrames={150}>
            <S2Plane />
          </Sequence>
          <Sequence name="0:12 Algorithm orbit" from={360} durationInFrames={90}>
            <S3Orbit />
          </Sequence>
          <Sequence name="0:15 Biggest hack" from={450} durationInFrames={180}>
            <S4Hack />
          </Sequence>
          <Sequence name="0:21 Split-screen DM" from={612} durationInFrames={210}>
            <S5Chat />
          </Sequence>
          <Sequence name="0:27 Real question" from={810} durationInFrames={180}>
            <S6Question />
          </Sequence>
          <Sequence name="0:33 Make them feel smart" from={990} durationInFrames={150}>
            <S7Smart />
          </Sequence>
          <Sequence name="0:38 0 to 100K payoff" from={1140} durationInFrames={210}>
            <S8Payoff />
          </Sequence>
        </AbsoluteFill>
      </AbsoluteFill>

      {VO_AUDIO.map((l) => (
        <Sequence key={l.id} name={`VO ${l.id}`} from={l.from} durationInFrames={l.frames} layout="none">
          <Audio src={staticFile(`voiceover/${l.id}.mp3`)} />
        </Sequence>
      ))}
      {showSubtitles && <Subtitles lines={VO} />}
      <AbsoluteFill style={{ background: "#fff", opacity: Math.min(1, flash), pointerEvents: "none" }} />
      <Grain />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
    </AbsoluteFill>
  );
};
