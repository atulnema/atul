import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { useScene, useWordFrame } from "../../timing";
import { Card, Caret, Check, Label, Lock, MiniFace, Spark, clamp, ease, popStyle, typed, useSpring } from "../../components/ui";

/** Centre stage area under the headline. */
const Stage: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 430 }) => (
  <AbsoluteFill style={{ top, height: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>
);

/** Fades/blur the whole card group out at the end of the scene. */
const useExit = () => {
  const frame = useCurrentFrame();
  const { dur } = useScene();
  const o = ease(frame, dur - 9, dur);
  return { opacity: 1 - o, transform: `scale(${1 - o * 0.06})`, filter: `blur(${o * 12}px)` } as React.CSSProperties;
};

/* ================================================================== */
/* 1. FIRED: employee ID card gets stamped                             */
/* ================================================================== */
const tasks = [
  { t: "Content calendar", s: "weekly", x: -380, y: -230 },
  { t: "Reel captions", s: "daily", x: 330, y: -150 },
  { t: "Comment replies", s: "500+/day", x: -400, y: 170 },
  { t: "Trend research", s: "manual", x: 340, y: 250 },
];

export const FiredCard: React.FC = () => {
  const frame = useCurrentFrame();
  const fireAt = useWordFrame("fire", 70);
  const enter = useSpring(0, 13, 120);
  const stamp = useSpring(fireAt, 9, 260, 0.6);
  const shake = frame > fireAt && frame < fireAt + 10 ? Math.sin(frame * 3) * (10 - (frame - fireAt)) * 1.2 : 0;
  const dim = ease(frame, fireAt, fireAt + 8);
  return (
    <Stage>
      <div style={{ position: "relative", ...useExit() }}>
        {tasks.map((t, i) => {
          const p = ease(frame, 6 + i * 5, 20 + i * 5);
          const fall = ease(frame, fireAt + 2 + i * 2, fireAt + 18 + i * 2);
          return (
            <Card
              key={t.t}
              small
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 300,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: p * (1 - fall * 0.85),
                transform: `translate(-50%,-50%) translate(${t.x + Math.sin(frame / 25 + i) * 6}px, ${t.y + fall * 120}px) rotate(${fall * (i % 2 ? 10 : -10)}deg) scale(${0.8 + p * 0.2})`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: i % 2 ? "#E9F3EE" : "#FCEBDD" }} />
              <div style={{ fontFamily: F.sans }}>
                <div style={{ fontWeight: 700, fontSize: 24, color: C.ink }}>{t.t}</div>
                <div style={{ fontWeight: 600, fontSize: 19, color: C.gray }}>{t.s}</div>
              </div>
            </Card>
          );
        })}

        <Card
          style={{
            width: 500,
            padding: "40px 44px 44px",
            textAlign: "center",
            position: "relative",
            ...popStyle(enter, 80, 0.8),
            transform: `${popStyle(enter, 80, 0.8).transform} translateX(${shake}px) rotate(${(1 - enter) * -6 + shake * 0.15}deg)`,
          }}
        >
          <div style={{ width: 120, height: 18, borderRadius: 10, background: "#E7E6E3", margin: "0 auto 36px" }} />
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 200,
              background: "#E6E5E2",
              margin: "0 auto",
              display: "grid",
              placeItems: "center",
              filter: `grayscale(${dim})`,
            }}
          >
            <svg width={96} height={96} viewBox="0 0 24 24">
              <circle cx={12} cy={8.5} r={4.2} fill="#B8B7B3" />
              <path d="M3.5 21 C4.5 15.5 8 13.6 12 13.6 C16 13.6 19.5 15.5 20.5 21 Z" fill="#B8B7B3" />
            </svg>
          </div>
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 44, color: C.ink, marginTop: 34, lineHeight: 1.1 }}>
            Social Media
            <br />
            Manager
          </div>
          <div style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 600, fontSize: 52, color: C.crimson, marginTop: 16 }}>
            ₹15,000<span style={{ fontFamily: F.sans, fontStyle: "normal", fontSize: 22, color: C.gray, fontWeight: 600 }}> /month</span>
          </div>
          <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 34, height: 70 }}>
            {Array.from({ length: 52 }).map((_, i) => (
              <div key={i} style={{ width: [2, 4, 3, 6, 2, 3][(i * 7) % 6], background: C.ink, opacity: 0.85 }} />
            ))}
          </div>

          {/* FIRED stamp */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              transform: `translate(-50%,-50%) rotate(-14deg) scale(${interpolate(stamp, [0, 1], [2.6, 1])})`,
              opacity: frame >= fireAt ? Math.min(1, stamp * 2) : 0,
              border: `10px solid ${C.crimson}`,
              color: C.crimson,
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 120,
              letterSpacing: 8,
              padding: "4px 34px",
              borderRadius: 24,
              background: "rgba(251,251,250,0.72)",
              mixBlendMode: "multiply",
            }}
          >
            FIRED
          </div>
        </Card>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 2. HIRED: AI spark tile with a burst                                */
/* ================================================================== */
export const HiredCard: React.FC = () => {
  const frame = useCurrentFrame();
  const hireAt = useWordFrame("hire", 30);
  const enter = useSpring(0, 11, 150);
  const burst = ease(frame, 4, 26);
  const badge = useSpring(hireAt, 12, 180);
  return (
    <Stage>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", ...useExit() }}>
        <div style={{ position: "relative", width: 560, height: 560, display: "grid", placeItems: "center" }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r0 = 190 + burst * 40;
            const len = 34 * Math.sin(burst * Math.PI) + 18 * burst;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 280 + Math.cos(a) * r0,
                  top: 280 + Math.sin(a) * r0,
                  width: len,
                  height: 7,
                  borderRadius: 6,
                  background: C.crimson,
                  opacity: (i % 2 ? 0.5 : 0.9) * Math.min(1, burst * 3),
                  transform: `translate(-50%,-50%) rotate(${(a * 180) / Math.PI}deg)`,
                }}
              />
            );
          })}
          <Card style={{ width: 300, height: 300, borderRadius: 76, display: "grid", placeItems: "center", ...popStyle(enter, 0, 0.5) }}>
            <Spark size={170} rotate={frame * 0.8} />
          </Card>
        </div>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#fff",
            borderRadius: 999,
            padding: "14px 30px 14px 14px",
            boxShadow: "0 14px 34px rgba(0,0,0,0.1)",
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 34,
            color: C.ink,
            ...popStyle(badge, 30, 0.7),
          }}
        >
          <Check size={52} />
          New hire · <span style={{ color: C.crimson }}>AI Agent</span>
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 3 + 4. 13 locked skills, 3 unlock                                   */
/* ================================================================== */
const ROWS = [5, 4, 4];
const UNLOCKS: Record<number, string> = { 1: "/ig-viral", 6: "/ig-comment", 11: "/ig-plan" };

const SkillGrid: React.FC<{ unlockFrames?: number[]; dimOthers?: number; popDelay?: number }> = ({
  unlockFrames,
  dimOthers = 0,
  popDelay = 0,
}) => {
  const frame = useCurrentFrame();
  let idx = 0;
  const unlockKeys = Object.keys(UNLOCKS).map(Number);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
      {ROWS.map((n, r) => (
        <div key={r} style={{ display: "flex", gap: 22 }}>
          {Array.from({ length: n }).map(() => {
            const i = idx++;
            const p = popDelay >= 0 ? ease(frame, popDelay + i * 2, popDelay + i * 2 + 10) : 1;
            const uk = unlockKeys.indexOf(i);
            const uf = unlockFrames && uk >= 0 ? unlockFrames[uk] : null;
            const u = uf !== null ? ease(frame, uf, uf + 10) : 0;
            const pulse = uf !== null && frame >= uf && frame < uf + 12 ? 1 + Math.sin(((frame - uf) / 12) * Math.PI) * 0.12 : 1;
            return (
              <div
                key={i}
                style={{
                  width: 132,
                  height: 132,
                  borderRadius: 34,
                  background: u > 0 ? `rgba(255,255,255,${0.9 + u * 0.1})` : "#F7F7F5",
                  border: `${2 + u * 3}px solid ${u > 0.01 ? C.crimson : "rgba(0,0,0,0.05)"}`,
                  boxShadow: u > 0 ? `0 16px 36px rgba(212,35,77,${0.25 * u})` : "0 8px 20px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: p * (uk >= 0 ? 1 : 1 - dimOthers * 0.6),
                  filter: `blur(${(1 - p) * 6 + (uk >= 0 ? 0 : dimOthers * 3)}px)`,
                  transform: `scale(${(0.7 + p * 0.3) * pulse})`,
                }}
              >
                {u > 0.5 ? (
                  <>
                    <Spark size={50} />
                    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 15, color: C.crimson }}>{UNLOCKS[i]}</div>
                  </>
                ) : (
                  <Lock size={50} open={u * 2} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const LockedCard: React.FC = () => {
  const frame = useCurrentFrame();
  const at13 = useWordFrame("13", 40);
  const big = useSpring(at13 - 2, 11, 170);
  return (
    <Stage top={400}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...useExit() }}>
        <div style={{ marginBottom: 34, transform: `rotate(${frame}deg)` }}>
          <Spark size={56} />
        </div>
        <SkillGrid popDelay={2} />
        <div style={{ textAlign: "center", marginTop: 34, ...popStyle(big, 40, 0.6) }}>
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 210, lineHeight: 0.9, color: C.ink, letterSpacing: -8 }}>13</div>
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 22, letterSpacing: 7, color: C.gray, marginTop: 14 }}>
            SECRET INSTAGRAM SKILLS
          </div>
        </div>
      </div>
    </Stage>
  );
};

export const UnlockCard: React.FC = () => {
  const frame = useCurrentFrame();
  const teen = useWordFrame("teen", 20);
  const frames = [teen - 6, teen + 4, teen + 14];
  const count = frames.filter((x) => frame >= x).length;
  const dim = ease(frame, teen + 14, teen + 28);
  return (
    <Stage top={400}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...useExit() }}>
        <div style={{ marginBottom: 34, transform: `rotate(${frame}deg)` }}>
          <Spark size={56} />
        </div>
        <SkillGrid unlockFrames={frames} dimOthers={dim} popDelay={-1} />
        <div style={{ marginTop: 40, fontFamily: F.sans, fontWeight: 800, letterSpacing: -6, display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 210, color: C.crimson, lineHeight: 0.9 }}>{count}</span>
          <span style={{ fontSize: 90, color: C.gray2, marginLeft: 12 }}>/ 13</span>
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 5. 10 hours vs 4 minutes                                            */
/* ================================================================== */
export const SpeedCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useSpring(0, 14, 150);
  const fourAt = useWordFrame("4", 40);
  const b = useSpring(fourAt - 14, 14, 150);
  const manual = ease(frame, 6, 110) * 0.86;
  const ai = ease(frame, fourAt - 4, fourAt + 14);
  const done = useSpring(fourAt + 16, 10, 200);
  const row = (
    icon: React.ReactNode,
    label: string,
    num: string,
    unit: string,
    color: string,
    prog: number,
    barColor: string,
    p: number,
    extra?: React.ReactNode,
  ) => (
    <Card style={{ width: 820, padding: "40px 46px", position: "relative", ...popStyle(p, 50, 0.9) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: F.sans, fontWeight: 700, fontSize: 32, color: C.ink }}>
          {icon}
          {label}
        </div>
        <div style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 600, color }}>
          <span style={{ fontSize: 110, lineHeight: 1 }}>{num}</span>
          <span style={{ fontSize: 44, marginLeft: 6 }}>{unit}</span>
        </div>
      </div>
      <div style={{ height: 18, background: "#ECEBE8", borderRadius: 20, marginTop: 26, overflow: "hidden" }}>
        <div style={{ width: `${prog * 100}%`, height: "100%", background: barColor, borderRadius: 20 }} />
      </div>
      {extra}
    </Card>
  );
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, ...useExit() }}>
        {row(
          <svg width={40} height={40} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={9} stroke={C.gray} strokeWidth={2} fill="none" />
            <path d="M12 7 V12 L15.5 14" stroke={C.gray} strokeWidth={2} fill="none" strokeLinecap="round" />
          </svg>,
          "Manual kaam",
          "10",
          "ghante",
          C.ink,
          manual,
          "#9A9995",
          a,
        )}
        {row(<Spark size={40} />, "AI Agent", "4", "minute", C.crimson, ai, C.crimson, b, (
          <div style={{ position: "absolute", right: -22, top: -22, transform: `scale(${done})` }}>
            <Check size={76} />
          </div>
        ))}
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* Command palette used by the three skills                            */
/* ================================================================== */
const COMMANDS = [
  { c: "/ig-viral", d: "Niche ke viral reels scan + hooks" },
  { c: "/ig-comment", d: "Har comment ka reply, aapki voice mein" },
  { c: "/ig-plan", d: "Poore week ka content calendar" },
];

const Palette: React.FC<{ active: number; start?: number }> = ({ active, start = 0 }) => {
  const frame = useCurrentFrame();
  const enter = useSpring(start, 14, 160);
  const text = typed(COMMANDS[active].c, frame, start + 6, 0.6);
  const full = text.length === COMMANDS[active].c.length;
  return (
    <div style={{ width: 860, ...popStyle(enter, 50, 0.9) }}>
      <Card style={{ padding: "26px 32px", display: "flex", alignItems: "center", gap: 20, borderRadius: 999 }}>
        <svg width={40} height={40} viewBox="0 0 24 24">
          <path d="M5 6 L10 12 L5 18" stroke={C.crimson} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 18 H19" stroke={C.crimson} strokeWidth={2.6} strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 44, color: C.ink }}>{text}</span>
        <Caret h={44} />
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        {COMMANDS.map((c, i) => {
          const p = ease(frame, start + 8 + i * 4, start + 20 + i * 4);
          const on = i === active && full;
          return (
            <Card
              key={c.c}
              small
              style={{
                padding: "22px 30px",
                display: "flex",
                alignItems: "center",
                gap: 22,
                opacity: p * (on ? 1 : 0.45),
                transform: `translateY(${(1 - p) * 20}px) scale(${on ? 1.03 : 1})`,
                border: on ? `3px solid ${C.crimson}` : `1.5px solid ${C.line}`,
                boxShadow: on ? "0 18px 40px rgba(212,35,77,0.18)" : undefined,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: on ? C.ink : "#EEEDEA",
                  color: on ? "#fff" : C.gray,
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 22,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                0{i + 1}
              </div>
              <div>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: on ? C.ink : C.gray }}>{c.c}</div>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 22, color: C.gray, marginTop: 4 }}>{c.d}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/** Cross-fades from A to B at frame `at`. */
const Swap: React.FC<{ at: number; a: React.ReactNode; b: React.ReactNode }> = ({ at, a, b }) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at, at + 10);
  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      {t < 1 && (
        <div style={{ gridArea: "1/1", opacity: 1 - t, filter: `blur(${t * 14}px)`, transform: `scale(${1 - t * 0.08})` }}>{a}</div>
      )}
      {frame >= at - 1 && (
        <div style={{ gridArea: "1/1", opacity: t, filter: `blur(${(1 - t) * 14}px)`, transform: `scale(${1.06 - t * 0.06})` }}>{b}</div>
      )}
    </div>
  );
};

/* ================================================================== */
/* 6. /ig-viral: reel grid with scan line                              */
/* ================================================================== */
const REELS = [
  { v: "2.4M", hue: "#3F6B5E", viral: true },
  { v: "890K", hue: "#8C7466", viral: false },
  { v: "1.7M", hue: "#4E4FC4", viral: true },
  { v: "310K", hue: "#9A8A6C", viral: false },
  { v: "3.1M", hue: "#2F8A4F", viral: true },
  { v: "1.2M", hue: "#C0476A", viral: true },
];

const ReelGrid: React.FC<{ start: number; small?: boolean }> = ({ start, small }) => {
  const frame = useCurrentFrame();
  const scan = ((frame - start) % 50) / 50;
  const s = small ? 0.5 : 1;
  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 22 * s }}>
      {REELS.map((r, i) => {
        const p = ease(frame, start + i * 3, start + i * 3 + 10);
        const hot = r.viral && frame > start + 16 + i * 3;
        return (
          <div
            key={i}
            style={{
              width: 250 * s,
              height: 400 * s,
              borderRadius: 26 * s,
              background: `linear-gradient(165deg, ${r.hue}, ${r.hue}AA 60%, #111 140%)`,
              position: "relative",
              overflow: "hidden",
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + p * 0.15})`,
              outline: hot ? `${5 * s}px solid ${C.crimson}` : "none",
              boxShadow: "0 14px 30px rgba(0,0,0,0.16)",
            }}
          >
            <div style={{ position: "absolute", left: "50%", top: "34%", transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 84 * s, height: 84 * s, borderRadius: 100, background: "rgba(255,255,255,0.45)", margin: "0 auto" }} />
              <div style={{ width: 150 * s, height: 70 * s, borderRadius: "80px 80px 20px 20px", background: "rgba(255,255,255,0.35)", marginTop: 10 * s }} />
            </div>
            {r.viral && !small && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: 14,
                  background: C.crimson,
                  color: "#fff",
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 17,
                  letterSpacing: 2,
                  padding: "5px 12px",
                  borderRadius: 999,
                  opacity: hot ? 1 : 0,
                }}
              >
                VIRAL
              </div>
            )}
            {!small && (
              <div style={{ position: "absolute", left: 16, bottom: 16, color: "#fff", fontFamily: F.sans, fontWeight: 800, fontSize: 26 }}>
                ▶ {r.v}
              </div>
            )}
          </div>
        );
      })}
      {!small && frame > start + 10 && (
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            top: `${scan * 100}%`,
            height: 6,
            borderRadius: 6,
            background: C.crimson,
            boxShadow: `0 0 30px 8px rgba(212,35,77,0.45)`,
          }}
        />
      )}
    </div>
  );
};

export const ViralCard: React.FC = () => {
  const ye = useWordFrame("ye", 60);
  return (
    <Stage>
      <div style={useExit()}>
        <Swap at={ye} a={<Palette active={0} start={2} />} b={<ReelGrid start={ye} />} />
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 7. Pattern breakdown -> new hook                                    */
/* ================================================================== */
export const PatternCard: React.FC = () => {
  const frame = useCurrentFrame();
  const copyAt = useWordFrame("copy", 40);
  const nayaAt = useWordFrame("naya", 70);
  const strip = useSpring(4, 14, 160);
  const strike = ease(frame, copyAt, copyAt + 8);
  const seg = (label: string, sub: string, bg: string, color: string, i: number) => {
    const p = ease(frame, 8 + i * 5, 20 + i * 5);
    return (
      <div
        style={{
          flex: i === 1 ? 1.4 : 1,
          background: bg,
          color,
          borderRadius: 22,
          padding: "22px 24px",
          fontFamily: F.sans,
          opacity: p,
          transform: `translateY(${(1 - p) * 24}px)`,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 1 }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 20, opacity: 0.7, marginTop: 4 }}>{sub}</div>
      </div>
    );
  };
  const hook = "Maine apna ₹15,000 wala manager fire kar diya…";
  const breakdown = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <ReelGrid start={-30} small />
      <Card style={{ width: 860, padding: "30px 30px 36px", ...popStyle(strip, 40, 0.9) }}>
        <Label style={{ marginBottom: 22 }}>Pattern mila</Label>
        <div style={{ display: "flex", gap: 14, position: "relative" }}>
          {seg("HOOK", "0-3s", C.crimson, "#fff", 0)}
          {seg("STORY", "3-40s", C.ink, "#fff", 1)}
          {seg("CTA", "end", "#D9D8D4", C.ink, 2)}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%,-50%) rotate(-6deg) scale(${0.6 + ease(frame, copyAt - 4, copyAt + 4) * 0.4})`,
              opacity: ease(frame, copyAt - 4, copyAt + 2),
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 76,
              color: "#fff",
              background: "rgba(18,18,18,0.9)",
              padding: "0 28px",
              borderRadius: 18,
            }}
          >
            COPY
            <div
              style={{
                position: "absolute",
                left: -10,
                top: "52%",
                height: 10,
                width: `${strike * 110}%`,
                background: C.crimson,
                borderRadius: 6,
                transform: "rotate(-4deg)",
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
  const newHook = (
    <Card style={{ width: 860, minHeight: 440, padding: "40px 44px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label color="#fff" bg={C.crimson}>
          New hook
        </Label>
        <Spark size={50} rotate={frame * 1.2} />
      </div>
      <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 58, lineHeight: 1.2, color: C.ink, marginTop: 34, letterSpacing: -1 }}>
        {typed(hook, frame, nayaAt + 6, 1.3)}
        <Caret h={56} />
      </div>
      <div style={{ position: "absolute", left: 44, bottom: 34, display: "flex", gap: 12 }}>
        {["Original", "0% copy", "Hinglish"].map((t) => (
          <span key={t} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.gray, background: "#F0EFEC", padding: "8px 16px", borderRadius: 999 }}>
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
  return (
    <Stage>
      <div style={useExit()}>
        <Swap at={nayaAt - 4} a={breakdown} b={newHook} />
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 8. /ig-comment: replies in your voice                               */
/* ================================================================== */
const Comment: React.FC<{ user: string; text: string; hue: string; p: number; reply?: string; replyP?: number; replyChars?: number }> = ({
  user,
  text,
  hue,
  p,
  reply,
  replyP = 0,
  replyChars = 999,
}) => (
  <div style={{ ...popStyle(p, 30, 0.92) }}>
    <Card small style={{ padding: "24px 28px", display: "flex", gap: 20, alignItems: "center" }}>
      <MiniFace size={64} hue={hue} />
      <div style={{ fontFamily: F.sans }}>
        <div style={{ fontWeight: 800, fontSize: 24, color: C.ink }}>@{user}</div>
        <div style={{ fontWeight: 600, fontSize: 28, color: "#3A3A3A", marginTop: 2 }}>{text}</div>
      </div>
    </Card>
    {reply && replyP > 0.01 && (
      <div style={{ marginLeft: 70, marginTop: 14, ...popStyle(replyP, 20, 0.92) }}>
        <Card
          small
          style={{
            padding: "22px 26px",
            background: "#FFF1F4",
            border: `2px solid rgba(212,35,77,0.35)`,
            display: "flex",
            gap: 18,
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 56, background: C.ink, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Spark size={30} color="#fff" />
          </div>
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 28, color: C.ink }}>{reply.slice(0, replyChars)}</div>
          <span
            style={{
              position: "absolute",
              right: 18,
              top: -18,
              background: C.crimson,
              color: "#fff",
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: 1.5,
              padding: "6px 12px",
              borderRadius: 999,
            }}
          >
            AAPKI VOICE
          </span>
        </Card>
      </div>
    )}
  </div>
);

export const CommentCard: React.FC = () => {
  const frame = useCurrentFrame();
  const har = useWordFrame("har", 60);
  const meri = useWordFrame("meri", 90);
  const r1 = "Bhai DM check kar, link bhej diya!";
  const r2 = "Thank you yaar! Next wali aur crazy hogi.";
  const list = (
    <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 26 }}>
      <Comment
        user="rahul.builds"
        text="Bhai ye setup kaise karu?"
        hue="#7B8CDE"
        p={ease(frame, har, har + 10)}
        reply={r1}
        replyP={ease(frame, har + 10, har + 20)}
        replyChars={Math.floor((frame - har - 12) * 1.4)}
      />
      <Comment
        user="simran.creates"
        text="Ye reel mast thi"
        hue="#E28AA5"
        p={ease(frame, har + 14, har + 24)}
        reply={r2}
        replyP={ease(frame, meri - 6, meri + 4)}
        replyChars={Math.floor((frame - meri + 4) * 1.5)}
      />
    </div>
  );
  return (
    <Stage>
      <div style={useExit()}>
        <Swap at={har - 4} a={<Palette active={1} start={2} />} b={list} />
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 9. Approve                                                          */
/* ================================================================== */
export const ApproveCard: React.FC = () => {
  const frame = useCurrentFrame();
  const at = useWordFrame("approve", 20);
  const enter = useSpring(0, 14, 160);
  const click = at + 8;
  const sent = ease(frame, click, click + 6);
  const cx = interpolate(frame, [0, click - 4], [760, 600], clamp);
  const cy = interpolate(frame, [0, click - 4], [760, 520], clamp);
  const press = frame >= click - 2 && frame < click + 4 ? 0.92 : 1;
  return (
    <Stage>
      <div style={{ position: "relative", ...useExit() }}>
        <Card style={{ width: 860, padding: "36px 40px", ...popStyle(enter, 40, 0.9) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <MiniFace size={70} hue="#7BC4A6" />
            <div style={{ fontFamily: F.sans, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 26, color: C.ink }}>@neha.designs</div>
              <div style={{ fontWeight: 600, fontSize: 30, color: "#3A3A3A" }}>Kaunsa AI tool use karte ho?</div>
            </div>
          </div>
          <div style={{ marginTop: 26, background: "#F4F3F0", borderRadius: 24, padding: "24px 26px", position: "relative" }}>
            <Label style={{ position: "absolute", top: -16, right: 20, fontSize: 16 }}>Draft</Label>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.ink, lineHeight: 1.35 }}>
              Ek custom AI agent hai, 13 skills wala. Comment karo AGENT, setup bhej dunga!
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 28 }}>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 28, color: C.gray, padding: "18px 30px", borderRadius: 999, background: "#EFEEEB", opacity: 1 - sent }}>
              Edit
            </div>
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 30,
                color: "#fff",
                padding: "18px 40px",
                borderRadius: 999,
                background: sent > 0.5 ? C.green : C.crimson,
                transform: `scale(${press})`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: `0 12px 26px ${sent > 0.5 ? "rgba(31,164,99,0.35)" : "rgba(212,35,77,0.35)"}`,
              }}
            >
              {sent > 0.5 ? "✓ Posted" : "Approve"}
            </div>
          </div>
        </Card>
        {/* cursor */}
        <svg
          width={64}
          height={64}
          viewBox="0 0 24 24"
          style={{ position: "absolute", left: cx, top: cy, transform: `scale(${press})`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" }}
        >
          <path d="M5 3 L19 12 L12.5 13.5 L9.5 20 Z" fill={C.ink} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 10. Command 03 is dangerous                                         */
/* ================================================================== */
const Tape: React.FC<{ text: string; bg: string; color: string; rot: number; y: number; speed: number }> = ({ text, bg, color, rot, y, speed }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, 6, 18);
  const items = Array.from({ length: 12 }).map(() => text).join("   ✱   ");
  return (
    <div
      style={{
        position: "absolute",
        left: -200,
        right: -200,
        top: y,
        transform: `rotate(${rot}deg) scaleX(${p})`,
        background: bg,
        color,
        fontFamily: F.sans,
        fontWeight: 800,
        fontSize: 48,
        letterSpacing: 4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        padding: "14px 0",
        boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ transform: `translateX(${-((frame * speed) % 600)}px)` }}>{items}</div>
    </div>
  );
};

export const DangerCard: React.FC = () => {
  const frame = useCurrentFrame();
  const kh = useWordFrame("khatarnaak", 30);
  const big = useSpring(0, 10, 200);
  const shake = frame > kh && frame < kh + 12 ? Math.sin(frame * 4) * (12 - (frame - kh)) : 0;
  return (
    <AbsoluteFill style={{ ...useExit() }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 520,
          textAlign: "center",
          fontFamily: F.sans,
          fontWeight: 800,
          fontSize: 520,
          letterSpacing: -30,
          color: C.ink,
          lineHeight: 1,
          transform: `scale(${0.6 + big * 0.4}) translateX(${shake}px)`,
          opacity: Math.min(1, big * 2),
        }}
      >
        03
      </div>
      <Tape text="CAUTION" bg={C.ink} color="#fff" rot={-8} y={860} speed={4} />
      {frame > kh - 6 && <Tape text="DANGEROUS" bg={C.crimson} color="#fff" rot={6} y={960} speed={-5} />}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 11. /ig-plan: week calendar                                         */
/* ================================================================== */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const KINDS = [
  { k: "Reel", c: C.crimson },
  { k: "Carousel", c: C.ink },
  { k: "Reel", c: C.crimson },
  { k: "Story", c: "#9A9995" },
  { k: "Reel", c: C.crimson },
  { k: "Carousel", c: C.ink },
  { k: "Reel", c: C.crimson },
];

export const PlanCard: React.FC = () => {
  const frame = useCurrentFrame();
  const ek = useWordFrame("click", 30);
  const capAt = useWordFrame("scripts", 120);
  const enter = useSpring(0, 14, 160);
  const press = frame >= ek - 2 && frame < ek + 4 ? 0.92 : 1;
  const cap = useSpring(capAt - 4, 13, 150);
  return (
    <Stage>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", ...useExit() }}>
        <Card style={{ padding: "20px 30px", borderRadius: 999, display: "flex", alignItems: "center", gap: 16, marginBottom: 34, ...popStyle(enter, 30, 0.9) }}>
          <svg width={34} height={34} viewBox="0 0 24 24">
            <rect x={3.5} y={5} width={17} height={15} rx={3} stroke={C.crimson} strokeWidth={2} fill="none" />
            <path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7" stroke={C.crimson} strokeWidth={2} strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 38, color: C.ink }}>{typed("/ig-plan", frame, 0, 0.7)}</span>
        </Card>
        <div style={{ display: "flex", gap: 14 }}>
          {DAYS.map((d, i) => {
            const fill = ease(frame, ek + 4 + i * 3, ek + 14 + i * 3);
            const p = ease(frame, 4 + i * 2, 14 + i * 2);
            return (
              <Card
                key={d}
                small
                style={{ width: 112, padding: "18px 12px 20px", textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 30}px)`, borderRadius: 22 }}
              >
                <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.gray }}>{d}</div>
                <div
                  style={{
                    height: 96,
                    borderRadius: 16,
                    marginTop: 12,
                    background: fill > 0.02 ? KINDS[i].c : "#EEEDEA",
                    transform: `scale(${0.6 + fill * 0.4})`,
                    opacity: 0.3 + fill * 0.7,
                  }}
                />
                <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 15, color: C.ink, marginTop: 10, opacity: fill }}>{KINDS[i].k}</div>
                {[0, 1].map((l) => (
                  <div key={l} style={{ height: 8, borderRadius: 6, background: "#ECEBE8", marginTop: 8, width: l ? "60%" : "90%", marginInline: "auto" }} />
                ))}
              </Card>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 34,
            background: C.ink,
            color: "#fff",
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 32,
            padding: "22px 46px",
            borderRadius: 999,
            transform: `scale(${press})`,
            boxShadow: "0 16px 34px rgba(0,0,0,0.25)",
            opacity: 1 - cap * 0.4,
          }}
        >
          {frame > ek + 4 ? "✓ Week Ready" : "Generate Week"}
        </div>

        {/* script + caption cards */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, display: "flex", gap: 20, justifyContent: "center", pointerEvents: "none" }}>
          {[
            { l: "Script", t: "Hook → Problem → Demo → CTA", r: -4 },
            { l: "SEO Caption", t: "#aitools #instagramtips #reels", r: 4 },
          ].map((c, i) => (
            <Card
              key={c.l}
              small
              style={{
                width: 420,
                padding: "26px 28px",
                transform: `translateY(${(1 - cap) * 260 + i * 40}px) rotate(${c.r * cap}deg)`,
                opacity: cap,
              }}
            >
              <Label style={{ fontSize: 16 }}>{c.l}</Label>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 26, color: C.ink, marginTop: 16, lineHeight: 1.35 }}>{c.t}</div>
              {[0, 1].map((l) => (
                <div key={l} style={{ height: 10, borderRadius: 6, background: "#ECEBE8", marginTop: 12, width: l ? "55%" : "85%" }} />
              ))}
            </Card>
          ))}
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 12. Think: handled by AvatarRig; faint calendar ghosts behind       */
/* ================================================================== */
export const ThinkCard: React.FC = () => null;

/* ================================================================== */
/* 13. Save                                                            */
/* ================================================================== */
export const SaveCard: React.FC = () => {
  const frame = useCurrentFrame();
  const at = useWordFrame("save", 20);
  const enter = useSpring(0, 12, 160);
  const fill = ease(frame, at, at + 6);
  const pop = frame >= at && frame < at + 10 ? 1 + Math.sin(((frame - at) / 10) * Math.PI) * 0.18 : 1;
  const toast = useSpring(at + 6, 13, 180);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...useExit() }}>
        <Card style={{ width: 400, height: 400, borderRadius: 90, display: "grid", placeItems: "center", ...popStyle(enter, 40, 0.7) }}>
          <svg width={190} height={190} viewBox="0 0 24 24" style={{ transform: `scale(${pop})` }}>
            <path
              d="M6.5 3.5 H17.5 A1 1 0 0 1 18.5 4.5 V20.5 L12 16 L5.5 20.5 V4.5 A1 1 0 0 1 6.5 3.5 Z"
              fill={fill > 0.05 ? C.crimson : "none"}
              fillOpacity={fill}
              stroke={fill > 0.5 ? C.crimson : C.ink}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </svg>
        </Card>
        <div
          style={{
            marginTop: 40,
            background: C.ink,
            color: "#fff",
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 32,
            padding: "18px 34px",
            borderRadius: 999,
            ...popStyle(toast, 30, 0.8),
          }}
        >
          Saved to collection
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 14. CTA: comment AGENT                                              */
/* ================================================================== */
export const CtaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const at = useWordFrame("comment", 40);
  const agentAt = useWordFrame("agent", 60);
  const enter = useSpring(0, 13, 150);
  const box = useSpring(at - 8, 14, 160);
  const word = typed("AGENT", frame, agentAt - 4, 0.5);
  const posted = frame > agentAt + 10;
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, ...useExit() }}>
        <Card style={{ width: 620, padding: "40px", textAlign: "center", ...popStyle(enter, 40, 0.85) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
            <Spark size={84} rotate={frame} />
            <span style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 50, color: C.gray2 }}>+</span>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 26,
                background: "linear-gradient(135deg, #F7B24A, #E1306C 55%, #8A3AB9)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, border: "5px solid #fff", display: "grid", placeItems: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: 14, border: "4px solid #fff" }} />
              </div>
            </div>
          </div>
          <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 52, color: C.ink, marginTop: 30 }}>13 Skills · Setup</div>
          <div style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 500, fontSize: 40, color: C.crimson, marginTop: 6 }}>
            exact setup link
          </div>
        </Card>
        <Card style={{ width: 860, padding: "18px 18px 18px 22px", borderRadius: 999, display: "flex", alignItems: "center", gap: 20, ...popStyle(box, 30, 0.9) }}>
          <MiniFace size={64} hue="#7B8CDE" />
          <span style={{ flex: 1, fontFamily: F.sans, fontWeight: 800, fontSize: 40, color: word ? C.ink : C.gray2 }}>
            {word || "Add a comment…"}
            {word && !posted && <Caret h={40} />}
          </span>
          <div
            style={{
              background: posted ? C.green : C.ink,
              color: "#fff",
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 28,
              padding: "16px 32px",
              borderRadius: 999,
            }}
          >
            {posted ? "✓ Posted" : "Post"}
          </div>
        </Card>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 15. DM                                                              */
/* ================================================================== */
export const DmCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 13, 150);
  const b1 = useSpring(8, 13, 170);
  const b2 = useSpring(18, 13, 170);
  const typing = frame < 8;
  return (
    <Stage>
      <div style={useExit()}>
        <Card style={{ width: 860, padding: "30px 34px 40px", ...popStyle(enter, 40, 0.9) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 24, borderBottom: `2px solid ${C.line}` }}>
            <div style={{ width: 64, height: 64, borderRadius: 64, background: C.ink, display: "grid", placeItems: "center" }}>
              <Spark size={34} color="#fff" />
            </div>
            <div style={{ fontFamily: F.sans, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 28, color: C.ink }}>Your inbox</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: C.green }}>● Active now</div>
            </div>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.gray }}>now</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, marginTop: 30 }}>
            {typing ? (
              <div style={{ background: "#F0EFEC", borderRadius: 30, padding: "22px 28px", display: "flex", gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 14, background: C.gray, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 4 + i)) }} />
                ))}
              </div>
            ) : (
              <div style={{ background: "#F0EFEC", borderRadius: "30px 30px 30px 8px", padding: "22px 28px", fontFamily: F.sans, fontWeight: 700, fontSize: 32, color: C.ink, ...popStyle(b1, 20, 0.9) }}>
                Ye lo bhai, poora setup
              </div>
            )}
            <div
              style={{
                width: 560,
                borderRadius: "30px 30px 30px 8px",
                border: `2px solid ${C.line}`,
                background: "#fff",
                overflow: "hidden",
                boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                ...popStyle(b2, 20, 0.9),
              }}
            >
              <div style={{ height: 150, background: `linear-gradient(135deg, ${C.crimsonSoft}, #fff)`, display: "grid", placeItems: "center" }}>
                <Spark size={80} rotate={frame} />
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.ink }}>13 Skills · Setup Guide</div>
                <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 20, color: C.gray, marginTop: 6 }}>step-by-step · link</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Stage>
  );
};

export const CARDS: Record<string, React.FC> = {
  fired: FiredCard,
  hired: HiredCard,
  locked: LockedCard,
  unlock: UnlockCard,
  speed: SpeedCard,
  viral: ViralCard,
  pattern: PatternCard,
  comment: CommentCard,
  approve: ApproveCard,
  danger: DangerCard,
  plan: PlanCard,
  think: ThinkCard,
  save: SaveCard,
  cta: CtaCard,
  dm: DmCard,
};
