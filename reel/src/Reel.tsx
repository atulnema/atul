import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile } from "remotion";
import { Background, Headline, Captions, AvatarRig, HandleBadge } from "./components/Chrome";
import { CARDS } from "./cards";
import { SceneProvider, sceneFrames, timing } from "./timing";
import { sfxCues } from "./sfx";

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([
      document.fonts.load('800 40px "Plus Jakarta Sans"'),
      document.fonts.load('700 40px "Plus Jakarta Sans"'),
      document.fonts.load('600 40px "Plus Jakarta Sans"'),
      document.fonts.load('italic 500 40px "Lora"'),
      document.fonts.load('italic 600 40px "Lora"'),
      document.fonts.load('500 40px "JetBrains Mono"'),
      document.fonts.load('700 40px "JetBrains Mono"'),
    ]).finally(() => continueRender(handle));
  }, [handle]);
};

export const Reel: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Background />
      {sceneFrames.map((s) => {
        const Card = CARDS[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
            <SceneProvider value={{ from: s.from, dur: s.dur, index: s.index, id: s.id }}>
              <Card />
              <Headline title={s.title} sub={s.sub} chip={s.chip} dur={s.dur} />
            </SceneProvider>
          </Sequence>
        );
      })}
      <Captions />
      <HandleBadge handle="@alphastrix_" />
      <AvatarRig />
      {timing.hasAudio && <Audio src={staticFile("voice.mp3")} />}
      {sfxCues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.at)} durationInFrames={60} name={`sfx:${c.name}`}>
          <Audio src={staticFile(`sfx/${c.name}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
