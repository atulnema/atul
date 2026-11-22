import { makeReel, Script, Timing } from "../timing";
import type { ReelDef } from "./types";
import agentScript from "./agent/script.json";
import agentTiming from "./agent/timing.json";
import { CARDS as agentCards } from "./agent/cards";
import { agentSfx } from "./agent/sfx";
import paymentScript from "./payment/script.json";
import paymentTiming from "./payment/timing.json";
import { CARDS as paymentCards } from "./payment/cards";
import { paymentSfx } from "./payment/sfx";

export const REELS: Record<string, ReelDef> = {
  agent: { data: makeReel("agent", agentScript as Script, agentTiming as Timing), cards: agentCards, sfx: agentSfx },
  payment: { data: makeReel("payment", paymentScript as Script, paymentTiming as Timing), cards: paymentCards, sfx: paymentSfx, motion: true, background: "ledger", music: "music/payment.mp3" },
};
