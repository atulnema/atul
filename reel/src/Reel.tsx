import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { Background, Headline, Captions, AvatarRig, HandleBadge } from "./components/Chrome";
import { ReelProvider, SceneProvider, f } from "./timing";
import { SceneMotion } from "./components/Motion";
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
      <Background variant={def.background} />
      {sceneFrames.map((s) => {
        const Card = def.cards[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
            <SceneProvider value={{ from: s.from, dur: s.dur, index: s.index, id: s.id }}>
              {def.motion ? (
                <SceneMotion index={s.index}>
                  <Card />
                </SceneMotion>
              ) : (
                <Card />
              )}
              <Headline title={s.title} sub={s.sub} chip={s.chip} dur={s.dur} variant={def.motion ? (s.index * 3) % 5 : 0} />
            </SceneProvider>
          </Sequence>
        );
      })}
      <Captions />
      <HandleBadge handle="@alphastrix_" />
      <AvatarRig />
      {timing.hasAudio && <Audio src={staticFile(audio)} />}
      {def.music && (
        <Audio
          src={staticFile(def.music)}
          loop
          volume={(fr) => {
            // duck under the voice, fade in and out
            const t = fr / 30;
            let gap = 99;
            for (const w of timing.words) {
              const d = t < w.start ? w.start - t : t > w.end ? t - w.end : 0;
              if (d < gap) gap = d;
            }
            const base = interpolate(gap, [0.35, 0.9], [0.1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fadeIn = interpolate(fr, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fadeOut = interpolate(fr, [def.data.totalFrames - 45, def.data.totalFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return base * fadeIn * fadeOut;
          }}
        />
      )}
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.at)} durationInFrames={60} name={`sfx:${c.name}`}>
          <Audio src={staticFile(`sfx/${c.name}.mp3`)} volume={c.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
    </ReelProvider>
  );
};
