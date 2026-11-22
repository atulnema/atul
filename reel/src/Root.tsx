import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { REELS } from "./reels";
import { FPS, W, H } from "./theme";

const NAMES: Record<string, string> = { agent: "Agent", payment: "Payment" };

export const Root: React.FC = () => (
  <>
    {Object.entries(REELS).map(([id, r]) => (
      <Composition
        key={id}
        id={NAMES[id] ?? id}
        component={Reel}
        defaultProps={{ reel: id }}
        durationInFrames={r.data.totalFrames}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
  </>
);
