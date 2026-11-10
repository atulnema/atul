import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import {
  springTiming,
  TransitionPresentation,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Background } from "./Background";
import { FPS, HEIGHT, WIDTH } from "./lib/theme";
import { ColdOpen, TitleReveal } from "./scenes/Intro";
import { Capability, ContextWindow, MaxOutput } from "./scenes/Specs";
import { Price } from "./scenes/Price";
import { Reasoning } from "./scenes/Reasoning";
import { Agentic, Outro } from "./scenes/Outro";

const T = 16;
const timing = springTiming({ config: { damping: 200 }, durationInFrames: T });

const SCENES: { id: string; frames: number; C: React.FC }[] = [
  { id: "cold-open", frames: 90, C: ColdOpen },
  { id: "title", frames: 150, C: TitleReveal },
  { id: "capability", frames: 120, C: Capability },
  { id: "context", frames: 140, C: ContextWindow },
  { id: "output", frames: 105, C: MaxOutput },
  { id: "price", frames: 150, C: Price },
  { id: "reasoning", frames: 155, C: Reasoning },
  { id: "agentic", frames: 165, C: Agentic },
  { id: "outro", frames: 200, C: Outro },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENTATIONS: TransitionPresentation<any>[] = [
  fade(),
  wipe({ direction: "from-left" }),
  slide({ direction: "from-right" }),
  slide({ direction: "from-bottom" }),
  wipe({ direction: "from-bottom" }),
  wipe({ direction: "from-right" }),
  slide({ direction: "from-right" }),
  fade(),
];

const TOTAL =
  SCENES.reduce((sum, s) => sum + s.frames, 0) - (SCENES.length - 1) * T;

export const FableLaunch: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        {SCENES.flatMap(({ id, frames, C }, i) => {
          const items = [
            <TransitionSeries.Sequence key={id} durationInFrames={frames} name={id}>
              <C />
            </TransitionSeries.Sequence>,
          ];
          if (i < SCENES.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`${id}-t`}
                presentation={PRESENTATIONS[i]}
                timing={timing}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="FableLaunch"
      component={FableLaunch}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
