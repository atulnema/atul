import type { TikTokPage } from "@remotion/captions";
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  CanvasImage,
  staticFile,
} from "remotion";
import { z } from "zod";
import { CaptionBox } from "../components/Captions";
import { Label } from "../components/Label";
import { Title } from "../components/Title";
import { getStyle, styleNames } from "../styles";

/**
 * Rebuilds one frame of the reference reel from the style's components, so it can be
 * put next to the real frame with scripts/compare.py. Render it as a still:
 *
 *   npx remotion still Rebuild work/rebuild/caption.png --frame=90 \
 *     --props='{"style":"paper","caption":"good of an editor","captionLitWords":2}'
 *
 * Frame 90 is after every entrance animation has finished. Pick an earlier frame to
 * rebuild a moment in the middle of an animation.
 */
export const rebuildSchema = z.object({
  style: z.enum(styleNames),
  /** A frame of the reel inside public/ (copy it from work/<reel>/grabs/). Drawn underneath. */
  reference: z.string().nullable(),
  /** Flat colour behind the graphics when no reference is given. */
  backdrop: z.string(),
  /** Title lines. Empty for none. */
  title: z.array(z.string()),
  /** Title colour. Null uses the style's colour for dark footage. */
  titleColor: z.string().nullable(),
  /** Caption text. Empty for none. */
  caption: z.string(),
  /** How many of the caption's words are lit in this frame. */
  captionLitWords: z.number().int().min(0),
  /** Label text. Empty for none. */
  label: z.string(),
  /** Top-left corner of the label, in canvas px. */
  labelX: z.number(),
  labelY: z.number(),
});

export type RebuildProps = z.infer<typeof rebuildSchema>;

export const calculateRebuildMetadata: CalculateMetadataFunction<
  RebuildProps
> = ({ props }) => {
  const { canvas } = getStyle(props.style);
  return { width: canvas.width, height: canvas.height };
};

export const Rebuild: React.FC<RebuildProps> = ({
  style,
  reference,
  backdrop,
  title,
  titleColor,
  caption,
  captionLitWords,
  label,
  labelX,
  labelY,
}) => {
  const tokens = getStyle(style);

  // A page whose words are one second apart, frozen at the requested word.
  const words = caption.split(/\s+/).filter(Boolean);
  const page: TikTokPage = {
    text: words.join(" "),
    startMs: 0,
    durationMs: words.length * 1000,
    tokens: words.map((word, index) => ({
      text: ` ${word}`,
      fromMs: index * 1000,
      toMs: (index + 1) * 1000,
    })),
  };
  // Frozen just before the next word starts, so exactly captionLitWords are lit and
  // the last of them counts as the word being said.
  const captionAtMs = captionLitWords * 1000 - 1;

  return (
    <AbsoluteFill style={{ backgroundColor: backdrop }}>
      {reference ? (
        <CanvasImage
          src={staticFile(reference)}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
      ) : null}
      {title.length > 0 ? (
        <Title
          lines={title}
          tokens={tokens}
          color={titleColor ?? undefined}
        />
      ) : null}
      {words.length > 0 ? (
        <CaptionBox page={page} tokens={tokens} atMs={captionAtMs} />
      ) : null}
      {label ? (
        <div style={{ position: "absolute", left: labelX, top: labelY }}>
          <Label tokens={tokens}>{label}</Label>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
