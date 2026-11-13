import React from "react";
import { tween } from "../lib/anim";
import { C, HEIGHT, WIDTH } from "../theme";

export type WipeKind = "iris" | "diagonal" | "shutters" | "sweep" | "corner";

const LEN = 14;
// A gentle ease-in: the bands stay visible, then snap shut on the cut.
const accelerate = (t: number) => t * 0.45 + t * t * 0.55;
const GAP = 3;

/**
 * A layered colour wipe that finishes on the frame before `at`.
 * The last colour matches the next scene's background, so the cut is invisible.
 */
export const Wipe: React.FC<{ frame: number; at: number; kind: WipeKind; colors: string[] }> = ({
  frame,
  at,
  kind,
  colors,
}) => {
  const start = at - LEN;
  if (frame < start || frame >= at) return null;
  const span = LEN - 1 - GAP * (colors.length - 1);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {colors.map((color, k) => {
        const p = tween(frame, start + k * GAP, start + k * GAP + span, 0, 1, accelerate);
        if (p <= 0) return null;
        const edge = `8px solid ${C.ink}`;
        if (kind === "iris" || kind === "corner") {
          const cx = kind === "iris" ? WIDTH / 2 : WIDTH + 40;
          const cy = kind === "iris" ? HEIGHT / 2 : HEIGHT + 40;
          const d = (kind === "iris" ? 2300 : 4600) * p;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: cx - d / 2,
                top: cy - d / 2,
                width: d,
                height: d,
                borderRadius: "50%",
                backgroundColor: color,
                border: edge,
                boxSizing: "border-box",
              }}
            />
          );
        }
        if (kind === "diagonal") {
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: -700,
                top: -900,
                width: 3300,
                height: 2900,
                backgroundColor: color,
                borderRight: edge,
                rotate: "14deg",
                translate: `${(p - 1) * 3400}px 0`,
              }}
            />
          );
        }
        if (kind === "sweep") {
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: -40,
                top: -200,
                width: 2700 * p,
                height: HEIGHT + 400,
                backgroundColor: color,
                border: edge,
                borderRadius: "0 700px 700px 0",
                boxSizing: "border-box",
              }}
            />
          );
        }
        // shutters
        const n = 8;
        return (
          <React.Fragment key={k}>
            {new Array(n).fill(0).map((_, i) => {
              const local = Math.min(1, Math.max(0, (p - i * 0.05) / (1 - 0.05 * (n - 1))));
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: (WIDTH / n) * i - 1,
                    top: i % 2 ? undefined : 0,
                    bottom: i % 2 ? 0 : undefined,
                    width: WIDTH / n + 2,
                    height: (HEIGHT + 10) * local,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};
