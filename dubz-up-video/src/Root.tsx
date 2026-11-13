import React from "react";
import { Composition, Folder } from "remotion";
import "./fonts";
import { Main } from "./Main";
import { Ask } from "./scenes/Ask";
import { Hook } from "./scenes/Hook";
import { HowItWorks } from "./scenes/HowItWorks";
import { Market } from "./scenes/Market";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { Traction } from "./scenes/Traction";
import { FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH } from "./theme";

const size = { width: WIDTH, height: HEIGHT, fps: FPS };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DubzUpPitch" component={Main} durationInFrames={TOTAL_FRAMES} {...size} />
    <Folder name="Scenes">
      <Composition id="Hook" component={Hook} durationInFrames={SCENES.hook} {...size} />
      <Composition id="Problem" component={Problem} durationInFrames={SCENES.problem} {...size} />
      <Composition id="Reveal" component={Reveal} durationInFrames={SCENES.reveal} {...size} />
      <Composition id="HowItWorks" component={HowItWorks} durationInFrames={SCENES.how} {...size} />
      <Composition id="Market" component={Market} durationInFrames={SCENES.market} {...size} />
      <Composition id="Traction" component={Traction} durationInFrames={SCENES.traction} {...size} />
      <Composition id="Ask" component={Ask} durationInFrames={SCENES.ask} {...size} />
    </Folder>
  </>
);
