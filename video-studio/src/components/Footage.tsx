import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";

/**
 * The cut and graded clip, filling the frame. `file` is a path inside public/, as
 * written by scripts/cut.py (for example "footage/me.mp4").
 */
export const Footage: React.FC<{ file: string; muted?: boolean }> = ({
  file,
  muted = false,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video
        name="Footage"
        src={staticFile(file)}
        muted={muted}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};
