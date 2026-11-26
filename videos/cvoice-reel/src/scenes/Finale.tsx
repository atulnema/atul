import React from "react";
import { AbsoluteFill } from "remotion";
import { Card, Chip, MysteryBox } from "../components/Kit";
import { Bookmark, CardIcon, Cross, Cursor, User } from "../components/Icons";
import { LogoMark } from "./Product";
import { C, EASE, FONT, GRAD, MONO, SceneProps, lerp, noise, ramp, shake, spr } from "../lib";

const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

// ===== 11. BUILDUP: the box is back and about to burst =====
export const Buildup: React.FC<SceneProps> = ({ f, dur }) => {
  const tension = ramp(f, 0, dur, EASE.inOut);
  const box = spr(f, 0, { damping: 14, stiffness: 120 });
  const cone = ramp(f, 0, 14, EASE.soft);
  return (
    <Stage>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.55)" }} />
      {/* spotlight cone */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 140,
          width: 800,
          height: 1300,
          background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02))",
          clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
          opacity: cone,
          filter: "blur(8px)",
        }}
      />
      <div style={{ position: "absolute", top: 310, opacity: ramp(f, 4, 16) }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 120,
            letterSpacing: lerp(ramp(f, 4, 40, EASE.soft), 40, 10),
            color: C.lime,
            textShadow: `0 0 40px rgba(198,255,61,${0.3 + tension * 0.5})`,
          }}
        >
          BEST PART
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 600,
          translate: `${Math.sin(f * 2.3) * 10 * tension * tension}px ${lerp(box, -900, 0)}px`,
          scale: String(1 + tension * 0.12),
        }}
      >
        <MysteryBox f={f} size={480} wiggle={0.3 + tension * 1.2} rays={tension * 0.8} lidOpen={tension * 0.06} />
      </div>
      {/* floor glow */}
      <div style={{ position: "absolute", top: 1150, width: 600, height: 80, borderRadius: "50%", background: "rgba(124,92,255,0.45)", filter: "blur(30px)", opacity: cone }} />
    </Stage>
  );
};

// ===== 12. DEMO: box bursts into a live demo ticket, no signup, no card =====
export const Demo: React.FC<SceneProps> = ({ f, seg }) => {
  const r3 = seg("r3");
  const r4 = seg("r4");
  const r5 = seg("r5");
  const burst = ramp(f, 0, 18, EASE.soft);
  const ticket = spr(f, 4, { damping: 11, stiffness: 150 });
  const rows = [
    { at: r3.s - 3, label: "Signup", Icon: User },
    { at: r4.s + Math.round((r4.e - r4.s) * 0.3) - 3, label: "Credit Card", Icon: CardIcon },
  ];
  const stamp = ramp(f, r5.s - 2, r5.s + 6, EASE.snap);
  const sx = shake(f, r5.s + 5, 10, 14);
  return (
    <Stage style={{ translate: `${sx}px 0` }}>
      {/* confetti burst */}
      {new Array(28).fill(0).map((_, i) => {
        const a = noise(i + 2) * Math.PI * 2;
        const d = 300 + noise(i + 9) * 520;
        const cols = [C.lime, C.cyan, C.violet, C.gold, "#FF5CC8"];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(a) * d * burst - 12,
              top: 560 + Math.sin(a) * d * burst + burst * burst * 260,
              width: 24,
              height: 14 + noise(i) * 20,
              borderRadius: 4,
              background: cols[i % cols.length],
              rotate: `${noise(i + 5) * 720 * burst}deg`,
              opacity: 1 - ramp(f, 14, 30),
            }}
          />
        );
      })}
      {/* ticket */}
      <div
        style={{
          position: "absolute",
          top: 300,
          scale: String(lerp(ticket, 0.2, 1)),
          rotate: `${lerp(ticket, 14, -3)}deg`,
        }}
      >
        <div
          style={{
            width: 820,
            height: 300,
            borderRadius: 36,
            background: GRAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 34,
            boxShadow: `0 0 120px rgba(124,92,255,0.7)`,
            WebkitMaskImage:
              "radial-gradient(circle at 0 50%, transparent 40px, black 41px), radial-gradient(circle at 100% 50%, transparent 40px, black 41px)",
            WebkitMaskComposite: "source-in",
            maskImage:
              "radial-gradient(circle at 0 50%, transparent 40px, black 41px), radial-gradient(circle at 100% 50%, transparent 40px, black 41px)",
            maskComposite: "intersect",
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FF3B4E", boxShadow: `0 0 ${10 + 14 * Math.abs(Math.sin(f / 6))}px #FF3B4E` }} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 124, color: "#fff", letterSpacing: 2 }}>LIVE DEMO</div>
        </div>
      </div>
      {/* no signup / no card rows */}
      <div style={{ position: "absolute", top: 700, display: "flex", flexDirection: "column", gap: 34 }}>
        {rows.map((r, i) => {
          const p = spr(f, r.at, { damping: 12, stiffness: 200 });
          const strike = ramp(f, r.at + 4, r.at + 12, EASE.snap);
          const Icon = r.Icon;
          return (
            <Card
              key={r.label}
              style={{
                width: 820,
                height: 170,
                padding: "0 44px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 34,
                translate: `${lerp(p, i === 0 ? -900 : 900, 0)}px 0`,
                opacity: f < r.at ? 0 : 1,
                position: "relative",
              }}
            >
              <Icon size={84} color={C.dim} />
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: lerp(strike, 0, 1) > 0.5 ? C.dim : C.ink, position: "relative" }}>
                {r.label}
                <div
                  style={{
                    position: "absolute",
                    left: -10,
                    top: "52%",
                    height: 10,
                    width: `${strike * 108}%`,
                    background: C.red,
                    borderRadius: 6,
                    rotate: "-3deg",
                  }}
                />
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  background: C.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scale: String(spr(f, r.at + 8, { damping: 9, stiffness: 300 })),
                }}
              >
                <Cross size={64} color="#fff" stroke={3.4} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 330,
                  top: -26,
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 40,
                  color: C.red,
                  border: `5px solid ${C.red}`,
                  borderRadius: 14,
                  padding: "2px 18px",
                  rotate: "-8deg",
                  scale: String(lerp(ramp(f, r.at + 8, r.at + 14, EASE.snap), 2.2, 1)),
                  opacity: ramp(f, r.at + 8, r.at + 12),
                  background: "rgba(7,7,13,0.9)",
                }}
              >
                बिना
              </div>
            </Card>
          );
        })}
      </div>
      {/* try it stamp */}
      <div
        style={{
          position: "absolute",
          top: 1120,
          scale: String(lerp(stamp, 2.6, 1)),
          opacity: stamp,
          rotate: "-6deg",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 92,
            color: "#111",
            background: C.lime,
            padding: "10px 46px",
            borderRadius: 24,
            boxShadow: `0 0 80px ${C.lime}`,
          }}
        >
          बस ट्राई करो!
        </div>
      </div>
    </Stage>
  );
};

// ===== 13. URL: browser types the address and we click the demo =====
export const URL_TEXT = "cvoice.ai";
export const urlTiming = (c2s: number, c2e: number) => {
  const typeStart = c2s + Math.round((c2e - c2s) * 0.3);
  const typeEnd = typeStart + URL_TEXT.length * 2;
  const load = typeEnd + 3;
  const click = load + 16;
  return { typeStart, typeEnd, load, click };
};

export const UrlScene: React.FC<SceneProps> = ({ f, seg }) => {
  const c2 = seg("c2");
  const t = urlTiming(c2.s, c2.e);
  const win = spr(f, 0, { damping: 13, stiffness: 160 });
  const typed = Math.max(0, Math.min(URL_TEXT.length, Math.floor((f - t.typeStart) / 2) + 1));
  const loaded = ramp(f, t.load, t.load + 10, EASE.soft);
  const cur = ramp(f, t.load, t.click, EASE.inOut);
  const clickP = f >= t.click && f < t.click + 5 ? 0.9 : 1;
  const ripple = ramp(f, t.click, t.click + 16, EASE.soft);
  const caret = Math.floor(f / 8) % 2 === 0;
  const q = spr(f, 2, { damping: 10, stiffness: 220 });
  return (
    <Stage>
      <div style={{ position: "absolute", top: 290, scale: String(lerp(q, 0.6, 1)), opacity: q }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 80, color: C.ink }}>देर किस बात की?</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 460,
          width: 940,
          scale: String(lerp(win, 0.7, 1)),
          opacity: win,
          rotate: `x ${lerp(win, 25, 0)}deg`,
        }}
      >
        <div
          style={{
            borderRadius: 36,
            overflow: "hidden",
            border: `2px solid ${C.line}`,
            background: "#0F0F1A",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ height: 110, background: "#191927", display: "flex", alignItems: "center", gap: 16, padding: "0 30px" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 24, height: 24, borderRadius: "50%", background: c }} />
            ))}
            <div
              style={{
                marginLeft: 20,
                flex: 1,
                height: 66,
                borderRadius: 33,
                background: "#0B0B14",
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                fontFamily: MONO,
                fontWeight: 600,
                fontSize: 42,
                color: C.ink,
                border: f >= t.typeStart && f < t.load ? `3px solid ${C.cyan}` : "3px solid transparent",
              }}
            >
              <span style={{ color: C.dim, marginRight: 4 }}>https://</span>
              {f >= t.typeStart ? URL_TEXT.slice(0, typed) : ""}
              <span style={{ opacity: f < t.load && caret ? 1 : 0, color: C.cyan }}>|</span>
            </div>
          </div>
          <div style={{ height: 640, position: "relative", padding: 50, boxSizing: "border-box" }}>
            {/* skeleton before load */}
            <div style={{ opacity: 1 - loaded, position: "absolute", inset: 50 }}>
              {[70, 50, 85, 40].map((w, i) => (
                <div key={i} style={{ width: `${w}%`, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.07)", marginBottom: 30 }} />
              ))}
            </div>
            <div
              style={{
                opacity: loaded,
                translate: `0 ${lerp(loaded, 40, 0)}px`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 30,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <LogoMark f={f} size={120} />
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.ink }}>
                  CVoice<span style={{ color: C.cyan }}>.ai</span>
                </div>
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.dim }}>Text-to-Speech • Cloning • Dubbing</div>
              <div style={{ position: "relative", marginTop: 30 }}>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 520,
                    height: 520,
                    marginLeft: -260,
                    marginTop: -260,
                    borderRadius: "50%",
                    border: `6px solid ${C.lime}`,
                    scale: String(lerp(ripple, 0.2, 1.2)),
                    opacity: ripple > 0 ? 1 - ripple : 0,
                  }}
                />
                <div
                  style={{
                    padding: "30px 70px",
                    borderRadius: 999,
                    background: C.lime,
                    fontFamily: FONT,
                    fontWeight: 900,
                    fontSize: 58,
                    color: "#111",
                    scale: String(clickP),
                    boxShadow: `0 0 ${50 + ripple * 60}px rgba(198,255,61,0.6)`,
                  }}
                >
                  Try Live Demo →
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: lerp(cur, 900, 560),
                top: lerp(cur, 700, 470),
                opacity: f >= t.load ? 1 : 0,
                scale: String(clickP),
              }}
            >
              <Cursor size={96} />
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};

// ===== 14. CTA: save it =====
export const Cta: React.FC<SceneProps> = ({ f, dur }) => {
  const icon = spr(f, 0, { damping: 9, stiffness: 200 });
  const fill = ramp(f, 6, 22, EASE.inOut);
  const head = spr(f, 4, { damping: 9, stiffness: 260 });
  const sub = ramp(f, 14, 28, EASE.soft);
  const url = spr(f, 24, { damping: 12, stiffness: 200 });
  const bounce = Math.sin(ramp(f, 24, 34, EASE.inOut) * Math.PI) * -30;
  return (
    <Stage>
      <div style={{ position: "absolute", top: 330, scale: String(lerp(icon, 0.3, 1)), translate: `0 ${bounce}px` }}>
        <div style={{ position: "relative", width: 340, height: 340 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(${100 - fill * 100}% 0 0 0)`,
            }}
          >
            <svg width={340} height={340} viewBox="0 0 24 24">
              <path d="M6 3h12v18l-6-4.5L6 21z" fill={C.lime} />
            </svg>
          </div>
          <Bookmark size={340} color={C.lime} stroke={1.4} style={{ position: "absolute", inset: 0 }} />
          {new Array(6).fill(0).map((_, i) => {
            const p = ramp(f, 22, 40, EASE.soft);
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 170 + Math.cos(a) * lerp(p, 120, 240) - 9,
                  top: 170 + Math.sin(a) * lerp(p, 120, 240) - 9,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: i % 2 ? C.cyan : C.lime,
                  opacity: p > 0 ? 1 - p : 0,
                }}
              />
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: 760, scale: String(lerp(head, 0.4, 1)), opacity: head }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: C.ink, textShadow: `0 10px 0 ${C.violet}` }}>
          Save कर लो!
        </div>
      </div>
      <div style={{ position: "absolute", top: 1000, overflow: "hidden" }}>
        <div style={{ translate: `0 ${lerp(sub, 90, 0)}px`, fontFamily: FONT, fontWeight: 700, fontSize: 64, color: C.dim }}>
          काम आने वाला है
        </div>
      </div>
      <div style={{ position: "absolute", top: 1160, scale: String(url), opacity: url }}>
        <Chip bg="rgba(255,255,255,0.08)" style={{ fontSize: 56, border: `3px solid ${C.cyan}` }}>
          <span style={{ fontFamily: MONO }}>cvoice.ai</span>
        </Chip>
      </div>
    </Stage>
  );
};
