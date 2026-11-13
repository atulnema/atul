import React from "react";
import { ease, tw } from "../lib/anim";

/**
 * Per-character masked rise. Each glyph slides up from below its own
 * baseline box, staggered, so a word "prints" itself onto the frame.
 */
export const Chars: React.FC<{
  text: string;
  b: number;
  at: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  charStyle?: (i: number) => React.CSSProperties;
}> = ({ text, b, at, stagger = 0.035, dur = 0.5, style, charStyle }) => (
  <span
    style={{
      display: "inline-block",
      overflow: "hidden",
      whiteSpace: "pre",
      lineHeight: 1,
      paddingBottom: "0.22em",
      marginBottom: "-0.22em",
      paddingRight: "0.06em",
      marginRight: "-0.06em",
      verticalAlign: "bottom",
      ...style,
    }}
  >
    {text.split("").map((ch, i) => {
      const p = tw(b, at + i * stagger, at + i * stagger + dur, ease.out);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            translate: `0 ${(1 - p) * 115}%`,
            rotate: `${(1 - p) * 6}deg`,
            transformOrigin: "0% 100%",
            ...(ch === " " ? { width: "0.26em" } : null),
            ...charStyle?.(i),
          }}
        >
          {ch}
        </span>
      );
    })}
  </span>
);
