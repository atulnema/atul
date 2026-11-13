export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// The soundtrack runs at 120 BPM, so a beat is 15 frames and a bar is 60.
export const BEAT = 15;
export const BAR = 60;

export const C = {
  cream: "#FFF4E0",
  ink: "#1B1340",
  pink: "#FF4D8D",
  yellow: "#FFC93C",
  blue: "#3D5AFE",
  mint: "#2ED9A3",
  orange: "#FF7A30",
  purple: "#8B5CF6",
  white: "#FFFFFF",
  sky: "#DDE4FF",
  blush: "#FFDDEA",
  foam: "#D6F7EC",
  deep: "#2A1F63",
} as const;

const SCRIPTS =
  '"Noto Sans Devanagari", "Noto Sans JP", "Noto Sans KR", "Noto Sans Arabic", "Noto Sans SC"';

export const FONT = {
  display: `"Bricolage Grotesque", ${SCRIPTS}, sans-serif`,
  body: `"DM Sans", ${SCRIPTS}, sans-serif`,
} as const;

export const STROKE = 7;

// Scene lengths in frames. Each one is a whole number of bars.
export const SCENES = {
  hook: 2 * BAR,
  problem: 2 * BAR,
  reveal: 2 * BAR,
  how: 4 * BAR,
  market: 2 * BAR,
  traction: 2 * BAR,
  ask: 2 * BAR,
} as const;

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0);
