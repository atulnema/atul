import { Composition } from "remotion";
import { GscReel } from "./GscReel";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GscReel"
    component={GscReel}
    durationInFrames={600}
    fps={30}
    width={1080}
    height={1920}
  />
);
