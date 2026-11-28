import "./fonts";
import { Composition } from "remotion";
import { Main } from "./Main";
import { TL } from "./lib";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CVoiceReel"
      component={Main}
      durationInFrames={TL.duration}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
