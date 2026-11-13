import React from "react";
import { AbsoluteFill } from "remotion";
import { Chars } from "../components/Chars";
import { clamp, ease, mix, rand, tw, useBeat, wipe } from "../lib/anim";
import { C, F } from "../lib/theme";

// ---------------------------------------------------------------------------
// Part 1 (beats 0–4): a tilted wall of capabilities, every row a marquee,
// one row lighting up per beat.
// ---------------------------------------------------------------------------

const CAPABILITIES = [
  "Search Engine Optimisation",
  "Performance Marketing",
  "Brand Strategy",
  "Web Design & Development",
  "Content That Ranks",
  "Social Media",
  "Conversion Optimisation",
  "Analytics & Tracking",
  "Search Engine Optimisation",
];
const ROW = 176;
const LIT = [4, 2, 5, 3];

/** Constant drift plus a shove on every beat, so the wall breathes with the kick. */
const travel = (b: number) => {
  let x = b * 150;
  for (let n = 0; n < 5; n++) x += 190 * tw(b, n, n + 0.7, ease.out);
  return x;
};

const Wall: React.FC<{ b: number }> = ({ b }) => {
  const tiltAway = tw(b, 3.5, 4.0, ease.in);
  const lit = LIT[Math.min(3, Math.floor(b))];
  const pulse = 1 - tw(b - Math.floor(b), 0, 0.5, ease.out);
  return (
    <AbsoluteFill style={{ background: C.ink, perspective: 1500, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 960 - 2000,
          top: 540 - (CAPABILITIES.length * ROW) / 2,
          width: 4000,
          transformStyle: "preserve-3d",
          transform: `translateY(${mix(tw(b, 0, 4, ease.linear), 90, -90)}px) rotateX(${mix(tiltAway, 34, 89.5)}deg) rotateZ(${mix(tw(b, 0, 4, ease.soft), -11, -6)}deg) scale(${mix(tw(b, 0, 4, ease.linear), 1.02, 1.2)})`,
        }}
      >
        {CAPABILITIES.map((cap, k) => {
          const dir = k % 2 ? 1 : -1;
          const enter = 1 - tw(b, 0.04 + k * 0.03, 0.7 + k * 0.03, ease.out);
          const x = dir * (travel(b) * (0.7 + rand(k) * 0.6) + enter * 1700) - 900 - rand(k + 9) * 500;
          const on = k === lit;
          return (
            <div
              key={k}
              style={{
                height: ROW,
                lineHeight: `${ROW}px`,
                whiteSpace: "nowrap",
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 158,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                translate: `${x}px 0`,
                color: on ? C.acid : "transparent",
                WebkitTextStroke: on ? "0px" : `2px rgba(242,239,233,${0.3 + (k % 3) * 0.06})`,
                textShadow: on ? `0 0 ${60 * pulse}px rgba(200,255,77,${0.7 * pulse})` : "none",
              }}
            >
              {[0, 1, 2, 3].map((r) => (
                <span key={r}>
                  {cap}
                  <span style={{ color: on ? C.iris : "transparent", WebkitTextStroke: on ? "0px" : "2px rgba(124,92,255,0.7)", padding: "0 0.28em" }}>
                    ✦
                  </span>
                </span>
              ))}
            </div>
          );
        })}
      </div>
      {/* depth fog, top and bottom */}
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${C.ink} 0%, transparent 26%, transparent 74%, ${C.ink} 100%)` }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Part 2 (beats 4–8): the process as a growth curve. Discover, Strategise,
// Execute, Scale: then the line goes vertical and takes the camera with it.
// ---------------------------------------------------------------------------

const X0 = 330;
const XW = 1300;
const BASE = 900;
const curveY = (u: number) => (u <= 1 ? BASE - 20 - 620 * u * u : BASE - 640 - 1240 * (u - 1) - 2600 * (u - 1) * (u - 1));
const curveX = (u: number) => X0 + XW * (u <= 1 ? u : 1 + 0.14 * (1 - Math.exp(-(u - 1) * 7)));

const NODES = [
  { u: 0.12, at: 4.5, label: "Discover" },
  { u: 0.4, at: 5.25, label: "Strategise" },
  { u: 0.68, at: 6.0, label: "Execute" },
  { u: 0.94, at: 6.75, label: "Scale" },
];

const headU = (b: number) => {
  if (b < 6.75) {
    const keys = [4.2, 4.5, 5.25, 6.0, 6.75];
    const vals = [0, 0.12, 0.4, 0.68, 0.94];
    for (let i = 0; i < 4; i++) {
      if (b <= keys[i + 1]) return mix(tw(b, keys[i], keys[i + 1], ease.inOut), vals[i], vals[i + 1]);
    }
  }
  return 0.94 + 1.5 * tw(b, 6.75, 8.0, ease.in);
};

const Process: React.FC<{ b: number }> = ({ b }) => {
  const u = headU(b);
  const hx = curveX(u);
  const hy = curveY(u);
  const tiltIn = tw(b, 4.0, 4.55, ease.out);
  // Once the line clears the chart, the camera chases it upward.
  const camY = Math.max(0, 330 - hy);
  const speed = (curveY(headU(b - 0.02)) - hy) / 0.02; // px per beat
  const streak = clamp(speed / 2500);

  const pts: string[] = [];
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const uu = (u * i) / steps;
    pts.push(`${curveX(uu).toFixed(1)},${curveY(uu).toFixed(1)}`);
  }
  const line = pts.join(" ");
  const area = `${X0},${BASE} ${line} ${hx.toFixed(1)},${BASE}`;
  const whiteout = tw(b, 7.45, 7.97, ease.in);

  return (
    <AbsoluteFill style={{ background: C.ink, perspective: 1500, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `rotateX(${mix(tiltIn, -88, 0)}deg) scale(${mix(tiltIn, 1.3, 1)})`,
          transformOrigin: "50% 50%",
        }}
      >
        <AbsoluteFill style={{ translate: `0 ${camY}px` }}>
          {/* endless graph paper */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -6000,
              height: 7080,
              backgroundImage:
                "linear-gradient(to right, rgba(242,239,233,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,239,233,0.1) 1px, transparent 1px)",
              backgroundSize: "90px 90px",
              backgroundPosition: "40px 0",
            }}
          />
          <svg width={1920} height={7080} viewBox="0 -6000 1920 7080" style={{ position: "absolute", left: 0, top: -6000 }}>
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.acid} stopOpacity={0.3} />
                <stop offset="1" stopColor={C.acid} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stroke" gradientUnits="userSpaceOnUse" x1={X0} y1="0" x2={X0 + XW} y2="0">
                <stop offset="0" stopColor={C.iris} />
                <stop offset="0.55" stopColor={C.acid} />
              </linearGradient>
            </defs>
            {/* axes */}
            <path d={`M${X0} ${BASE}H${X0 + XW + 60}`} stroke="rgba(242,239,233,0.35)" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tw(b, 4.1, 4.8)} />
            <path d={`M${X0} ${BASE}V170`} stroke="rgba(242,239,233,0.35)" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tw(b, 4.1, 4.8)} />
            {u <= 1.02 && <polygon points={area} fill="url(#area)" />}
            {/* glow pass + crisp pass */}
            <polyline points={line} fill="none" stroke={C.acid} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={0.22} style={{ filter: "blur(14px)" }} />
            <polyline points={line} fill="none" stroke="url(#stroke)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            {NODES.map((n, i) => {
              const p = tw(b, n.at - 0.04, n.at + 0.3, ease.back);
              const ring = tw(b, n.at, n.at + 0.7, ease.out);
              const x = curveX(n.u);
              const y = curveY(n.u);
              if (b < n.at - 0.04) return null;
              return (
                <g key={i}>
                  <path d={`M${x} ${y + 26}V${BASE}`} stroke="rgba(242,239,233,0.3)" strokeWidth={2} strokeDasharray="5 9" opacity={tw(b, n.at, n.at + 0.3)} />
                  <circle cx={x} cy={y} r={18 + ring * 60} fill="none" stroke={C.acid} strokeWidth={3} opacity={1 - ring} />
                  <circle cx={x} cy={y} r={18 * p} fill={C.ink} stroke={C.acid} strokeWidth={6} />
                  <circle cx={x} cy={y} r={6 * p} fill={C.acid} />
                </g>
              );
            })}
            {/* head */}
            <circle cx={hx} cy={hy} r={34} fill={C.acid} opacity={0.25} style={{ filter: "blur(10px)" }} />
            <circle cx={hx} cy={hy} r={13} fill={C.bone} />
          </svg>

          {/* labels sit above-left of each node, clear of the line */}
          {NODES.map((n, i) => {
            if (b < n.at - 0.05) return null;
            const x = curveX(n.u);
            const y = curveY(n.u);
            return (
              <div key={i} style={{ position: "absolute", right: 1920 - x + 34, top: y - 150, textAlign: "right" }}>
                <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.14em", color: C.acid, opacity: tw(b, n.at, n.at + 0.25) }}>
                  0{i + 1}
                </div>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 82, letterSpacing: "-0.045em", color: C.bone, lineHeight: 1, marginTop: 6 }}>
                  <Chars text={n.label} b={b} at={n.at - 0.04} stagger={0.018} dur={0.42} />
                </div>
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: X0 + 70,
              top: 214,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontSize: 132,
              lineHeight: 1,
              color: C.bone,
            }}
          >
            <Chars text="The process." b={b} at={4.25} stagger={0.02} dur={0.5} />
          </div>
          <div style={{ position: "absolute", left: X0 + 18, top: 150, fontFamily: F.mono, fontSize: 20, letterSpacing: "0.16em", color: C.mist, opacity: tw(b, 4.5, 4.9) }}>
            GROWTH ↑
          </div>
          <div style={{ position: "absolute", left: X0 + XW - 40, top: BASE + 22, fontFamily: F.mono, fontSize: 20, letterSpacing: "0.16em", color: C.mist, opacity: tw(b, 4.5, 4.9) }}>
            TIME →
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* speed streaks while the camera climbs */}
      {streak > 0.02 &&
        Array.from({ length: 34 }).map((_, i) => {
          const len = 160 + rand(i) * 520;
          const y = ((rand(i + 40) * 1600 + camY * (0.6 + rand(i + 80))) % 1700) - 400;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: rand(i + 3) * 1920,
                top: y,
                width: 2 + rand(i + 7) * 3,
                height: len * streak,
                borderRadius: 3,
                background: `linear-gradient(to bottom, transparent, ${i % 4 === 0 ? C.iris : C.acid})`,
                opacity: streak * (0.25 + rand(i + 5) * 0.55),
              }}
            />
          );
        })}

      {/* the head overtakes the frame: hand-off to the last scene */}
      <div
        style={{
          position: "absolute",
          left: hx - 60,
          top: hy + camY - 60,
          width: 120,
          height: 120,
          borderRadius: 60,
          background: C.acid,
          scale: String(whiteout * 64),
        }}
      />
    </AbsoluteFill>
  );
};

export const Engine: React.FC = () => {
  const b = useBeat();
  return (
    <AbsoluteFill style={{ background: C.acid }}>
      <AbsoluteFill style={{ clipPath: wipe("up", tw(b, 0, 0.36, ease.inOut)) }}>
        {b < 4 ? <Wall b={b} /> : <Process b={b} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
