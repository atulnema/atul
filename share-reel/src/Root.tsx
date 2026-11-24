import React from "react";
import { Composition } from "remotion";
import { Main, MainProps } from "./Main";
import { DURATION, FPS, H, W } from "./theme";

const defaults: MainProps = { presenterSrc: undefined, showSubtitles: true };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ShareReel"
      component={Main}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={defaults}
    />
    {/* Same timeline without burned-in VO subtitles, for when real VO + captions land. */}
    <Composition
      id="ShareReelClean"
      component={Main}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ ...defaults, showSubtitles: false }}
    />
  </>
);
