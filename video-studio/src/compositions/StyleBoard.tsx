import React, { useMemo } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { captionsFromText } from "../captions";
import { Captions } from "../components/Captions";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { Title } from "../components/Title";
import { WhipBlur } from "../components/WhipBlur";
import { getStyle, styleNames } from "../styles";

/**
 * Every piece of a style on one canvas, in motion: title, captions, label, card and
 * the blur transition. Use it to check a style at a glance after changing tokens.
 */
export const styleBoardSchema = z.object({
  style: z.enum(styleNames),
});

export type StyleBoardProps = z.infer<typeof styleBoardSchema>;

export const calculateStyleBoardMetadata: CalculateMetadataFunction<
  StyleBoardProps
> = ({ props }) => {
  const { canvas } = getStyle(props.style);
  return { width: canvas.width, height: canvas.height };
};

const Swatch: React.FC<{ color: string; name: string }> = ({ color, name }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: "monospace",
      fontSize: 24,
      color: "#222",
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: color,
        outline: "1px solid rgba(0,0,0,0.25)",
      }}
    />
    {name} {color}
  </div>
);

export const StyleBoard: React.FC<StyleBoardProps> = ({ style }) => {
  const tokens = getStyle(style);
  const { fps, width, height } = useVideoConfig();
  const captions = useMemo(
    () => captionsFromText("each word lights up as it is said out loud"),
    [],
  );
  const cardTop = tokens.caption.boxBottom + 70;

  return (
    <AbsoluteFill style={{ backgroundColor: "#15171A" }}>
      {/* The blur transition fires once, a second and a half in. */}
      <WhipBlur cuts={[Math.round(1.5 * fps)]} tokens={tokens}>
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(160deg, #2B3037 0%, #15171A 55%, #3A3128 100%)",
          }}
        />
        <Sequence name="Title" from={Math.round(0.2 * fps)}>
          <Title lines={["Style", "board"]} tokens={tokens} />
        </Sequence>
      </WhipBlur>

      <Sequence name="Captions" from={Math.round(0.3 * fps)}>
        <Captions captions={captions} tokens={tokens} />
      </Sequence>

      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Label tokens={tokens}>{`style · ${tokens.name}`}</Label>
      </div>

      <Card
        tokens={tokens}
        footer="card with label"
        style={{
          left: 60,
          top: cardTop,
          width: width - 120,
          height: height - cardTop - 60,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            padding: 36,
          }}
        >
          <Swatch color={tokens.colors.onDark} name="on dark" />
          <Swatch color={tokens.colors.onLight} name="on light" />
          <Swatch color={tokens.colors.captionBox} name="caption box" />
          <Swatch color={tokens.colors.captionText} name="caption text" />
          <Swatch color={tokens.colors.labelBox} name="label box" />
          <Swatch color={tokens.colors.cardBorder} name="card border" />
        </div>
      </Card>
    </AbsoluteFill>
  );
};
