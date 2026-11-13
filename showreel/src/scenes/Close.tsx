import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { Chars } from "../components/Chars";
import { Mark } from "../components/Mark";
import { Grid } from "../components/Overlays";
import { clamp, ease, mix, rand, tw, useBeat } from "../lib/anim";
import { C, F } from "../lib/theme";

// ---------------------------------------------------------------------------
// Part 1 (beats 0–4): "Strategy and execution under one roof."
// The roof is the top of the A. Then the whole thing implodes.
// ---------------------------------------------------------------------------

const line: React.CSSProperties = {
  fontFamily: F.sans,
  fontWeight: 700,
  fontSize: 158,
  letterSpacing: "-0.05em",
  lineHeight: 1,
  whiteSpace: "nowrap",
  color: C.bone,
};

const Slide: React.FC<{ b: number; at: number; from: number; children: React.ReactNode; id: string }> = ({ b, at, from, children, id }) => {
  const pos = (x: number) => (1 - tw(x, at, at + 0.5, ease.out)) * from;
  const v = Math.abs(pos(b) - pos(b - 0.02));
  return (
    <span style={{ display: "inline-block", translate: `${pos(b)}px 0`, opacity: tw(b, at, at + 0.08, ease.linear), filter: `url(#${id})` }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-50%" width="200%">
          <feGaussianBlur stdDeviation={`${Math.min(60, v * 0.5)} 0`} />
        </filter>
      </svg>
      {children}
    </span>
  );
};

const Promise: React.FC<{ b: number }> = ({ b }) => {
  const suck = tw(b, 3.0, 3.92, ease.in);
  const roof = tw(b, 2.0, 2.7, ease.out);
  const and = tw(b, 0.5, 0.9, ease.back);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid style={{ opacity: 0.9 * (1 - suck) }} />
      <AbsoluteFill
        style={{
          scale: String(mix(tw(b, 0, 3, ease.linear), 1, 1.05) * (1 - suck)),
          rotate: `${suck * -14}deg`,
          filter: `blur(${suck * 10}px)`,
          transformOrigin: "960px 540px",
        }}
      >
        {/* the roof: same pitch as the mark's apex */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M960 170 L1640 430"
            stroke={C.iris}
            strokeWidth={22}
            strokeLinecap="square"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - roof}
            opacity={b > 2 ? 1 : 0}
          />
          <path
            d="M960 170 L280 430"
            stroke={C.acid}
            strokeWidth={22}
            strokeLinecap="square"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - roof}
            opacity={b > 2 ? 1 : 0}
          />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 468, textAlign: "center", ...line }}>
          <Slide b={b} at={0.0} from={-1300} id="mb-a">
            Strategy
          </Slide>
          <span
            style={{
              display: "inline-block",
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: C.acid,
              margin: "0 0.2em",
              scale: String(and),
              rotate: `${mix(and, -24, -4)}deg`,
            }}
          >
            and
          </span>
          <Slide b={b} at={1.0} from={1300} id="mb-b">
            execution
          </Slide>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", ...line }}>
          <Chars text="under " b={b} at={2.0} stagger={0.025} dur={0.5} />
          <Chars
            text="one roof."
            b={b}
            at={2.14}
            stagger={0.025}
            dur={0.5}
            style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.02em", color: C.acid, fontSize: 176 }}
          />
        </div>
      </AbsoluteFill>
      {/* everything gets pulled into the centre */}
      {suck > 0 &&
        Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2 + rand(i) * 0.3;
          const r0 = 1150;
          const lead = clamp(tw(b, 3.0 + rand(i + 5) * 0.35, 3.9, ease.in));
          const r = mix(lead, r0, 30);
          const len = (60 + rand(i + 2) * 260) * Math.sin(lead * Math.PI);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 960,
                top: 540,
                width: len,
                height: 3 + rand(i + 9) * 3,
                borderRadius: 3,
                background: i % 3 === 0 ? C.iris : i % 3 === 1 ? C.acid : C.bone,
                transformOrigin: "0 50%",
                transform: `rotate(${a}rad) translateX(${r}px)`,
                opacity: Math.sin(lead * Math.PI),
              }}
            />
          );
        })}
      {/* arrival flash, carried over from the previous scene */}
      <AbsoluteFill style={{ background: C.acid, opacity: 1 - tw(b, 0, 0.42, ease.out) }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Part 2 (beats 4–8): end card.
// ---------------------------------------------------------------------------

const WORDMARK_W = 1046;
const HIT = 113; // beat 4 at 60 fps

const EndCard: React.FC<{ b: number }> = ({ b }) => {
  const frame = useCurrentFrame();
  const open = tw(b, 4.45, 5.2, ease.inOut);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {/* ambient light */}
      <div
        style={{
          position: "absolute",
          left: 120 + Math.sin(b * 0.5) * 60,
          top: 520,
          width: 900,
          height: 900,
          borderRadius: 450,
          background: C.iris,
          filter: "blur(200px)",
          opacity: 0.34 * tw(b, 4, 5),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1100 - Math.sin(b * 0.5) * 60,
          top: -420,
          width: 800,
          height: 800,
          borderRadius: 400,
          background: C.acid,
          filter: "blur(220px)",
          opacity: 0.2 * tw(b, 4, 5),
        }}
      />
      <Grid style={{ opacity: tw(b, 4, 4.6) }} />

      {/* shockwaves */}
      {[0, 0.12, 0.3].map((d, i) => {
        const p = tw(b, 4 + d, 5.3 + d, ease.out);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 - 100,
              top: 500 - 100,
              width: 200,
              height: 200,
              borderRadius: 100,
              border: `${i === 0 ? 5 : 2.5}px solid ${i === 1 ? C.iris : C.acid}`,
              scale: String(0.4 + p * (13 - i * 2.5)),
              opacity: (1 - p) * 0.9,
            }}
          />
        );
      })}
      {/* debris */}
      {Array.from({ length: 34 }).map((_, i) => {
        const a = rand(i) * Math.PI * 2;
        const p = tw(b, 4, 5.4 + rand(i + 3) * 0.6, ease.out);
        const d = (260 + rand(i + 1) * 760) * p;
        const size = 8 + rand(i + 2) * 20;
        const tri = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + Math.cos(a) * d - size / 2,
              top: 500 + Math.sin(a) * d * 0.72 - size / 2 + p * p * 60,
              width: size,
              height: size,
              background: [C.acid, C.iris, C.bone][i % 3],
              clipPath: tri ? "polygon(50% 0, 100% 100%, 0 100%)" : "none",
              borderRadius: tri ? 0 : i % 2 ? size : 3,
              rotate: `${rand(i + 4) * 360 + p * 300 * (i % 2 ? 1 : -1)}deg`,
              opacity: 1 - tw(b, 4.7, 5.6 + rand(i + 3) * 0.5),
            }}
          />
        );
      })}

      {/* lockup */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          scale: String(mix(tw(b, 4, 8, ease.linear), 1, 1.045)),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginTop: -90 }}>
          <Interactive.Div
            name="Mark"
            style={{
              scale: interpolate(frame, [HIT, HIT + 22], [3.2, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              rotate: interpolate(frame, [HIT, HIT + 26], ["-18deg", "0deg"], {
                easing: Easing.bezier(0.34, 1.56, 0.64, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              filter: `drop-shadow(0 0 ${60 * (1 - tw(b, 4, 5.2))}px rgba(200,255,77,0.9))`,
            }}
          >
            <Mark size={196} />
          </Interactive.Div>
          <div style={{ width: (WORDMARK_W + 46) * open, overflow: "hidden", height: 230, display: "flex", alignItems: "center" }}>
            <div
              style={{
                paddingLeft: 46,
                width: WORDMARK_W,
                flexShrink: 0,
                fontFamily: F.sans,
                fontWeight: 600,
                fontSize: 148,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: C.bone,
              }}
            >
              <Chars text="Alphastrix" b={b} at={4.55} stagger={0.03} dur={0.55} />
              <Chars text=" Digital" b={b} at={4.85} stagger={0.03} dur={0.55} style={{ color: C.mist }} />
            </div>
          </div>
        </div>

        <Interactive.Div
          name="Tagline"
          style={{
            marginTop: 34,
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: 68,
            letterSpacing: "-0.03em",
            color: C.bone,
            opacity: interpolate(frame, [HIT + 34, HIT + 52], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [HIT + 34, HIT + 62], ["0px 36px", "0px 0px"], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          We build brands{" "}
          <span style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 400, fontSize: 80, color: C.acid, letterSpacing: "-0.01em" }}>that grow.</span>
        </Interactive.Div>
      </AbsoluteFill>

      {/* footer */}
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 880,
          height: 2,
          background: "rgba(242,239,233,0.22)",
          scale: `${tw(b, 5.3, 6.2, ease.out)} 1`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          top: 908,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: F.mono,
          fontSize: 30,
          letterSpacing: "0.08em",
          color: C.bone,
          opacity: tw(b, 5.5, 6.0, ease.linear),
          translate: `0 ${(1 - tw(b, 5.5, 6.2)) * 16}px`,
        }}
      >
        <span>
          <span style={{ color: C.acid }}>@</span>alphastrix_
        </span>
        <span style={{ color: C.mist }}>SEO · PERFORMANCE · WEB · SOCIAL</span>
        <span>GROWTH STUDIO</span>
      </div>

      {/* impact flash */}
      <AbsoluteFill style={{ background: C.acid, opacity: 0.85 * (1 - tw(b, 4, 4.5, ease.out)), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

export const Close: React.FC = () => {
  const b = useBeat();
  return <AbsoluteFill style={{ background: C.ink }}>{b < 4 ? <Promise b={b} /> : <EndCard b={b} />}</AbsoluteFill>;
};
