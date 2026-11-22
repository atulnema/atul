import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { useScene, useWordFrame } from "../../timing";
import { Card, Caret, Check, Label, MiniFace, Spark, clamp, ease, popStyle, typed, useSpring } from "../../components/ui";

const AMBER = "#C27A00";
const WA = "#1FA855";
const CHAT = "#E3F5E6";

const Stage: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 430 }) => (
  <AbsoluteFill style={{ top, height: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>
);

const useExit = () => {
  const frame = useCurrentFrame();
  const { dur } = useScene();
  const o = ease(frame, dur - 9, dur);
  return { opacity: 1 - o, transform: `scale(${1 - o * 0.06})`, filter: `blur(${o * 12}px)` } as React.CSSProperties;
};

const Cross: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size, background: C.crimson, display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(212,35,77,0.35)" }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" />
    </svg>
  </div>
);

/* ================================================================== */
/* 1. Work done, client happy, payment?                                */
/* ================================================================== */
export const DoneCard: React.FC = () => {
  const frame = useCurrentFrame();
  const kaam = useWordFrame("kaam", 0);
  const khush = useWordFrame("khush", 25);
  const pay = useWordFrame("payment", 50);
  const row = (label: string, sub: string, at: number, right: React.ReactNode, i: number) => {
    const p = ease(frame, at - 4, at + 8);
    return (
      <Card
        small
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 34px",
          opacity: p,
          transform: `translateY(${(1 - p) * 30}px)`,
          filter: `blur(${(1 - p) * 8}px)`,
        }}
        key={i}
      >
        <div style={{ fontFamily: F.sans }}>
          <div style={{ fontWeight: 800, fontSize: 40, color: C.ink }}>{label}</div>
          <div style={{ fontWeight: 600, fontSize: 24, color: C.gray, marginTop: 2 }}>{sub}</div>
        </div>
        {right}
      </Card>
    );
  };
  const q = useSpring(pay, 9, 220);
  const blink = Math.floor(frame / 8) % 2 ? 1 : 0.55;
  return (
    <Stage>
      <div style={{ width: 860, display: "flex", flexDirection: "column", gap: 22, ...useExit() }}>
        {row("Project delivered", "Logo + website", kaam, <Check size={70} />, 0)}
        {row("Client happy", "“Bhai mast hai!”", khush, <Check size={70} />, 1)}
        {row(
          "Payment",
          "₹18,000 · Invoice #104",
          pay,
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 84,
              background: C.crimsonSoft,
              color: C.crimson,
              display: "grid",
              placeItems: "center",
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 64,
              transform: `scale(${q})`,
              opacity: blink,
            }}
          >
            ?
          </div>,
          2,
        )}
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 2. "Kal kar deta hoon" + days piling up                             */
/* ================================================================== */
export const KalCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 13, 160);
  const t3 = useWordFrame("teen", 50);
  const t12 = useWordFrame("baarah", 75);
  const t27 = useWordFrame("sattaees", 100);
  const day = frame < t3 ? 1 : frame < t12 ? 3 : frame < t27 ? 12 : 27;
  const flipAt = frame < t3 ? -100 : frame < t12 ? t3 : frame < t27 ? t12 : t27;
  const flip = ease(frame, flipAt, flipAt + 7);
  const heat = day >= 27 ? 1 : day >= 12 ? 0.6 : day >= 3 ? 0.25 : 0;
  const cal = useSpring(t3 - 8, 12, 170);
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 46, ...useExit() }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, ...popStyle(enter, 30, 0.9) }}>
          <MiniFace size={84} hue="#7B8CDE" />
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "34px 34px 34px 10px",
              padding: "28px 36px",
              fontFamily: F.sans,
              fontWeight: 700,
              fontSize: 44,
              color: C.ink,
              boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            }}
          >
            {typed("Haan bhai, kal kar deta hoon", frame, 4, 1.4)}
            <div style={{ fontSize: 20, color: C.gray, fontWeight: 600, marginTop: 8, textAlign: "right" }}>Seen ✓✓</div>
          </div>
        </div>

        <Card style={{ width: 420, overflow: "hidden", textAlign: "center", ...popStyle(cal, 40, 0.85) }}>
          <div
            style={{
              background: interpolate(heat, [0, 1], [0, 1]) > 0.5 ? C.crimson : C.ink,
              color: "#fff",
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: 4,
              padding: "16px 0",
            }}
          >
            DAYS WAITING
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 230,
              lineHeight: 1.05,
              letterSpacing: -8,
              color: heat > 0.5 ? C.crimson : C.ink,
              padding: "20px 0 26px",
              transform: `rotateX(${(1 - flip) * 80}deg)`,
              opacity: 0.3 + flip * 0.7,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {day}
          </div>
        </Card>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 3. "Dobara poochun?" - avatar centre stage, no card                 */
/* ================================================================== */
export const RudeCard: React.FC = () => null;

/* ================================================================== */
/* 4. The wrong message                                                 */
/* ================================================================== */
export const WrongCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 13, 160);
  const galat = useWordFrame("galat", 30);
  const time = useWordFrame("time", 60);
  const x = useSpring(galat, 9, 230);
  const missing = ["No amount", "No invoice", "No UPI"];
  return (
    <Stage>
      <div style={{ width: 860, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 26, ...useExit() }}>
        <div style={{ position: "relative", ...popStyle(enter, 30, 0.9) }}>
          <div
            style={{
              background: CHAT,
              borderRadius: "34px 34px 10px 34px",
              padding: "28px 38px",
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 60,
              color: "#10301C",
              boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            }}
          >
            Bhai payment??
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, fontSize: 22, fontWeight: 700, marginTop: 6 }}>
              <span style={{ color: frame > time ? C.crimson : "#5B7A63" }}>11:48 PM</span>
              <span style={{ color: "#5B7A63" }}>Seen</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: -40, top: -36, transform: `scale(${x}) rotate(${(1 - x) * -30}deg)` }}>
            <Cross size={96} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {missing.map((m, i) => {
            const p = ease(frame, galat + 6 + i * 5, galat + 16 + i * 5);
            return (
              <span
                key={m}
                style={{
                  fontFamily: F.sans,
                  fontWeight: 800,
                  fontSize: 30,
                  color: C.crimson,
                  background: C.crimsonSoft,
                  padding: "12px 24px",
                  borderRadius: 999,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                {m}
              </span>
            );
          })}
          <span
            style={{
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 30,
              color: "#fff",
              background: C.ink,
              padding: "12px 24px",
              borderRadius: 999,
              opacity: ease(frame, time, time + 8),
              transform: `translateY(${(1 - ease(frame, time, time + 8)) * 20}px)`,
            }}
          >
            Sent at midnight
          </span>
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 5. The reminder ladder                                               */
/* ================================================================== */
export const LadderCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useWordFrame("pehle", 4);
  const b = useWordFrame("dusre", 90);
  const c = useWordFrame("mahine", 170);
  const steps = [
    { at: a, when: "Week 1", name: "Friendly reminder", color: C.green, text: "Bas ek chhota sa reminder, invoice #104 ka ₹18,000 due tha." },
    { at: b, when: "Week 2", name: "Ask for a date", color: AMBER, text: "Payment kab tak ho jayega? Ek date confirm kar doge?" },
    { at: c, when: "Day 30+", name: "Final notice", color: C.crimson, text: "15 March tak clear kar do, ya aaj call karke plan bana lete hain." },
  ];
  return (
    <Stage>
      <div style={{ width: 880, display: "flex", flexDirection: "column", gap: 22, ...useExit() }}>
        {steps.map((s, i) => {
          const p = ease(frame, s.at - 6, s.at + 8);
          const active = frame >= s.at - 6 && (i === steps.length - 1 || frame < steps[i + 1].at - 6);
          return (
            <Card
              key={s.name}
              small
              style={{
                padding: "26px 30px",
                display: "flex",
                gap: 24,
                alignItems: "flex-start",
                opacity: p * (active ? 1 : 0.55),
                transform: `translateX(${(1 - p) * 60}px) scale(${active ? 1.02 : 0.98})`,
                filter: `blur(${(1 - p) * 8}px)`,
                border: active ? `3px solid ${s.color}` : `1.5px solid ${C.line}`,
              }}
            >
              <div style={{ width: 18, alignSelf: "stretch", borderRadius: 10, background: s.color, flexShrink: 0 }} />
              <div style={{ fontFamily: F.sans, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: s.color }}>{s.when}</span>
                  <span style={{ fontWeight: 800, fontSize: 38, color: C.ink }}>{s.name}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 27, color: "#4A4A4A", marginTop: 10, lineHeight: 1.35 }}>{s.text}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 6. Amount · invoice · UPI, then one-tap pay                         */
/* ================================================================== */
export const UpiCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 13, 160);
  const amt = useWordFrame("amount", 20);
  const inv = useWordFrame("invoice", 40);
  const upi = useWordFrame("upi", 60);
  const tap = useWordFrame("tap", 120);
  const hl = (at: number): React.CSSProperties => {
    const p = ease(frame, at - 2, at + 6);
    return {
      background: `rgba(212,35,77,${0.16 * p})`,
      color: p > 0.5 ? C.crimson : "#10301C",
      borderRadius: 10,
      padding: "0 6px",
      boxShadow: p > 0.5 ? `inset 0 -4px 0 rgba(212,35,77,0.5)` : "none",
    };
  };
  const press = frame >= tap - 2 && frame < tap + 4 ? 0.92 : 1;
  const paid = ease(frame, tap + 2, tap + 8);
  const btn = useSpring(upi + 10, 13, 170);
  return (
    <Stage>
      <div style={{ width: 880, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 30, ...useExit() }}>
        <div
          style={{
            background: CHAT,
            borderRadius: "34px 34px 10px 34px",
            padding: "32px 38px",
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 38,
            lineHeight: 1.5,
            color: "#10301C",
            boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            ...popStyle(enter, 30, 0.92),
          }}
        >
          Hi Rohit, invoice <b style={hl(inv)}>#104</b> ka <b style={hl(amt)}>₹18,000</b> ab 12 din se pending hai. Ek date confirm kar doge?
          <div style={{ marginTop: 14 }}>
            UPI: <b style={{ ...hl(upi), fontFamily: F.mono, fontSize: 34 }}>studiobloom@okaxis</b>
          </div>
        </div>
        <div
          style={{
            alignSelf: "center",
            display: "flex",
            alignItems: "center",
            gap: 18,
            background: paid > 0.5 ? C.green : C.ink,
            color: "#fff",
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 40,
            padding: "26px 52px",
            borderRadius: 999,
            boxShadow: paid > 0.5 ? "0 18px 40px rgba(31,164,99,0.35)" : "0 18px 40px rgba(0,0,0,0.25)",
            ...popStyle(btn, 30, 0.85),
            transform: `${popStyle(btn, 30, 0.85).transform} scale(${press})`,
          }}
        >
          {paid > 0.5 ? (
            <>
              <Check size={52} bg="rgba(255,255,255,0.25)" /> Paid ₹18,000
            </>
          ) : (
            <>Pay via UPI</>
          )}
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 7. The free tool on a phone                                          */
/* ================================================================== */
export const ToolCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 13, 140);
  const naam = useWordFrame("naam", 40);
  const ready = useWordFrame("sahi", 110) + 10;
  const fields = [
    { l: "Client", v: "Rohit", at: naam - 6 },
    { l: "Amount", v: "₹18,000", at: naam + 8 },
    { l: "Due", v: "27 days ago", at: naam + 20 },
  ];
  const status = ease(frame, ready - 14, ready - 4);
  const msg = useSpring(ready - 4, 13, 170);
  return (
    <Stage top={400}>
      <div
        style={{
          width: 600,
          height: 960,
          borderRadius: 70,
          background: C.ink,
          padding: 18,
          boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
          ...popStyle(enter, 80, 0.85),
          ...useExit(),
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 54, background: "#F4F3F0", padding: "54px 34px", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Spark size={40} rotate={frame} />
            <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 32, color: C.ink }}>Payment Reminder</div>
          </div>
          {fields.map((fl) => (
            <div key={fl.l} style={{ background: "#fff", borderRadius: 18, padding: "14px 20px", border: `1.5px solid ${frame > fl.at && frame < fl.at + 14 ? C.crimson : C.line}` }}>
              <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 18, color: C.gray }}>{fl.l}</div>
              <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: 30, color: C.ink, minHeight: 40 }}>
                {typed(fl.v, frame, fl.at, 0.9)}
                {frame > fl.at && frame < fl.at + 14 && <Caret h={30} />}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 22,
              color: AMBER,
              background: "rgba(194,122,0,0.14)",
              borderRadius: 999,
              padding: "10px 18px",
              width: "fit-content",
              opacity: status,
              transform: `scale(${0.8 + status * 0.2})`,
            }}
          >
            27 days late · Send: Firm follow-up
          </div>
          <div
            style={{
              background: CHAT,
              borderRadius: "24px 24px 24px 8px",
              padding: "18px 20px",
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 22,
              lineHeight: 1.45,
              color: "#10301C",
              ...popStyle(msg, 30, 0.9),
            }}
          >
            Hi Rohit, invoice #104 ka ₹18,000 ab 27 din se pending hai. Payment kab tak ho jayega, ek date confirm kar doge?
          </div>
          <div
            style={{
              marginTop: "auto",
              background: WA,
              color: "#fff",
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 28,
              textAlign: "center",
              padding: "20px 0",
              borderRadius: 999,
              opacity: msg,
            }}
          >
            Open in WhatsApp
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================== */
/* 8. CTA: comment PAYMENT, send to a friend                            */
/* ================================================================== */
export const CtaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 13, 160);
  const kw = useWordFrame("payment", 30);
  const dost = useWordFrame("dost", 60);
  const word = typed("PAYMENT", frame, kw - 4, 0.55);
  const posted = frame > kw + 16;
  const share = useSpring(dost - 6, 13, 160);
  const people = [
    { n: "Rahul", s: "₹40,000 atka hai", hue: "#7B8CDE", on: true },
    { n: "Sneha", s: "Freelancer", hue: "#E28AA5", on: false },
    { n: "Aman", s: "Shop owner", hue: "#7BC4A6", on: false },
  ];
  const sent = frame > dost + 22;
  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, ...useExit() }}>
        <Card style={{ width: 860, padding: "18px 18px 18px 22px", borderRadius: 999, display: "flex", alignItems: "center", gap: 20, ...popStyle(enter, 30, 0.9) }}>
          <MiniFace size={64} hue="#E2A35B" />
          <span style={{ flex: 1, fontFamily: F.sans, fontWeight: 800, fontSize: 44, color: word ? C.ink : C.gray2 }}>
            {word || "Add a comment…"}
            {word && !posted && <Caret h={44} />}
          </span>
          <div style={{ background: posted ? C.green : C.ink, color: "#fff", fontFamily: F.sans, fontWeight: 800, fontSize: 28, padding: "16px 32px", borderRadius: 999 }}>
            {posted ? "✓ Posted" : "Post"}
          </div>
        </Card>

        <Card style={{ width: 860, padding: "26px 28px", ...popStyle(share, 40, 0.9) }}>
          <Label style={{ fontSize: 18 }}>Send to</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
            {people.map((p) => (
              <div
                key={p.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "12px 14px",
                  borderRadius: 20,
                  background: p.on ? C.crimsonSoft : "transparent",
                  opacity: p.on ? 1 : 0.5,
                }}
              >
                <MiniFace size={60} hue={p.hue} />
                <div style={{ flex: 1, fontFamily: F.sans }}>
                  <div style={{ fontWeight: 800, fontSize: 30, color: C.ink }}>{p.n}</div>
                  <div style={{ fontWeight: 600, fontSize: 22, color: p.on ? C.crimson : C.gray }}>{p.s}</div>
                </div>
                {p.on && (
                  <div
                    style={{
                      background: sent ? C.green : C.crimson,
                      color: "#fff",
                      fontFamily: F.sans,
                      fontWeight: 800,
                      fontSize: 24,
                      padding: "12px 24px",
                      borderRadius: 999,
                    }}
                  >
                    {sent ? "✓ Sent" : "Send"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Stage>
  );
};

export const CARDS: Record<string, React.FC> = {
  done: DoneCard,
  kal: KalCard,
  rude: RudeCard,
  wrong: WrongCard,
  ladder: LadderCard,
  upi: UpiCard,
  tool: ToolCard,
  cta: CtaCard,
};

export { clamp };
