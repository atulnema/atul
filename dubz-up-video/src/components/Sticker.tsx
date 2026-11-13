import React from "react";
import { C, FONT, STROKE } from "../theme";

/** A flat shape with an ink outline and a hard offset shadow. */
export const Sticker: React.FC<{
  color?: string;
  radius?: number;
  shadow?: number;
  stroke?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ color = C.white, radius = 32, shadow = 12, stroke = STROKE, style, children }) => (
  <div
    style={{
      backgroundColor: color,
      border: `${stroke}px solid ${C.ink}`,
      borderRadius: radius,
      boxShadow: `${shadow}px ${shadow}px 0 ${C.ink}`,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Display type with an ink outline and a hard shadow, like a die-cut sticker. */
export const StickerText: React.FC<{
  size: number;
  color: string;
  stroke?: number;
  shadow?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ size, color, stroke = 14, shadow = 10, style, children }) => {
  const base: React.CSSProperties = {
    WebkitTextStroke: `${stroke}px ${C.ink}`,
    paintOrder: "stroke fill",
    strokeLinejoin: "round",
    whiteSpace: "nowrap",
  };
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        ...style,
      }}
    >
      <span style={{ ...base, position: "absolute", left: shadow, top: shadow, color: C.ink }}>
        {children}
      </span>
      <span style={{ ...base, position: "relative", color }}>{children}</span>
    </span>
  );
};

/** A pill-shaped sticker label. */
export const Pill: React.FC<{
  color?: string;
  fg?: string;
  size?: number;
  shadow?: number;
  padX?: number;
  padY?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ color = C.yellow, fg = C.ink, size = 44, shadow = 8, padX, padY, style, children }) => (
  <Sticker
    color={color}
    radius={999}
    shadow={shadow}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.3,
      padding: `${padY ?? size * 0.32}px ${padX ?? size * 0.7}px`,
      fontFamily: FONT.display,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.1,
      color: fg,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </Sticker>
);
