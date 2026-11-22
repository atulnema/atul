import type { ReelData } from "../../timing";
import type { Cue } from "../types";

/** Sound effect cues for the payment reel, placed relative to the voice timing. */
export const paymentSfx = ({ sceneById, wordFrameGlobal }: ReelData): Cue[] => {
  const cues: Cue[] = [];
  const add = (name: string, at: number, vol = 0.5) => cues.push({ name, at, vol });
  for (const id of ["kal", "rude", "wrong", "ladder", "upi", "tool", "cta"]) add("whoosh", sceneById(id).from, 0.3);
  add("pop", wordFrameGlobal("done", "kaam", 0), 0.45);
  add("pop", wordFrameGlobal("done", "khush", 0), 0.45);
  add("alarm", wordFrameGlobal("done", "payment", 0), 0.25);
  add("typing", sceneById("kal").from + 4, 0.3);
  add("click", wordFrameGlobal("kal", "teen", 0), 0.5);
  add("click", wordFrameGlobal("kal", "baarah", 0), 0.5);
  add("impact", wordFrameGlobal("kal", "sattaees", 0), 0.5);
  add("stamp", wordFrameGlobal("wrong", "galat", 0), 0.6);
  add("ding", wordFrameGlobal("ladder", "friendly", 0), 0.35);
  add("ding", wordFrameGlobal("ladder", "date", 0), 0.35);
  add("ding", wordFrameGlobal("ladder", "final", 0), 0.35);
  add("click", wordFrameGlobal("upi", "tap", 0) - 2, 0.6);
  add("ding", wordFrameGlobal("upi", "tap", 0) + 4, 0.5);
  add("typing", wordFrameGlobal("tool", "naam", 0) - 6, 0.3);
  add("sparkle", sceneById("tool").from + 2, 0.35);
  add("typing", wordFrameGlobal("cta", "payment", 0) - 4, 0.3);
  add("pop", wordFrameGlobal("cta", "dost", 0) + 20, 0.5);
  return cues;
};
