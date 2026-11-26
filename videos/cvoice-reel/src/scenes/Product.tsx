import React from "react";
import { AbsoluteFill } from "remotion";
import { Card, Chip, Rise, Waveform } from "../components/Kit";
import { Check, Clone, Film, Globe, Mic, Play, Sliders, TextIcon, User } from "../components/Icons";
import { C, EASE, FONT, GRAD, MONO, SceneProps, lerp, ramp, spr } from "../lib";

const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

// ===== 5. LOGO: waveform bars assemble into the brand =====
export const LogoMark: React.FC<{ f: number; size?: number; build?: number }> = ({ f, size = 300, build = 1 }) => {
  const bars = [0.35, 0.6, 0.95, 0.7, 0.45];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: GRAD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.05,
        boxShadow: `0 0 ${size * 0.4}px rgba(124,92,255,0.6)`,
      }}
    >
      {bars.map((h, i) => {
        const p = ramp(build * 30, i * 3, i * 3 + 14, EASE.punch);
        const wob = 1 + 0.12 * Math.sin(f * 0.35 + i);
        return (
          <div
            key={i}
            style={{
              width: size * 0.09,
              height: size * 0.62 * h * p * wob,
              borderRadius: size,
              background: "#fff",
            }}
          />
        );
      })}
    </div>
  );
};

export const Logo: React.FC<SceneProps> = ({ f }) => {
  const mark = spr(f, 2, { damping: 10, stiffness: 160 });
  const name = "CVoice.ai";
  const sweep = ramp(f, 22, 46, EASE.inOut);
  return (
    <Stage>
      {[0, 1, 2].map((i) => {
        const p = ramp(f, 4 + i * 7, 40 + i * 7, EASE.soft);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 640 - 150,
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: `4px solid ${i === 1 ? C.cyan : C.violet}`,
              scale: String(lerp(p, 1, 3.2)),
              opacity: (1 - p) * 0.7,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", top: 490, scale: String(lerp(mark, 0.3, 1)), rotate: `${lerp(mark, -30, 0)}deg` }}>
        <LogoMark f={f} size={300} build={ramp(f, 2, 32, EASE.soft)} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 880,
          display: "flex",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 170,
          letterSpacing: -4,
          color: C.ink,
        }}
      >
        {name.split("").map((ch, i) => {
          const p = spr(f, 10 + i * 2, { damping: 12, stiffness: 220 });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                translate: `0 ${lerp(p, 120, 0)}px`,
                opacity: Math.min(1, p * 1.4),
                color: i >= 6 ? C.cyan : C.ink,
              }}
            >
              {ch}
            </span>
          );
        })}
        {/* light sweep: a glowing copy of the word, masked to a moving band */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            color: "#fff",
            textShadow: "0 0 30px rgba(255,255,255,0.9)",
            WebkitMaskImage: `linear-gradient(100deg, transparent ${lerp(sweep, -30, 110)}%, black ${lerp(sweep, -20, 120)}%, transparent ${lerp(sweep, -10, 130)}%)`,
            maskImage: `linear-gradient(100deg, transparent ${lerp(sweep, -30, 110)}%, black ${lerp(sweep, -20, 120)}%, transparent ${lerp(sweep, -10, 130)}%)`,
            opacity: f >= 22 ? 1 : 0,
          }}
        >
          {name}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1120, opacity: ramp(f, 26, 38), translate: `0 ${lerp(ramp(f, 26, 38), 30, 0)}px` }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: C.dim, letterSpacing: 8 }}>AI VOICE STUDIO</div>
      </div>
      {/* sparkle wink */}
      <svg
        width={90}
        height={90}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          top: 860,
          left: 900,
          scale: String(Math.sin(ramp(f, 40, 56, EASE.inOut) * Math.PI)),
          rotate: `${f * 3}deg`,
        }}
      >
        <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={C.lime} />
      </svg>
    </Stage>
  );
};

// ===== 6. FEATURES: bento grid, one tile per spoken feature =====
const FEATS = [
  { id: "f1", label: "AI Text-to-Speech", Icon: TextIcon, from: [-700, 0, 0], color: C.violet },
  { id: "f2", label: "Voice Cloning", Icon: Clone, from: [700, 0, 0], color: C.cyan },
  { id: "f3", label: "Voice Changer", Icon: Sliders, from: [0, 700, 0], color: "#FF5CC8" },
  { id: "f4", label: "Video Dubbing", Icon: Film, from: [0, 0, 90], color: C.lime },
];

export const Features: React.FC<SceneProps> = ({ f, seg, dur }) => {
  const m3 = seg("m3");
  const all = ramp(f, m3.s - 3, m3.s + 8, EASE.soft);
  const push = lerp(ramp(f, 0, dur, EASE.inOut), 1, 1.05);
  return (
    <Stage style={{ scale: String(push) }}>
      <div style={{ position: "absolute", top: 300, opacity: 1 - all, translate: `0 ${-all * 40}px` }}>
        <Rise f={f} text="यहाँ मिलते हैं" start={0} size={84} color={C.dim} weight={700} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 450,
          display: "grid",
          gridTemplateColumns: "440px 440px",
          gap: 36,
          perspective: 1600,
          scale: String(1 + 0.03 * Math.sin(all * Math.PI)),
        }}
      >
        {FEATS.map((ft, i) => {
          const s = seg(ft.id);
          const e = seg(ft.id).e;
          const p = spr(f, s.s - 4, { damping: 13, stiffness: 190 });
          const active = f >= s.s - 4 && f < e + 2;
          const on = active || all > 0;
          const glow = active ? 1 : all;
          const Icon = ft.Icon;
          return (
            <Card
              key={ft.id}
              glow={glow * 0.9}
              style={{
                width: 440,
                height: 370,
                padding: 40,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                translate: `${lerp(p, ft.from[0], 0)}px ${lerp(p, ft.from[1], 0)}px`,
                rotate: `y ${lerp(p, ft.from[2], 0)}deg`,
                opacity: f < s.s - 4 ? 0 : lerp(Math.min(p, 1), 0, on ? 1 : 0.55),
                scale: String(active ? 1.04 : 1),
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 36,
                  background: ft.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 50px ${ft.color}`,
                }}
              >
                <Icon size={84} color={ft.color === C.lime ? "#111" : "#fff"} stroke={2.2} />
              </div>
              <div style={{ opacity: active ? 1 : 0.5 }}>
                <Waveform f={f + i * 13} bars={14} width={300} height={56} gap={6} color={ft.color} energy={active ? 1 : 0.3} seed={i} />
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50, color: C.ink, lineHeight: 1.05 }}>{ft.label}</div>
            </Card>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 290,
          opacity: all,
          scale: String(lerp(spr(f, m3.s - 3, { damping: 9, stiffness: 260 }), 0.5, 1)),
        }}
      >
        <Chip bg={C.lime} color="#111" style={{ border: "none", fontSize: 50 }}>
          कमाल के फीचर्स
        </Chip>
      </div>
    </Stage>
  );
};

// ===== 7. PROCESS: text in -> voice out =====
const DEMO_TEXT = "Namaste doston! Aaj ka video...";
export const Process: React.FC<SceneProps> = ({ f, seg }) => {
  const m4 = seg("m4");
  const m5 = seg("m5");
  const typeStart = m4.s + Math.round((m4.e - m4.s) * 0.35);
  const typed = Math.floor(ramp(f, typeStart, m5.s + 2, EASE.inOut) * DEMO_TEXT.length);
  const card = spr(f, 0, { damping: 13, stiffness: 170 });
  const press = m5.s + 2;
  const btn = f >= press && f < press + 6 ? 0.92 : 1;
  const arrow = ramp(f, press + 2, press + 16, EASE.inOut);
  const out = spr(f, press + 12, { damping: 12, stiffness: 180 });
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <Stage>
      <Card
        style={{
          position: "absolute",
          top: 300,
          width: 900,
          padding: "38px 46px",
          boxSizing: "border-box",
          translate: `0 ${lerp(card, -400, 0)}px`,
          opacity: card,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.dim }}>
          <TextIcon size={46} color={C.cyan} /> अपना Text
        </div>
        <div
          style={{
            marginTop: 26,
            minHeight: 120,
            padding: "26px 30px",
            borderRadius: 24,
            background: "rgba(0,0,0,0.35)",
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: 46,
            color: C.ink,
            lineHeight: 1.35,
          }}
        >
          {DEMO_TEXT.slice(0, typed)}
          <span style={{ opacity: caret ? 1 : 0, color: C.cyan }}>|</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
          <div
            style={{
              padding: "18px 40px",
              borderRadius: 999,
              background: GRAD,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 40,
              color: "#fff",
              scale: String(btn),
              boxShadow: f >= press ? `0 0 40px ${C.violet}` : "none",
            }}
          >
            Generate
          </div>
        </div>
      </Card>
      <svg width={120} height={200} viewBox="0 0 120 200" style={{ position: "absolute", top: 790 }}>
        <path d="M60 10 L60 160" stroke={C.lime} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} fill="none" />
        <path d="M25 125 L60 165 L95 125" stroke={C.lime} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ opacity: arrow > 0.9 ? 1 : 0 }} />
      </svg>
      <Card
        glow={out}
        style={{
          position: "absolute",
          top: 1000,
          width: 900,
          height: 300,
          padding: "0 46px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 30,
          scale: String(lerp(out, 0.6, 1)),
          opacity: out,
        }}
      >
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Play size={62} color="#111" fill="#111" />
        </div>
        <Waveform f={f} bars={22} width={640} height={170} gap={8} energy={ramp(f, press + 12, press + 24)} />
      </Card>
    </Stage>
  );
};

// ===== 8. CLONE: your voice mirrored into an AI twin =====
export const CloneScene: React.FC<SceneProps> = ({ f, dur }) => {
  const scan = ramp(f, 6, Math.max(20, dur - 14), EASE.inOut);
  const left = spr(f, 0, { damping: 13, stiffness: 170 });
  const done = spr(f, Math.max(20, dur - 14), { damping: 9, stiffness: 260 });
  return (
    <Stage>
      <div style={{ position: "absolute", top: 320 }}>
        <Rise f={f} text="अपनी आवाज़ Clone करो" size={82} start={0} />
      </div>
      <div style={{ position: "absolute", top: 560, display: "flex", gap: 40 }}>
        {[0, 1].map((side) => {
          const isAI = side === 1;
          return (
            <Card
              key={side}
              style={{
                width: 440,
                height: 600,
                padding: 36,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                translate: `${isAI ? 0 : lerp(left, -600, 0)}px 0`,
                border: isAI ? `2px solid rgba(34,211,238,${0.2 + scan * 0.7})` : `2px solid ${C.line}`,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  background: isAI ? GRAD : "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isAI ? <Clone size={100} color="#fff" /> : <Mic size={100} color="#fff" />}
              </div>
              <div style={{ clipPath: isAI ? `inset(0 ${100 - scan * 100}% 0 0)` : undefined }}>
                <Waveform f={f} bars={12} width={340} height={170} gap={10} color={isAI ? GRAD : "#fff"} seed={3} />
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: isAI ? C.cyan : C.ink }}>
                {isAI ? "AI Clone" : "You"}
              </div>
              {isAI && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${scan * 100}%`,
                    width: 6,
                    background: C.cyan,
                    boxShadow: `0 0 30px 10px ${C.cyan}`,
                    opacity: scan < 1 ? 1 : 0,
                  }}
                />
              )}
            </Card>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 790,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: done > 0.01 ? C.lime : "#222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(lerp(done, 0.6, 1)),
          boxShadow: `0 0 ${40 * done}px ${C.lime}`,
          border: "6px solid #07070D",
        }}
      >
        {done > 0.01 ? <Check size={70} color="#111" stroke={3.2} /> : <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 60, color: C.dim }}>→</div>}
      </div>
    </Stage>
  );
};

// ===== 9. STYLES: orbiting style chips with a snapping selector =====
const STYLES = ["Cheerful", "Deep", "Calm", "News", "Story", "Hype"];
export const SNAP_EVERY = 11;
export const Styles: React.FC<SceneProps> = ({ f, dur }) => {
  const maxSteps = Math.max(1, Math.floor((dur - 10) / SNAP_EVERY));
  const steps = Math.min(maxSteps, Math.max(0, Math.floor((f - 4) / SNAP_EVERY)));
  const settle = steps === 0 ? 1 : spr(f, 4 + steps * SNAP_EVERY, { damping: 10, stiffness: 240 });
  const rot = lerp(settle, -(steps - 1) * 60, -steps * 60);
  const intro = spr(f, 0, { damping: 13, stiffness: 160 });
  const R = 330;
  const active = ((steps % 6) + 6) % 6;
  return (
    <Stage>
      <div style={{ position: "absolute", top: 300 }}>
        <Rise f={f} text="Voice Styles" size={100} start={0} />
      </div>
      <div style={{ position: "absolute", top: 520, width: 900, height: 900, scale: String(lerp(intro, 0.4, 1)), opacity: intro }}>
        <div
          style={{
            position: "absolute",
            left: 450 - R,
            top: 450 - R,
            width: R * 2,
            height: R * 2,
            borderRadius: "50%",
            border: "3px dashed rgba(255,255,255,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 450 - 140,
            top: 450 - 140,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: GRAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 90px ${C.violet}`,
          }}
        >
          <User size={150} color="#fff" />
        </div>
        {STYLES.map((s, i) => {
          const a = ((i * 60 + rot - 90) * Math.PI) / 180;
          const x = 450 + Math.cos(a) * R;
          const y = 450 + Math.sin(a) * R;
          const isOn = i === active;
          return (
            <div
              key={s}
              style={{
                position: "absolute",
                left: x,
                top: y,
                translate: "-50% -50%",
                scale: String(isOn ? lerp(settle, 1, 1.25) : 0.92),
              }}
            >
              <Chip
                bg={isOn ? C.lime : "rgba(20,20,32,0.92)"}
                color={isOn ? "#111" : C.ink}
                style={{ fontSize: 42, padding: "14px 30px" }}
              >
                {s}
              </Chip>
            </div>
          );
        })}
        {/* selector pin */}
        <div
          style={{
            position: "absolute",
            left: 450 - 22,
            top: 450 - R - 110,
            width: 0,
            height: 0,
            borderLeft: "22px solid transparent",
            borderRight: "22px solid transparent",
            borderTop: `30px solid ${C.lime}`,
          }}
        />
      </div>
    </Stage>
  );
};

// ===== 10. DUBBING: editor timeline gets an AI voice track =====
const LANGS = ["हिंदी", "English", "Español"];
export const Dubbing: React.FC<SceneProps> = ({ f, dur }) => {
  const win = spr(f, 0, { damping: 13, stiffness: 160 });
  const head = ramp(f, 6, dur - 6, EASE.inOut);
  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          top: 300,
          width: 920,
          translate: `0 ${lerp(win, 900, 0)}px`,
          rotate: `x ${lerp(win, 30, 0)}deg`,
        }}
      >
        <Card style={{ padding: 30, boxSizing: "border-box" }}>
          {/* preview */}
          <div
            style={{
              height: 470,
              borderRadius: 26,
              background: "linear-gradient(160deg,#2A1E6B,#0E3A4A)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 330, top: 110, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
            <div style={{ position: "absolute", left: 250, top: 300, width: 360, height: 260, borderRadius: "180px 180px 0 0", background: "rgba(255,255,255,0.18)" }} />
            <div style={{ position: "absolute", right: 26, top: 26 }}>
              <Chip bg="rgba(0,0,0,0.5)" style={{ fontSize: 32, padding: "8px 20px" }}>
                <Mic size={36} color={C.lime} /> AI Voiceover
              </Chip>
            </div>
            <div style={{ position: "absolute", left: 30, bottom: 26, display: "flex", gap: 14 }}>
              {LANGS.map((l, i) => {
                const p = spr(f, 14 + i * 8, { damping: 10, stiffness: 240 });
                return (
                  <div key={l} style={{ scale: String(p), opacity: p }}>
                    <Chip bg={i === 0 ? C.lime : "rgba(0,0,0,0.55)"} color={i === 0 ? "#111" : C.ink} style={{ fontSize: 34, padding: "8px 22px" }}>
                      {i === 0 ? <Globe size={34} color="#111" /> : null}
                      {l}
                    </Chip>
                  </div>
                );
              })}
            </div>
          </div>
          {/* tracks */}
          <div style={{ position: "relative", marginTop: 26 }}>
            <div style={{ display: "flex", gap: 6, height: 90 }}>
              {new Array(9).fill(0).map((_, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 10, background: `linear-gradient(160deg, rgba(124,92,255,${0.35 + (i % 3) * 0.12}), rgba(34,211,238,0.25))` }} />
              ))}
            </div>
            <div style={{ marginTop: 14, height: 110, borderRadius: 14, background: "rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - head * 100}% 0 0)`, background: "rgba(198,255,61,0.14)", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <Waveform f={f} bars={40} width={830} height={86} gap={5} color={C.lime} seed={5} />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: -14,
                bottom: -14,
                left: `${head * 100}%`,
                width: 5,
                background: "#fff",
                boxShadow: "0 0 14px #fff",
              }}
            />
          </div>
        </Card>
      </div>
    </Stage>
  );
};
