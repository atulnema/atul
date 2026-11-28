import React from "react";
import { AbsoluteFill } from "remotion";
import { Card, Chip, MysteryBox, Odometer, Rise } from "../components/Kit";
import { Wallet } from "../components/Icons";
import { C, EASE, FONT, SceneProps, lerp, noise, ramp, shake, spr } from "../lib";

const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

// ===== 1. HOOK: the bill that keeps climbing =====
export const Hook: React.FC<SceneProps> = ({ f, dur, seg }) => {
  const h1 = seg("h1");
  const card = spr(f, 0, { damping: 13, stiffness: 140 });
  const count = ramp(f, 4, h1.e - 6, EASE.inOut);
  const brandAt = h1.s + Math.round((h1.e - h1.s) * 0.12);
  const brand = spr(f, brandAt - 3, { damping: 9, stiffness: 260 });
  const rows = ["Voice credits", "Pro plan", "Extra characters"];
  const push = lerp(ramp(f, 0, dur, EASE.inOut), 1, 1.07);
  const jitter = count > 0.15 && count < 0.99 ? Math.sin(f * 3.1) * 2.5 : 0;
  return (
    <Stage style={{ scale: String(push) }}>
      {/* flying cash */}
      {new Array(9).fill(0).map((_, i) => {
        const st = 8 + i * 4;
        const p = ramp(f, st, st + 30, EASE.soft);
        if (p <= 0) return null;
        const dx = (noise(i + 3) - 0.5) * 900;
        const dy = -380 - noise(i + 11) * 520;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - 85 + dx * p,
              top: 820 + dy * p,
              width: 170,
              height: 90,
              borderRadius: 14,
              background: "linear-gradient(135deg,#3BD67B,#1E9E58)",
              border: "3px solid rgba(255,255,255,0.4)",
              rotate: `${(noise(i) - 0.5) * 120 * p}deg`,
              opacity: 1 - p * 0.85,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 52,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            ₹
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 330,
          scale: String(lerp(brand, 0.3, 1)),
          opacity: brand,
          rotate: `${lerp(brand, -12, -4)}deg`,
        }}
      >
        <Chip bg="rgba(255,59,78,0.18)" style={{ border: `3px solid ${C.red}`, fontSize: 56 }}>
          ElevenLabs?
        </Chip>
      </div>
      <div style={{ perspective: 1400, position: "absolute", top: 470 }}>
        <Card
          style={{
            width: 820,
            padding: "56px 60px",
            rotate: `x ${lerp(card, 35, 10)}deg`,
            translate: `${jitter}px ${lerp(card, 700, 0)}px`,
            boxShadow: `0 40px 120px rgba(0,0,0,0.5), 0 0 ${120 * count}px rgba(255,59,78,${0.45 * count})`,
            border: `2px solid rgba(255,59,78,${0.2 + count * 0.6})`,
            background: "linear-gradient(160deg, rgba(34,22,40,0.96), rgba(16,12,24,0.96))",
          }}
        >
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.dim, letterSpacing: 2 }}>
            MONTHLY AI VOICE BILL
          </div>
          <div style={{ height: 2, background: C.line, margin: "26px 0" }} />
          {rows.map((r, i) => {
            const p = ramp(f, 6 + i * 6, 18 + i * 6);
            return (
              <div
                key={r}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 44,
                  color: C.ink,
                  margin: "14px 0",
                  opacity: p,
                  translate: `${lerp(p, 60, 0)}px 0`,
                }}
              >
                <span>{r}</span>
                <span style={{ color: C.red }}>+ ₹₹₹</span>
              </div>
            );
          })}
          <div style={{ height: 2, background: C.line, margin: "26px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: C.dim }}>TOTAL</span>
            <Odometer value={lerp(count, 0, 9999)} size={120} color={count > 0.6 ? C.red : C.ink} />
          </div>
        </Card>
      </div>
    </Stage>
  );
};

// ===== 2. STOP slam =====
export const Stop: React.FC<SceneProps> = ({ f }) => {
  const slam = ramp(f, 0, 9, EASE.snap);
  const txt = spr(f, 4, { damping: 9, stiffness: 300 });
  const sx = shake(f, 8, 12, 26);
  return (
    <Stage style={{ translate: `${sx}px ${sx * 0.4}px` }}>
      {/* burst lines */}
      {new Array(16).fill(0).map((_, i) => {
        const p = ramp(f, 7, 22, EASE.soft);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - 6,
              top: 760,
              width: 12,
              height: 200,
              borderRadius: 10,
              background: C.red,
              transformOrigin: "6px 0px",
              rotate: `${i * 22.5}deg`,
              translate: `0 ${lerp(p, 220, 420)}px`,
              opacity: (1 - p) * 0.9,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 510,
          width: 500,
          height: 500,
          scale: String(lerp(slam, 3.2, 1)),
          opacity: ramp(f, 0, 3),
          rotate: `${lerp(slam, -25, 0)}deg`,
        }}
      >
        <svg viewBox="0 0 100 100" width={500} height={500}>
          <polygon
            points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30"
            fill={C.red}
            stroke="#fff"
            strokeWidth={4}
          />
          <text
            x="50"
            y="61"
            textAnchor="middle"
            fontFamily="Poppins"
            fontWeight={900}
            fontSize={28}
            fill="#fff"
          >
            STOP
          </text>
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1080,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 150,
          color: C.ink,
          scale: String(lerp(txt, 0.4, 1)),
          opacity: txt,
          textShadow: `0 10px 0 ${C.red}`,
        }}
      >
        रुक जाओ!
      </div>
    </Stage>
  );
};

// ===== 3. SAVE: coins fly back into the wallet =====
export const COINS = 7;
export const coinLand = (i: number) => 18 + i * 5; // frames, mirrored in audio mix

export const Save: React.FC<SceneProps> = ({ f, seg }) => {
  const h3 = seg("h3");
  const wal = spr(f, 0, { damping: 12, stiffness: 160 });
  const landed = new Array(COINS).fill(0).filter((_, i) => f >= coinLand(i)).length;
  const lastLand = landed > 0 ? coinLand(landed - 1) : -99;
  const bump = Math.max(0, 1 - (f - lastLand) / 8);
  const saved = ramp(f, 16, coinLand(COINS - 1) + 4, EASE.inOut);
  const toolAt = h3.s + Math.round((h3.e - h3.s) * 0.08);
  const tool = spr(f, toolAt - 3, { damping: 10, stiffness: 240 });
  return (
    <Stage>
      <div style={{ position: "absolute", top: 330, scale: String(lerp(tool, 0.5, 1)), opacity: tool }}>
        <Chip bg="rgba(43,214,123,0.16)" style={{ border: "3px solid #2BD67B", fontSize: 54 }}>
          ये AI Tool
        </Chip>
      </div>
      {new Array(COINS).fill(0).map((_, i) => {
        const st = coinLand(i) - 14;
        const p = ramp(f, st, coinLand(i), EASE.inOut);
        if (p <= 0 || p >= 1) return null;
        const side = i % 2 === 0 ? -1 : 1;
        const sx = 540 + side * (380 + noise(i) * 120);
        const sy = 360 + noise(i + 4) * 200;
        const ex = 540;
        const ey = 860;
        const x = lerp(p, sx, ex);
        const y = lerp(p, sy, ey) - Math.sin(p * Math.PI) * 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 55,
              top: y - 55,
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #FFE69A, #FFC83D 55%, #C98A00)",
              border: "5px solid #FFE69A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 58,
              color: "#8A5A00",
              rotate: `${p * 360 * side}deg`,
              scale: String(lerp(p, 1.1, 0.6)),
            }}
          >
            ₹
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 700,
          width: 380,
          height: 380,
          borderRadius: 90,
          background: "linear-gradient(160deg, #2BD67B, #138A4C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(lerp(wal, 0.2, 1) * (1 + bump * 0.08)),
          boxShadow: `0 0 ${80 + bump * 80}px rgba(43,214,123,0.55)`,
        }}
      >
        <Wallet size={230} color="#fff" stroke={1.8} />
      </div>
      <div style={{ position: "absolute", top: 1100, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "#2BD67B", letterSpacing: 3 }}>
          पैसा बचाओ
        </div>
        <Odometer value={lerp(saved, 0, 9999)} size={110} color="#2BD67B" prefix="+₹" />
      </div>
    </Stage>
  );
};

// ===== 4. TEASE: the best part is locked till the end =====
export const Tease: React.FC<SceneProps> = ({ f, seg }) => {
  const h4 = seg("h4");
  const box = spr(f, 0, { damping: 10, stiffness: 150 });
  const endAt = h4.s + Math.round((h4.e - h4.s) * 0.62); // "आखिर में"
  const flag = spr(f, endAt - 4, { damping: 9, stiffness: 260 });
  const path = ramp(f, endAt - 8, endAt + 10, EASE.inOut);
  const head = ramp(f, 4, endAt + 10, EASE.inOut);
  const q = spr(f, 6, { damping: 8, stiffness: 200 });
  return (
    <Stage>
      <div style={{ position: "absolute", top: 300 }}>
        <Rise f={f} text="सबसे अच्छी बात?" start={2} size={92} color={C.gold} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 470,
          scale: String(lerp(box, 0.2, 1)),
          translate: `0 ${Math.sin(f / 8) * 8}px`,
        }}
      >
        <MysteryBox f={f} size={440} wiggle={0.6} />
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -50,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 180,
            color: C.gold,
            scale: String(q),
            rotate: `${12 + Math.sin(f / 6) * 6}deg`,
            textShadow: "0 8px 0 rgba(0,0,0,0.4)",
          }}
        >
          ?
        </div>
      </div>
      {/* video timeline */}
      <div style={{ position: "absolute", top: 1080, left: 110, width: 860, height: 140 }}>
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, height: 16, borderRadius: 10, background: "rgba(255,255,255,0.14)" }} />
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            height: 16,
            width: `${lerp(head, 4, 30)}%`,
            borderRadius: 10,
            background: C.gold,
          }}
        />
        <svg width={860} height={140} style={{ position: "absolute", inset: 0 }}>
          <path
            d={`M ${lerp(head, 34, 258)} 68 L 820 68`}
            stroke={C.gold}
            strokeWidth={5}
            strokeDasharray="14 12"
            pathLength={1}
            strokeDashoffset={0}
            style={{ opacity: path }}
            fill="none"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 40,
            left: `calc(${lerp(head, 4, 30)}% - 28px)`,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: `0 0 20px ${C.gold}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -10,
            top: -80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            scale: String(flag),
            transformOrigin: "50% 100%",
          }}
        >
          <Chip bg={C.gold} color="#1a1200" style={{ fontSize: 40, padding: "10px 24px", border: "none" }}>
            आखिर में
          </Chip>
          <div style={{ width: 6, height: 60, background: C.gold }} />
        </div>
      </div>
    </Stage>
  );
};
