// Procedural soundtrack for the Dubz Up pitch film.
// No samples, no external services: every sound is synthesised here.
// 120 BPM, 16 bars, 32 seconds. One bar = 2s = 60 frames at 30fps, so every
// scene cut in the video lands on a bar line.
//
//   node scripts/make-audio.mjs   ->  public/audio/soundtrack.wav

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BEAT = 0.5;
const BAR = 2;
const DUR = 32;
const N = SR * DUR;
const S16 = BEAT / 4; // one sixteenth note

// ---------- utilities ----------
let seed = 20261113;
const rnd = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const bus = () => [new Float32Array(N), new Float32Array(N)];
const buf = (sec) => new Float32Array(Math.max(1, Math.floor(sec * SR)));

const add = (b, t, mono, gain = 1, pan = 0) => {
  const start = Math.floor(t * SR);
  const a = ((pan + 1) * Math.PI) / 4;
  const gl = Math.cos(a) * gain;
  const gr = Math.sin(a) * gain;
  for (let i = 0; i < mono.length; i++) {
    const j = start + i;
    if (j < 0) continue;
    if (j >= N) break;
    b[0][j] += mono[i] * gl;
    b[1][j] += mono[i] * gr;
  }
};

class Biquad {
  constructor() {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.b0 = 1;
    this.b1 = this.b2 = this.a1 = this.a2 = 0;
  }
  set(type, f, q) {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const c = Math.cos(w);
    const al = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (type === "lp") {
      b0 = (1 - c) / 2;
      b1 = 1 - c;
      b2 = (1 - c) / 2;
    } else if (type === "hp") {
      b0 = (1 + c) / 2;
      b1 = -(1 + c);
      b2 = (1 + c) / 2;
    } else {
      b0 = al;
      b1 = 0;
      b2 = -al;
    }
    const a0 = 1 + al;
    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = (-2 * c) / a0;
    this.a2 = (1 - al) / a0;
    return this;
  }
  run(x) {
    const y =
      this.b0 * x +
      this.b1 * this.x1 +
      this.b2 * this.x2 -
      this.a1 * this.y1 -
      this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

// Band-limited saw (polyBLEP) so the chords stay clean.
const sawOsc = (freq) => {
  let ph = rnd();
  const dt = freq / SR;
  return () => {
    ph += dt;
    if (ph >= 1) ph -= 1;
    let v = 2 * ph - 1;
    if (ph < dt) {
      const t = ph / dt;
      v -= t + t - t * t - 1;
    } else if (ph > 1 - dt) {
      const t = (ph - 1) / dt;
      v -= t * t + t + t + 1;
    }
    return v;
  };
};

// ---------- instruments ----------
const kick = (weight = 1) => {
  const o = buf(0.38);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const f = 46 + 120 * Math.exp(-t / 0.032);
    ph += (2 * Math.PI * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.17);
    const click = noise() * Math.exp(-t / 0.0025) * 0.35;
    o[i] = Math.tanh((body + click) * 1.6) * weight;
  }
  return o;
};

const clap = () => {
  const o = buf(0.3);
  const f = new Biquad().set("bp", 1600, 1.1);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    let e = 0;
    for (const d of [0, 0.011, 0.022]) {
      if (t >= d) e += Math.exp(-(t - d) / 0.007);
    }
    if (t >= 0.028) e += 0.7 * Math.exp(-(t - 0.028) / 0.075);
    o[i] = f.run(noise()) * e * 1.6;
  }
  return o;
};

const snap = () => {
  const o = buf(0.14);
  const f = new Biquad().set("bp", 2600, 3);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    o[i] = f.run(noise()) * Math.exp(-t / 0.026) * 2.4;
  }
  return o;
};

const hat = (open = false) => {
  const o = buf(open ? 0.3 : 0.08);
  const f = new Biquad().set("hp", 7200, 0.8);
  const tau = open ? 0.085 : 0.016;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    o[i] = f.run(noise()) * Math.exp(-t / tau);
  }
  return o;
};

const snare = () => {
  const o = buf(0.2);
  const f = new Biquad().set("bp", 1900, 0.9);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (185 + 60 * Math.exp(-t / 0.02))) / SR;
    o[i] =
      f.run(noise()) * Math.exp(-t / 0.07) * 1.3 +
      Math.sin(ph) * Math.exp(-t / 0.06) * 0.6;
  }
  return o;
};

const tom = (freq) => {
  const o = buf(0.5);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * freq * (1 + 0.7 * Math.exp(-t / 0.04))) / SR;
    o[i] = Math.sin(ph) * Math.exp(-t / 0.2) + noise() * Math.exp(-t / 0.004) * 0.2;
  }
  return o;
};

const bassNote = (midi, dur) => {
  const o = buf(dur + 0.05);
  const f0 = mtof(midi);
  const saw = sawOsc(f0);
  const lp = new Biquad();
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    if (i % 32 === 0) lp.set("lp", 180 + 1100 * Math.exp(-t / 0.07), 1.4);
    ph += (2 * Math.PI * f0) / SR;
    const sq = Math.sin(ph) > 0 ? 0.3 : -0.3;
    const att = Math.min(1, t / 0.004);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.04) : 1;
    const amp = att * rel * (0.75 + 0.25 * Math.exp(-t / 0.1));
    o[i] = (lp.run(saw() * 0.6 + sq) + Math.sin(ph) * 0.7) * amp;
  }
  return o;
};

const stab = (notes, len = 0.32, bright = 1) => {
  const o = buf(len);
  const oscs = [];
  for (const n of notes) {
    oscs.push(sawOsc(mtof(n) * 1.004), sawOsc(mtof(n) * 0.996));
  }
  const lp = new Biquad();
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    if (i % 32 === 0) lp.set("lp", 500 + 3600 * bright * Math.exp(-t / 0.06), 1.2);
    let v = 0;
    for (const osc of oscs) v += osc();
    const amp = Math.min(1, t / 0.003) * Math.exp(-t / (len * 0.3));
    o[i] = (lp.run(v) * amp) / oscs.length;
  }
  return o;
};

// Marimba-ish pluck: fundamental plus two short inharmonic partials.
const pluck = (midi, len = 0.7) => {
  const o = buf(len);
  const f = mtof(midi);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    const w = 2 * Math.PI * f * t;
    const v =
      Math.sin(w) * Math.exp(-t / 0.22) +
      0.4 * Math.sin(w * 4) * Math.exp(-t / 0.045) +
      0.14 * Math.sin(w * 10) * Math.exp(-t / 0.012);
    o[i] = v * Math.min(1, t / 0.002);
  }
  return o;
};

const pad = (notes, dur) => {
  const o = buf(dur + 0.5);
  const oscs = [];
  for (const n of notes) {
    oscs.push(sawOsc(mtof(n) * 1.006), sawOsc(mtof(n) * 0.994));
  }
  const lp = new Biquad();
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    if (i % 64 === 0) lp.set("lp", 500 + 1400 * Math.min(1, t / dur), 0.8);
    let v = 0;
    for (const osc of oscs) v += osc();
    const att = Math.min(1, t / 0.25);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.45) : 1;
    o[i] = (lp.run(v) * att * rel) / oscs.length;
  }
  return o;
};

const pop = (f0 = 420, f1 = 980, len = 0.075) => {
  const o = buf(len);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const p = i / o.length;
    ph += (2 * Math.PI * (f0 + (f1 - f0) * p * p)) / SR;
    o[i] = Math.sin(ph) * Math.sin(Math.PI * Math.pow(p, 0.6));
  }
  return o;
};

const whoosh = (len, fa, fb) => {
  const o = buf(len);
  const f = new Biquad();
  for (let i = 0; i < o.length; i++) {
    const p = i / o.length;
    if (i % 32 === 0) f.set("bp", fa * Math.pow(fb / fa, p), 1.6);
    o[i] = f.run(noise()) * Math.pow(Math.sin(Math.PI * p), 2) * 2.2;
  }
  return o;
};

const riser = (len) => {
  const o = buf(len);
  const f = new Biquad();
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const p = i / o.length;
    if (i % 32 === 0) f.set("bp", 300 * Math.pow(28, p), 2.2);
    ph += (2 * Math.PI * (180 * Math.pow(8, p))) / SR;
    o[i] = (f.run(noise()) * 1.8 + Math.sin(ph) * 0.16) * p * p;
  }
  return o;
};

const crash = () => {
  const o = buf(1.8);
  const f = new Biquad().set("hp", 4200, 0.7);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    o[i] = f.run(noise()) * Math.exp(-t / 0.5);
  }
  return o;
};

const impact = () => {
  const o = buf(0.9);
  const f = new Biquad().set("lp", 420, 0.8);
  let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (40 + 60 * Math.exp(-t / 0.05))) / SR;
    o[i] = Math.sin(ph) * Math.exp(-t / 0.28) + f.run(noise()) * Math.exp(-t / 0.09) * 1.4;
  }
  return o;
};

// ---------- arrangement ----------
const drums = bus();
const kicks = bus();
const bass = bus();
const music = bus(); // goes through delay + reverb
const fx = bus();
const kickTimes = [];

const K = kick();
const KSOFT = kick(0.75);
const CLAP = clap();
const SNAP = snap();
const HAT = hat(false);
const OHAT = hat(true);
const SNARE = snare();
const CRASH = crash();
const IMPACT = impact();

const putKick = (t, soft = false) => {
  add(kicks, t, soft ? KSOFT : K, 0.95);
  kickTimes.push(t);
};

const CH = {
  C: { stab: [60, 64, 67], bass: 36, arp: [72, 76, 79, 84] },
  G: { stab: [59, 62, 67], bass: 31, arp: [71, 74, 79, 83] },
  Am: { stab: [60, 64, 69], bass: 33, arp: [69, 72, 76, 81] },
  F: { stab: [60, 65, 69], bass: 29, arp: [69, 72, 77, 81] },
};

// Lead melody over the two-bar loop (C G | Am F), eighth-note grid.
const MELODY = [
  [76, 79, 0, 76, 74, 0, 79, 74],
  [72, 76, 0, 81, 81, 0, 77, 79],
];

const grooveBar = (bar, chords, opts = {}) => {
  const { melody = null, octave = false, fill = false, hatsOnly = false } = opts;
  const t0 = bar * BAR;
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT;
    if (!hatsOnly) putKick(tb);
    if (b % 2 === 1) add(drums, tb, CLAP, 0.55, 0.05);
    add(drums, tb + BEAT / 2, OHAT, 0.1, 0.25);
    for (let s = 0; s < 4; s++) {
      if (s === 2) continue;
      add(drums, tb + s * S16 + (s % 2 ? 0.012 : 0), HAT, s === 0 ? 0.1 : 0.055, -0.25);
    }
  }
  chords.forEach((name, h) => {
    const c = CH[name];
    const th = t0 + h * 2 * BEAT;
    // Tresillo stabs: sixteenths 0, 3, 6.
    [0, 3, 6].forEach((s, k) => {
      add(music, th + s * S16, stab(c.stab), 0.5, k % 2 ? 0.35 : -0.35);
    });
    // Bouncing bass.
    add(bass, th, bassNote(c.bass, 0.2), 0.8);
    add(bass, th + 3 * S16, bassNote(c.bass, 0.1), 0.7);
    add(bass, th + 4 * S16, bassNote(c.bass + 12, 0.09), 0.6);
    add(bass, th + 6 * S16, bassNote(c.bass, 0.16), 0.75);
  });
  if (melody) {
    melody.forEach((m, i) => {
      if (!m) return;
      const t = t0 + i * (BEAT / 2);
      add(music, t, pluck(m), 0.42, i % 2 ? 0.2 : -0.2);
      if (octave) add(music, t, pluck(m + 12, 0.5), 0.2, i % 2 ? -0.3 : 0.3);
    });
  }
  if (fill) {
    for (let s = 0; s < 4; s++) {
      add(drums, t0 + 3 * BEAT + s * S16, SNARE, 0.25 + s * 0.09, 0.1);
    }
  }
};

// --- Bars 0-1: hook. Plucks and snaps, then everything drops to one note.
["C", "G"].forEach((name, h) => {
  CH[name].arp.forEach((m, i) => {
    add(music, h * 2 * BEAT + i * (BEAT / 2), pluck(m), 1.0, i % 2 ? 0.3 : -0.3);
  });
});
add(drums, 1 * BEAT, SNAP, 0.8);
add(drums, 3 * BEAT, SNAP, 0.8);
for (let i = 0; i < 8; i++) add(drums, i * (BEAT / 2), HAT, i % 2 ? 0.05 : 0.09, -0.2);
// Speech bubbles popping in (one every 3 frames from frame 2).
for (let i = 0; i < 10; i++) {
  const f = 300 + i * 55;
  add(fx, (2 + i * 3) / 30, pop(f, f * 2.1), 0.6, -0.6 + (i % 5) * 0.3);
}
add(fx, 1.72, whoosh(0.5, 400, 3000), 0.4);
// "Your video speaks one."
add(fx, 2.0, IMPACT, 0.75);
add(bass, 2.0, bassNote(33, 1.7), 0.9);
add(music, 2.0, pluck(69, 1.2), 0.9);
add(music, 2.6, pop(520, 300, 0.12), 0.35); // the lonely bubble lands
add(music, 3.0, pluck(76, 1.2), 0.7, 0.3);
add(music, 3.5, pluck(72, 1.0), 0.5, -0.3);
add(fx, 3.62, whoosh(0.6, 300, 4000), 0.5);

// --- Bars 2-3: the problem. Half-time, minor, then a riser into the drop.
add(fx, 4.0, IMPACT, 0.8);
[0, 2].forEach((b) => putKick(4 + b * BEAT));
[0, 2].forEach((b) => putKick(6 + b * BEAT));
add(drums, 4 + 1 * BEAT, SNAP, 0.4);
for (let i = 0; i < 8; i++) add(bass, 4 + i * (BEAT / 2), bassNote(33, 0.14), i % 2 ? 0.5 : 0.75);
for (let i = 0; i < 4; i++) add(bass, 6 + i * (BEAT / 2), bassNote(29, 0.14), i % 2 ? 0.5 : 0.75);
for (let i = 0; i < 4; i++) add(bass, 7 + i * (BEAT / 2), bassNote(31, 0.14), i % 2 ? 0.5 : 0.75);
add(music, 4.0, stab(CH.Am.stab, 0.6, 0.5), 0.6);
add(music, 6.0, stab(CH.F.stab, 0.6, 0.6), 0.55);
add(music, 7.0, stab(CH.G.stab, 0.6, 0.8), 0.55);
// Three cards slam in on beats 3, 4 and the next 1.
[5.0, 5.5, 6.0].forEach((t, i) => {
  add(fx, t, tom(150 - i * 22), 0.7, -0.5 + i * 0.5);
  add(drums, t, CLAP, 0.4, -0.5 + i * 0.5);
});
add(fx, 6.0, riser(2.0), 0.36);
for (let s = 0; s < 8; s++) add(drums, 7 + s * S16, SNARE, 0.12 + s * 0.055);
add(fx, 7.25, whoosh(0.7, 3000, 250), 0.5); // cards fall away

// --- Bars 4-9: the drop. Full groove under the reveal and the product walk-through.
add(drums, 8.0, CRASH, 0.28);
add(fx, 8.0, IMPACT, 0.7);
add(fx, 8.0, pop(300, 1400, 0.16), 0.5);
const LOOP = [
  ["C", "G"],
  ["Am", "F"],
];
for (let bar = 4; bar <= 9; bar++) {
  const k = (bar - 4) % 2;
  grooveBar(bar, LOOP[k], { melody: bar >= 5 ? MELODY[k] : MELODY[k].map((m, i) => (i < 4 ? m : 0)), fill: bar === 9 });
}
// Tagline chips land on beats.
[10.0, 10.5, 11.0].forEach((t, i) => add(fx, t, pop(500 + i * 160, 1100 + i * 260, 0.09), 0.4, -0.4 + i * 0.4));
// Step changes in the walk-through.
[12, 14, 16, 18].forEach((t, i) => {
  add(fx, t - 0.16, whoosh(0.34, 600, 5000), 0.32, i % 2 ? 0.4 : -0.4);
  add(fx, t, pop(600, 1500, 0.08), 0.35);
});
add(drums, 12.0, CRASH, 0.15);
add(drums, 16.0, CRASH, 0.13);
add(fx, 12.66, tom(110), 0.35); // file lands in the drop zone
add(fx, 13.6, pop(900, 1800, 0.07), 0.3); // upload tick
// Language chips toggling on, one per sixteenth.
for (let i = 0; i < 8; i++) {
  const f = 520 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16][i] / 12);
  add(fx, 16.5 + i * S16, pop(f, f * 1.5, 0.06), 0.3, -0.5 + (i % 4) * 0.33);
}
add(fx, 18.2, pop(260, 1200, 0.14), 0.45); // "Dub it" press
add(fx, 19.3, riser(0.7), 0.3);

// --- Bars 10-11: market. Kick drops out, pads and three booms, then a build.
add(drums, 20.0, CRASH, 0.22);
add(fx, 20.0, IMPACT, 0.6);
add(music, 20.0, pad(CH.F.stab.concat(53), 1.9), 0.5);
add(music, 22.0, pad(CH.G.stab.concat(55), 1.9), 0.5);
add(bass, 20.0, bassNote(29, 1.8), 0.55);
add(bass, 22.0, bassNote(31, 1.8), 0.55);
for (let i = 0; i < 16; i++) {
  const c = i < 8 ? CH.F : CH.G;
  add(music, 20 + i * (BEAT / 2), pluck(c.arp[i % 4], 0.4), 0.2, i % 2 ? 0.5 : -0.5);
  add(drums, 20 + i * (BEAT / 2), HAT, i % 2 ? 0.07 : 0.12, 0.2);
}
[20.5, 21.0, 21.5].forEach((t, i) => {
  add(fx, t, tom(90 + i * 30), 0.8, -0.3 + i * 0.3);
  add(fx, t, pop(300 + i * 150, 700 + i * 300, 0.1), 0.3);
});
[0, 1, 2, 3].forEach((b) => putKick(22 + b * BEAT, true));
add(fx, 22.0, riser(2.0), 0.36);
for (let s = 0; s < 8; s++) add(drums, 23 + s * S16, SNARE, 0.12 + s * 0.06);

// --- Bars 12-13: traction. Groove returns with the melody doubled an octave up.
add(drums, 24.0, CRASH, 0.28);
add(fx, 24.0, IMPACT, 0.65);
grooveBar(12, LOOP[0], { melody: MELODY[0], octave: true });
grooveBar(13, LOOP[1], { melody: MELODY[1], octave: true, fill: true });
// Chart bars pop up, then three stat stickers on beats.
for (let i = 0; i < 6; i++) {
  const f = 400 * Math.pow(2, [0, 2, 4, 7, 9, 12][i] / 12);
  add(fx, 24.27 + i * 0.1, pop(f, f * 1.6, 0.06), 0.26, -0.5);
}
[25.0, 25.5, 26.0].forEach((t, i) => add(fx, t, pop(600 + i * 150, 1300 + i * 300, 0.09), 0.38, 0.5));

// --- Bars 14-15: the ask. One more bar of groove, then a final chord that rings out.
add(drums, 28.0, CRASH, 0.24);
grooveBar(14, LOOP[0], { melody: MELODY[0], octave: true, fill: true });
add(fx, 29.3, riser(0.7), 0.4);
putKick(30.0);
add(drums, 30.0, CRASH, 0.32);
add(fx, 30.0, IMPACT, 0.8);
add(music, 30.0, stab([48, 60, 64, 67, 72], 2.0, 1), 0.85);
add(bass, 30.0, bassNote(36, 0.55), 0.75);
[72, 76, 79, 84, 88].forEach((m, i) => add(music, 30.0 + i * S16, pluck(m, 1.4), 0.34, -0.5 + i * 0.25));
add(fx, 30.0, pop(400, 1600, 0.16), 0.45);

// ---------- mix ----------
// Sidechain: bass and music duck under every kick.
const duck = new Float32Array(N).fill(1);
for (const t of kickTimes) {
  const s = Math.floor(t * SR);
  const len = Math.floor(0.4 * SR);
  for (let i = 0; i < len && s + i < N; i++) {
    const d = 1 - 0.55 * Math.exp(-(i / SR) / 0.1);
    if (d < duck[s + i]) duck[s + i] = d;
  }
}

// Ping-pong delay (dotted eighth) on the music bus.
const D = Math.floor(0.375 * SR);
const wetL = new Float32Array(N);
const wetR = new Float32Array(N);
for (let i = D; i < N; i++) {
  wetL[i] = (music[1][i - D] + wetR[i - D] * 0.6) * 0.42;
  wetR[i] = (music[0][i - D] + wetL[i - D] * 0.6) * 0.42;
}

// Small Schroeder reverb fed by music, claps and effects.
const reverb = (input) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, b: new Float32Array(d), i: 0, lp: 0 }));
  const aps = [225, 556].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  for (let n = 0; n < N; n++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.b[c.i];
      c.lp = y * 0.75 + c.lp * 0.25;
      c.b[c.i] = input[n] + c.lp * 0.8;
      c.i = (c.i + 1) % c.d;
      acc += y;
    }
    let v = acc * 0.25;
    for (const a of aps) {
      const y = a.b[a.i];
      const x = v + y * 0.5;
      a.b[a.i] = x;
      a.i = (a.i + 1) % a.d;
      v = y - x * 0.5;
    }
    out[n] = v;
  }
  return out;
};
const send = [new Float32Array(N), new Float32Array(N)];
for (let ch = 0; ch < 2; ch++) {
  for (let i = 0; i < N; i++) {
    send[ch][i] = music[ch][i] * 0.5 + fx[ch][i] * 0.35 + drums[ch][i] * 0.07;
  }
}
const rv = [reverb(send[0]), reverb(send[1])];
const wets = [wetL, wetR];

const out = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let ch = 0; ch < 2; ch++) {
  for (let i = 0; i < N; i++) {
    const m =
      kicks[ch][i] * 0.9 +
      drums[ch][i] * 0.8 +
      bass[ch][i] * 0.5 * duck[i] +
      (music[ch][i] + wets[ch][i]) * 0.62 * duck[i] +
      fx[ch][i] * 0.6 +
      rv[ch === 0 ? 1 : 0][i] * 0.22;
    const v = Math.tanh(m * 0.85);
    out[ch][i] = v;
    if (Math.abs(v) > peak) peak = Math.abs(v);
  }
}
const norm = 0.92 / peak;
const fadeIn = Math.floor(0.004 * SR);
const fadeOut = Math.floor(0.35 * SR);

const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  let g = norm;
  if (i < fadeIn) g *= i / fadeIn;
  if (i > N - fadeOut) g *= (N - i) / fadeOut;
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[0][i] * g)) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[1][i] * g)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "soundtrack.wav");
fs.writeFileSync(file, Buffer.concat([header, pcm]));
console.log(`Wrote ${path.relative(process.cwd(), file)} (${DUR}s, peak ${peak.toFixed(2)} before normalise)`);
