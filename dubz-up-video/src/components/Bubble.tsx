import React from "react";
import { C, FONT, STROKE } from "../theme";

/** A speech bubble drawn as one path so the outline and shadow follow the tail. */
export const Bubble: React.FC<{
  w: number;
  h: number;
  color: string;
  fg?: string;
  tail?: "left" | "right";
  size?: number;
  shadow?: number;
  children: React.ReactNode;
}> = ({ w, h, color, fg = C.ink, tail = "left", size = 52, shadow = 9, children }) => {
  const r = Math.min(h / 2, 46);
  const th = Math.max(26, h * 0.3);
  const tx = w * 0.16;
  const tw = Math.max(40, w * 0.13);
  const pad = STROKE;
  const d = [
    `M${r} 0`,
    `H${w - r}`,
    `A${r} ${r} 0 0 1 ${w} ${r}`,
    `V${h - r}`,
    `A${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H${tx + tw}`,
    `L${tx + tw * 0.1} ${h + th}`,
    `L${tx} ${h}`,
    `H${r}`,
    `A${r} ${r} 0 0 1 0 ${h - r}`,
    `V${r}`,
    `A${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
  const W = w + pad * 2 + shadow;
  const H = h + th + pad * 2 + shadow;
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, scale: tail === "right" ? "-1 1" : undefined }}
      >
        <g transform={`translate(${pad + shadow} ${pad + shadow})`}>
          <path d={d} fill={C.ink} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        </g>
        <g transform={`translate(${pad} ${pad})`}>
          <path d={d} fill={color} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: tail === "right" ? shadow + pad : pad,
          top: pad,
          width: w,
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          color: fg,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};
