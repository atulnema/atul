import React from "react";
import { C } from "../theme";

const SKIN = "#C98B5F";
const SKIN_SHADE = "#A96E47";
const HAIR = "#1A1512";
const HOODIE = "#18181B";
const HOODIE_HI = "#26262B";

type Props = {
  /** 0 = closed, 1 = wide open */
  mouth: number;
  /** 0 = open eyes, 1 = fully closed */
  blink: number;
  /** pupil offset, -1..1 */
  lookX?: number;
  lookY?: number;
  /** eyebrow lift, -1..1 */
  brow?: number;
  /** tilt in degrees */
  tilt?: number;
  smile?: number;
};

export const Avatar: React.FC<Props> = ({ mouth, blink, lookX = 0, lookY = 0, brow = 0, tilt = 0, smile = 1 }) => {
  const eyeRy = 12 * (1 - blink) + 0.8;
  const px = lookX * 4.5;
  const py = lookY * 3.5;
  const browY = -brow * 6;
  const open = Math.max(0, Math.min(1, mouth));

  return (
    <svg viewBox="0 0 400 440" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* body */}
      <path d="M30 440 C30 362 86 314 150 304 L250 304 C314 314 370 362 370 440 Z" fill={HOODIE} />
      <path d="M150 304 C120 330 104 372 100 440 L80 440 C84 372 104 330 150 304 Z" fill={HOODIE_HI} />
      <path d="M250 304 C280 330 296 372 300 440 L320 440 C316 372 296 330 250 304 Z" fill={HOODIE_HI} />
      {/* neck */}
      <path d="M172 250 L228 250 L232 312 C215 326 185 326 168 312 Z" fill={SKIN_SHADE} />
      {/* hood collar */}
      <path d="M138 302 C160 346 240 346 262 302 C246 330 154 330 138 302 Z" fill={HOODIE_HI} />
      <path d="M150 300 C168 332 232 332 250 300" stroke="#0E0E10" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* drawstrings */}
      <path d="M184 330 C182 352 180 372 178 396" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M216 330 C218 352 220 372 222 396" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" fill="none" />
      <circle cx={178} cy={400} r={6} fill={C.crimson} />
      <circle cx={222} cy={400} r={6} fill={C.crimson} />

      <g transform={`rotate(${tilt} 200 260)`}>
        {/* ears */}
        <ellipse cx={113} cy={182} rx={17} ry={25} fill={SKIN} />
        <ellipse cx={287} cy={182} rx={17} ry={25} fill={SKIN} />
        <ellipse cx={115} cy={183} rx={8} ry={13} fill={SKIN_SHADE} />
        <ellipse cx={285} cy={183} rx={8} ry={13} fill={SKIN_SHADE} />
        {/* face */}
        <path d="M114 150 C114 84 286 84 286 150 L286 192 C286 250 244 282 200 282 C156 282 114 250 114 192 Z" fill={SKIN} />
        {/* stubble */}
        <path
          d="M120 206 C128 258 162 284 200 284 C238 284 272 258 280 206 C268 240 244 256 226 254 C214 246 186 246 174 254 C156 256 132 240 120 206 Z"
          fill={HAIR}
          opacity={0.2}
        />
        {/* moustache */}
        <path d="M172 224 C186 214 214 214 228 224 C214 220 186 220 172 224 Z" fill={HAIR} opacity={0.55} />
        {/* cheeks */}
        <ellipse cx={142} cy={214} rx={16} ry={9} fill="#E0705F" opacity={0.18} />
        <ellipse cx={258} cy={214} rx={16} ry={9} fill="#E0705F" opacity={0.18} />

        {/* hair: swept-up quiff */}
        <path
          d="M108 168 C96 104 124 56 176 44 C200 22 252 22 276 46 C302 66 306 112 294 168 C290 140 282 120 266 112 C244 120 210 118 186 108 C168 116 146 112 132 120 C120 132 112 148 108 168 Z"
          fill={HAIR}
        />
        <path d="M176 44 C196 30 236 26 262 40 C232 34 204 40 186 60 C186 52 182 48 176 44 Z" fill="#3A2E27" />
        <path d="M150 70 C172 54 206 50 232 58 C204 60 182 70 168 88 Z" fill="#2A221D" />

        {/* eyebrows */}
        <g transform={`translate(0 ${browY})`}>
          <rect x={140} y={128} width={46} height={11} rx={5.5} fill={HAIR} transform="rotate(-6 163 133)" />
          <rect x={214} y={128} width={46} height={11} rx={5.5} fill={HAIR} transform="rotate(6 237 133)" />
        </g>

        {/* eyes */}
        <ellipse cx={163} cy={172} rx={13} ry={eyeRy} fill="#fff" />
        <ellipse cx={237} cy={172} rx={13} ry={eyeRy} fill="#fff" />
        {blink < 0.7 && (
          <>
            <circle cx={163 + px} cy={173 + py} r={7.5 * (1 - blink * 0.5)} fill="#141414" />
            <circle cx={237 + px} cy={173 + py} r={7.5 * (1 - blink * 0.5)} fill="#141414" />
            <circle cx={166 + px} cy={170 + py} r={2.4} fill="#fff" />
            <circle cx={240 + px} cy={170 + py} r={2.4} fill="#fff" />
          </>
        )}

        {/* glasses */}
        <rect x={134} y={148} width={58} height={48} rx={20} fill="rgba(255,255,255,0.08)" stroke="#121212" strokeWidth={6} />
        <rect x={208} y={148} width={58} height={48} rx={20} fill="rgba(255,255,255,0.08)" stroke="#121212" strokeWidth={6} />
        <path d="M192 166 C197 160 203 160 208 166" stroke="#121212" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M134 164 L118 160" stroke="#121212" strokeWidth={6} strokeLinecap="round" />
        <path d="M266 164 L282 160" stroke="#121212" strokeWidth={6} strokeLinecap="round" />

        {/* nose */}
        <path d="M199 184 C193 202 195 210 207 209" stroke={SKIN_SHADE} strokeWidth={5} fill="none" strokeLinecap="round" />

        {/* mouth */}
        {open < 0.08 ? (
          <path
            d={`M180 ${236 - smile * 2} Q200 ${236 + smile * 10} 220 ${236 - smile * 2}`}
            stroke="#5A2418"
            strokeWidth={5.5}
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <g>
            <path
              d={`M${181 - open * 3} 234 Q200 ${236 + 4 + open * 26} ${219 + open * 3} 234 Q200 ${232 - open * 4} ${181 - open * 3} 234 Z`}
              fill="#5A1E16"
            />
            <clipPath id="mouthClip">
              <path d={`M${181 - open * 3} 234 Q200 ${236 + 4 + open * 26} ${219 + open * 3} 234 Q200 ${232 - open * 4} ${181 - open * 3} 234 Z`} />
            </clipPath>
            <g clipPath="url(#mouthClip)">
              <rect x={178} y={228} width={44} height={7} fill="#fff" />
              <ellipse cx={200} cy={250 + open * 10} rx={14} ry={9} fill="#E2675E" />
            </g>
          </g>
        )}
      </g>
    </svg>
  );
};
