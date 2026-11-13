import React from "react";
import { talk } from "../lib/anim";
import { C, STROKE } from "../theme";
import { Sticker } from "./Sticker";

/** The host of the video: a friendly blob in headphones that blinks and lip-syncs. */
export const Avatar: React.FC<{
  size: number;
  frame: number;
  color?: string;
  talking?: number;
  seed?: number;
}> = ({ size, frame, color = C.purple, talking = 0, seed = 0 }) => {
  const blinkPhase = (frame + seed * 17) % 52;
  const eye = blinkPhase < 4 ? 0.12 + Math.abs(blinkPhase - 2) * 0.3 : 1;
  const open = talk(frame, seed) * talking;
  const bob = Math.sin(frame * 0.3 + seed) * 2.5 * talking;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block", overflow: "visible" }}>
      <ellipse cx="100" cy="222" rx="86" ry="70" fill={color} stroke={C.ink} strokeWidth="6" />
      <g transform={`translate(0 ${bob})`}>
        <path d="M100 40 q-8 -22 10 -26" fill="none" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
        <circle cx="111" cy="13" r="8" fill={C.yellow} stroke={C.ink} strokeWidth="5" />
        <circle cx="100" cy="100" r="62" fill={color} stroke={C.ink} strokeWidth="6" />
        <path d="M32 100 A68 68 0 0 1 168 100" fill="none" stroke={C.ink} strokeWidth="11" strokeLinecap="round" />
        <rect x="18" y="84" width="26" height="46" rx="11" fill={C.yellow} stroke={C.ink} strokeWidth="6" />
        <rect x="156" y="84" width="26" height="46" rx="11" fill={C.yellow} stroke={C.ink} strokeWidth="6" />
        <circle cx="66" cy="116" r="9" fill={C.pink} opacity="0.75" />
        <circle cx="134" cy="116" r="9" fill={C.pink} opacity="0.75" />
        <ellipse cx="78" cy="94" rx="8.5" ry={11 * eye} fill={C.ink} />
        <ellipse cx="122" cy="94" rx="8.5" ry={11 * eye} fill={C.ink} />
        <circle cx="81" cy="90" r="3" fill={C.white} opacity={eye > 0.9 ? 1 : 0} />
        <circle cx="125" cy="90" r="3" fill={C.white} opacity={eye > 0.9 ? 1 : 0} />
        {talking > 0.01 ? (
          <ellipse
            cx="100"
            cy="128"
            rx={15 - open * 3}
            ry={4 + open * 13}
            fill={C.ink}
          />
        ) : (
          <path d="M84 124 Q100 142 116 124" fill="none" stroke={C.ink} strokeWidth="6.5" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};

/** A video thumbnail with the host inside, a tag and a scrub bar. */
export const VideoCard: React.FC<{
  w: number;
  h: number;
  frame: number;
  bg?: string;
  avatar?: string;
  tag?: string;
  tagColor?: string;
  talking?: number;
  seed?: number;
  progress?: number;
  shadow?: number;
}> = ({
  w,
  h,
  frame,
  bg = C.sky,
  avatar = C.purple,
  tag,
  tagColor = C.yellow,
  talking = 0,
  seed = 0,
  progress = 0.4,
  shadow = 10,
}) => (
  <Sticker color={bg} radius={Math.round(h * 0.14)} shadow={shadow} style={{ width: w, height: h, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: "50%", bottom: -h * 0.08, translate: "-50% 0" }}>
      <Avatar size={h * 0.86} frame={frame} color={avatar} talking={talking} seed={seed} />
    </div>
    {tag ? (
      <div
        style={{
          position: "absolute",
          left: h * 0.07,
          top: h * 0.07,
          padding: `${h * 0.025}px ${h * 0.07}px`,
          backgroundColor: tagColor,
          border: `${Math.max(4, STROKE - 2)}px solid ${C.ink}`,
          borderRadius: 999,
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 700,
          fontSize: Math.max(20, h * 0.12),
          color: C.ink,
          lineHeight: 1.2,
        }}
      >
        {tag}
      </div>
    ) : null}
    <div
      style={{
        position: "absolute",
        left: h * 0.08,
        right: h * 0.08,
        bottom: h * 0.07,
        height: Math.max(8, h * 0.05),
        borderRadius: 999,
        backgroundColor: C.ink,
        overflow: "hidden",
      }}
    >
      <div style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: C.pink }} />
    </div>
  </Sticker>
);
