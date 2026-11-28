import React from "react";
import { Easing, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, NUMBERS } from "./content";
import { C, F } from "./theme";
import {
  Bar,
  Card,
  Caret,
  Headline,
  IGGlyph,
  LogoMark,
  Mascot,
  Mono,
  Pill,
  SceneExit,
  Stage,
  StepTag,
  lerp,
  pop,
  popIn,
  typed,
} from "./ui";

type SceneProps = { dur: number };

const Check: React.FC<{ size?: number; color?: string }> = ({ size = 26, color = C.violet }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ================= 1. HOOK ================= */

export const Hook: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.min(4, Math.max(0, Math.floor(lerp(f, 22, 104, 0, 4.999, Easing.linear))));
  const items = ["/seo-content", "/performance-ads", "/web-design", "/brand-social"];
  const icons = pop(f, fps, 6);
  const card = pop(f, fps, 12);
  const dash = lerp(f, 10, 40, 0, 1);
  const travel = ((f - 10) % 40) / 40;
  return (
    <SceneExit dur={dur}>
      <Headline l1="Agency hire mat karo" l2="Jab tak ye 4 na dekho" s1={76} s2={70} />

      {/* business  - - - -  alphastrix */}
      <div
        style={{
          position: "absolute",
          top: 528,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
          ...popIn(icons, 24),
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 32,
            background: C.white,
            border: `1px solid ${C.line}`,
            boxShadow: "0 14px 30px -12px rgba(40,30,10,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={64} height={64} viewBox="0 0 24 24">
            <path d="M4 19V5M4 19h16" stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <path d="M7 15l4-4 3 3 5-6" stroke={C.violet} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <div style={{ position: "relative", width: 170, height: 6 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${dash * 100}%`,
              backgroundImage: `linear-gradient(90deg, ${C.violet} 55%, transparent 45%)`,
              backgroundSize: "18px 4px",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 1px",
            }}
          />
          {f > 40 && (
            <div
              style={{
                position: "absolute",
                top: -6,
                left: `${travel * 100}%`,
                width: 18,
                height: 18,
                borderRadius: 9,
                background: C.violet,
                boxShadow: `0 0 0 6px ${C.violetSoft}`,
              }}
            />
          )}
        </div>
        <LogoMark size={118} />
      </div>

      <Stage top={700}>
        <Card style={{ ...popIn(card, 50), display: "flex", gap: 40, padding: "48px 48px", height: 560 }}>
          <div style={{ width: 230, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <div
              key={count}
              style={{
                fontFamily: F.sans,
                fontWeight: 900,
                fontSize: 230,
                lineHeight: 0.9,
                color: C.ink,
                letterSpacing: "-0.06em",
                transform: `scale(${0.85 + 0.15 * pop(f, fps, 22 + count * 20.5, 10)})`,
                transformOrigin: "20% 80%",
              }}
            >
              {count}
            </div>
            <div style={{ marginTop: 20, lineHeight: 1.4 }}>
              <Mono size={24} color="#8D887C" weight={700}>
                SERVICES
                <br />
                FOR GROWTH
              </Mono>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
            {items.map((it, i) => {
              const on = count > i;
              const op = on ? pop(f, fps, 22 + (i + 1) * 20.5, 12) : 0;
              return (
                <div
                  key={it}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "22px 24px",
                    borderRadius: 20,
                    background: on ? C.white : "rgba(255,255,255,0.35)",
                    border: `1px solid ${on ? C.line : "transparent"}`,
                    boxShadow: on ? "0 8px 18px -10px rgba(40,30,10,0.3)" : "none",
                    transform: `translateX(${on ? (1 - op) * 24 : 0}px)`,
                    opacity: on ? 1 : 0.5,
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 8, background: on ? C.violet : C.mute2 }} />
                  <Mono size={29} color={on ? C.ink : C.mute} weight={on ? 700 : 500}>
                    {it}
                  </Mono>
                  <div style={{ flex: 1 }} />
                  {on && (
                    <div style={{ transform: `scale(${op})` }}>
                      <Check />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </Stage>
    </SceneExit>
  );
};

/* ================= 2. PROOF ================= */

export const Proof: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 4);
  const n = Math.round(lerp(f, 10, 62, 0, NUMBERS.projects, Easing.out(Easing.quad)));
  const chips = [
    { t: "SEO", bg: "rgba(255,255,255,0.1)", c: C.white },
    { t: "ADS", bg: C.lime, c: C.ink },
    { t: "WEB", bg: C.violet, c: C.white },
    { t: "SOCIAL", bg: "rgba(255,255,255,0.1)", c: C.white },
  ];
  const lines = [
    [`${NUMBERS.roas}x`, " average ROAS"],
    [`${NUMBERS.organicGrowth}%`, " avg organic growth"],
    [`${NUMBERS.retention}%`, " client retention"],
  ];
  return (
    <SceneExit dur={dur}>
      <Headline l1="Alphastrix digital" l2={`${NUMBERS.projects}+ projects`} s1={86} s2={92} />
      <Stage top={590}>
        <Card dark style={{ ...popIn(card, 60), height: 760, padding: "40px 52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: C.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={22} height={22} viewBox="5 5 22 22">
                <path d="M16 5 27 27H21L16 17 11 27H5L16 5Z" fill={C.ink} />
              </svg>
            </div>
            <Mono size={27} color="rgba(255,255,255,0.75)">
              alphastrix-digital/results
            </Mono>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 44 }}>
            <div style={{ transform: `scale(${pop(f, fps, 8, 11)})` }}>
              <div
                style={{
                  width: 156,
                  height: 156,
                  borderRadius: 40,
                  background: `linear-gradient(145deg, #9A82FF 0%, ${C.violet} 55%, #5B3BE0 100%)`,
                  boxShadow: "0 18px 40px -12px rgba(124,92,255,0.6), inset 0 2px 0 rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={92} height={92} viewBox="5 5 22 22">
                  <path d="M16 5 27 27H21L16 17 11 27H5L16 5Z" fill={C.white} />
                  <path d="M16 5 27 27H21L16 17Z" fill={C.lime} />
                </svg>
              </div>
            </div>
            <div
              style={{
                fontFamily: F.sans,
                fontWeight: 900,
                fontSize: 210,
                lineHeight: 1,
                letterSpacing: "-0.06em",
                color: C.white,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {n}
              <span style={{ color: C.lime }}>+</span>
            </div>
          </div>
          <div style={{ marginTop: 18, fontFamily: F.sans, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.55)" }}>
            projects delivered · India + worldwide
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
            {chips.map((c, i) => {
              const p = pop(f, fps, 50 + i * 4, 12);
              return (
                <div key={c.t} style={{ transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
                  <Pill bg={c.bg} color={c.c} size={22} style={{ fontFamily: F.mono, letterSpacing: "0.06em" }}>
                    {c.t}
                  </Pill>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 12 }}>
            {lines.map(([num, rest], i) => {
              const start = 64 + i * 12;
              const full = `› ${num}${rest}`;
              const shown = typed(full, f, start, 2.4);
              const numPart = shown.slice(2, 2 + num.length);
              const restPart = shown.slice(2 + num.length);
              return (
                <div key={i} style={{ height: 36 }}>
                  <Mono size={27} color="rgba(255,255,255,0.5)">
                    {shown.slice(0, 2)}
                    <span style={{ color: C.lime, fontWeight: 700 }}>{numPart}</span>
                    {restPart}
                  </Mono>
                </div>
              );
            })}
          </div>
        </Card>
      </Stage>
    </SceneExit>
  );
};

/* ================= 3. TEAM ================= */

export const Team: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 2);
  const roles = [
    { r: "SEO Specialist", t: "rankings", c: C.violet, i: "S" },
    { r: "Ads Manager", t: "ROAS", c: C.ink, i: "A" },
    { r: "Web Designer", t: "conversions", c: "#9A82FF", i: "W" },
    { r: "Content Creator", t: "reels + posts", c: "#3B3B4A", i: "C" },
  ];
  const tag = pop(f, fps, 34, 12);
  return (
    <SceneExit dur={dur}>
      <Headline l1="Alphastrix = aapki" l2="Marketing team" s1={84} s2={90} />
      <Stage top={600}>
        <Card style={{ ...popIn(card, 40), padding: 36 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            {roles.map((r, i) => {
              const p = pop(f, fps, 6 + i * 5, 12);
              return (
                <div
                  key={r.r}
                  style={{
                    background: C.white,
                    borderRadius: 26,
                    border: `1px solid ${C.line}`,
                    padding: "30px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    ...popIn(p, 30),
                  }}
                >
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      borderRadius: 43,
                      background: r.c,
                      color: r.c === C.ink || r.c === "#3B3B4A" ? C.lime : C.white,
                      fontFamily: F.sans,
                      fontWeight: 900,
                      fontSize: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {r.i}
                  </div>
                  <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 34, color: C.ink, letterSpacing: "-0.02em" }}>
                    {r.r}
                  </div>
                  <Mono size={24} color="#8D887C">
                    → {r.t}
                  </Mono>
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{ display: "flex", justifyContent: "center", marginTop: -30, position: "relative", zIndex: 5 }}>
          <div style={{ transform: `scale(${tag})` }}>
            <Pill size={28}>
              <span style={{ color: C.lime }}>●</span> ek team · ek point of contact
            </Pill>
          </div>
        </div>
      </Stage>
      <Mascot delay={20} y={1215} x={850} size={140} />
    </SceneExit>
  );
};

/* ================= 4. SEO ================= */

export const Seo: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 4);
  const query = typed("best dentist in pune", f, 10, 0.9);
  const k = lerp(f, 58, 96, 0, 1, Easing.inOut(Easing.cubic));
  const rank = Math.max(1, Math.round(lerp(f, 52, 96, 18, 1, Easing.inOut(Easing.quad))));
  const rowH = 104;
  const others = [
    { d: "smiledental.in", w: 380 },
    { d: "justdial.com", w: 320 },
    { d: "practo.com", w: 350 },
  ];
  const draw = lerp(f, 70, 125, 0, 1, Easing.inOut(Easing.cubic));
  const growth = Math.round(lerp(f, 70, 125, 0, NUMBERS.organicGrowth));
  const won = f >= 96;
  const wonP = pop(f, fps, 96, 10);
  return (
    <SceneExit dur={dur}>
      <Headline l1="Pehli service" l2="SEO & content" s1={86} s2={92} />
      <StepTag n={1} slug="seo-content" top={516} />
      <Stage top={598}>
        <Card style={{ ...popIn(card, 50), padding: 34, height: 760 }}>
          {/* search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 26px",
              background: C.white,
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              boxShadow: "0 6px 16px -8px rgba(40,30,10,0.25)",
            }}
          >
            <svg width={32} height={32} viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#8D887C" strokeWidth={2.4} />
              <path d="M15.5 15.5L20 20" stroke="#8D887C" strokeWidth={2.4} strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 32, color: C.ink }}>
              {query}
              {f < 50 && <Caret h={32} />}
            </span>
          </div>

          {/* results */}
          <div style={{ position: "relative", height: rowH * 4, marginTop: 24 }}>
            {others.map((o, j) => (
              <div
                key={o.d}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (j + k) * rowH,
                  height: rowH - 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "0 22px",
                  opacity: lerp(f, 30 + j * 4, 40 + j * 4, 0, 1),
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 20, background: C.mute2 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Mono size={23} color="#8D887C">
                    {o.d}
                  </Mono>
                  <Bar w={o.w} h={14} />
                </div>
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: (3 - 3 * k) * rowH,
                height: rowH - 14,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 22px",
                borderRadius: 22,
                background: C.white,
                border: `2.5px solid ${C.violet}`,
                boxShadow: `0 ${12 + 14 * Math.sin(k * Math.PI)}px 30px -12px rgba(124,92,255,0.45)`,
                transform: `scale(${1 + 0.03 * Math.sin(k * Math.PI)})`,
                zIndex: 3,
                opacity: lerp(f, 42, 52, 0, 1),
              }}
            >
              <LogoMark size={44} radius={14} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <Mono size={23} color={C.violetText} weight={700}>
                  yourbrand.com
                </Mono>
                <span style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 28, color: C.ink }}>
                  Pune ke best dentist · book today
                </span>
              </div>
              <div
                style={{
                  minWidth: 92,
                  padding: "10px 16px",
                  borderRadius: 16,
                  textAlign: "center",
                  background: won ? C.violet : C.card2,
                  color: won ? C.white : C.ink,
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 30,
                  transform: `scale(${won ? 0.9 + 0.1 * wonP : 1})`,
                }}
              >
                #{rank}
              </div>
            </div>
          </div>

          {/* organic traffic */}
          <div
            style={{
              marginTop: 18,
              background: C.white,
              borderRadius: 24,
              border: `1px solid ${C.line}`,
              padding: "22px 26px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: lerp(f, 62, 72, 0, 1),
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Mono size={21} color="#8D887C" weight={700}>
                ORGANIC TRAFFIC
              </Mono>
              <span style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 56, color: C.ink, letterSpacing: "-0.04em" }}>
                +{growth}
                <span style={{ color: C.violet }}>%</span>
              </span>
            </div>
            <svg width={420} height={110} viewBox="0 0 420 110" style={{ flex: 1 }}>
              <path
                d="M4 100 C 60 96, 90 92, 130 84 S 200 74, 240 60 S 320 40, 360 22 S 400 10, 416 6"
                fill="none"
                stroke={C.violet}
                strokeWidth={6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw}
              />
              <circle cx={416} cy={6} r={8} fill={C.violet} opacity={draw > 0.97 ? 1 : 0} />
            </svg>
          </div>
        </Card>
      </Stage>
    </SceneExit>
  );
};

/* ================= 5. ADS ================= */

export const Ads: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 4);
  const roas = lerp(f, 12, 100, 1, NUMBERS.roas, Easing.out(Easing.quad));
  const camps = [
    { n: "Google Search", w: 0.9, v: "4.1x", c: C.violet },
    { n: "Meta Reels", w: 0.74, v: "3.3x", c: C.ink },
    { n: "LinkedIn Leads", w: 0.56, v: "2.6x", c: "#9A82FF" },
  ];
  const cpl = pop(f, fps, 84, 10);
  const tracked = pop(f, fps, 96, 12);
  return (
    <SceneExit dur={dur}>
      <Headline l1="Doosri service" l2="Performance ads" s1={86} s2={88} />
      <StepTag n={2} slug="performance-ads" top={516} />
      <Stage top={598}>
        <Card style={{ ...popIn(card, 50), padding: "38px 40px", height: 720 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Mono size={22} color="#8D887C" weight={700}>
                AVERAGE ROAS
              </Mono>
              <div
                style={{
                  fontFamily: F.sans,
                  fontWeight: 900,
                  fontSize: 168,
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                  color: C.ink,
                  marginTop: 6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {roas.toFixed(1)}
                <span style={{ color: C.violet }}>x</span>
              </div>
            </div>
            <div style={{ transform: `scale(${cpl}) rotate(${(1 - cpl) * -12 + 3}deg)`, marginTop: 30 }}>
              <div
                style={{
                  background: C.ink,
                  borderRadius: 24,
                  padding: "18px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: "0 16px 30px -12px rgba(11,11,16,0.5)",
                }}
              >
                <Mono size={20} color="rgba(255,255,255,0.6)" weight={700}>
                  COST / LEAD
                </Mono>
                <span style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 52, color: C.lime, letterSpacing: "-0.03em" }}>
                  ↓ {NUMBERS.cplDrop}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 40 }}>
            {camps.map((c, i) => {
              const g = lerp(f, 26 + i * 10, 80 + i * 10, 0, c.w, Easing.out(Easing.cubic));
              return (
                <div key={c.n} style={{ opacity: lerp(f, 20 + i * 8, 30 + i * 8, 0, 1) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.ink }}>{c.n}</span>
                    <Mono size={28} color={C.ink} weight={700}>
                      {c.v}
                    </Mono>
                  </div>
                  <div style={{ height: 26, borderRadius: 13, background: C.card2, border: `1px solid ${C.line}`, overflow: "hidden" }}>
                    <div style={{ width: `${g * 100}%`, height: "100%", borderRadius: 13, background: c.c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{ display: "flex", justifyContent: "center", marginTop: -34, position: "relative" }}>
          <div style={{ transform: `scale(${tracked})` }}>
            <Pill size={28}>₹ har rupee tracked</Pill>
          </div>
        </div>
      </Stage>
    </SceneExit>
  );
};

/* ================= 6. WEB ================= */

export const Web: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 4);
  const url = typed("yourbrand.com", f, 8, 0.8);
  const b = (d: number) => popIn(pop(f, fps, d, 13), 26);
  // cursor path to the CTA button
  const cx = lerp(f, 66, 92, 760, 300, Easing.inOut(Easing.cubic));
  const cy = lerp(f, 66, 92, 690, 410, Easing.inOut(Easing.cubic));
  const press = f >= 94 && f < 100 ? 0.92 : 1;
  const toast = pop(f, fps, 100, 11);
  const score = Math.round(lerp(f, 30, 90, 0, NUMBERS.speedScore));
  const ring = pop(f, fps, 26, 11);
  const R = 58;
  const circ = 2 * Math.PI * R;
  return (
    <SceneExit dur={dur}>
      <Headline l1="Teesri service" l2="Web design" s1={86} s2={96} />
      <StepTag n={3} slug="web-design" top={516} />
      <Stage top={598}>
        <Card style={{ ...popIn(card, 50), padding: 0, height: 760, overflow: "hidden" }}>
          {/* browser chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "22px 28px",
              borderBottom: `1px solid ${C.line}`,
              background: "rgba(255,255,255,0.6)",
            }}
          >
            {["#FF6159", "#FFBD2E", "#28C941"].map((c) => (
              <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
            ))}
            <div
              style={{
                marginLeft: 20,
                flex: 1,
                padding: "10px 22px",
                borderRadius: 999,
                background: C.card2,
                border: `1px solid ${C.line}`,
              }}
            >
              <Mono size={24} color={C.ink}>
                🔒 {url}
              </Mono>
            </div>
          </div>

          {/* site */}
          <div style={{ padding: "30px 40px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...b(16) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: C.violet }} />
                <Bar w={110} h={14} color={C.ink} />
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <Bar w={64} h={12} />
                <Bar w={64} h={12} />
                <Bar w={64} h={12} />
              </div>
            </div>

            <div style={{ marginTop: 54, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...b(24), fontFamily: F.sans, fontWeight: 900, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.04em", color: C.ink }}>
                Smile wide.
                <br />
                <span style={{ color: C.violetText }}>Book in 30 sec.</span>
              </div>
              <div style={b(32)}>
                <Bar w={460} h={14} />
              </div>
              <div style={b(36)}>
                <Bar w={360} h={14} />
              </div>
              <div style={{ ...b(42), marginTop: 12 }}>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "20px 34px",
                    borderRadius: 18,
                    background: C.violet,
                    color: C.white,
                    fontFamily: F.sans,
                    fontWeight: 800,
                    fontSize: 30,
                    transform: `scale(${press})`,
                    boxShadow: "0 12px 24px -10px rgba(124,92,255,0.7)",
                  }}
                >
                  Book a free call →
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 46 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 140,
                    borderRadius: 20,
                    background: C.white,
                    border: `1px solid ${C.line}`,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    ...b(48 + i * 5),
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: i === 1 ? C.ink : C.violetSoft }} />
                  <Bar w="80%" h={12} />
                  <Bar w="55%" h={12} />
                </div>
              ))}
            </div>

            {/* cursor */}
            {f >= 62 && (
              <svg
                width={54}
                height={54}
                viewBox="0 0 24 24"
                style={{ position: "absolute", left: cx, top: cy, transform: `scale(${press})`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
              >
                <path d="M4 3l15 8-6.5 1.6L9.5 19z" fill={C.ink} stroke={C.white} strokeWidth={1.4} strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </Card>

        {/* speed score badge */}
        <div style={{ position: "absolute", top: -64, right: -20, transform: `scale(${ring}) rotate(${(1 - ring) * 40}deg)` }}>
          <div
            style={{
              width: 156,
              height: 156,
              borderRadius: 78,
              background: C.ink,
              boxShadow: "0 18px 36px -12px rgba(11,11,16,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg width={156} height={156} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx={78} cy={78} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />
              <circle
                cx={78}
                cy={78}
                r={R}
                fill="none"
                stroke={C.lime}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - score / 100)}
              />
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 52, color: C.white, lineHeight: 1 }}>{score}</div>
              <Mono size={16} color="rgba(255,255,255,0.6)" weight={700}>
                SPEED
              </Mono>
            </div>
          </div>
        </div>

        {/* lead toast */}
        <div
          style={{
            position: "absolute",
            top: 560,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            transform: `translateY(${(1 - toast) * 40}px) scale(${0.8 + 0.2 * toast})`,
            opacity: Math.min(1, toast * 2),
          }}
        >
          <Pill size={32} style={{ boxShadow: "0 20px 40px -14px rgba(11,11,16,0.6)", padding: "18px 30px" }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: C.lime,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={24} color={C.ink} />
            </span>
            New lead aaya · Priya S.
          </Pill>
        </div>
      </Stage>
    </SceneExit>
  );
};

/* ================= 7. SOCIAL ================= */

const fmtK = (v: number) => (v < 10000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v / 1000)}k`);

export const Social: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 4);
  const followers = lerp(f, 40, 110, 1200, NUMBERS.followers, Easing.inOut(Easing.quad));
  const posts = Math.round(lerp(f, 30, 90, 24, 120));
  const strike = lerp(f, 14, 26, 0, 1);
  const newBio = typed("Pune ka smile expert · free checkup ↓", f, 28, 1.3);
  const following = f >= 104;
  const fp = pop(f, fps, 104, 11);
  const tiles = [
    `linear-gradient(135deg, ${C.violet}, #B9A8FF)`,
    `linear-gradient(135deg, ${C.ink}, #3B3B4A)`,
    `linear-gradient(135deg, ${C.lime}, #E9FFB8)`,
    `linear-gradient(135deg, #3B3B4A, ${C.ink})`,
    `linear-gradient(135deg, #E9E3FF, ${C.violet})`,
    `linear-gradient(135deg, #F4F0E7, ${C.lime})`,
  ];
  return (
    <SceneExit dur={dur}>
      <Headline l1="Chauthi service" l2="Brand & social" s1={84} s2={90} />
      <StepTag n={4} slug="brand-social" top={516} />
      <Stage top={598}>
        <Card style={{ ...popIn(card, 50), padding: 36, height: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
                padding: 5,
                background: `conic-gradient(from 200deg, ${C.violet}, ${C.lime}, ${C.violet})`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `5px solid ${C.card}`,
                  background: C.ink,
                  color: C.lime,
                  fontFamily: F.sans,
                  fontWeight: 900,
                  fontSize: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                YB
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, justifyContent: "space-around" }}>
              {[
                [String(posts), "posts"],
                [fmtK(followers), "followers"],
                ["180", "following"],
              ].map(([v, l], i) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: F.sans,
                      fontWeight: 900,
                      fontSize: 46,
                      color: i === 1 ? C.violetText : C.ink,
                      letterSpacing: "-0.03em",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {v}
                  </div>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 24, color: "#8D887C" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24, fontFamily: F.sans, fontWeight: 800, fontSize: 32, color: C.ink }}>Your Brand</div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 6 }}>
            <span style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, color: C.mute }}>
              Dentist. Coffee lover. DM for info.
            </span>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "52%",
                height: 3,
                width: `${strike * 100}%`,
                background: C.mute,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              padding: "14px 20px",
              borderRadius: 16,
              background: C.violetSoft,
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 28,
              color: C.ink,
              minHeight: 38,
              opacity: f >= 26 ? 1 : 0,
            }}
          >
            {newBio}
            {f < 80 && <Caret h={28} />}
          </div>

          <div
            style={{
              marginTop: 22,
              height: 70,
              borderRadius: 18,
              background: following ? C.card2 : C.violet,
              border: following ? `1px solid ${C.line}` : "none",
              color: following ? C.ink : C.white,
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transform: `scale(${following ? 0.94 + 0.06 * fp : 1})`,
            }}
          >
            {following ? (
              <>
                Following <Check size={28} color={C.ink} />
              </>
            ) : (
              "Follow"
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 24 }}>
            {tiles.map((t, i) => {
              const p = pop(f, fps, 34 + i * 6, 12);
              return (
                <div
                  key={i}
                  style={{
                    height: 118,
                    borderRadius: 14,
                    background: t,
                    transform: `scale(${p})`,
                    opacity: Math.min(1, p * 2),
                  }}
                />
              );
            })}
          </div>
        </Card>
      </Stage>
    </SceneExit>
  );
};

/* ================= 8. MANUAL -> AUTOPILOT ================= */

export const Auto: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SWITCH = 78;
  const on = f >= SWITCH;
  const k = lerp(f, SWITCH, SWITCH + 10, 0, 1, Easing.inOut(Easing.cubic));
  const card = pop(f, fps, 4);
  const chips = ["seo", "ads", "web", "social", "reports"];
  const flash = lerp(f, SWITCH, SWITCH + 14, 1, 0);
  return (
    <SceneExit dur={dur}>
      {on ? (
        <Headline key="b" l1="Alphastrix =" l2="Autopilot" s1={92} s2={104} />
      ) : (
        <Headline key="a" l1="Ye sab alag alag" l2="Manual mode hai" c2={C.mute} s1={88} s2={84} />
      )}
      <Stage top={640}>
        <Card style={{ ...popIn(card, 50), padding: "84px 48px 72px", minHeight: 660 }}>
          {on && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 40,
                boxShadow: `0 0 0 ${10 * flash}px rgba(124,92,255,${0.35 * flash})`,
              }}
            />
          )}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 420,
                height: 200,
                borderRadius: 100,
                background: interpolateColors(k, [0, 1], ["#D4CEC1", C.violet]),
                position: "relative",
                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.12)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12 + k * 220,
                  width: 176,
                  height: 176,
                  borderRadius: 88,
                  background: C.white,
                  boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 44, padding: "0 10px" }}>
            <Mono size={24} weight={700} color={on ? C.mute : C.ink}>
              MANUAL
            </Mono>
            <Mono size={24} weight={700} color={on ? C.violetText : C.mute}>
              AUTOPILOT
            </Mono>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 56 }}>
            {chips.map((c, i) => {
              const p = on ? pop(f, fps, SWITCH + 4 + i * 4, 11) : 0;
              const lit = on && p > 0.3;
              return (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 24px",
                    borderRadius: 999,
                    background: lit ? C.violet : "transparent",
                    border: lit ? `2px solid ${C.violet}` : `2px dashed ${C.mute2}`,
                    color: lit ? C.white : C.mute,
                    fontFamily: F.mono,
                    fontWeight: 700,
                    fontSize: 26,
                    transform: `scale(${on ? 0.9 + 0.1 * p : 1})`,
                  }}
                >
                  {c}
                  {lit && <Check size={22} color={C.white} />}
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Mono size={26} color={on ? C.ink : C.mute} weight={700}>
              {on ? "1 team · 1 plan · weekly reports" : "4 vendors · 4 invoices · 0 sync"}
            </Mono>
          </div>
        </Card>
      </Stage>
      {on && <Mascot delay={SWITCH + 6} y={1222} x={850} size={140} />}
    </SceneExit>
  );
};

/* ================= 9. CTA ================= */

export const Cta: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(f, fps, 4);
  const comment = typed(BRAND.ctaWord, f, 12, 0.35);
  const sent = f >= 36;
  const sp = pop(f, fps, 36, 12);
  const following = f >= 52;
  const fp = pop(f, fps, 52, 11);
  const dm = pop(f, fps, 70, 10);
  const icons = pop(f, fps, 80, 12);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Headline l1="Comment karo" l2={BRAND.ctaWord} s1={96} s2={110} />
      <Stage top={620}>
        <Card style={{ ...popIn(card, 50), padding: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IGGlyph size={38} />
              <Mono size={28} weight={700}>
                INSTAGRAM
              </Mono>
            </div>
            <span style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 26, color: C.violetText }}>Post</span>
          </div>

          <div
            style={{
              marginTop: 26,
              padding: "20px 22px",
              background: C.white,
              borderRadius: 24,
              border: `1px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <LogoMark size={70} radius={35} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.ink }}>{BRAND.handle}</span>
              <Mono size={21} color="#8D887C">
                free growth audit · step by step
              </Mono>
            </div>
            <div
              style={{
                padding: "14px 24px",
                borderRadius: 14,
                background: following ? C.card2 : C.violet,
                color: following ? C.ink : C.white,
                border: following ? `1px solid ${C.line}` : "none",
                fontFamily: F.sans,
                fontWeight: 800,
                fontSize: 24,
                transform: `scale(${following ? 0.9 + 0.1 * fp : 1})`,
              }}
            >
              {following ? "Following" : "Follow"}
            </div>
          </div>

          {/* comment */}
          <div style={{ marginTop: 30, minHeight: 300 }}>
            {sent ? (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", ...popIn(sp, 20) }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, background: "#D9C7B0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24, color: "#8D887C" }}>you · now</span>
                  <span style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 40, color: C.ink, letterSpacing: "-0.01em" }}>
                    {BRAND.ctaWord}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "22px 26px",
                  borderRadius: 999,
                  border: `1.5px solid ${C.mute2}`,
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 34,
                  color: comment ? C.ink : C.mute,
                  opacity: lerp(f, 8, 14, 0, 1),
                }}
              >
                {comment || "Add a comment…"}
                <Caret h={32} />
              </div>
            )}
            <div style={{ marginTop: 22, display: "flex", transform: `scale(${dm})`, transformOrigin: "0% 50%", opacity: Math.min(1, dm * 2) }}>
              <Pill bg={C.violet} size={28} style={{ boxShadow: "0 14px 28px -12px rgba(124,92,255,0.7)" }}>
                Free audit aapke DM mein <Check size={26} color={C.white} />
              </Pill>
            </div>
          </div>
        </Card>
      </Stage>

      {/* IG - - brand, like the reference's closing row */}
      <div
        style={{
          position: "absolute",
          top: 1318,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          ...popIn(icons, 20),
        }}
      >
        <IGGlyph size={64} />
        <div
          style={{
            width: 70,
            height: 4,
            backgroundImage: `linear-gradient(90deg, ${C.violet} 55%, transparent 45%)`,
            backgroundSize: "14px 4px",
          }}
        />
        <LogoMark size={64} />
      </div>
      <Mascot delay={86} y={1230} x={850} size={140} />
    </div>
  );
};
