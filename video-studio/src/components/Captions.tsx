import type { Caption, TikTokPage } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontStyle, useStyleFonts } from "../fonts";
import type { StyleTokens } from "../styles/types";

/** One caption page: a box at the measured position, words lighting up as they are said. */
export const CaptionBox: React.FC<{
  page: TikTokPage;
  tokens: StyleTokens;
  /** Freeze the box at this moment instead of following the timeline. */
  atMs?: number;
}> = ({ page, tokens, atMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { caption, colors, fonts } = tokens;
  const nowMs = atMs ?? page.startMs + (frame / fps) * 1000;
  const boxHeight = caption.boxBottom - caption.boxTop;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: caption.boxTop,
          left: 0,
          right: 0,
          height: boxHeight,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            height: boxHeight,
            lineHeight: `${boxHeight}px`,
            padding: `0 ${caption.paddingX}px`,
            borderRadius: caption.radius,
            backgroundColor: colors.captionBox,
            color: colors.captionText,
            fontSize: caption.fontSize,
            letterSpacing: caption.letterSpacing,
            whiteSpace: "pre",
            ...fontStyle(fonts.caption),
          }}
        >
          {page.tokens.map((token, index) => {
            const said = token.fromMs <= nowMs;
            const current = said && token.toMs > nowMs;
            const lit = caption.highlight === "karaoke" ? said : current;
            // The page's first word carries a leading space that would push the text off centre.
            const text = index === 0 ? token.text.trimStart() : token.text;
            return (
              <span
                key={`${token.fromMs}-${index}`}
                style={{ opacity: lit ? 1 : caption.dimOpacity }}
              >
                {text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Captions for a whole clip. `captions` is the word-level JSON from scripts/transcribe.mjs
 * (Remotion's Caption type), transcribed from the same file the footage layer plays.
 */
export const Captions: React.FC<{
  captions: Caption[];
  tokens: StyleTokens;
}> = ({ captions, tokens }) => {
  const { fps } = useVideoConfig();
  const ready = useStyleFonts(tokens);
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: tokens.caption.pageMs,
      }),
    [captions, tokens.caption.pageMs],
  );

  if (!ready) {
    return null;
  }

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const lastWordEnd = page.tokens[page.tokens.length - 1].toMs;
        const endMs = next ? next.startMs : lastWordEnd + 150;
        const durationInFrames = Math.round((endMs / 1000) * fps) - from;
        if (durationInFrames <= 0) {
          return null;
        }
        return (
          <Sequence
            key={index}
            name={page.text.trim()}
            from={from}
            durationInFrames={durationInFrames}
          >
            <CaptionBox page={page} tokens={tokens} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
