import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { totalFrames } from "./timing";
import { FPS, W, H } from "./theme";

export const Root: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={totalFrames} fps={FPS} width={W} height={H} />
);
