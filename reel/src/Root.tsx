import { Composition } from "remotion";
import { Reel } from "./Reel";
import { FPS, TOTAL_FRAMES } from "./content";
import "./fonts";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AlphastrixReel"
    component={Reel}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
