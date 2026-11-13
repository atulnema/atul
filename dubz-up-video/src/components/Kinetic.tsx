import React from "react";
import { glide, pop, tween, EASE } from "../lib/anim";

/**
 * Text that animates in one word or one letter at a time.
 * - "rise": each unit slides up from behind a mask.
 * - "pop": each unit springs in with a little spin.
 * `out` is the frame at which the units leave again (upwards, through the mask).
 */
export const Kinetic: React.FC<{
  text: string;
  frame: number;
  delay?: number;
  stagger?: number;
  by?: "word" | "char";
  mode?: "rise" | "pop";
  out?: number;
  style?: React.CSSProperties;
}> = ({ text, frame, delay = 0, stagger = 2, by = "word", mode = "rise", out, style }) => {
  const words = text.split(" ");
  let index = 0;
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "pre", lineHeight: 1.08, ...style }}>
      {words.map((word, w) => {
        const units = by === "char" ? Array.from(word) : [word];
        return (
          <span key={w} style={{ display: "inline-flex", marginRight: w < words.length - 1 ? "0.26em" : 0 }}>
            {units.map((u, i) => {
              const d = delay + index * stagger;
              index += 1;
              if (mode === "pop") {
                const p = pop(frame, d);
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      transformOrigin: "50% 90%",
                      scale: String(p),
                      rotate: `${(1 - p) * (i % 2 ? -18 : 18)}deg`,
                      translate: `0 ${(1 - p) * 0.3}em`,
                    }}
                  >
                    {u}
                  </span>
                );
              }
              const p = glide(frame, d, 14);
              const leave = out === undefined ? 0 : tween(frame, out + index * 0.6, out + 7 + index * 0.6, 0, 1, EASE.in);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    padding: "0.08em 0.04em 0.16em",
                    margin: "-0.08em -0.04em -0.16em",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      translate: `0 ${(1 - p) * 115 - leave * 125}%`,
                      rotate: `${(1 - p) * 6}deg`,
                      transformOrigin: "0% 100%",
                    }}
                  >
                    {u}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};
