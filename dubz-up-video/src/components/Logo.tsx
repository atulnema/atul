import React from "react";
import { pop } from "../lib/anim";
import { C, FONT, STROKE } from "../theme";

/** The mark: a speech bubble with an up arrow inside. */
export const Mark: React.FC<{ size: number; color?: string; arrow?: string }> = ({
  size,
  color = C.pink,
  arrow = C.cream,
}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: "block", overflow: "visible" }}>
    <path
      d="M30 10 H90 A22 22 0 0 1 112 32 V68 A22 22 0 0 1 90 90 H52 L26 112 L30 90 A22 22 0 0 1 8 68 V32 A22 22 0 0 1 30 10 Z"
      transform="translate(7 7)"
      fill={C.ink}
      stroke={C.ink}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      d="M30 10 H90 A22 22 0 0 1 112 32 V68 A22 22 0 0 1 90 90 H52 L26 112 L30 90 A22 22 0 0 1 8 68 V32 A22 22 0 0 1 30 10 Z"
      fill={color}
      stroke={C.ink}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      d="M60 24 L86 52 H70 V76 H50 V52 H34 Z"
      fill={arrow}
      stroke={C.ink}
      strokeWidth="6"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Full lockup: mark, "dubz", and "up" in a tilted pill.
 * Pass a frame and delay to animate it in; leave them out for a static lockup.
 */
export const Logo: React.FC<{
  size?: number;
  frame?: number;
  delay?: number;
  pillColor?: string;
  pillFg?: string;
  markColor?: string;
}> = ({ size = 220, frame = 999, delay = 0, pillColor = C.pink, pillFg = C.cream, markColor = C.pink }) => {
  const mark = pop(frame, delay, { damping: 8, stiffness: 160 });
  const letters = Array.from("dubz");
  const up = pop(frame, delay + 13, { damping: 8, stiffness: 170 });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.1,
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color: C.ink,
      }}
    >
      <div
        style={{
          scale: String(mark),
          rotate: `${(1 - mark) * -40}deg`,
          transformOrigin: "50% 100%",
          marginRight: size * 0.02,
        }}
      >
        <Mark size={size * 0.86} color={markColor} />
      </div>
      <div style={{ display: "flex" }}>
        {letters.map((l, i) => {
          const p = pop(frame, delay + 3 + i * 2, { damping: 9 });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transformOrigin: "50% 100%",
                scale: `${p === 0 ? 0 : 1.3 - p * 0.3} ${p}`,
                translate: `0 ${(1 - p) * size * 0.5}px`,
                rotate: `${(1 - p) * (i % 2 ? 14 : -14)}deg`,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <div
        style={{
          scale: String(up),
          rotate: `${-7 + (1 - up) * 30}deg`,
          translate: `0 ${-size * 0.06}px`,
          backgroundColor: pillColor,
          color: pillFg,
          border: `${STROKE + 1}px solid ${C.ink}`,
          boxShadow: `${size * 0.045}px ${size * 0.045}px 0 ${C.ink}`,
          borderRadius: size * 0.24,
          padding: `${size * 0.02}px ${size * 0.16}px ${size * 0.1}px`,
        }}
      >
        up
      </div>
    </div>
  );
};
