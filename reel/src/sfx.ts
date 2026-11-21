import fs from "./sfx.json";
import { sceneById, wordFrameGlobal } from "./timing";

/** Sound effect cues, placed relative to the voice timing. Only files listed in sfx.json are used. */
const available = new Set<string>((fs as { files: string[] }).files);

const raw: { name: string; at: number; vol: number }[] = [];
const add = (name: string, at: number, vol = 0.5) => raw.push({ name, at, vol });

for (const id of ["hired", "locked", "speed", "viral", "comment", "approve", "plan", "save", "cta", "dm"]) {
  add("whoosh", sceneById(id).from, 0.32);
}
add("stamp", wordFrameGlobal("fired", "fire", 60), 0.7);
add("pop", wordFrameGlobal("hired", "hire", 0), 0.5);
add("sparkle", sceneById("hired").from + 2, 0.35);
add("unlock", wordFrameGlobal("unlock", "teen", 0) - 6, 0.45);
add("unlock", wordFrameGlobal("unlock", "teen", 0) + 4, 0.45);
add("unlock", wordFrameGlobal("unlock", "teen", 0) + 14, 0.45);
add("ding", wordFrameGlobal("speed", "4", 0) + 16, 0.45);
add("typing", sceneById("viral").from + 6, 0.35);
add("typing", sceneById("comment").from + 6, 0.35);
add("typing", sceneById("plan").from, 0.3);
add("click", wordFrameGlobal("approve", "approve", 0) + 6, 0.6);
add("impact", sceneById("danger").from + 2, 0.6);
add("alarm", wordFrameGlobal("danger", "khatarnaak", 0) - 4, 0.3);
add("click", wordFrameGlobal("plan", "click", 0) - 2, 0.6);
add("pop", wordFrameGlobal("save", "save", 0), 0.55);
add("typing", wordFrameGlobal("cta", "agent", 0) - 4, 0.3);
add("ding", wordFrameGlobal("dm", "dm", 0), 0.45);

export const sfxCues = raw.filter((c) => available.has(c.name));
