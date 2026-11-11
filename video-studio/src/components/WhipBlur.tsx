import React, { useId } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StyleTokens } from "../styles/types";

/**
 * Camera-blur transition. Wrap the footage in it and list the frames where a cut
 * should be hidden: the picture smears sideways on the way in, holds through the cut,
 * and sharpens on the way out. The three durations and the peak blur are measured values.
 */
export const WhipBlur: React.FC<{
  /** Timeline frames of the cuts to cover. */
  cuts: number[];
  tokens: StyleTokens;
  children: React.ReactNode;
}> = ({ cuts, tokens, children }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const filterId = `whip-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { whip } = tokens;

  const blurIn = Math.max(1, whip.inSeconds * fps);
  const hold = Math.max(1, whip.holdSeconds * fps);
  const blurOut = Math.max(1, whip.outSeconds * fps);

  // The cut sits in the middle of the hold, where the picture is least readable.
  const amount = cuts.reduce((strongest, cut) => {
    const holdStart = cut - hold / 2;
    const level = interpolate(
      frame,
      [holdStart - blurIn, holdStart, holdStart + hold, holdStart + hold + blurOut],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return Math.max(strongest, level);
  }, 0);

  const blur = amount * whip.blurPx;
  if (blur < 0.05) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter
          id={filterId}
          x="-20%"
          y="0%"
          width="140%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={`${blur} 0`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          filter: `url(#${filterId})`,
          // Widen slightly so the blurred edges never show the background.
          scale: `${1 + (blur * 2) / width} 1`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
