import React from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { C, H, W } from "./theme";

/**
 * The "presenter plate": everything the camera sees in the studio.
 *
 * With no `presenterSrc`, a stylised backlit stand-in is drawn so the
 * motion-graphics timing can be judged before footage exists. Pass a
 * file in /public (e.g. "presenter.mp4") to drop the real take in; every
 * camera move in Main.tsx is then applied to the footage itself.
 */
export type PlateProps = {
  presenterSrc?: string;
  /** Whole-frame camera scale (crash zooms, micro zooms, pull-backs). */
  scale: number;
  /** Extra scale on the background only - used for the vertigo dolly. */
  bgScale: number;
  /** 0..1 background exposure drop (spotlight isolation). */
  dim: number;
  /** Rendered between the set and the presenter (2.5D parallax text). */
  midground?: React.ReactNode;
};

const ORIGIN = "50% 40%"; // roughly between the eyes

const Bokeh: React.FC<{ f: number }> = ({ f }) => {
  const dots = new Array(26).fill(0).map((_, i) => {
    const x = random(`bx${i}`) * W;
    const y = 120 + random(`by${i}`) * 1250;
    const r = 18 + random(`br${i}`) * 62;
    const hue = random(`bh${i}`);
    const color = hue < 0.55 ? "#ffb35c" : hue < 0.85 ? C.teal : "#fff1dc";
    const o = 0.12 + random(`bo${i}`) * 0.32;
    const dx = Math.sin(f / (70 + i * 3) + i) * 6;
    const dy = Math.cos(f / (90 + i * 2) + i) * 4;
    return (
      <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={color} opacity={o} />
    );
  });
  return <g filter="url(#bokehBlur)">{dots}</g>;
};

const Shelves: React.FC = () => {
  const spines: React.ReactNode[] = [];
  const shelfY = [430, 720, 1010];
  const palette = ["#3b2a20", "#26323a", "#4a3324", "#1d2a2f", "#5a3d28", "#2e2622"];
  shelfY.forEach((sy, row) => {
    for (const side of [0, 1]) {
      let x = side === 0 ? 10 : 640;
      const end = side === 0 ? 330 : 1070;
      let k = 0;
      while (x < end) {
        const w = 16 + random(`sw${row}${side}${k}`) * 26;
        const h = 150 + random(`sh${row}${side}${k}`) * 90;
        spines.push(
          <rect
            key={`${row}-${side}-${k}`}
            x={x}
            y={sy - h}
            width={w}
            height={h}
            rx={3}
            fill={palette[Math.floor(random(`sc${row}${side}${k}`) * palette.length)]}
          />,
        );
        x += w + 3;
        k++;
      }
    }
    spines.push(
      <rect key={`shelf${row}`} x={0} y={sy} width={W} height={12} fill="#120d0a" />,
    );
  });
  return (
    <g filter="url(#shelfBlur)" opacity={0.55}>
      {spines}
    </g>
  );
};

const StudioSet: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="setKey" cx="0.36" cy="0.34" r="0.75">
        <stop offset="0" stopColor="#33221a" />
        <stop offset="0.5" stopColor="#0b1016" />
        <stop offset="1" stopColor="#040509" />
      </radialGradient>
      <radialGradient id="setTeal" cx="0.85" cy="0.25" r="0.55">
        <stop offset="0" stopColor={C.tealDeep} stopOpacity="0.9" />
        <stop offset="1" stopColor={C.tealDeep} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.amber} />
        <stop offset="0.55" stopColor="#ffd9a0" />
        <stop offset="1" stopColor={C.cyan} />
      </linearGradient>
      <filter id="bokehBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id="shelfBlur">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <filter id="tubeGlow" x="-400%" y="-10%" width="900%" height="120%">
        <feGaussianBlur stdDeviation="28" />
      </filter>
    </defs>
    <rect width={W} height={H} fill="url(#setKey)" />
    <rect width={W} height={H} fill="url(#setTeal)" />
    <Shelves />
    <Bokeh f={f} />
    <rect x={128} y={240} width={70} height={1140} rx={35} fill="url(#tube)" filter="url(#tubeGlow)" opacity={0.75} />
    <rect x={150} y={260} width={24} height={1100} rx={12} fill="url(#tube)" opacity={0.95} />
  </svg>
);

const StandIn: React.FC<{ f: number }> = ({ f }) => {
  // Slight breathing + head motion so the plate never feels frozen.
  const breathe = Math.sin(f / 22) * 3;
  const headX = Math.sin(f / 41) * 5;
  const headR = Math.sin(f / 53) * 1.2;
  const torso =
    "M 90 1920 L 100 1420 C 110 1250 200 1170 330 1130 C 420 1102 460 1080 470 1030 L 475 930 L 605 930 L 610 1030 C 620 1080 660 1102 750 1130 C 880 1170 970 1250 980 1420 L 990 1920 Z";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="torsoFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a1a12" />
          <stop offset="0.3" stopColor="#120d0b" />
          <stop offset="0.7" stopColor="#07090c" />
          <stop offset="1" stopColor="#0b1418" />
        </linearGradient>
        <radialGradient id="headFill" cx="0.3" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#7a4f36" />
          <stop offset="0.38" stopColor="#3a2418" />
          <stop offset="0.75" stopColor="#120c0a" />
          <stop offset="1" stopColor="#07080a" />
        </radialGradient>
        <linearGradient id="rimR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.55" stopColor={C.teal} stopOpacity="0" />
          <stop offset="1" stopColor={C.teal} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="rimL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc27a" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#ffc27a" stopOpacity="0" />
        </linearGradient>
        <filter id="rimBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g transform={`translate(0 ${breathe})`}>
        <path d={torso} fill="url(#torsoFill)" />
        <path d={torso} fill="none" stroke="url(#rimR)" strokeWidth={8} filter="url(#rimBlur)" />
        <path d={torso} fill="none" stroke="url(#rimL)" strokeWidth={5} filter="url(#rimBlur)" />
        {/* crew neck */}
        <path d="M 468 1036 C 500 1082 580 1082 612 1036" fill="none" stroke="#1c2026" strokeWidth={10} />
        <g transform={`translate(${headX} 0) rotate(${headR} 540 900)`}>
          <ellipse cx={540} cy={760} rx={142} ry={178} fill="url(#headFill)" />
          {/* hair mass */}
          <path d="M 400 735 C 395 610 460 568 540 566 C 625 566 690 612 682 735 C 668 660 620 630 540 630 C 465 630 415 660 400 735 Z" fill="#07080a" />
          <ellipse cx={540} cy={760} rx={142} ry={178} fill="none" stroke="url(#rimR)" strokeWidth={9} filter="url(#rimBlur)" />
          <ellipse cx={540} cy={760} rx={142} ry={178} fill="none" stroke="url(#rimL)" strokeWidth={6} filter="url(#rimBlur)" />
        </g>
      </g>
    </svg>
  );
};

const Mic: React.FC = () => (
  <svg
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
    style={{ position: "absolute", filter: "blur(3px)" }}
  >
    <defs>
      <linearGradient id="micBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#25292f" />
        <stop offset="0.45" stopColor="#0d0f12" />
        <stop offset="1" stopColor="#030405" />
      </linearGradient>
    </defs>
    <g transform="rotate(-18 600 1760)">
      <rect x={600} y={1820} width={26} height={200} fill="#0a0b0d" />
      <path d="M 470 1690 L 470 1800 C 470 1850 760 1850 760 1800 L 760 1690" fill="none" stroke="#111317" strokeWidth={18} />
      <rect x={490} y={1540} width={250} height={330} rx={120} fill="url(#micBody)" />
      <ellipse cx={615} cy={1580} rx={118} ry={58} fill="#08090b" />
      <rect x={492} y={1560} width={246} height={300} rx={118} fill="none" stroke={C.teal} strokeOpacity={0.25} strokeWidth={3} />
    </g>
  </svg>
);

export const Plate: React.FC<PlateProps> = ({ presenterSrc, scale, bgScale, dim, midground }) => {
  const f = useCurrentFrame();
  const driftX = Math.sin(f / 37) * 4 + Math.sin(f / 13) * 1.2;
  const driftY = Math.cos(f / 53) * 3 + Math.cos(f / 17) * 1;
  const driftR = Math.sin(f / 61) * 0.18;

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        translate: `${driftX}px ${driftY}px`,
        rotate: `${driftR}deg`,
        transformOrigin: ORIGIN,
      }}
    >
      {presenterSrc ? (
        <>
          <Video
            src={staticFile(presenterSrc)}
            style={{ width: W, height: H, objectFit: "cover" }}
          />
          {midground}
        </>
      ) : (
        <>
          <AbsoluteFill style={{ scale: String(bgScale), transformOrigin: ORIGIN }}>
            <StudioSet f={f} />
            <AbsoluteFill style={{ background: "#000", opacity: dim }} />
          </AbsoluteFill>
          {midground}
          <StandIn f={f} />
          <Mic />
        </>
      )}
      {/* spotlight: darken everything but the face when dimmed */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 520px 640px at 50% 42%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)",
          opacity: dim * 2.4,
        }}
      />
    </AbsoluteFill>
  );
};
