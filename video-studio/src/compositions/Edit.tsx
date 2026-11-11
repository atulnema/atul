import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  staticFile,
} from "remotion";
import { z } from "zod";
import { useCaptions } from "../captions";
import { Captions } from "../components/Captions";
import { Footage } from "../components/Footage";
import { WhipBlur } from "../components/WhipBlur";
import { getStyle, styleNames } from "../styles";

export const editSchema = z.object({
  /** Which saved style to edit in. */
  style: z.enum(styleNames),
  /** Cut and graded clip inside public/, written by scripts/cut.py. */
  footage: z.string().nullable(),
  /** Word-level captions inside public/, written by scripts/transcribe.mjs. */
  captions: z.string().nullable(),
});

export type EditProps = z.infer<typeof editSchema>;

type FootageInfo = { fps: number; durationInFrames: number };

/** Size comes from the style, length and frame rate from the footage. */
export const calculateEditMetadata: CalculateMetadataFunction<EditProps> = async ({
  props,
  abortSignal,
}) => {
  const { canvas } = getStyle(props.style);
  if (!props.footage) {
    return { width: canvas.width, height: canvas.height };
  }
  const sidecar = props.footage.replace(/\.[^.]+$/, ".json");
  const response = await fetch(staticFile(sidecar), { signal: abortSignal });
  if (!response.ok) {
    throw new Error(
      `public/${sidecar} not found. Create the footage with scripts/cut.py, which writes it.`,
    );
  }
  const info = (await response.json()) as FootageInfo;
  return {
    width: canvas.width,
    height: canvas.height,
    fps: info.fps,
    durationInFrames: info.durationInFrames,
  };
};

/**
 * The edit of one video. This file is rewritten for each new video (prompt 4).
 *
 * Layers, bottom to top: footage, captions, graphics. Rules for the graphics layer:
 *   - one graphic on screen at a time
 *   - each one starts on the frame of the word that names it (read the captions JSON:
 *     frame = startMs / 1000 * fps)
 *   - each one is its own <Sequence> with hard-coded `from` and `durationInFrames`,
 *     so it can be nudged in the Studio timeline
 *
 *   <Sequence name="Title: the catch" from={212} durationInFrames={54}>
 *     <Title lines={["The", "catch"]} tokens={tokens} />
 *   </Sequence>
 */
export const Edit: React.FC<EditProps> = ({ style, footage, captions }) => {
  const tokens = getStyle(style);
  const words = useCaptions(captions);

  if (!footage) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#111",
          color: "#ddd",
          fontFamily: "sans-serif",
          fontSize: 44,
          lineHeight: 1.4,
          padding: 90,
          justifyContent: "center",
        }}
      >
        No footage yet. Cut your clip with scripts/cut.py, then pass its path in
        the "footage" prop.
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* List the timeline frames of cuts that should get the blur transition. */}
      <WhipBlur cuts={[]} tokens={tokens}>
        <Footage file={footage} />
      </WhipBlur>

      {words ? <Captions captions={words} tokens={tokens} /> : null}

      {/* Graphics go here, one <Sequence> each. */}
    </AbsoluteFill>
  );
};
