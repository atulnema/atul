import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, W, H, captionText, clamp, easeIn, easeOut } from "../theme";
import { GlossyPlane } from "../Icons";
import { CaptionBlock } from "../Common";

// 0:07 - 0:12 (local 0-150). Tap the air, plane materialises, tunnel through it.
const TAP = 14;
const BRUSH = 70;
export const TUNNEL = 135; // 0:11.5

export const S2Plane: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 540;
  const cy = 930;

  const grid = interpolate(f, [TAP, TAP + 20], [0, 1], clamp);
  const s = interpolate(f, [TAP + 2, TAP + 12, TAP + 20], [0, 1.2, 1], clamp);
  const bob = Math.sin(f / 12) * 10;
  const tunnel = interpolate(f, [TUNNEL, 150], [1, 22], { ...clamp, easing: easeIn });
  const tunnelO = interpolate(f, [TUNNEL + 8, 150], [0, 1], clamp);
  const rays = f / 2;
  const ripple = f - TAP;

  const brush = interpolate(f, [BRUSH, BRUSH + 8], [0, 1], { ...clamp, easing: easeOut });
  const capO = interpolate(f, [24, 30, TUNNEL, TUNNEL + 4], [0, 1, 1, 0], clamp);

  // converging particles on materialise
  const parts = new Array(24).fill(0).map((_, i) => {
    const ang = random(`pp${i}`) * Math.PI * 2;
    const d = interpolate(f, [TAP, TAP + 14], [380, 0], { ...clamp, easing: easeIn }) + 10;
    const o = interpolate(f, [TAP, TAP + 4, TAP + 14, TAP + 16], [0, 1, 1, 0], clamp);
    return <circle key={i} cx={cx + Math.cos(ang) * d} cy={cy + Math.sin(ang) * d} r={4} fill={C.cyan} opacity={o} />;
  });

  return (
    <AbsoluteFill>
      {/* dark glass grid */}
      <svg width={W} height={H} style={{ position: "absolute", opacity: grid * 0.45 }}>
        <defs>
          <radialGradient id="gridMask">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="gm">
            <circle cx={cx} cy={cy} r={460} fill="url(#gridMask)" />
          </mask>
        </defs>
        <g mask="url(#gm)" stroke={C.cyan} strokeOpacity={0.5} strokeWidth={1.5}>
          {new Array(19).fill(0).map((_, i) => (
            <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} />
          ))}
          {new Array(33).fill(0).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 60} x2={W} y2={i * 60} />
          ))}
        </g>
      </svg>

      {/* tap ripple */}
      {ripple >= 0 && ripple < 18 && (
        <div
          style={{
            position: "absolute",
            left: cx - 40,
            top: cy - 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `4px solid ${C.cyan}`,
            scale: String(1 + ripple * 0.5),
            opacity: 1 - ripple / 18,
          }}
        />
      )}

      <svg width={W} height={H} style={{ position: "absolute" }}>
        {parts}
      </svg>

      {/* volumetric rays */}
      <div
        style={{
          position: "absolute",
          left: cx - 420,
          top: cy - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: `repeating-conic-gradient(from ${rays}deg, rgba(61,232,255,0.22) 0deg 6deg, rgba(61,232,255,0) 6deg 20deg)`,
          WebkitMaskImage: "radial-gradient(circle, #000 10%, transparent 68%)",
          maskImage: "radial-gradient(circle, #000 10%, transparent 68%)",
          opacity: s > 0 ? Math.min(1, s) : 0,
          scale: String(tunnel),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: cx - 160,
          top: cy - 160 + bob,
          width: 320,
          height: 320,
          scale: String(s * tunnel),
          transformOrigin: "50% 52%",
          opacity: s > 0 ? 1 : 0,
        }}
      >
        <GlossyPlane size={320} id="pl1" glow={1 + (tunnel - 1) * 0.2} />
      </div>

      <CaptionBlock y={1170} style={{ opacity: capO }}>
        <div style={{ ...captionText, fontSize: 80 }}>SIRF</div>
        <div style={{ position: "relative", display: "inline-block", margin: "6px 0" }}>
          <svg width={560} height={150} viewBox="0 0 560 150" style={{ position: "absolute", left: -40, top: -18, overflow: "visible" }}>
            <path
              d="M 12 90 C 120 60 300 52 548 64 C 420 90 260 108 30 118"
              fill="none"
              stroke={C.yellow}
              strokeWidth={92}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - brush}
              style={{ filter: `drop-shadow(0 0 22px rgba(255,225,77,0.6))` }}
            />
          </svg>
          <div style={{ ...captionText, fontSize: 120, position: "relative", color: brush > 0.4 ? "#0a0a0a" : C.white, textShadow: brush > 0.4 ? "none" : captionText.textShadow }}>
            SHARE
          </div>
        </div>
        <div style={{ ...captionText, fontSize: 76 }}>KE LIYE BANAO</div>
      </CaptionBlock>

      {/* tunnel white-out */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 55%, #ffffff 0%, #c8fbff 45%, #3de8ff 100%)",
          opacity: tunnelO,
        }}
      />
    </AbsoluteFill>
  );
};
