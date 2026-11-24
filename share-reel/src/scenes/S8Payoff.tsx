import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, H, INTER, MONTSERRAT, W, b, captionText, clamp, easeIn, easeOut, glass } from "../theme";
import { GlossyPlane } from "../Icons";

// global 1140-1350 (local 0-210). Odometer, flash-cut montage, final lockup.
// Local beat helper: the scene starts on global frame 1140.
const lb = (n: number) => b(n) - 1140;
const SLAM = 78;
export const CUTS = [90, 102, 114, 126, 138]; // 0.4s montage cuts (local)
export const PRESENTER_CUT = 2; // index in CUTS where the presenter plate shows
const LOCK = 150;
const WORDS = [
  { t: "VERY.", at: lb(89) },
  { t: "VERY.", at: lb(90) },
  { t: "VERY.", at: lb(91) },
  { t: "QUICKLY.", at: lb(92) },
];

const followers = (f: number) => {
  if (f < 6) return 0;
  if (f < 30) return interpolate(f, [6, 30], [0, 10000], { ...clamp, easing: easeIn });
  if (f < 50) return interpolate(f, [30, 50], [10000, 48000], clamp);
  return interpolate(f, [50, SLAM], [48000, 100000], { ...clamp, easing: easeOut });
};

const DIGIT_H = 120;
const Odometer: React.FC<{ f: number }> = ({ f }) => {
  const v = followers(f);
  const speed = Math.abs(followers(f + 1) - v);
  const cols = [5, 4, 3, 2, 1, 0];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 112, color: "#fff" }}>
      {cols.map((p, idx) => {
        const unit = Math.pow(10, p);
        // Mechanical roll: a wheel only turns while every wheel below it
        // is passing 9 -> 0, exactly like a real odometer carry.
        const lower = v % unit;
        const carry = p === 0 ? v % 1 : Math.min(1, Math.max(0, lower - (unit - 1)));
        const pos = (Math.floor(v / unit) % 10) + carry;
        const blur = Math.min(8, (speed / unit) * 0.9);
        const hide = p > 0 && v < unit - 1;
        return (
          <React.Fragment key={p}>
            {idx === 3 && v >= 999 && <span style={{ height: DIGIT_H, lineHeight: `${DIGIT_H}px` }}>,</span>}
            <div style={{ height: DIGIT_H, overflow: "hidden", width: hide ? 0 : 78 }}>
              <div style={{ translate: `0px ${-pos * DIGIT_H}px` }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
                  <div key={i} style={{ height: DIGIT_H, lineHeight: `${DIGIT_H}px`, textAlign: "center", filter: blur > 0.5 ? `blur(${blur * 0.4}px)` : undefined }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const NOTES = [
  { t: "+1 Follow", at: 56, x: 90, c: C.green },
  { t: "Shared your reel", at: 62, x: 520, c: C.cyan },
  { t: "+1 Follow", at: 68, x: 160, c: C.green },
  { t: "Shared your reel", at: 74, x: 480, c: C.cyan },
  { t: "+1 Follow", at: 82, x: 300, c: C.gold },
  { t: "Shared your reel", at: 88, x: 120, c: C.cyan },
];

const ProfileCard: React.FC<{ f: number }> = ({ f }) => {
  const rotY = Math.sin(f / 14) * 16;
  const rotX = 10 + Math.cos(f / 19) * 5;
  const burst = f - SLAM;
  const glow = f >= SLAM ? Math.exp(-burst / 10) : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #0c2a20 0%, #05070b 70%)" }}>
      {burst >= 0 && burst < 30 && (
        <div style={{ position: "absolute", left: 540 - 300, top: 800 - 300, width: 600, height: 600, borderRadius: "50%", border: `10px solid ${C.gold}`, scale: String(1 + burst * 0.18), opacity: 1 - burst / 30, boxShadow: `0 0 80px ${C.green}` }} />
      )}
      <div style={{ position: "absolute", left: 90, top: 500, width: 900, perspective: 1600 }}>
        <div
          style={{
            ...glass,
            background: "rgba(18,22,28,0.82)",
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${1 + glow * 0.06})`,
            borderRadius: 48,
            padding: "56px 50px",
            fontFamily: INTER,
            color: "#fff",
            boxShadow: `0 60px 120px rgba(0,0,0,0.6), 0 0 ${120 * glow}px rgba(25,230,140,${glow})`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <div style={{ width: 150, height: 150, borderRadius: "50%", background: `conic-gradient(${C.gold}, ${C.red}, #b83a7a, ${C.gold})`, padding: 7 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #6b4a36, #1a1210)" }} />
            </div>
            <div>
              <div style={{ fontSize: 46, fontWeight: 700 }}>@yourhandle</div>
              <div style={{ fontSize: 30, opacity: 0.6, marginTop: 6 }}>Digital Strategist</div>
            </div>
          </div>
          <div style={{ marginTop: 50, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ filter: glow > 0 ? `drop-shadow(0 0 ${30 * glow}px ${C.green})` : undefined, color: f >= SLAM ? C.green : "#fff" }}>
              <Odometer f={f} />
            </div>
            <div style={{ fontSize: 34, opacity: 0.7, letterSpacing: "0.12em", marginTop: 10 }}>FOLLOWERS</div>
          </div>
        </div>
      </div>
      {NOTES.map((n, i) => {
        const p = interpolate(f, [n.at, n.at + 8], [0, 1], { ...clamp, easing: easeOut });
        const rise = (f - n.at) * 5;
        if (f < n.at) return null;
        return (
          <div
            key={i}
            style={{
              ...glass,
              position: "absolute",
              left: n.x,
              top: 1420 - rise,
              borderRadius: 999,
              padding: "16px 30px",
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: 34,
              color: "#fff",
              opacity: p * interpolate(f, [n.at + 30, n.at + 45], [1, 0], clamp),
              scale: String(0.7 + p * 0.3),
              borderColor: n.c,
              boxShadow: `0 0 26px ${n.c}55`,
            }}
          >
            <span style={{ color: n.c }}>●</span> {n.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const ChartCut: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [0, 10], [0.3, 1], { ...clamp, easing: easeOut });
  const bars = new Array(9).fill(0).map((_, i) => 0.12 + Math.pow(i / 8, 2.2) * 0.88);
  return (
    <AbsoluteFill style={{ background: "#04140d" }}>
      <svg width={W} height={H}>
        {bars.map((v, i) => (
          <rect key={i} x={90 + i * 104} y={1500 - v * 1000 * p} width={78} height={v * 1000 * p} rx={12} fill={C.green} opacity={0.35 + 0.65 * (i / 8)} style={{ filter: `drop-shadow(0 0 18px ${C.green})` }} />
        ))}
        <path d={`M 120 1400 C 500 1350 700 1100 980 ${520 + (1 - p) * 600}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

const PlanesCut: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle, #0a2a36 0%, #05070b 75%)" }}>
    {new Array(14).fill(0).map((_, i) => {
      const ang = random(`pl${i}`) * Math.PI * 2;
      const r0 = 60 + random(`pr${i}`) * 200;
      const z = interpolate(f, [0, 12], [0.3, 3.2], { ...clamp, easing: easeIn }) * (0.6 + random(`pz${i}`) * 0.6);
      return (
        <div key={i} style={{ position: "absolute", left: 540 + Math.cos(ang) * r0 * z - 60, top: 900 + Math.sin(ang) * r0 * z - 60, scale: String(z), rotate: `${ang * 57}deg` }}>
          <GlossyPlane size={120} id={`fp${i}`} glow={0.6} />
        </div>
      );
    })}
  </AbsoluteFill>
);

export const S8Payoff: React.FC = () => {
  const f = useCurrentFrame();

  let body: React.ReactNode = null;
  if (f < CUTS[0]) body = <ProfileCard f={f} />;
  else if (f < LOCK) {
    const k = CUTS.filter((c) => f >= c).length - 1;
    const lf = f - CUTS[k];
    if (k === PRESENTER_CUT) body = null; // the plate shows through (Main)
    else if (k % 2 === 0) body = <ChartCut f={lf} />;
    else body = <PlanesCut f={lf} />;
  }

  const lock = interpolate(f, [LOCK, LOCK + 8], [0, 1], { ...clamp, easing: easeOut });
  const sheen = interpolate(f, [LOCK + 6, LOCK + 30], [-40, 140], clamp);

  return (
    <AbsoluteFill>
      {body}
      {f >= LOCK && (
        <>
          <AbsoluteFill style={{ top: 1150, height: "auto", alignItems: "center", opacity: lock, scale: String(0.8 + lock * 0.2) }}>
            <div
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 900,
                fontSize: 150,
                letterSpacing: "-0.02em",
                backgroundImage: `linear-gradient(100deg, ${C.green} 0%, ${C.green} ${sheen - 20}%, #ffffff ${sheen}%, ${C.gold} ${sheen + 20}%, ${C.gold} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 30px rgba(25,230,140,0.55)) drop-shadow(0 8px 24px rgba(0,0,0,0.7))",
              }}
            >
              0 → 100K
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ top: 1360, height: "auto", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", maxWidth: 920 }}>
              {WORDS.map((w, i) => {
                const lf = f - w.at;
                if (lf < 0) return null;
                const s = interpolate(lf, [0, 3, 6], [i === 3 ? 1.35 : 1.7, 0.96, 1], clamp);
                return (
                  <div key={i} style={{ ...captionText, fontSize: i === 3 ? 110 : 76, color: i === 3 ? C.yellow : C.white, scale: String(s), width: i === 3 ? "100%" : undefined, textAlign: "center" }}>
                    {w.t}
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
