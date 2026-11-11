import React from "react";
import { Composition } from "remotion";
import { calculateEditMetadata, Edit, editSchema } from "./compositions/Edit";
import {
  calculateRebuildMetadata,
  Rebuild,
  rebuildSchema,
} from "./compositions/Rebuild";
import {
  calculateStyleBoardMetadata,
  StyleBoard,
  styleBoardSchema,
} from "./compositions/StyleBoard";

/**
 * Width and height below are fallbacks: each composition takes its real size from the
 * chosen style's canvas, and Edit takes its length and frame rate from the footage.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Edit"
        component={Edit}
        schema={editSchema}
        calculateMetadata={calculateEditMetadata}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ style: "template", footage: null, captions: null }}
      />
      <Composition
        id="StyleBoard"
        component={StyleBoard}
        schema={styleBoardSchema}
        calculateMetadata={calculateStyleBoardMetadata}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ style: "template" }}
      />
      <Composition
        id="Rebuild"
        component={Rebuild}
        schema={rebuildSchema}
        calculateMetadata={calculateRebuildMetadata}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          style: "template",
          reference: null,
          backdrop: "#15171A",
          title: [],
          titleColor: null,
          caption: "",
          captionLitWords: 0,
          label: "",
          labelX: 60,
          labelY: 60,
        }}
      />
    </>
  );
};
