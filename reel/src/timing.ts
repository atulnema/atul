import React, { createContext, useContext } from "react";
import raw from "./timing.json";
import script from "./script.json";
import { FPS } from "./theme";

export type Word = { cap: string; emph: boolean; scene: number; start: number; end: number };
export type SceneMeta = {
  id: string;
  title: string;
  sub: string;
  chip?: string;
  mono?: boolean;
};

export const timing = raw as {
  hasAudio: boolean;
  duration: number;
  scenes: { id: string; start: number; end: number }[];
  words: Word[];
};

export const f = (s: number) => Math.round(s * FPS);
export const totalFrames = Math.ceil(timing.duration * FPS);

/** Visuals lead the voice slightly so the card is on screen as the line starts. */
const LEAD = 6;

export const sceneFrames = timing.scenes.map((s, i) => {
  const from = i === 0 ? 0 : f(s.start) - LEAD;
  const next = timing.scenes[i + 1];
  const to = next ? f(next.start) - LEAD : totalFrames;
  const meta = script.scenes[i] as SceneMeta;
  return { ...meta, from, dur: to - from, index: i };
});

export const sceneById = (id: string) => sceneFrames.find((s) => s.id === id)!;

type Ctx = { from: number; dur: number; index: number; id: string };
export const SceneCtx = createContext<Ctx>({ from: 0, dur: 1, index: 0, id: "" });
export const SceneProvider = SceneCtx.Provider;
export const useScene = () => useContext(SceneCtx);

/** Local frame (inside the current scene) at which a word containing `match` starts. */
export const useWordFrame = (match: string, fallback = 0, occurrence = 0): number => {
  const { from, index } = useScene();
  const hits = timing.words.filter(
    (w) => w.scene === index && w.cap.toLowerCase().includes(match.toLowerCase()),
  );
  const w = hits[occurrence] ?? hits[0];
  return w ? f(w.start) - from : fallback;
};

export const wordFrameGlobal = (sceneId: string, match: string, fallback = 0): number => {
  const idx = timing.scenes.findIndex((s) => s.id === sceneId);
  const w = timing.words.find((x) => x.scene === idx && x.cap.toLowerCase().includes(match.toLowerCase()));
  return w ? f(w.start) : fallback;
};

export { React };
