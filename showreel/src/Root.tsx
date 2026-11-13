import { Composition, Folder } from "remotion";
import "./lib/theme";
import { Close } from "./scenes/Close";
import { Engine } from "./scenes/Engine";
import { Open } from "./scenes/Open";
import { Services } from "./scenes/Services";
import { Showreel } from "./Showreel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Showreel-Scenes">
        <Composition id="Open" component={Open} width={1920} height={1080} fps={60} durationInFrames={225} />
        <Composition id="Services" component={Services} width={1920} height={1080} fps={60} durationInFrames={225} />
        <Composition id="Engine" component={Engine} width={1920} height={1080} fps={60} durationInFrames={225} />
        <Composition id="Close" component={Close} width={1920} height={1080} fps={60} durationInFrames={225} />
      </Folder>
      <Composition id="Showreel" component={Showreel} width={1920} height={1080} fps={60} durationInFrames={900} />
    </>
  );
};
