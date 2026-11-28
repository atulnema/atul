import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, OUTRO_START, PHRASES, SCENES } from "./content";
import { C, F } from "./theme";
import { IGGlyph, lerp, pop } from "./ui";
import { Ads, Auto, Cta, Hook, Proof, Seo, Social, Team, Web } from "./scenes";

const SCENE_COMPONENTS = {
  hook: Hook,
  proof: Proof,
  team: Team,
  seo: Seo,
  ads: Ads,
  web: Web,
  social: Social,
  auto: Auto,
  cta: Cta,
} as const;

const currentScene = (f: number) => [...SCENES].reverse().find((s) => f >= s.from) ?? SCENES[0];

/* ---------- background ---------- */

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: C.bg,
      backgroundImage: `linear-gradient(${C.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.grid} 1.5px, transparent 1.5px)`,
      backgroundSize: "54px 54px",
      backgroundPosition: "-1px -1px",
    }}
  >
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 55% at 50% 42%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 120% 80% at 50% 50%, rgba(0,0,0,0) 60%, rgba(60,45,20,0.10) 100%)",
      }}
    />
  </AbsoluteFill>
);

/* ---------- header: kicker + step pill ---------- */

const Header: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = currentScene(f);
  const p = pop(f, fps, s.from, 12);
  const intro = pop(f, fps, 0, 16);
  const active = s.dots > 0;
  return (
    <div
      style={{
        position: "absolute",
        top: 206,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: intro,
      }}
    >
      <span style={{ fontFamily: F.mono, fontSize: 24, color: "#8D887C", letterSpacing: "0.06em", fontWeight: 500 }}>
        {BRAND.kicker}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.7)",
          border: `1px solid ${C.line}`,
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 22,
          color: C.ink,
          letterSpacing: "0.04em",
          transform: `scale(${0.85 + 0.15 * p})`,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 6, background: active ? C.violet : "#8D887C" }} />
        {s.pill}
      </div>
    </div>
  );
};

/* ---------- faint creator watermark, like the reference ---------- */

const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 560,
      right: 60,
      display: "flex",
      alignItems: "center",
      gap: 10,
      opacity: 0.22,
    }}
  >
    <IGGlyph size={34} mono={C.ink} />
    <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: "0.02em" }}>
      {BRAND.handle.toUpperCase()}
    </span>
  </div>
);

/* ---------- progress dots ---------- */

const Dots: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = currentScene(f);
  if (s.dots === 0 || f >= OUTRO_START) return null;
  const appear = pop(f, fps, SCENES[3].from, 14);
  return (
    <div
      style={{
        position: "absolute",
        top: 1418,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 14,
        opacity: appear,
      }}
    >
      {[0, 1, 2, 3].map((i) => {
        const on = i < s.dots;
        const isNew = i === s.dots - 1;
        const g = isNew ? pop(f, fps, s.from + 8, 12) : on ? 1 : 0;
        return (
          <div
            key={i}
            style={{
              width: 18 + 30 * g,
              height: 18,
              borderRadius: 9,
              background: on && g > 0.05 ? C.violet : "#CFC9BC",
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- word-by-word caption pill ---------- */

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  if (f >= OUTRO_START) return null;
  let idx = -1;
  for (let i = 0; i < PHRASES.length; i++) if (PHRASES[i].t0 <= t) idx = i;
  if (idx < 0) return null;
  const cap = PHRASES[idx];
  const next = PHRASES[idx + 1];
  // hold through short gaps, drop during long pauses
  const holdUntil = next && next.t0 - cap.t1 < 0.8 ? next.t0 : cap.t1 + 0.35;
  if (t > holdUntil) return null;

  const enter = pop(f, fps, Math.round(cap.t0 * fps), 16);

  return (
    <div
      style={{
        position: "absolute",
        top: 1490,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          padding: "26px 44px",
          borderRadius: 30,
          background: "rgba(251,249,244,0.94)",
          border: `1px solid ${C.line}`,
          boxShadow: "0 20px 40px -18px rgba(40,30,10,0.3)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 16,
          rowGap: 4,
          transform: `scale(${0.94 + 0.06 * enter})`,
          opacity: Math.min(1, enter * 2),
        }}
      >
        {cap.words.map(({ text: w, key, t: wt }, i) => {
          const lit = t >= wt;
          const wp = lit ? pop(f, fps, Math.round(wt * fps), 12) : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 58,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                color: lit ? (key ? C.violetText : C.ink) : "#BDB8AC",
                display: "inline-block",
                transform: `translateY(${lit ? (1 - wp) * 6 : 0}px) scale(${lit ? 0.96 + 0.04 * wp : 1})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- outro dim ---------- */

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < OUTRO_START) return null;
  const d = lerp(f, OUTRO_START, OUTRO_START + 10, 0, 1);
  const p = pop(f, fps, OUTRO_START + 6, 11);
  const h = pop(f, fps, OUTRO_START + 14, 14);
  return (
    <AbsoluteFill style={{ background: `rgba(14,12,10,${0.62 * d})`, zIndex: 50 }}>
      <div
        style={{
          position: "absolute",
          top: 1030,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <div style={{ transform: `scale(${p})` }}>
          <IGGlyph size={150} />
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 48,
            color: C.white,
            letterSpacing: "0.02em",
            opacity: h,
            transform: `translateY(${(1 - h) * 20}px)`,
          }}
        >
          {BRAND.handle.toUpperCase()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("voiceover.wav")} />
    <Background />
    <Watermark />
    {SCENES.map((s) => {
      const Comp = SCENE_COMPONENTS[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} layout="none">
          <Comp dur={s.dur} />
        </Sequence>
      );
    })}
    <Header />
    <Dots />
    <Captions />
    <Outro />
  </AbsoluteFill>
);
