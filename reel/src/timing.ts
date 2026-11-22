import React, { createContext, useContext } from "react";
import { FPS } from "./theme";

export type Word = { cap: string; emph: boolean; scene: number; start: number; end: number };
export type SceneMeta = {
  id: string;
  title: string;
  sub: string;
  chip?: string;
  mono?: boolean;
  /** Avatar takes centre stage for this scene; optional tag pops in at a spoken word. */
  center?: { tag?: string; tagAt?: string };
};
export type Timing = {
  hasAudio: boolean;
  duration: number;
  scenes: { id: string; start: number; end: number }[];
  words: Word[];
};
export type Script = { scenes: SceneMeta[] };

export const f = (s: number) => Math.round(s * FPS);

/** Visuals lead the voice slightly so the card is on screen as the line starts. */
const LEAD = 6;

export type SceneFrame = SceneMeta & { from: number; dur: number; index: number };
export type CaptionGroup = { words: Word[]; start: number; end: number };

export type ReelData = {
  id: string;
  timing: Timing;
  totalFrames: number;
  sceneFrames: SceneFrame[];
  groups: CaptionGroup[];
  audio: string;
  sceneById: (id: string) => SceneFrame;
  wordFrameGlobal: (sceneId: string, match: string, fallback?: number) => number;
};

export const makeReel = (id: string, script: Script, timing: Timing): ReelData => {
  const totalFrames = Math.ceil(timing.duration * FPS);
  const sceneFrames = timing.scenes.map((s, i) => {
    const from = i === 0 ? 0 : f(s.start) - LEAD;
    const next = timing.scenes[i + 1];
    const to = next ? f(next.start) - LEAD : totalFrames;
    return { ...script.scenes[i], from, dur: to - from, index: i };
  });

  // Captions: 1-3 words at a time, broken at punctuation and scene changes.
  const groups: CaptionGroup[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) groups.push({ words: cur, start: f(cur[0].start), end: f(cur[cur.length - 1].end) });
    cur = [];
  };
  timing.words.forEach((w, i) => {
    const prev = timing.words[i - 1];
    if (prev && prev.scene !== w.scene) flush();
    cur.push(w);
    const chars = cur.reduce((n, x) => n + x.cap.length, 0);
    if (/[.,:?!]$/.test(w.cap) || cur.length >= 3 || chars > 14) flush();
  });
  flush();

  return {
    id,
    timing,
    totalFrames,
    sceneFrames,
    groups,
    audio: `${id}/voice.mp3`,
    sceneById: (sid) => sceneFrames.find((s) => s.id === sid)!,
    wordFrameGlobal: (sceneId, match, fallback = 0) => {
      const idx = timing.scenes.findIndex((s) => s.id === sceneId);
      const w = timing.words.find((x) => x.scene === idx && x.cap.toLowerCase().includes(match.toLowerCase()));
      return w ? f(w.start) : fallback;
    },
  };
};

const ReelCtx = createContext<ReelData | null>(null);
export const ReelProvider = ReelCtx.Provider;
export const useReel = () => useContext(ReelCtx)!;

type Ctx = { from: number; dur: number; index: number; id: string };
export const SceneCtx = createContext<Ctx>({ from: 0, dur: 1, index: 0, id: "" });
export const SceneProvider = SceneCtx.Provider;
export const useScene = () => useContext(SceneCtx);

/** Local frame (inside the current scene) at which a word containing `match` starts. */
export const useWordFrame = (match: string, fallback = 0, occurrence = 0): number => {
  const { timing } = useReel();
  const { from, index } = useScene();
  const hits = timing.words.filter(
    (w) => w.scene === index && w.cap.toLowerCase().includes(match.toLowerCase()),
  );
  const w = hits[occurrence] ?? hits[0];
  return w ? f(w.start) - from : fallback;
};

export { React };
