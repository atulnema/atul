import type { StyleTokens } from "../types";

/**
 * PLACEHOLDER VALUES. This is the starting point for a new style, not a real one.
 *
 * To add a style: copy this folder to src/styles/<name>/, run prompt 1 from PROMPTS.md
 * to fill STYLE.md with measurements, then replace every value below with the measured
 * number and register the style in src/styles/index.ts.
 */
export const tokens: StyleTokens = {
  name: "template",
  source: { creator: "@handle", reel: "title or link of the reference reel" },
  canvas: { width: 1080, height: 1920 },

  fonts: {
    title: { family: "serif", file: null, weight: "400", style: "normal" },
    caption: { family: "serif", file: null, weight: "400", style: "normal" },
    label: { family: "monospace", file: null, weight: "400", style: "normal" },
  },

  colors: {
    onDark: "#F4F1EA",
    onLight: "#1F2A24",
    captionBox: "#1F2A24",
    captionText: "#F4F1EA",
    labelBox: "#1F2A24",
    labelText: "#F4F1EA",
    cardBackground: "#F4F1EA",
    cardBorder: "#F4F1EA",
  },

  caption: {
    fontSize: 64,
    boxTop: 1320,
    boxBottom: 1404,
    paddingX: 22,
    radius: 4,
    letterSpacing: 0,
    pageMs: 1200,
    highlight: "karaoke",
    dimOpacity: 0.45,
  },

  title: {
    lineWidth: 760,
    top: 300,
    lineHeight: 0.95,
    letterSpacing: 0,
    uppercase: true,
    riseSeconds: 0.12,
    risePx: 40,
    staggerSeconds: 0.02,
    easing: [0.33, 1, 0.68, 1],
  },

  label: {
    fontSize: 30,
    letterSpacing: 0.18,
    uppercase: true,
    paddingX: 20,
    paddingY: 10,
    radius: 4,
  },

  card: {
    radius: 28,
    borderWidth: 6,
    padding: 0,
  },

  whip: {
    inSeconds: 0.1,
    holdSeconds: 0.13,
    outSeconds: 0.12,
    blurPx: 60,
  },

  grade: {
    lut: null,
    strength: 1,
  },
};
