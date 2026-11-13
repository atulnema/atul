import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { Avatar, VideoCard } from "../components/Avatar";
import { Bubble } from "../components/Bubble";
import { Kinetic } from "../components/Kinetic";
import { Confetti, Dots, Shape } from "../components/Shapes";
import { Pill, Sticker } from "../components/Sticker";
import { content } from "../content";
import { EASE, glide, hit, pop, tween } from "../lib/anim";
import { BAR, C, FONT } from "../theme";

const T = content.how;
const STEP_COLORS = [C.pink, C.blue, C.yellow, C.mint];
const CHIP_COLORS = [C.pink, C.yellow, C.mint, C.blue, C.orange, C.purple, C.pink, C.mint];
const DARK_TEXT = new Set<string>([C.yellow, C.mint, C.orange]);

const Check: React.FC<{ size: number; color?: string }> = ({ size, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d="M4 12.5 L10 18 L20 6.5" fill="none" stroke={color} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- step 1
const StepDrop: React.FC<{ f: number; frame: number }> = ({ f, frame }) => {
  const wobble = f >= 20 ? Math.exp(-(f - 20) / 4) * Math.cos((f - 20) * 0.9) * 0.2 : 0;
  const up = tween(f, 24, 46, 0, 1, EASE.inOut);
  const done = pop(f, 48);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 40,
          width: 760,
          height: 320,
          borderRadius: 34,
          border: `7px dashed ${C.ink}`,
          boxSizing: "border-box",
          backgroundColor: interpolateColors(f, [19, 22, 36], [C.cream, C.mint, C.foam]),
          scale: String(1 + hit(f, 20, 3) * 0.035),
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 26,
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: 36,
          color: C.ink,
        }}
      >
        <span style={{ opacity: f < 18 ? 0.7 : 0 }}>Drop a video to start</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 292,
          top: 96,
          opacity: f >= 6 ? 1 : 0,
          transformOrigin: "50% 100%",
          translate: `0 ${tween(f, 6, 20, -720, 0, EASE.in)}px`,
          rotate: `${tween(f, 6, 20, -18, -3, EASE.in)}deg`,
          scale: `${1 + wobble} ${1 - wobble}`,
        }}
      >
        <VideoCard w={300} h={196} frame={frame} tag={T.fileName} progress={0.3} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 396,
          width: 760,
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: f >= 22 ? 1 : 0,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 38,
            borderRadius: 999,
            border: `6px solid ${C.ink}`,
            backgroundColor: C.cream,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: `${up * 100}%`, height: "100%", backgroundColor: C.pink, borderRight: `6px solid ${C.ink}` }} />
        </div>
        <div
          style={{
            width: 120,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 44,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {f < 48 ? (
            `${Math.round(up * 100)}%`
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: C.mint,
                border: `6px solid ${C.ink}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: String(done),
              }}
            >
              <Check size={38} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- step 2
const StepClone: React.FC<{ f: number; frame: number }> = ({ f, frame }) => {
  const cx = 668;
  const cy = 196;
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 96, rotate: "-3deg" }}>
        <VideoCard w={310} h={200} frame={frame} talking={1} progress={0.3 + f * 0.008} />
      </div>
      {new Array(7).fill(0).map((_, i) => {
        const h = (14 + 56 * Math.abs(Math.sin(f * 0.55 - i * 0.75))) * tween(f, 3 + i, 8 + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 392 + i * 19,
              top: cy - h / 2,
              width: 11,
              height: h,
              borderRadius: 6,
              backgroundColor: C.pink,
            }}
          />
        );
      })}
      {new Array(30).fill(0).map((_, i) => {
        const grow = tween(f, 8 + i * 0.6, 15 + i * 0.6);
        const len = (18 + 46 * (0.5 + 0.5 * Math.sin(f * 0.62 + i * 1.37))) * grow;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - 6,
              top: cy - 98 - len,
              width: 12,
              height: len,
              borderRadius: 6,
              backgroundColor: i % 3 === 0 ? C.pink : C.blue,
              transformOrigin: `6px ${98 + len}px`,
              rotate: `${i * 12}deg`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: cx - 80,
          top: cy - 80,
          scale: String(pop(f, 26) * (1 + hit(f, 40, 3) * 0.08)),
        }}
      >
        <Sticker color={C.yellow} radius={999} shadow={0} style={{ width: 160, height: 160, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 12, top: 14 }}>
            <Avatar size={122} frame={frame} talking={1} seed={0} />
          </div>
        </Sticker>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 392,
          display: "flex",
          justifyContent: "center",
          opacity: f >= 40 ? 1 : 0,
          scale: String(pop(f, 40)),
          rotate: "-2deg",
        }}
      >
        <Pill color={C.mint} size={42} shadow={7}>
          <Check size={40} />
          {T.cloned}
        </Pill>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- step 3
const StepPick: React.FC<{ f: number }> = ({ f }) => {
  let k = -1;
  let selected = 0;
  let lastToggle = -99;
  const chips = T.languages.map((lang, i) => {
    let at = Infinity;
    let order = -1;
    if (lang.on) {
      k += 1;
      order = k;
      at = 15 + k * 3.75;
      if (f >= at) {
        selected += 1;
        lastToggle = at;
      }
    }
    return { ...lang, i, at, order };
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 33,
          top: 40,
          width: 820,
          display: "grid",
          gridTemplateColumns: "repeat(4, 190px)",
          gap: 20,
        }}
      >
        {chips.map((chip) => {
          const on = f >= chip.at;
          const color = on ? CHIP_COLORS[chip.order] : C.cream;
          return (
            <div
              key={chip.i}
              style={{
                height: 86,
                borderRadius: 43,
                border: `6px solid ${C.ink}`,
                boxSizing: "border-box",
                boxShadow: on ? `6px 6px 0 ${C.ink}` : "none",
                backgroundColor: color,
                color: on && !DARK_TEXT.has(color) ? C.cream : C.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT.body,
                fontWeight: 700,
                fontSize: 30,
                scale: String(pop(f, 2 + chip.i * 1.1, { damping: 12 }) * (1 + hit(f, chip.at, 2.5) * 0.17)),
                rotate: `${on ? (chip.order % 2 ? 2 : -2) : 0}deg`,
              }}
            >
              <span style={{ opacity: on ? 1 : 0.6 }}>{chip.label}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 386,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          scale: String(pop(f, 12, { damping: 13 })),
        }}
      >
        <Sticker
          color={C.pink}
          radius={999}
          shadow={6}
          style={{
            width: 84,
            height: 84,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 50,
            color: C.cream,
            scale: String(1 + hit(f, lastToggle, 2.5) * 0.2),
          }}
        >
          {selected}
        </Sticker>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: C.ink }}>{T.selected}</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- step 4
const StepDub: React.FC<{ f: number }> = ({ f }) => {
  const move = tween(f, 0, 6, 0, 1, EASE.out);
  const press = hit(f, 6, 2.2);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 203,
          top: 150,
          scale: String(pop(f, 0, { damping: 12 }) * (1 - press * 0.12)),
          translate: `${press * 8}px ${press * 8}px`,
        }}
      >
        <Sticker
          color={C.pink}
          radius={48}
          shadow={14 - press * 10}
          stroke={8}
          style={{
            width: 480,
            height: 170,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 96,
            letterSpacing: "-0.02em",
            color: C.cream,
          }}
        >
          {T.button}
        </Sticker>
      </div>
      <svg
        width="90"
        height="90"
        viewBox="0 0 60 60"
        style={{
          position: "absolute",
          left: 760 - move * 220,
          top: 470 - move * 200,
          overflow: "visible",
          scale: String(1 - press * 0.15),
        }}
      >
        <path d="M8 4 L8 46 L19 36 L27 54 L36 50 L28 33 L43 33 Z" fill={C.white} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
      </svg>
    </>
  );
};

// ---------------------------------------------------------------- output fan
const FAN_X = 1296;
const FAN_Y = 1600;
const FAN_R = 950;
const FAN_BG = [C.blush, "#FFEDB8", C.foam, C.sky, "#FFDFCB"];
const FAN_TAG = [C.pink, C.yellow, C.mint, C.blue, C.orange];
const FAN_W = [190, 190, 256, 200, 176];

const Fan: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {T.outputs.map((o, i) => {
      const p = pop(frame, 193 + i * 2, { damping: 11, stiffness: 150 });
      const b = pop(frame, 207 + i * 3);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: FAN_X,
            top: FAN_Y,
            width: 0,
            height: 0,
            rotate: `${(i - 2) * 10.5 * p}deg`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -124,
              top: -FAN_R - 78,
              scale: String(p),
              translate: `0 ${Math.sin(frame * 0.2 + i * 1.3) * 5}px`,
            }}
          >
            <VideoCard
              w={248}
              h={156}
              frame={frame}
              bg={FAN_BG[i]}
              tag={o.tag}
              tagColor={FAN_TAG[i]}
              talking={1}
              seed={i + 1}
              progress={0.2 + ((frame - 190) / 50) * 0.6}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: -FAN_W[i] / 2 + 10,
              top: -FAN_R - 78 - 136 - (i % 2 ? 92 : 0),
              transformOrigin: "20% 100%",
              scale: String(b),
              rotate: `${(1 - b) * 20}deg`,
            }}
          >
            <Bubble w={FAN_W[i]} h={80} color={C.white} size={38} shadow={7}>
              {o.hello}
            </Bubble>
          </div>
        </div>
      );
    })}
  </>
);

// ---------------------------------------------------------------- scene
export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.min(3, Math.floor(frame / BAR));
  const f = frame - step * BAR;
  const s = T.steps[step];
  const last = step === 3;
  const out = last ? undefined : 53;

  const appear = pop(frame, 2, { damping: 12 });
  const exit = tween(frame, 190, 198, 0, 1, EASE.in);
  const enter = pop(f, 0, { damping: 14, stiffness: 200 });
  const leave = last ? 0 : tween(f, 55, 60, 0, 1, EASE.in);
  // The badge pops in once, then just kicks when the number changes.
  const badge = step === 0 ? pop(f, 0, { damping: 9 }) : 1 + hit(f, 0, 3) * 0.28;

  const bg = interpolateColors(
    frame,
    [0, 54, 62, 114, 122, 174, 182, 240],
    [C.cream, C.cream, C.sky, C.sky, C.blush, C.blush, C.foam, C.foam],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <Dots frame={frame} />

      {/* left column: step number, title, caption */}
      <div style={{ position: "absolute", left: 130, top: 178 }}>
        <div style={{ scale: String(badge), rotate: `${step === 0 ? (1 - badge) * -120 : hit(f, 0, 3) * -24}deg`, width: 128 }}>
          <Sticker
            color={STEP_COLORS[step]}
            radius={999}
            shadow={9}
            style={{
              width: 128,
              height: 128,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 76,
              color: step === 0 || step === 1 ? C.cream : C.ink,
            }}
          >
            {step + 1}
          </Sticker>
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 110,
            letterSpacing: "-0.03em",
            color: C.ink,
          }}
        >
          <Kinetic key={`a${step}`} text={s.title[0]} frame={f} delay={1} out={out} />
          <Kinetic key={`b${step}`} text={s.title[1]} frame={f} delay={4} out={out} />
        </div>
        <Kinetic
          key={`c${step}`}
          text={s.sub}
          frame={f}
          delay={9}
          stagger={1}
          out={out}
          style={{ marginTop: 30, fontFamily: FONT.body, fontWeight: 700, fontSize: 46, color: C.ink }}
        />
      </div>
      <div style={{ position: "absolute", left: 130, top: 880, display: "flex", gap: 14 }}>
        {STEP_COLORS.map((color, i) => {
          const on = glide(frame, i * BAR, 10) - (i < 3 ? glide(frame, (i + 1) * BAR, 10) : 0);
          return (
            <div
              key={i}
              style={{
                width: 34 + on * 70,
                height: 34,
                borderRadius: 17,
                border: `6px solid ${C.ink}`,
                boxSizing: "border-box",
                backgroundColor: frame >= i * BAR ? color : "transparent",
              }}
            />
          );
        })}
      </div>

      {/* the app window */}
      {frame < 198 ? (
        <div
          style={{
            position: "absolute",
            left: 870,
            top: 236,
            scale: String(appear * (1 - exit) * (1 + (last ? tween(f, 7, 10, 0, 0.05) : 0))),
            rotate: `${(1 - appear) * -8 + exit * 12}deg`,
          }}
        >
          <Sticker color={C.white} radius={40} shadow={16} stroke={8} style={{ width: 900, height: 610 }}>
            <div
              style={{
                height: 66,
                borderBottom: `7px solid ${C.ink}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 26px",
                backgroundColor: C.cream,
                borderRadius: "32px 32px 0 0",
              }}
            >
              {[C.pink, C.yellow, C.mint].map((c) => (
                <div key={c} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c, border: `5px solid ${C.ink}`, boxSizing: "border-box" }} />
              ))}
              <div style={{ flex: 1, textAlign: "center", marginRight: 96, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: C.ink }}>
                dubz up studio
              </div>
            </div>
            <div
              style={{
                position: "relative",
                width: 884,
                height: 520,
                scale: String(0.92 + enter * 0.08),
                translate: `0 ${(1 - enter) * 30 - leave * 30}px`,
                opacity: 1 - leave,
              }}
            >
              {step === 0 ? <StepDrop f={f} frame={frame} /> : null}
              {step === 1 ? <StepClone f={f} frame={frame} /> : null}
              {step === 2 ? <StepPick f={f} /> : null}
              {step === 3 ? <StepDub f={f} /> : null}
            </div>
          </Sticker>
        </div>
      ) : null}

      {/* five dubbed versions fan out */}
      {frame >= 190 ? (
        <>
          <Confetti frame={frame} at={193} x={FAN_X} y={660} count={34} power={0.95} colors={[C.pink, C.blue, C.yellow, C.orange, C.purple]} />
          <Fan frame={frame} />
          <div
            style={{
              position: "absolute",
              left: 1650,
              top: 84,
              scale: String(pop(frame, 216, { damping: 8 })),
              rotate: `${-10 + Math.sin(frame * 0.15) * 5}deg`,
            }}
          >
            <div style={{ rotate: `${frame * 0.6}deg` }}>
              <Shape kind="burst" size={216} color={C.yellow} stroke={7} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 35,
                lineHeight: 1.05,
                color: C.ink,
              }}
            >
              <span>{T.badge[0]}</span>
              <span>{T.badge[1]}</span>
            </div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
