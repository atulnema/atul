import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile } from "remotion";
import { Background, Headline, Captions, AvatarRig, HandleBadge } from "./components/Chrome";
import { ReelProvider, SceneProvider } from "./timing";
import { REELS } from "./reels";
import sfxFiles from "./sfx.json";

const available = new Set<string>((sfxFiles as { files: string[] }).files);

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

export const Reel: React.FC<{ reel: string }> = ({ reel }) => {
  useFonts();
  const def = REELS[reel];
  const { sceneFrames, timing, audio } = def.data;
  const cues = def.sfx(def.data).filter((c) => available.has(c.name));
  return (
    <ReelProvider value={def.data}>
    <AbsoluteFill>
      <Background />
      {sceneFrames.map((s) => {
        const Card = def.cards[s.id];
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
      {timing.hasAudio && <Audio src={staticFile(audio)} />}
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.at)} durationInFrames={60} name={`sfx:${c.name}`}>
          <Audio src={staticFile(`sfx/${c.name}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
    </ReelProvider>
  );
};
