import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, EMOJI, H, INTER, W, clamp, easeInOut, easeOut } from "../theme";

// global 612-822 (local 0-210). Split-screen: presenter top 45% (Main clips
// the plate), cafe B-roll bottom 55%, spring-physics chat bubble on the seam.
export const SPLIT_Y = 864;
const SLIDE = [3, 23];
const BUBBLE = 30;
const EXPAND = BUBBLE + 15; // 0.5s of typing dots
const MSG = ["Abe", "tu", "kitna", "dumb", "hai,", "tereko", "ye", "nahi", "pata"];
const TICKS = 140;

const Cafe: React.FC<{ f: number }> = ({ f }) => {
  const orbs = new Array(12).fill(0).map((_, i) => {
    const x = random(`co${i}`) * W;
    const y = 40 + random(`cy${i}`) * 520;
    const r = 40 + random(`cr${i}`) * 110;
    return <circle key={i} cx={x + Math.sin(f / 40 + i) * 8} cy={y} r={r} fill={i % 3 ? "#ffb35c" : "#ffe1b0"} opacity={0.12 + random(`cp${i}`) * 0.25} />;
  });
  const sent = f >= 120;
  const sheet = interpolate(f, [60, 72], [1, 0], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ top: SPLIT_Y, height: H - SPLIT_Y, overflow: "hidden", background: "linear-gradient(180deg, #2b1a10 0%, #160d08 70%, #0b0705 100%)" }}>
      <svg width={W} height={H - SPLIT_Y} style={{ position: "absolute" }}>
        <filter id="cafeBlur">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <g filter="url(#cafeBlur)">
          {orbs}
          <rect x={760} y={0} width={360} height={700} fill={C.tealDeep} opacity={0.7} />
        </g>
        {/* table edge */}
        <path d={`M 0 820 L ${W} 760 L ${W} ${H} L 0 ${H} Z`} fill="#1d120b" />
        <path d={`M 0 820 L ${W} 760`} stroke="#5a3b26" strokeWidth={4} opacity={0.6} />
      </svg>

      {/* phone in hand, forwarding a reel */}
      <div
        style={{
          position: "absolute",
          left: 540 - 175,
          top: 230,
          width: 350,
          height: 700,
          rotate: `${-7 + Math.sin(f / 25) * 1.2}deg`,
          borderRadius: 52,
          background: "#0b0d10",
          border: "9px solid #1c1f24",
          overflow: "hidden",
          boxShadow: "0 50px 90px rgba(0,0,0,0.7), 0 0 40px rgba(255,179,92,0.15)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 30%, #ff9a5a, #b83a7a 45%, #2a1650 85%)" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 380,
            background: "#16181c",
            borderRadius: "36px 36px 0 0",
            translate: `0px ${sheet * 400}px`,
            padding: "26px 22px",
            fontFamily: INTER,
            color: "#fff",
          }}
        >
          <div style={{ width: 70, height: 6, borderRadius: 3, background: "#444", margin: "0 auto 20px" }} />
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, opacity: 0.8 }}>Send to</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {["Rahul", "Aman", "Kabir"].map((n, i) => (
              <div key={n} style={{ textAlign: "center", width: 90 }}>
                <div style={{ width: 78, height: 78, margin: "0 auto", borderRadius: "50%", background: [C.cyan, "#ff4fd8", C.green][i], border: i === 0 ? "4px solid #fff" : "none" }} />
                <div style={{ fontSize: 18, marginTop: 8 }}>{n}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 34,
              height: 70,
              borderRadius: 16,
              background: sent ? "#2a2d33" : "#0095f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              scale: String(interpolate(f, [116, 120, 126], [1, 0.92, 1], clamp)),
            }}
          >
            {sent ? "Sent ✓" : "Send"}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const S5Chat: React.FC = () => {
  const f = useCurrentFrame();
  const slide = interpolate(f, SLIDE, [H - SPLIT_Y, 0], { ...clamp, easing: easeInOut });

  const pop = interpolate(f, [BUBBLE, BUBBLE + 5, BUBBLE + 9, BUBBLE + 13], [0, 1.18, 0.95, 1], clamp);
  const expand = interpolate(f, [EXPAND, EXPAND + 9], [0, 1], { ...clamp, easing: easeOut });
  const wobble = f >= EXPAND ? Math.sin((f - EXPAND) * 0.9) * Math.exp(-(f - EXPAND) / 6) * 0.05 : 0;
  const bw = interpolate(expand, [0, 1], [190, 880]);
  const bh = interpolate(expand, [0, 1], [110, 250]);
  const ticksBlue = f >= TICKS;
  const divider = interpolate(f, [SLIDE[1] - 4, SLIDE[1] + 6], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ translate: `0px ${slide}px` }}>
        <Cafe f={f} />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 0, right: 0, top: SPLIT_Y - 2, height: 4, background: C.cyan, opacity: divider * 0.8, boxShadow: `0 0 24px ${C.cyan}` }} />

      {f >= BUBBLE && (
        <div
          style={{
            position: "absolute",
            left: 540 - bw / 2,
            top: SPLIT_Y - bh / 2,
            width: bw,
            height: bh,
            borderRadius: 40,
            background: "linear-gradient(160deg, #24333c 0%, #172128 100%)",
            border: "1.5px solid rgba(255,255,255,0.14)",
            boxShadow: "0 30px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
            scale: `${pop * (1 + wobble)} ${pop * (1 - wobble)}`,
            overflow: "hidden",
            padding: expand > 0.5 ? "34px 44px" : 0,
            boxSizing: "border-box",
          }}
        >
          {expand < 0.5 ? (
            <div style={{ display: "flex", gap: 16, height: "100%", alignItems: "center", justifyContent: "center", opacity: 1 - expand * 2 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: "#cfd8dc", translate: `0px ${Math.sin(f / 2.2 - i) * 7}px`, opacity: 0.6 + 0.4 * Math.sin(f / 2.2 - i) }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ fontFamily: `${INTER}, ${EMOJI}`, fontWeight: 600, fontSize: 52, lineHeight: 1.22, color: "#fff", opacity: (expand - 0.5) * 2 }}>
                {MSG.map((w, i) => {
                  const t = EXPAND + 10 + i * 8;
                  const lit = f >= t;
                  return (
                    <span key={i} style={{ color: lit ? "#fff" : "rgba(255,255,255,0.35)", textShadow: lit && f < t + 10 ? `0 0 22px ${C.yellow}` : "none" }}>
                      {w}{" "}
                    </span>
                  );
                })}
                <span style={{ fontFamily: EMOJI, opacity: f >= EXPAND + 10 + MSG.length * 8 ? 1 : 0.2 }}>😂</span>
              </div>
              <div style={{ position: "absolute", right: 36, bottom: 22, fontFamily: INTER, fontSize: 24, color: "rgba(255,255,255,0.55)", display: "flex", gap: 10, alignItems: "center" }}>
                9:41 PM
                <svg width={36} height={22} viewBox="0 0 36 22">
                  <path d="M 2 12 L 8 18 L 20 4 M 14 18 L 16 18 L 30 4" fill="none" stroke={ticksBlue ? "#53bdeb" : "#8696a0"} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
