import React from "react";
import { C } from "./theme";

type IconProps = { size: number; glow?: number; id: string };

export const HEART_PATH =
  "M50 88 C 20 66 2 50 2 28 C 2 13 14 2 28 2 C 38 2 46 8 50 16 C 54 8 62 2 72 2 C 86 2 98 13 98 28 C 98 50 80 66 50 88 Z";
export const BUBBLE_PATH =
  "M50 6 C 75 6 94 23 94 46 C 94 69 75 86 50 86 C 42 86 35 84 28 81 L 10 90 L 15 71 C 9 64 6 55 6 46 C 6 23 25 6 50 6 Z";
export const PLANE_PATH = "M 6 44 L 94 8 L 62 94 L 47 56 Z";

const shadow = (color: string, glow = 1) =>
  `drop-shadow(0 28px 34px rgba(0,0,0,0.55)) drop-shadow(0 0 ${30 * glow}px ${color})`;

export const GlossyHeart: React.FC<IconProps> = ({ size, glow = 1, id }) => (
  <svg width={size} height={size * 0.92} viewBox="0 0 100 92" style={{ overflow: "visible", filter: shadow("rgba(255,45,85,0.55)", glow) }}>
    <defs>
      <radialGradient id={`${id}g`} cx="0.34" cy="0.28" r="0.85">
        <stop offset="0" stopColor="#ffb0bb" />
        <stop offset="0.35" stopColor="#ff3b62" />
        <stop offset="0.8" stopColor="#c0112f" />
        <stop offset="1" stopColor="#7d0a1f" />
      </radialGradient>
      <filter id={`${id}s`}>
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </defs>
    <path d={HEART_PATH} fill={`url(#${id}g)`} />
    <path d={HEART_PATH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} />
    <ellipse cx={30} cy={22} rx={15} ry={8} transform="rotate(-32 30 22)" fill="#fff" opacity={0.6} filter={`url(#${id}s)`} />
    <ellipse cx={74} cy={20} rx={6} ry={3.5} transform="rotate(28 74 20)" fill="#fff" opacity={0.35} filter={`url(#${id}s)`} />
  </svg>
);

export const GlossyComment: React.FC<IconProps> = ({ size, glow = 1, id }) => (
  <svg width={size} height={size} viewBox="0 0 100 96" style={{ overflow: "visible", filter: shadow("rgba(255,70,90,0.5)", glow) }}>
    <defs>
      <radialGradient id={`${id}g`} cx="0.32" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#ffc2b8" />
        <stop offset="0.35" stopColor="#ff5a5f" />
        <stop offset="0.85" stopColor="#c2183a" />
        <stop offset="1" stopColor="#80102a" />
      </radialGradient>
      <filter id={`${id}s`}>
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </defs>
    <path d={BUBBLE_PATH} fill={`url(#${id}g)`} />
    <path d={BUBBLE_PATH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} />
    {[34, 50, 66].map((x) => (
      <circle key={x} cx={x} cy={47} r={5.5} fill="#fff" opacity={0.92} />
    ))}
    <ellipse cx={34} cy={22} rx={16} ry={7} transform="rotate(-22 34 22)" fill="#fff" opacity={0.55} filter={`url(#${id}s)`} />
  </svg>
);

export const GlossyPlane: React.FC<IconProps> = ({ size, glow = 1, id }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${36 * glow}px ${C.cyan}) drop-shadow(0 24px 30px rgba(0,0,0,0.5))` }}>
    <defs>
      <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor="#bff7ff" />
        <stop offset="1" stopColor="#14a9cf" />
      </linearGradient>
      <linearGradient id={`${id}b`} x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7ff1ff" />
        <stop offset="1" stopColor="#0a6f8c" />
      </linearGradient>
    </defs>
    <path d="M 6 44 L 94 8 L 47 56 Z" fill={`url(#${id}a)`} />
    <path d="M 94 8 L 62 94 L 47 56 Z" fill={`url(#${id}b)`} />
    <path d={PLANE_PATH} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
    <path d="M 94 8 L 47 56" stroke="#fff" strokeWidth={2.2} />
  </svg>
);

export const Bulb: React.FC<{ size: number; pulse: number }> = ({ size, pulse }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${18 + pulse * 26}px rgba(255,255,255,${0.35 + pulse * 0.45}))` }}>
    <path
      d="M50 8 C 30 8 16 23 16 42 C 16 55 23 63 30 70 L 32 78 L 68 78 L 70 70 C 77 63 84 55 84 42 C 84 23 70 8 50 8 Z"
      fill={`rgba(255,255,255,${0.06 + pulse * 0.16})`}
      stroke="#fff"
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path d="M 38 86 L 62 86 M 42 94 L 58 94" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    <path d="M 40 60 L 40 46 C 40 38 60 38 60 46 L 60 60 M 50 46 L 50 62" fill="none" stroke={C.amber} strokeWidth={3.5} strokeLinecap="round" opacity={0.6 + pulse * 0.4} />
  </svg>
);
