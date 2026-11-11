import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontStyle, useStyleFonts } from "../fonts";
import type { StyleTokens } from "../styles/types";

/**
 * Stacked title. Each line is scaled so that all lines share one width, and the letters
 * rise into place one after another. Put it in a <Sequence>: the animation starts at the
 * sequence's first frame.
 */
export const Title: React.FC<{
  lines: string[];
  tokens: StyleTokens;
  /** Defaults to the style's colour for dark footage. */
  color?: string;
  /** Override the measured top edge, in canvas px. */
  top?: number;
}> = ({ lines, tokens, color, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ready = useStyleFonts(tokens);
  const { title, fonts } = tokens;

  if (!ready) {
    return null;
  }

  const shown = lines.map((line) =>
    title.uppercase ? line.toUpperCase() : line,
  );
  const sizes = shown.map((text) => {
    // Measure at 100px so the em-based letter spacing has a known pixel value.
    const { fontSize } = fitText({
      text,
      withinWidth: title.lineWidth,
      fontFamily: fonts.title.family,
      fontWeight: fonts.title.weight,
      letterSpacing: `${title.letterSpacing * 100}px`,
      additionalStyles: { fontStyle: fonts.title.style },
    });
    return fontSize;
  });
  const lettersBefore = shown.map((_, i) =>
    shown.slice(0, i).reduce((sum, line) => sum + line.length, 0),
  );
  const rise = title.riseSeconds * fps;
  const stagger = title.staggerSeconds * fps;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: top ?? title.top,
          width: title.lineWidth,
          color: color ?? tokens.colors.onDark,
          ...fontStyle(fonts.title),
        }}
      >
        {shown.map((text, lineIndex) => (
          <div
            key={lineIndex}
            style={{
              fontSize: sizes[lineIndex],
              lineHeight: title.lineHeight,
              letterSpacing: `${title.letterSpacing}em`,
              whiteSpace: "pre",
              // Letter spacing adds a trailing gap after the last letter; pull it back
              // so the visible ink, not the box, is what spans the line width.
              marginRight: `${-title.letterSpacing}em`,
            }}
          >
            {Array.from(text).map((letter, letterIndex) => {
              const start = (lettersBefore[lineIndex] + letterIndex) * stagger;
              return (
                <span
                  key={letterIndex}
                  style={{
                    display: "inline-block",
                    opacity: interpolate(
                      frame,
                      [start, start + rise * 0.6],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                    translate: interpolate(
                      frame,
                      [start, start + rise],
                      [`0px ${title.risePx}px`, "0px 0px"],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(...title.easing),
                      },
                    ),
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
