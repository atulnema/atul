import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, staticFile } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { C, F, FPS, W, H } from "../theme";
import { f, useReel, Word } from "../timing";
import { clamp, ease, useSpring, Check } from "./ui";
import { Avatar } from "./Avatar";

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */
export const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 70% at 50% 30%, ${C.bg2} 0%, ${C.bg} 55%, #E2E1DD 100%)`,
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Headline (top): bold sans title + crimson italic serif sub          */
/* ------------------------------------------------------------------ */
export const Headline: React.FC<{ title: string; sub: string; chip?: string; dur: number }> = ({ title, sub, chip, dur }) => {
  const frame = useCurrentFrame();
  const inT = useSpring(0, 15, 160);
  const inS = useSpring(5, 15, 160);
  const out = ease(frame, dur - 8, dur, 0, 1);
  const line = (p: number): React.CSSProperties => ({
    opacity: Math.min(1, p * 1.3) * (1 - out),
    transform: `translateY(${(1 - p) * 34 - out * 24}px)`,
    filter: `blur(${(1 - p) * 10 + out * 8}px)`,
  });
  return (
    <div style={{ position: "absolute", top: 120, left: 60, right: 60, textAlign: "center" }}>
      {chip && (
        <div style={{ ...line(inT), marginBottom: 18 }}>
          <span
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: C.crimson,
              background: C.crimsonSoft,
              padding: "8px 18px",
              borderRadius: 999,
            }}
          >
            {chip}
          </span>
        </div>
      )}
      <div style={{ ...line(inT), fontFamily: F.sans, fontWeight: 800, fontSize: 74, color: C.ink, letterSpacing: -2, lineHeight: 1.08 }}>
        {title}
      </div>
      <div
        style={{
          ...line(inS),
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 72,
          color: C.crimson,
          letterSpacing: -0.5,
          lineHeight: 1.15,
          marginTop: 4,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Captions: 1-3 words at a time, popping in as they are spoken        */
/* ------------------------------------------------------------------ */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { groups } = useReel();
  const gi = groups.findIndex((g, i) => frame >= g.start - 2 && frame < (groups[i + 1]?.start ?? Infinity) - 2);
  const g = groups[gi];
  if (!g) return null;
  const gone = ease(frame, g.end + 14, g.end + 20, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        top: 1418,
        left: 40,
        right: 40,
        textAlign: "center",
        fontFamily: F.sans,
        fontWeight: 800,
        fontSize: 64,
        letterSpacing: -1.2,
        lineHeight: 1.1,
        opacity: 1 - gone,
      }}
    >
      {g.words.map((w, i) => {
        const s = f(w.start) - 2;
        const p = ease(frame, s, s + 6);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 9px",
              color: w.emph ? C.crimson : C.ink,
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px) scale(${0.9 + p * 0.1})`,
              filter: `blur(${(1 - p) * 6}px)`,
            }}
          >
            {w.cap.replace(/[,:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Voice level: real audio amplitude when available, else word timing  */
/* ------------------------------------------------------------------ */
const useLevelFromWords = (frame: number, words: Word[]) => {
  const t = frame / FPS;
  const w = words.find((x) => t >= x.start && t <= x.end + 0.02);
  if (!w) return 0;
  return 0.45 + 0.45 * Math.abs(Math.sin(frame * 1.7)) * Math.abs(Math.sin(frame * 0.63 + 1));
};

const LevelFromAudio: React.FC<{ children: (lvl: number, bars: number[]) => React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const reel = useReel();
  const audio = useAudioData(staticFile(reel.audio));
  if (!audio) return <>{children(0, new Array(9).fill(0))}</>;
  const bins = visualizeAudio({ fps: FPS, frame, audioData: audio, numberOfSamples: 32, optimizeFor: "speed" });
  const speech = bins.slice(1, 12);
  const lvl = Math.min(1, (speech.reduce((a, b) => a + b, 0) / speech.length) * 9);
  const bars = Array.from({ length: 9 }, (_, i) => Math.min(1, bins[i + 1] * 10));
  return <>{children(lvl, bars)}</>;
};

export const VoiceLevel: React.FC<{ children: (lvl: number, bars: number[]) => React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { timing } = useReel();
  if (timing.hasAudio) return <LevelFromAudio>{children}</LevelFromAudio>;
  const lvl = useLevelFromWords(frame, timing.words);
  const bars = Array.from({ length: 9 }, (_, i) => lvl * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.5 + i * 1.3))));
  return <>{children(lvl, bars)}</>;
};

/* ------------------------------------------------------------------ */
/* Avatar rig: corner by default, centre stage for the "think" scene   */
/* ------------------------------------------------------------------ */
const blinkAt = (frame: number) => {
  // deterministic blink schedule: every ~3.3s with jitter, 6 frames long
  const period = 100;
  const phase = frame % period;
  const k = Math.floor(frame / period);
  const offset = (k * 37) % 23;
  const d = phase - offset;
  if (d < 0 || d > 6) return 0;
  return d < 3 ? d / 3 : (6 - d) / 3;
};

export const AvatarRig: React.FC = () => {
  const frame = useCurrentFrame();
  const reel = useReel();
  const think = reel.sceneFrames.find((s) => s.center) ?? { id: "", from: -100000, dur: 0, center: undefined as { tag?: string; tagAt?: string } | undefined };
  const tIn = ease(frame, think.from - 4, think.from + 14);
  const tOut = ease(frame, think.from + think.dur - 2, think.from + think.dur + 9);
  const big = tIn * (1 - tOut);

  // corner rig vs centre rig
  const size = interpolate(big, [0, 1], [400, 860]);
  const left = interpolate(big, [0, 1], [W - 400 - 6, (W - 860) / 2]);
  const top = interpolate(big, [0, 1], [H - 440, 470]);
  const bob = Math.sin(frame / 22) * 4;

  const tag = think.center?.tag;
  const plannedAt = tag ? reel.wordFrameGlobal(think.id, think.center?.tagAt ?? "", think.from + 40) : 1e7;
  const plannedRaw = ease(frame, plannedAt, plannedAt + 8);
  const planned = plannedRaw * (1 - Math.min(1, tOut * 2.5));
  const thinking = big > 0.5 && frame < plannedAt;

  const introP = useSpring(2, 13, 120);

  return (
    <VoiceLevel>
      {(lvl, bars) => (
        <>
          <div
            style={{
              position: "absolute",
              left,
              top: top + bob + (1 - introP) * 300,
              width: size,
              height: size * 1.1,
            }}
          >
            <Avatar
              mouth={lvl}
              blink={blinkAt(frame)}
              lookX={thinking ? 0.8 : big > 0.5 ? 0 : -0.35}
              lookY={thinking ? -0.9 : 0}
              brow={thinking ? 0.6 : lvl * 0.35}
              tilt={thinking ? -4 : Math.sin(frame / 40) * 1.5}
              smile={thinking ? 0.2 : 1}
            />
            {/* mic pill on the chest */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "87%",
                transform: `translateX(-50%) scale(${size / 400})`,
                transformOrigin: "50% 0",
                background: "#fff",
                borderRadius: 999,
                padding: "9px 16px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 10, background: C.crimson, marginRight: 4 }} />
              {bars.map((b, i) => (
                <div key={i} style={{ width: 4, height: 6 + b * 22, borderRadius: 3, background: C.crimson }} />
              ))}
            </div>
          </div>

          {/* thought bubble */}
          {big > 0.02 && (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: big * (1 - plannedRaw) * (1 - Math.min(1, tOut * 3)) }}>
              {[
                { x: 770, y: 720, s: 26 },
                { x: 815, y: 655, s: 42 },
              ].map((d, i) => {
                const p = ease(frame, think.from + 10 + i * 6, think.from + 20 + i * 6);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: d.x,
                      top: d.y,
                      width: d.s,
                      height: d.s,
                      borderRadius: 100,
                      background: "#fff",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                      transform: `scale(${p})`,
                    }}
                  />
                );
              })}
              <div
                style={{
                  position: "absolute",
                  left: 830,
                  top: 470,
                  width: 170,
                  height: 150,
                  borderRadius: 90,
                  background: "#fff",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.1)",
                  display: "grid",
                  placeItems: "center",
                  transform: `scale(${ease(frame, think.from + 22, think.from + 32)})`,
                  fontFamily: F.serif,
                  fontStyle: "italic",
                  fontWeight: 600,
                  fontSize: 90,
                  color: C.crimson,
                }}
              >
                ?
              </div>
            </div>
          )}

          {/* "Content planned" tag */}
          {planned > 0.01 && (
            <div
              style={{
                position: "absolute",
                left: 120,
                top: 600,
                opacity: planned,
                transform: `translateY(${(1 - planned) * 30}px) scale(${0.85 + planned * 0.15})`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: C.ink,
                color: "#fff",
                fontFamily: F.sans,
                fontWeight: 700,
                fontSize: 34,
                padding: "16px 28px 16px 16px",
                borderRadius: 999,
                boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
              }}
            >
              <Check size={48} />
              {tag}
            </div>
          )}
        </>
      )}
    </VoiceLevel>
  );
};


/* ------------------------------------------------------------------ */
/* Handle badge (bottom-left)                                          */
/* ------------------------------------------------------------------ */
export const HandleBadge: React.FC<{ handle: string }> = ({ handle }) => {
  const p = useSpring(10, 14, 140);
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        bottom: 64,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "rgba(255,255,255,0.85)",
        border: `1.5px solid ${C.line}`,
        borderRadius: 999,
        padding: "14px 26px 14px 16px",
        boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
        fontFamily: F.sans,
        fontWeight: 800,
        fontSize: 32,
        color: C.ink,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          background: "linear-gradient(135deg, #F7B24A, #E1306C 55%, #8A3AB9)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ width: 24, height: 24, borderRadius: 8, border: "3.5px solid #fff", display: "grid", placeItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: 8, border: "3px solid #fff" }} />
        </div>
      </div>
      {handle}
    </div>
  );
};
