import type React from "react";
import type { ReelData } from "../timing";

export type Cue = { name: string; at: number; vol: number };
export type ReelDef = { data: ReelData; cards: Record<string, React.FC>; sfx: (r: ReelData) => Cue[] };
