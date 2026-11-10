import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fraunces (SIL Open Font License), bundled locally so renders work offline.
loadFont({
  family: "Fraunces",
  url: staticFile("fonts/Fraunces.woff2"),
  weight: "400 700",
  style: "normal",
});
loadFont({
  family: "Fraunces",
  url: staticFile("fonts/Fraunces-Italic.woff2"),
  weight: "400 700",
  style: "italic",
});

export const FONTS = {
  serif: "Fraunces, serif",
  sans: "Inter, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const COLORS = {
  ink: "#0E0D0B",
  cream: "#F3EEE3",
  muted: "#8F887B",
  clay: "#D97757",
  amber: "#F2B36B",
  line: "rgba(243, 238, 227, 0.14)",
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
