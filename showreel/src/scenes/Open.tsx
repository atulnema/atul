import React from "react";
import { AbsoluteFill } from "remotion";
import { Chars } from "../components/Chars";
import { Grid } from "../components/Overlays";
import { clamp, ease, mix, tw, useBeat, wipe } from "../lib/anim";
import { C, F } from "../lib/theme";

// ---------------------------------------------------------------------------
// Part 1 (beats 0–4): the mark is drafted on a blueprint, inked, then the
// camera punches straight through it into the headline.
// ---------------------------------------------------------------------------

const S = 13.125; // 32-unit logo grid → 420px
const OX = 750;
const OY = 330;
const px = (x: number, y: number) => [OX + x * S, OY + y * S] as const;
const MARK = "M16 2 30 30H22L16 17 10 30H2L16 2Z";
const FACET = "M16 2 30 30H22L16 17Z";

const VERTS: [number, number, string][] = [
  [16, 2, "16.0 / 02.0"],
  [2, 30, "02.0 / 30.0"],
  [30, 30, "30.0 / 30.0"],
  [16, 17, "16.0 / 17.0"],
];

const draw = (p: number): React.SVGProps<SVGPathElement> => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - p,
});

const LogoBuild: React.FC<{ b: number }> = ({ b }) => {
  const guideOut = 1 - tw(b, 2.9, 3.5, ease.inOut);
  const g = (from: number, len = 0.7) => tw(b, from, from + len, ease.inOut);

  // Anticipation, then a hard exponential push through the left leg of the A.
  const squash = tw(b, 3.2, 3.72, ease.inOut);
  const punch = tw(b, 3.68, 4.0, ease.in);
  const scale = mix(squash, 1, 0.86) * Math.pow(90, punch);
  const [zx, zy] = px(9, 24);

  const caption = "ALPHASTRIX DIGITAL — SHOWREEL";
  const typed = Math.round(tw(b, 2.3, 3.1, ease.linear) * caption.length);

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill
        style={{
          scale: String(scale),
          rotate: `${squash * -3 + punch * 10}deg`,
          transformOrigin: `${zx}px ${zy}px`,
        }}
      >
        <Grid color="rgba(242,239,233,0.1)" style={{ opacity: tw(b, 0, 1.2, ease.soft), scale: String(mix(tw(b, 0, 4, ease.out), 1.12, 1)) }} />

        {/* Scanner pass that "boots" the blueprint */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: mix(tw(b, 0, 1.15, ease.inOut), -200, 1090),
            height: 200,
            background: "linear-gradient(to bottom, transparent, rgba(200,255,77,0.13))",
            borderBottom: `2px solid ${C.acid}`,
            opacity: 1 - tw(b, 0.95, 1.15, ease.linear),
          }}
        />

        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* Construction guides */}
          <g stroke={C.mist} strokeWidth={2} fill="none" opacity={0.9 * guideOut}>
            <path d="M520 723.75H1400" {...draw(g(0.26))} />
            <path d="M960 220V860" {...draw(g(0.26))} />
            <path d="M660 356.25H1260" {...draw(g(0.76))} />
            <path d={`M${960 + 0.3 * 183.75} ${356.25 - 0.3 * 367.5}L${776.25 - 0.3 * 183.75} ${723.75 + 0.3 * 367.5}`} {...draw(g(0.76))} />
            <path d={`M${960 - 0.3 * 183.75} ${356.25 - 0.3 * 367.5}L${1143.75 + 0.3 * 183.75} ${723.75 + 0.3 * 367.5}`} {...draw(g(0.76))} />
            <circle cx={960} cy={553.1} r={196.85} {...(draw(g(1.26, 0.9)) as React.SVGProps<SVGCircleElement>)} transform="rotate(-90 960 553.1)" />
            <circle
              cx={960}
              cy={540}
              r={300}
              strokeDasharray="4 14"
              opacity={tw(b, 1.26, 1.9)}
              transform={`rotate(${b * 14} 960 540)`}
            />
          </g>

          {/* Vertex crosshairs + coordinates */}
          {VERTS.map(([x, y, label], i) => {
            const [cx, cy] = px(x, y);
            const p = tw(b, 1.26 + i * 0.125, 1.56 + i * 0.125, ease.back) * guideOut;
            const side = x > 16 ? 1 : x < 16 ? -1 : 1;
            return (
              <g key={i} opacity={clamp(p * 2)}>
                <g transform={`translate(${cx} ${cy}) scale(${p}) rotate(${(1 - p) * 90})`} stroke={C.acid} strokeWidth={2}>
                  <path d="M-12 0H12M0 -12V12" />
                </g>
                <text
                  x={cx + side * 22}
                  y={cy + (y === 17 ? 44 : y === 2 ? -22 : 40)}
                  textAnchor={side > 0 ? "start" : "end"}
                  fill={C.mist}
                  fontFamily={F.mono}
                  fontSize={17}
                  letterSpacing="0.1em"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* The mark itself: outline is drafted, then ink floods up from the baseline */}
          <g transform={`translate(${OX} ${OY}) scale(${S})`}>
            <defs>
              <clipPath id="ink-rise">
                <rect x={0} width={32} y={mix(tw(b, 2.26, 2.9, ease.out), 30.5, 1.5)} height={32} />
              </clipPath>
            </defs>
            <path
              d={MARK}
              fill="none"
              stroke={C.acid}
              strokeWidth={0.16}
              strokeLinejoin="round"
              {...draw(tw(b, 1.5, 2.45, ease.inOut))}
            />
            <path d={MARK} fill={C.acid} clipPath="url(#ink-rise)" />
            <path
              d={FACET}
              fill={C.iris}
              opacity={0.85 * tw(b, 2.76, 3.0, ease.linear)}
              transform={`translate(${mix(tw(b, 2.76, 3.25, ease.out), 7, 0)} ${mix(tw(b, 2.76, 3.25, ease.out), -3.5, 0)})`}
            />
          </g>
        </svg>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 880,
            textAlign: "center",
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.34em",
            color: C.bone,
            opacity: 0.85 * (1 - tw(b, 3.3, 3.6, ease.linear)),
          }}
        >
          {caption.slice(0, typed)}
          <span style={{ color: C.acid, opacity: typed < caption.length || Math.floor(b * 4) % 2 ? 1 : 0 }}>_</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Part 2 (beats 4–8): "We build brands that grow." One idea per beat,
// each on its own colour plate.
// ---------------------------------------------------------------------------

const big: React.CSSProperties = {
  fontFamily: F.sans,
  fontWeight: 800,
  letterSpacing: "-0.055em",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const center: React.CSSProperties = { alignItems: "center", justifyContent: "center" };

const WeBuild: React.FC<{ b: number }> = ({ b }) => (
  <AbsoluteFill style={{ background: C.acid, ...center }}>
    <div style={{ ...big, fontSize: 372, color: C.ink, scale: String(mix(tw(b, 4, 5, ease.linear), 1, 1.06)) }}>
      <Chars text="We build" b={b} at={4.0} stagger={0.03} dur={0.5} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 150,
        right: 150,
        top: 772,
        height: 10,
        background: C.ink,
        scale: `${tw(b, 4.15, 4.8, ease.out)} 1`,
        transformOrigin: "0 50%",
      }}
    />
  </AbsoluteFill>
);

const Brands: React.FC<{ b: number }> = ({ b }) => {
  const spread = tw(b, 5.0, 5.75, ease.out);
  return (
    <AbsoluteFill style={{ background: C.ink, ...center }}>
      {[-2, -1, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            ...big,
            position: "absolute",
            fontSize: 452,
            color: "transparent",
            WebkitTextStroke: `2.5px rgba(242,239,233,${0.5 - Math.abs(k) * 0.14})`,
            translate: `0 ${k * 318 * spread}px`,
          }}
        >
          brands
        </div>
      ))}
      <div
        style={{
          ...big,
          fontSize: 452,
          color: C.bone,
          scale: String(mix(tw(b, 5.0, 5.4, ease.back), 0.86, 1)),
          filter: `blur(${(1 - tw(b, 5.0, 5.2)) * 14}px)`,
        }}
      >
        brands
      </div>
    </AbsoluteFill>
  );
};

const That: React.FC<{ b: number }> = ({ b }) => {
  const p = tw(b, 6.0, 6.38, ease.out);
  return (
    <AbsoluteFill style={{ background: C.iris, ...center }}>
      <div
        style={{
          fontFamily: F.serif,
          fontStyle: "italic",
          fontSize: 600,
          lineHeight: 1,
          color: C.bone,
          rotate: `${mix(p, -9, -2)}deg`,
          scale: String(mix(p, 1.5, 1)),
          filter: `blur(${(1 - p) * 22}px)`,
          translate: "0 -30px",
        }}
      >
        that
      </div>
    </AbsoluteFill>
  );
};

const REEL = ["convert.", "lead.", "scale.", "grow."];
const LINE = 470;
const GROWTH = [0.2, 0.45, 0.75, 1.1, 0];

const Grow: React.FC<{ b: number }> = ({ b }) => {
  const pos = (x: number) => 3 * tw(x, 6.5, 7.04, ease.inOut);
  const p = pos(b);
  const speed = Math.abs(p - pos(b - 0.03)) / 0.03;
  const landed = b >= 7;
  const rise = tw(b, 7.08, 7.85, ease.inOut);
  const gradient: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${C.acid} 0%, ${C.acidSoft} 45%, ${C.iris} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
  return (
    <AbsoluteFill style={{ background: C.ink, ...center }}>
      <Grid style={{ opacity: 0.8 }} />
      {/* Slot-machine reel that lands on "grow." exactly on the beat */}
      {!landed && (
        <div
          style={{
            height: LINE,
            overflow: "hidden",
            width: 1920,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
          }}
        >
          <svg width={0} height={0}>
            <filter id="vblur">
              <feGaussianBlur stdDeviation={`0 ${speed * 16}`} />
            </filter>
          </svg>
          <div style={{ translate: `0 ${-p * LINE}px`, filter: "url(#vblur)" }}>
            {REEL.map((w) => (
              <div key={w} style={{ ...big, fontSize: 400, height: LINE, lineHeight: `${LINE}px`, textAlign: "center", ...gradient }}>
                {w}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Landed: the word literally grows, letter by letter, like a bar chart */}
      {landed && (
        <div
          style={{
            ...big,
            fontSize: 400,
            height: LINE,
            lineHeight: `${LINE}px`,
            display: "flex",
            scale: String(mix(tw(b, 7.0, 7.3, ease.back), 1.12, 1)),
            translate: `0 ${rise * 190}px`,
          }}
        >
          {"grow.".split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                transformOrigin: "50% 86%",
                scale: `1 ${1 + GROWTH[i] * tw(b, 7.1 + i * 0.05, 7.8 + i * 0.03, ease.inOut)}`,
                backgroundImage: `linear-gradient(90deg, ${C.acid}, ${C.acidSoft} 45%, ${C.iris})`,
                backgroundSize: "1100px 100%",
                backgroundPosition: `${-i * 230}px 0`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      )}
      {landed && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M250 300 L1560 150"
            stroke={C.bone}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            opacity={0.9}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - tw(b, 7.15, 7.7, ease.out)}
          />
          <g
            transform={`translate(${mix(tw(b, 7.15, 7.7, ease.out), 250, 1560)} ${mix(tw(b, 7.15, 7.7, ease.out), 300, 150)}) rotate(-6.5)`}
            opacity={tw(b, 7.15, 7.25)}
          >
            <path d="M-58 -44 L6 0 L-58 44" stroke={C.bone} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};

export const Open: React.FC = () => {
  const b = useBeat();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {b < 4 && <LogoBuild b={b} />}
      {b >= 4 && b < 5 && <WeBuild b={b} />}
      {b >= 5 && b < 6 && <Brands b={b} />}
      {b >= 6 && b < 6.5 && <That b={b} />}
      {b >= 6.5 && <Grow b={b} />}
      {/* Hand-off: an acid plate sweeps up and becomes the floor of the next scene */}
      <AbsoluteFill style={{ background: C.acid, clipPath: wipe("up", tw(b, 7.62, 8.0, ease.inOut)) }} />
      {/* Impact flash on the drop */}
      <AbsoluteFill style={{ background: C.bone, opacity: 0.55 * (1 - tw(b, 4.0, 4.35)) * (b >= 3.98 ? 1 : 0), mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};
